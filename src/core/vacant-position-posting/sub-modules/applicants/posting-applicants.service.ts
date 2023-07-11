import { lastValueFrom } from 'rxjs';
import { MicroserviceType } from './../../../../global/utils/enums/microservice-type.enum';
import { ClientProxy } from '@nestjs/microservices';
import { VacantPositionPosting } from 'src/core/vacant-position-posting/data/entities/vacant-position-posting.entity';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { Repository } from 'typeorm';
import {
  UpdateApplicantsExamDTO,
  PostingApplicantsDTOForUpdate,
  PostingApplicantsExamDTO,
  ApplicantStatusDTO,
  AddEmployeePostingApplicantDTO,
} from './data/dtos/posting-applicants.dto';
import { PostingApplicants } from './data/entities/posting-applicants.entity';
import { ApplicantStatus } from './utils/enums/applicant-status.enum';

@Injectable()
export class ApplicantsService extends BaseEntityCrudService<PostingApplicants> {
  constructor(
    @InjectRepository(PostingApplicants) private readonly postingApplicantsRepository: Repository<PostingApplicants>,
    @Inject(MicroserviceType.AUTHN) private readonly client: ClientProxy,
  ) {
    super(postingApplicantsRepository);
  }

  async updateApplicantStatus(postingApplicantsDTOForUpdate: PostingApplicantsDTOForUpdate) {
    try {
      let applicantField = 'external_applicant_id_fk';
      const { internal, vacantPositionPostingId, applicantStatus, applicantId } = postingApplicantsDTOForUpdate;
      console.log(applicantStatus);
      if (internal === true) applicantField = 'employee_id_fk';
      const executeQuery = await this.entityRepository
        .createQueryBuilder('pa')
        .update()
        .set({ vacantPositionPostingId, applicantStatus })
        .where(`vacant_position_posting_id_fk = :vacantPositionPostingId AND ${applicantField} = :applicantId ;`, { vacantPositionPostingId, applicantId })
        .execute();
      if (executeQuery.affected == 0) throw new HttpException('Posting or Applicant Not Found', HttpStatus.NOT_FOUND);
      return postingApplicantsDTOForUpdate;
    } catch (error) {
      if (error.message == "Data truncated for column 'applicant_status' at row 1") throw new HttpException('Invalid Applicant Status', HttpStatus.NOT_ACCEPTABLE);
      if (error.message == 'Posting or Applicant Not Found') throw new HttpException('Posting or Applicant Not Found', HttpStatus.NOT_FOUND);
    }
  }

  async updateApplicantStatus2(postingApplicantId: string, applicantStatusDTO: ApplicantStatusDTO) {
    try {
      console.log(applicantStatusDTO);
      const result = await this.entityRepository
        .createQueryBuilder()
        .update()
        .set({
          applicantStatus: applicantStatusDTO.applicantStatus,
        })
        .where({ _id: postingApplicantId })
        .execute();
      if (result.affected > 0) return applicantStatusDTO;
    } catch (error) {
      console.log(error);
      throw new HttpException('Error', 500);
    }
  }

  async setExamScore(applicantsExamScores: PostingApplicantsExamDTO) {
    try {
      const result = await Promise.all(
        applicantsExamScores.applicantsExamScores.map(async (applicantExamScore) => {
          const executeQuery = await this.entityRepository
            .createQueryBuilder()
            .update()
            .set({ examScore: applicantExamScore.examScore })
            .where({ _id: applicantExamScore.postingApplicantId })
            .execute();
          if (executeQuery.affected > 0) return { _id: applicantExamScore.postingApplicantId, examScore: applicantExamScore.examScore };
        }),
      );
      return result;
    } catch (error) {
      throw new HttpException('error', 500);
    }
  }

  async addExternalApplicant(vppId: string, externalApplicantId: string) {
    try {
      return await this.saveEntity({
        vacantPositionPostingId: vppId,
        externalApplicantId,
        applicantStatus: ApplicantStatus.FOR_REVIEW,
        examScore: 0,
      });
    } catch (error) {}
  }

  async addInternalApplicant(vppId: string, employeeId: string, addEmployeePostingApplicantDTO: AddEmployeePostingApplicantDTO) {
    try {
      const { withRelevantExperience, workExperienceSheet } = addEmployeePostingApplicantDTO;
      const internalApplicant = await this.saveEntity({
        vacantPositionPostingId: vppId,
        employeeId,
        ApplicantStatus: ApplicantStatus.FOR_REVIEW,
        examScore: 0,
        withRelevantExperience,
      });
      const payload = { postingApplicantId: internalApplicant._id, workExperienceSheetAddDTO: { workExperienceSheet, vppId } };
      console.log('========================================== ', payload);
      console.log(withRelevantExperience);
      if (withRelevantExperience) {
        const workExperienceSheetResult = await lastValueFrom(this.client.send({ msg: 'add_employee_work_experience_sheet' }, payload));
        return { internalApplicant, workExperienceSheetResult };
      }
      return { internalApplicant };
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async getInternalApplicantDetails(vppId: string, employeeId: string) {
    try {
      return (
        await this.entityRepository.query(
          `
          SELECT DISTINCT if(count(postingApplicantId)>0, true, false) hasApplied,vppId,padv.applicantName2 applicantName FROM posting_applicants_detailed_view padv
               INNER JOIN posting_applicants pa ON pa._id = padv.postingApplicantId
          WHERE vppId = ? AND pa.employee_id_fk = ? GROUP BY padv.applicantName2;`,
          [vppId, employeeId],
        )
      )[0];
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
}
