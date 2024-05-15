import { ApplicantStatus } from './../../../../utils/enums/applicant-status.enum';
import { PDSWorkExperienceService } from './../work-experience/pds-workexperience.service';
import { PDSWorkExperience } from './../work-experience/data/entities/pds-workexperience.entity';
import { PostingApplicants } from 'src/core/vacant-position-posting/sub-modules/applicants/data/entities/posting-applicants.entity';
import { ApplicantsService } from './../../../../posting-applicants.service';
import { getManager } from 'typeorm';
import { WorkExperienceSheetAddDTO, WorkExperienceSheetDTO } from './data/work-experience-sheet.dto';
import { Injectable } from '@nestjs/common';
import { WorkExperienceSheetAccomplishmentsService } from './contents/accomplishments/accomplishments.service';
import { WorkExperienceSheetBasicService } from './contents/basic/basic.service';
import { WorkExperienceSheetDutiesService } from './contents/duties/duties.service';

@Injectable()
export class WorkExperienceSheetService {
  constructor(
    private readonly dutiesService: WorkExperienceSheetDutiesService,
    private readonly accomplishmentsService: WorkExperienceSheetAccomplishmentsService,
    private readonly basicService: WorkExperienceSheetBasicService,
    private readonly postingApplicantService: ApplicantsService,
    private readonly workExperienceService: PDSWorkExperienceService,
  ) {}

  async getWorkExperienceSheet(postingApplicantId: string) {
    try {
      /*
      
       _id: string;
        vppId: string;
        companyName: string;
        monthlySalary: number | null;
        appointmentStatus: string;
        isGovernmentService: boolean;
        salaryGrade: string | null;
        from: string;
        to: string | null;
        isSelected?: boolean;
        isPresentWork?: boolean;
        immediateSupervisor: string;
        nameOfOffice: string;
        accomplishments: WorkExperienceSheetAccomplishmentsDTO[];
        duties: WorkExperienceSheetDutiesDTO[];
      
      */
      const _id = postingApplicantId;
      console.log(_id);
      const postingApplicant = await this.postingApplicantService.entityRepository.findOne({
        select: ['vacantPositionPostingId'],
        where: { _id },
      });

      console.log('APPLICANT: ', postingApplicant);

      const basic = await this.basicService.entityRepository.find({ where: { postingApplicantId } });

      const result = await Promise.all(
        basic.map(async (basicItem) => {
          console.log(basicItem);
          const workExperience = await this.workExperienceService.entityRepository.findOne({
            where: { _id: basicItem.workExperienceId._id },
          });
          //console.log(workExperience);
          const accomplishments = await this.accomplishmentsService.entityRepository.find({ where: { workExperienceSheetBasicId: basicItem._id } });
          const duties = await this.dutiesService.entityRepository.find({ where: { workExperienceSheetBasicId: basicItem._id } });
          const { workExperienceId, _id, ...rest } = basicItem;
          return { ...rest, ...workExperienceId, accomplishments, duties };
        }),
      );

      return result;
    } catch (error) {
      console.log(error);
    }
  }

  async addWorkExperienceSheet(externalApplicantId: string, workExperienceSheetDTO: WorkExperienceSheetAddDTO) {
    try {
      console.log(workExperienceSheetDTO);
      const { vppId, withRelevantExperience, ...rest } = workExperienceSheetDTO;
      let _withRelevantWorkExperience = withRelevantExperience;

      const { applicantCount } = (
        await this.postingApplicantService.entityRepository.query(
          `SELECT count(_id ) applicantCount FROM posting_applicants WHERE external_applicant_id_fk =  ?  AND vacant_position_posting_id_fk = ?`,
          [externalApplicantId, vppId],
        )
      )[0];
      //let postingApplicant = null;
      //console.log('count!!!!:   ', applicantCount);
      if (applicantCount === '0') {
        await this.postingApplicantService.saveEntity({ vacantPositionPostingId: vppId, externalApplicantId, examScore: 0, applicantStatus: ApplicantStatus.FOR_REVIEW });
      }

      const updatePostingApplicantId = await this.postingApplicantService.entityRepository
        .createQueryBuilder()
        .update()
        .set({
          withRelevantExperience,
        })
        .where(`external_applicant_id_fk = :externalApplicantId AND vacant_position_posting_id_fk =:vppId`, { externalApplicantId, vppId })
        .execute();

      const postingApplicant = await this.postingApplicantService.entityRepository.findOne({ select: ['_id'], where: { externalApplicantId, vacantPositionPostingId: vppId } });

      //console.log(updatePostingApplicantId);
      if (updatePostingApplicantId.affected > 0) {
        if (withRelevantExperience) {
          const result = await getManager().transaction(async (transactionEntityManager) => {
            // const postingApplicant = await transactionEntityManager.save(
            //   this.postingApplicantService.createEntity({ externalApplicantId, vacantPositionPostingId: workExperienceSheetDTO.vppId, examScore: 0 }),
            // );
            const workExperienceSheets = await Promise.all(
              workExperienceSheetDTO.workExperiencesSheet.map(async (workExperienceSheet) => {
                const { _id, accomplishments, duties, supervisor, office, ...rest } = workExperienceSheet;

                const basic = await transactionEntityManager.save(
                  this.basicService.createEntity({
                    postingApplicantId: postingApplicant._id,
                    workExperienceId: _id,
                    supervisor,
                    office,
                  }),
                );

                const _accomplishments = await Promise.all(
                  workExperienceSheet.accomplishments.map(async (accomplishment) => {
                    return await transactionEntityManager.save(
                      this.accomplishmentsService.createEntity({
                        postingApplicantId: postingApplicant._id,
                        ...accomplishment,
                        workExperienceSheetBasicId: basic._id,
                      }),
                    );
                  }),
                );

                const _duties = await Promise.all(
                  workExperienceSheet.duties.map(async (duty) => {
                    console.log(duty);
                    return await transactionEntityManager.save(
                      this.dutiesService.createEntity({
                        postingApplicantId: postingApplicant._id,
                        duty: duty.duty,
                        workExperienceSheetBasicId: basic._id,
                      }),
                    );
                  }),
                );
                return { postingApplicantId: postingApplicant._id, basic, duties: _duties, accomplishments: _accomplishments, withRelevantExperience };
              }),
            );
          });
        } else return { withRelevantExperience };
      }
    } catch (error) {
      console.log(error);
    }
  }
}
