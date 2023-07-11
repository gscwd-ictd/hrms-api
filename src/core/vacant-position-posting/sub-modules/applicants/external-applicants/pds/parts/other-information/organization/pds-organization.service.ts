import { PDSOrganizationUpdateDTO } from './data/dtos/pds-organization.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { EntityManager, Repository } from 'typeorm';
import { PDSOrganization } from './data/entities/pds-organization.entity';

@Injectable()
export class PDSOrganizationService extends BaseEntityCrudService<PDSOrganization> {
  constructor(@InjectRepository(PDSOrganization) pdsOrganizationRepository: Repository<PDSOrganization>) {
    super(pdsOrganizationRepository);
  }

  async updateOrganizationTransaction(transactionEntityManager: EntityManager, pdsOrganizationUpdateDTO: PDSOrganizationUpdateDTO, externalApplicantId: string) {
    if (pdsOrganizationUpdateDTO.update.length > 0) {
      await Promise.all(
        pdsOrganizationUpdateDTO.update.map(async (organization) => {
          const { _id, ...rest } = organization;
          if (_id === '') await transactionEntityManager.save(this.createEntity({ externalApplicantId, ...rest }));
          //else await transactionEntityManager.remove(this.createEntity(organization));
        }),
      );
    }

    if (pdsOrganizationUpdateDTO.deleted.length > 0) {
      await Promise.all(
        pdsOrganizationUpdateDTO.deleted.map(async (organization) => {
          const { _id, ...rest } = organization;
          if (_id !== '') await transactionEntityManager.remove(this.createEntity(organization));
        }),
      );
    }
  }
}
