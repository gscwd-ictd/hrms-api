import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { BaseEntity, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { PositionDescriptionFormBasic } from './data/position-description-form-basic.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PositionDescriptionFormBasicService extends BaseEntityCrudService<PositionDescriptionFormBasic> {
  constructor(@InjectRepository(PositionDescriptionFormBasic) private readonly positionDescriptionFormBasicRepository: Repository<PositionDescriptionFormBasic>) {
    super(positionDescriptionFormBasicRepository);
  }
  async getPositionDescriptionFormBasicInfo(postingApplicantId: string) {
    try {
      const positionDescriptionFormBasic = await this.entityRepository.findOne({ where: { postingApplicantId } });
      const { createdAt, updatedAt, _id, ...rest } = positionDescriptionFormBasic;

      const positionDetails = (
        await this.entityRepository.query(
          `SELECT 
              vppv.positionTitle positionTitle, 
              get_position_id_by_item_number(?) positionId, 
              get_plantilla_salary_grade(substring_index(vppv.positionId,',',1)) salaryGrade,
              FORMAT(get_salary_grade_amount(get_plantilla_salary_grade(substring_index(vppv.positionId,',',1))),2) salary,
              vppv.placeOfAssignment placeOfAssignment,
              padv.applicantName2 applicantName
           FROM posting_applicants_detailed_view padv 
              INNER JOIN vacant_position_posting_view vppv ON vppv.vppId = padv.vppId 
           WHERE padv.postingApplicantId=?`,
          [rest.itemNumber, postingApplicantId],
        )
      )[0];

      return { positionDetails, positionDescriptionFormBasic: rest };
    } catch (error) {
      console.log(error.message, error.status);
    }
  }
}
