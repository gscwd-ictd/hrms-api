import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { Repository } from 'typeorm';
import { VppPsbApplicantsDTO } from './data/dtos/vpp-psb-applicants.dto';
import { VppPsbApplicants } from './data/entities/vpp-psb-applicants.entity';

@Injectable()
export class VppPsbApplicantsService extends BaseEntityCrudService<VppPsbApplicants> {
  constructor(@InjectRepository(VppPsbApplicants) vppPsbApplicantRepository: Repository<VppPsbApplicants>) {
    super(vppPsbApplicantRepository);
  }

  async getPsbRemarks(postingApplicantId: string) {
    try {
      return await this.entityRepository.query(
        `SELECT vppp.psb_no psbNo,get_employee_fullname(vppp.employee_id_fk) psbName,remarks FROM vpp_psb_applicants vpa 
            INNER JOIN vpp_psb vppp ON vppp._id = vpa.vpp_psb_id_fk 
            INNER JOIN posting_applicants pa ON vpa.posting_applicants_id_fk = pa._id 
          WHERE pa._id = ? ORDER BY psbNo ASC;`,
        [postingApplicantId],
      );
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async setExamScore(vppId: string, vppPsbApplicantsDTO: VppPsbApplicantsDTO) {
    const result = await this.entityRepository
      .createQueryBuilder()
      .update()
      .set({ examResult: vppPsbApplicantsDTO.examResult })
      .where({
        _id: vppId,
      })
      .execute();

    if (result.affected > 0) return { vppId, examResult: vppPsbApplicantsDTO.examResult };
  }

  async setInterviewed(vppId: string, employeeId: string, vppPsbApplicantsDTO: VppPsbApplicantsDTO) {
    //TODO: Set constraint if interviewed column is set to 1, psb cant set it back to 0;

    const { vppPsbId } = (
      await this.entityRepository.query(`SELECT _id vppPsbId FROM vpp_psb WHERE vacant_position_posting_id_fk=? AND employee_id_fk = ?`, [vppId, employeeId])
    )[0];

    const setInterviewedResult = await this.entityRepository
      .createQueryBuilder()
      .update()
      .set({
        interviewed: vppPsbApplicantsDTO.interviewed,
      })
      .where({ vppPsbId })
      .execute();

    if (setInterviewedResult.affected > 0) return { vppPsbId, interviewed: vppPsbApplicantsDTO.interviewed };
  }
}
