import { VppEffectivityDateDTO } from './data/dtos/vacant-positions-posting.dto';
import { Controller, Get, Post, Put, Delete, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { VacantPositionPostingDTO } from 'src/core/vacant-position-posting/data/dtos/vacant-positions-posting.dto';
import { VacantPositionPostingViewService } from './data/views/vacant-position-posting-view/vacant-position-posting-view.service';
import { VppPsbDTO } from './sub-modules/vpp-psb/data/dtos/vpp-psb.dto';
import { VppScheduleDto } from './sub-modules/vpp-schedule/data/dtos/vpp-schedule.dto';
import { VacantPositionPostingService } from './vacant-position-posting.service';
import { ExternalApplicantsPDSGuard } from './sub-modules/applicants/external-applicants/guards/external-applicants-pds.guard';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('vacant-position-postings')
export class VacantPositionPostingController {
  constructor(private vacantPositionPostingService: VacantPositionPostingService, private vppViewService: VacantPositionPostingViewService) {}

  //#region vacant position posting=
  //@UseGuards(AuthenticatedGuard)
  @Get('publications/')
  async getAllOpenPostings() {
    return this.vacantPositionPostingService.getAllOpenPostings();
  }

  @Get('publications/:vpp_id')
  async getOpenPostingDetails(@Param('vpp_id') vppId: string) {
    return this.vppViewService.getOpenPostingDetails(vppId);
  }

  @UseGuards(ExternalApplicantsPDSGuard)
  @Get('publications/portal/:vpp_id')
  async getOpenPostingDetailsJobPortal(@Param('vpp_id') vppId: string) {
    return this.vppViewService.getOpenPostingDetails(vppId);
  }

  @Get('appointing-authority-selection/')
  async getVppsForAppointingAuthoritySelection() {
    return await this.vacantPositionPostingService.getVppsForAppointingAuthoritySelection();
  }

  @Get(':vpp_id')
  async getApplicantEmployeeDetails(@Param('vpp_id') vppId: string) {
    return await this.vacantPositionPostingService.applicantDetails(vppId);
  }

  @Get(':vpp_id/competencies')
  async getVppCompetencies(@Param('vpp_id') vppId: string) {
    return await this.vacantPositionPostingService.getVppCompetencies(vppId);
  }

  @Get('/requesting-entity/:emp_id')
  async getRequestingEntityRequestedVpp(@Param('emp_id') employeeId: string) {
    //return await this.vacantPositionPostingService.applicantDetails(vppId);
    return await this.vacantPositionPostingService.getRequestingEntityRequestedVpp(employeeId);
  }

  @Get('prf/:prf_id')
  async getPostingsByPrfNo(@Param('prf_id') prfId: string) {
    return await this.vppViewService.getPostingsByPrfId(prfId);
  }

  @Get('single/:vpp_id')
  async getVppDetails(@Param('vpp_id') vppId: string) {
    return await this.vppViewService.getSinglePosting(vppId);
  }

  @Get('psb/:employee_id/:vpp_id')
  async getSinglePostingForPsb(@Param('employee_id') employeeId: string, @Param('vpp_id') vppId: string) {
    return await this.vacantPositionPostingService.getSinglePostingForPsb(employeeId, vppId);
  }

  @Get('psb/:employee_id')
  async getPostingsForPsb(@Param('employee_id') employeeId: string) {
    return await this.vacantPositionPostingService.getPostingsForPsb(employeeId);
  }

  @Get('publication/:prf_id')
  async getPostings(@Param('prf_id') prfId: string) {
    return await this.vacantPositionPostingService.getVppView(prfId);
  }

  @Post()
  async addPosting(@Body() postingDTO: VacantPositionPostingDTO) {
    return await this.vacantPositionPostingService.saveEntity(postingDTO);
  }

  @Put(':id')
  async updatePosting(@Param('id') _id: string, @Body() postingDTO: VacantPositionPostingDTO) {
    return await this.vacantPositionPostingService.updatePosting(_id, postingDTO);
  }

  @Delete(':id')
  async deletePosting(@Param('id') _id: string) {
    return await this.vacantPositionPostingService.removeEntity(_id);
  }

  //#endregion vacant position posting
  //#region schedules
  @Post(':id/schedules')
  async addPostingSchedule(@Param('id') vppId: string, @Body() vppScheduleDto: VppScheduleDto) {
    return await this.vacantPositionPostingService.vppScheduleService.addPostingSchedule(vppId, vppScheduleDto);
  }

  @Get(':id/schedules')
  async getPostingSchedule(@Param('id') vppId: string) {
    return await this.vacantPositionPostingService.getSchedules(vppId);
  }

  @Patch(':id/schedules/:schedule_id')
  async updatePostingSchedule(@Param('schedule_id') _id: string, @Body() vppScheduleDTO: VppScheduleDto) {
    return await this.vacantPositionPostingService.vppScheduleService.updatePostingSchedule(_id, vppScheduleDTO);
  }

  //#endregion schedules

  //#region schedule psb
  @Post(':id/schedules/:schedule_id/psb/')
  async addPostingSchedulePsb(@Param('schedule_id') vppScheduleId: string, @Body() vppPsbDTO: VppPsbDTO) {
    //return await this.vacantPositionPostingService.addPostingSchedulePsb({ vppScheduleId, ...vppSchedulePsbDTO });
  }

  @Get(':id/schedules/:schedule_id/psb/')
  async getSchedulePsb(@Param('schedule_id') vppScheduleId: string) {
    return await this.vacantPositionPostingService.getSchedulePsb(vppScheduleId);
  }

  @Get('schedules/calendar')
  async getCalendarSchedule() {
    return await this.vacantPositionPostingService.getCalendarSchedule();
  }
  //#endregion schedule psb
  @Patch('/appointment-effectivity/:vpp_id')
  async setVppEffectivityDate(@Param('vpp_id') vppId: string, @Body() vppEffectivityDateDTO: VppEffectivityDateDTO) {
    return await this.vacantPositionPostingService.setVppEffectivityDate(vppId, vppEffectivityDateDTO);
  }

  @Get('/job-description/:vpp_id')
  async getVppJDCompetenciesById(@Param('vpp_id') vppId: string) {
    return await this.vacantPositionPostingService.getVppJDCompetenciesById(vppId);
  }

  @Get('/positions/:vpp_id')
  async getVppItemNumbers(@Param('vpp_id') vppId: string) {
    return await this.vacantPositionPostingService.getVppItemNumbers(vppId);
  }

  @Get('/psb-details/:vpp_id')
  async getPsbDetails(@Param('vpp_id') vppId: string) {
    return await this.vacantPositionPostingService.getPsbDetails(vppId);
  }

  @Get('/squirtser/mikay/squirtster/:vpp_id')
  async resetAppointingAuthorityProcedure(@Param('vpp_id') vppId: string) {
    return await this.vacantPositionPostingService.entityRepository.query(`CALL sp_reset_appointing_authority_procedure(?);`, [vppId]);
  }

  @MessagePattern('get_employee_id_by_posting_applicant_id')
  async getEmployeeIdByPostingApplicantId(@Payload() postingApplicantId: string) {
    return await this.vacantPositionPostingService.getEmployeeIdByPostingApplicantId(postingApplicantId);
  }
}
