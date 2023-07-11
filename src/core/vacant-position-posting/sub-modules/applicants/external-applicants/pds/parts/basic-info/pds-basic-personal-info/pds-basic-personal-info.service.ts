import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { Repository } from 'typeorm';
import { PDSBasicPersonalInfoDTO } from './data/dtos/pds-basic-personal-info.dto';
import { PDSBasicPersonalInfo } from './data/entities/pds-basic-personal-info.entity';

@Injectable()
export class PDSBasicPersonalInfoService extends BaseEntityCrudService<PDSBasicPersonalInfo> {
  constructor(@InjectRepository(PDSBasicPersonalInfo) private pdsBasicPersonalInfoRepository: Repository<PDSBasicPersonalInfo>) {
    super(pdsBasicPersonalInfoRepository);
  }

  async getApplicantBasicInfo(externalApplicantId: string) {
    try {
      return await this.pdsBasicPersonalInfoRepository.findOne({ where: { externalApplicantId } });
    } catch (error) {}
  }

  async updatePersonalInfo(applicantId: string, personalInfoDTO: PDSBasicPersonalInfoDTO) {
    if (
      (await this.entityRepository.createQueryBuilder('pi').update().set(personalInfoDTO).where('external_applicant_id_fk = :applicantId', { applicantId }).execute()).affected > 0
    )
      return { applicantId, ...personalInfoDTO };
    throw new HttpException('PDS Record not found', 404);
  }
}
