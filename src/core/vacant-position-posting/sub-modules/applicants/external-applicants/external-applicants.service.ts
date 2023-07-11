import { ApplicantsService } from './../posting-applicants.service';
import { PDSService } from './pds/pds.service';
import { JwtService } from '@nestjs/jwt';
import { ExternalApplicantsDTO, JobPortalDTO } from './data/dtos/external-applicants.dto';
import { Injectable, HttpException, HttpCode } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { Repository } from 'typeorm';
import { ExternalApplicants } from './data/entities/external-applicants.entity';
import { EmailService } from 'src/global/auth/services/email.service';
import { GlobalJwtService } from 'src/global/auth/services/global-jwt.service';
import { PostingApplicantRelevantExperienceUpdateDTO } from '../data/dtos/posting-applicants.dto';

@Injectable()
export class ExternalApplicantsService extends BaseEntityCrudService<ExternalApplicants> {
  constructor(
    @InjectRepository(ExternalApplicants) private readonly externalApplicantsRepository: Repository<ExternalApplicants>,
    private readonly emailService: EmailService,
    private readonly jwtService: GlobalJwtService,
    private readonly pdsService: PDSService,
    private readonly applicantService: ApplicantsService,
  ) {
    super(externalApplicantsRepository);
  }

  async getApplicantInformationByEmail(email: { email: string }, vppId: string) {
    try {
      const details = await this.entityRepository.findOne({ select: ['firstName', 'middleName', 'lastName', 'nameExtension'], where: { email: email.email } });
      const vpp = (await this.entityRepository.query(`SELECT COUNT(_id) \`count\` FROM vacant_position_posting WHERE _id = ?`, [vppId]))[0];
      console.log(vpp);
      if (vpp.count === '0') throw new HttpException('Invalid Posting ID', 404);
      if (details) {
        await this.emailService.sendEmailForApplicant(email.email, details, vppId);
        return {
          email,
          details,
        };
      }
      return null;
    } catch (error) {
      console.log(error);
      throw new HttpException(error.response, error.status);
    }
  }

  async addExternalApplicant(vppId: string, jobPortalDTO: JobPortalDTO) {
    try {
      // console.log('via');
      // console.log(jobPortalDTO);
      // console.table(jobPortalDTO);
      // console.log(jobPortalDTO.pds);
      const externalApplicant = await this.saveEntity(jobPortalDTO.personalInfo);
      console.log('External Applicant Id: ', externalApplicant._id);
      const pds = await this.pdsService.savePDS(externalApplicant._id, jobPortalDTO.pds);
      const postingApplicant = await this.applicantService.saveEntity({
        vacantPositionPostingId: vppId,
        externalApplicantId: externalApplicant._id,
        applicantStatus: 'For review',
        examScore: 0,
      });
      // const result = await this.applicantService.entityRepository
      // .createQueryBuilder()
      // .update()
      // .set({ withRelevantExperience: postingApplicantRelevantExperienceUpdateDTO.withRelevantExperience })
      // .where(`external_applicant_id_fk = :externalApplicantId AND vacant_position_posting_id_fk =:vppId`, { externalApplicantId, vppId })
      // .execute();

      return {
        externalApplicant,
        pds,
        postingApplicant,
      };
    } catch (error) {}
  }

  async verifyExternalApplicantByToken(token: string) {
    const verifiedApplicant = await this.verifyExternalApplicantToken(token);
    console.log('asdasdasdas: ', verifiedApplicant.email);
    const applicantId = await this.entityRepository.findOne({ select: ['_id'], where: { email: verifiedApplicant.email } });

    return {
      applicantId,
      vppId: verifiedApplicant.details.vppId,
    };
  }

  private async verifyExternalApplicantToken(token: string) {
    try {
      return await this.jwtService.jwtService.verifyAsync(token, {
        secret: process.env.MAIL_JWT_SECRET,
      });
    } catch (error) {
      throw new HttpException('Invalid token', 401);
    }
  }

  async checkRelevantWorkExperience(externalApplicantsLogin: { externalApplicantId: string; vppId: string }) {
    //return await this.applicantser;
    const { externalApplicantId, vppId } = externalApplicantsLogin;
    const hasRelevantWorkExperience = await this.applicantService.entityRepository.findOne({
      select: ['withRelevantExperience'],
      where: { externalApplicantId, vacantPositionPostingId: vppId },
    });
    return { hasRelevantWorkExperience };
  }

  async updateRelevantWorkExperience(
    externalApplicantsLogin: { externalApplicantId: string; vppId: string },
    postingApplicantRelevantExperienceUpdateDTO: PostingApplicantRelevantExperienceUpdateDTO,
  ) {
    const { externalApplicantId, vppId } = externalApplicantsLogin;

    const result = await this.applicantService.entityRepository
      .createQueryBuilder()
      .update()
      .set({ withRelevantExperience: postingApplicantRelevantExperienceUpdateDTO.withRelevantExperience })
      .where(`external_applicant_id_fk = :externalApplicantId AND vacant_position_posting_id_fk =:vppId`, { externalApplicantId, vppId })
      .execute();
    if (result.affected > 0) return { ...externalApplicantsLogin, ...postingApplicantRelevantExperienceUpdateDTO };
  }

  async getExternalApplicantName(externalApplicantId: string) {
    try {
      const name = (
        await this.entityRepository.query(
          `SELECT applicantName fullName,applicantFirstName, applicantMiddleName, applicantLastName, applicantNameExtension FROM posting_applicants_detailed_view WHERE applicantId=?;`,
          [externalApplicantId],
        )
      )[0];
      console.log(name);
      return name;
    } catch (error) {
      console.log(error);
      throw new HttpException(error.message, error.status);
    }
  }
}
