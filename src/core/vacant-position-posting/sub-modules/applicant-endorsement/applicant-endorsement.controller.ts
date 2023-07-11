import { ApplicantEndorsementStatus } from './utils/types/applicant-endorsement.enum';
import { ApplicantEndorsementDTO } from './data/applicant-endorsement.dto';
import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApplicantEndorsementService } from './applicant-endorsement.service';
import { PostingStatus } from '../../utils/enums/posting-status.enum';

@Controller('applicant-endorsement')
export class ApplicantEndorsementController {
  constructor(private readonly applicantEndorsementService: ApplicantEndorsementService) {}

  @Get('/hiring-process-results/')
  async getHiringProcessResults(@Query('effectivity_date') effectivityDate?: Date) {
    return await this.applicantEndorsementService.getHiringProcessResults(effectivityDate);
  }

  @Get('/:vpp_id')
  async getEndorsedApplicants(@Param('vpp_id') vppId: string) {
    return await this.applicantEndorsementService.getEndorsedApplicants(vppId);
  }

  @Get('/:vpp_id/all')
  async getAllQualifiedApplicants(@Param('vpp_id') vppId: string) {
    return await this.applicantEndorsementService.getAllQualifiedApplicants(vppId);
  }

  @Get('/publications/:employee_id')
  async getAllPublicationsUnderRequestingAuthority(@Param('employee_id') employeeId: string) {
    return await this.applicantEndorsementService.getAllPublicationsUnderRequestingEntity(employeeId);
  }

  @Get('/publications/:employee_id/pending')
  async getAllPendingEndorsementsPublicationsUnderRequestingEntity(@Param('employee_id') employeeId: string) {
    return await this.applicantEndorsementService.getAllPublicationsUnderRequestingEntityByEndorsementStatus(
      employeeId,
      ApplicantEndorsementStatus.ENDORSED,
      PostingStatus.REQUESTING_ENTITY_SELECTION,
    );
  }

  @Get('/publications/:employee_id/selected')
  async getAllSelectedEndorsementsPublicationsUnderRequestingEntity(@Param('employee_id') employeeId: string) {
    return [
      ...(await this.applicantEndorsementService.getAllPublicationsUnderRequestingEntityByEndorsementStatus(
        employeeId,
        ApplicantEndorsementStatus.SELECTED_BY_REQUESTING_ENTITY,
        PostingStatus.REQUESTING_ENTITY_SELECTION_DONE,
      )),
      ...(await this.applicantEndorsementService.getAllPublicationsUnderRequestingEntityByEndorsementStatus(
        employeeId,
        ApplicantEndorsementStatus.SELECTED_BY_APPOINTING_AUTHORITY,
        PostingStatus.APPOINTING_AUTHORITY_SELECTION_DONE,
      )),
      ...(await this.applicantEndorsementService.getAllPublicationsUnderRequestingEntityByEndorsementStatus(
        employeeId,
        ApplicantEndorsementStatus.SELECTED_BY_REQUESTING_ENTITY,
        PostingStatus.APPOINTING_AUTHORITY_SELECTION,
      )),
    ];
  }

  @Get('/shortlisted/:vpp_id')
  async getShortlistedApplicants(@Param('vpp_id') vppId: string) {
    return [
      ...(await this.applicantEndorsementService.getApplicantsByEndorsementStatus(vppId, ApplicantEndorsementStatus.SELECTED_BY_REQUESTING_ENTITY)),
      ...(await this.applicantEndorsementService.getApplicantsByEndorsementStatus(vppId, ApplicantEndorsementStatus.SELECTED_BY_APPOINTING_AUTHORITY)),
    ];
  }

  /**
   * @audience Employee Portal
   * @param vppId
   * @returns
   */
  @Get('/appointing-authority-selection/publications')
  async getAllPublicationsUnderAppointingAuthority(@Param('vpp_id') vppId: string) {
    return await this.applicantEndorsementService.getAllPublicationsUnderAppointingAuthority();
  }

  /**
   * @audience Employee Portal
   * @param vppId
   * @returns
   */
  @Get('/appointing-authority-selection/publications/pending')
  async getAllPendingEndorsementPublicationsUnderAppointingAuthority(@Param('vpp_id') vppId: string) {
    return await this.applicantEndorsementService.getAllPublicationsUnderAppointingAuthorityByEndorsementStatus(
      ApplicantEndorsementStatus.SELECTED_BY_REQUESTING_ENTITY,
      PostingStatus.APPOINTING_AUTHORITY_SELECTION,
    );
  }

  /**
   * @audience Employee Portal, HRMS
   * @param vppId
   * @returns
   */
  @Get('/appointing-authority-selection/publications/selected')
  async getAllSelectedEndorsementPublicationsUnderAppointingAuthority(@Param('vpp_id') vppId: string) {
    return await this.applicantEndorsementService.getAllPublicationsUnderAppointingAuthorityByEndorsementStatus(
      ApplicantEndorsementStatus.SELECTED_BY_APPOINTING_AUTHORITY,
      PostingStatus.APPOINTING_AUTHORITY_SELECTION_DONE,
    );
  }

  @Get('/appointing-authority-selection/:vpp_id')
  async getSelectedByAppointingAuthority(@Param('vpp_id') vppId: string) {
    return await this.applicantEndorsementService.getApplicantsByEndorsementStatus(vppId, ApplicantEndorsementStatus.SELECTED_BY_APPOINTING_AUTHORITY);
  }

  @Patch('/appointing-authority-selection/:vpp_id')
  async appointingAuthoritySelection(@Param('vpp_id') vppId: string, @Body() applicantEndorsementDTO: ApplicantEndorsementDTO) {
    return await this.applicantEndorsementService.appointingAuthoritySelection(vppId, applicantEndorsementDTO);
  }

  @Get('/qualified/:vpp_id')
  async getQualifiedApplicants(@Param('vpp_id') vppId: string) {
    return await this.applicantEndorsementService.getQualifiedApplicants(vppId);
  }

  @Post('/:vpp_id')
  async addEndorsedApplicants(@Param('vpp_id') vppId: string) {
    return await this.applicantEndorsementService.addEndorsedApplicants(vppId);
  }

  @Patch('/shortlist/:vpp_id')
  async shortlistApplicants(@Param('vpp_id') vppId: string, @Body() applicantEndorsementDTO: ApplicantEndorsementDTO) {
    return await this.applicantEndorsementService.selectApplicants(vppId, applicantEndorsementDTO);
  }
}
