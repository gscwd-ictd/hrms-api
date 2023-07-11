import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { Repository } from 'typeorm';
import { PDSEducationElementaryDTO } from '../data/dtos/pds-education.dto';
import { PDSEducationElementary } from './data/entities/pds-education-elementary.entity';

@Injectable()
export class PDSEducationElementaryService extends BaseEntityCrudService<PDSEducationElementary> {
  constructor(@InjectRepository(PDSEducationElementary) pdsEducationElementaryRepository: Repository<PDSEducationElementary>) {
    super(pdsEducationElementaryRepository);
  }
  async updateElementaryEducation(applicantId: string, pdsEducationElementaryDTO: PDSEducationElementaryDTO) {
    if (
      (await this.entityRepository.createQueryBuilder('pds_e').update().set(pdsEducationElementaryDTO).where('external_applicant_id_fk = :applicantId', { applicantId }).execute())
        .affected > 0
    )
      return { applicantId, ...pdsEducationElementaryDTO };
    throw new HttpException('PDS Record not found', 404);
  }

  async deleteElementaryEducation(externalApplicantId: string) {
    const elementary = await this.entityRepository.findOne({ where: { externalApplicantId } });
    if ((await this.entityRepository.createQueryBuilder().delete().where('external_applicant_id_fk = :externalApplicantId', { externalApplicantId }).execute()).affected > 0)
      return elementary;
    throw new HttpException('PDS Record not found', 404);
  }
}
