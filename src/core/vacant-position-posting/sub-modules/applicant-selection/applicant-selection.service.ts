import { ExternalApplicantsService } from './../applicants/external-applicants/external-applicants.service';
import { Injectable, HttpException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { Repository } from 'typeorm';
import { ExternalApplicantsDTO } from '../applicants/external-applicants/data/dtos/external-applicants.dto';
import { ApplicantSelectionDTO } from './data/applicant-selection.dto';
import { ApplicantSelection } from './data/applicant-selection.entity';

@Injectable()
export class ApplicantSelectionService extends BaseEntityCrudService<ApplicantSelection> {
  constructor(
    @InjectRepository(ApplicantSelection)
    private readonly applicantSelectionRepository: Repository<ApplicantSelection>,
    private readonly externalApplicantsService: ExternalApplicantsService,
  ) {
    super(applicantSelectionRepository);
  }

  async addApplicant(vppId: string, externalApplicantsDTO: ExternalApplicantsDTO) {
    try {
      return await this.externalApplicantsService.saveEntity(externalApplicantsDTO);
    } catch (error) {
      throw new HttpException(error, 500);
    }
  }

  async selectApplicants(applicantSelectionDTO: ApplicantSelectionDTO) {
    try {
      return await this.saveEntity({ ...applicantSelectionDTO });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
