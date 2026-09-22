import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Put, Query } from '@nestjs/common';
import { EmployeeDTO, UpdateBasicEmployeeInfoDto } from 'src/core/employees/data/dtos/employee.dto';
import { EmployeesService } from './employees.service';
import { NatureOfAppointment } from 'src/global/utils/enums/nature-of-appointment.enum';
import { BasicEmployeeInfo } from './utils/employee.type';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get('/name/')
  async getEmployeesByNameMatch(@Query('value') name: string) {
    if (name === undefined) return await this.employeesService.getAllEmployeeNames();
    return await this.employeesService.getEmployeesByNameMatch(name);
  }

  @Get('')
  async getAllEmployeesList() {
    return await this.employeesService.getAllEmployees();
  }

  @Get('/inactive')
  async getAllInactiveEmployeesList() {
    return await this.employeesService.getAllInactiveEmployees();
  }

  @Get('test/test/test/test')
  async testEmail() {
    return await this.employeesService.testEmail();
  }

  @Get('/sub')
  async getEmployeesUnderSupervisor(employeeId: string) {
    return await this.employeesService.getEmployeesUnderSupervisor(employeeId);
  }

  @Get('/:organization_id/list/')
  async getEmployeesByOrgIdAlone(@Param('organization_id') orgId: string) {
    return await this.employeesService.getEmployeesByOrgIdAlone(orgId);
  }

  @Post()
  async addEmployeeWithRegisterLink(@Body() addEmployeeObj: EmployeeDTO) {
    return await this.employeesService.addEmployeeWithRegisterLink(addEmployeeObj);
  }

  @Get()
  async getEmployeesWithPositions() {
    return await this.employeesService.getAllEmployees();
  }

  @Get('/options/')
  async getAllPermanentCasualEmployees() {
    return await this.employeesService.getAllPermanentCasualEmployees();
  }

  @Get('/options/v2/')
  async getAllPermanentCasualEmployees2() {
    return await this.employeesService.getAllPermanentCasualEmployees2();
  }

  @Get('asd/asd/asd/asd/asd/:employee_id')
  async getEmployeeWithSupervisor(@Param('employee_id') employeeId: string) {
    return await this.employeesService.getEmployeeWithSupervisor(employeeId);
  }

  @Get('asd/asd/asd/asd')
  async getAllEmployeesWithSupervisor() {
    return await this.employeesService.getAllEmployeesWithSupervisor();
  }

  @Get('/:employee_id/company-id')
  async getCompanyIdByEmployeeId(@Param('employee_id') employeeId: string) {
    return await this.employeesService.getCompanyIdByEmployeeId(employeeId);
  }

  @Get(':id')
  async getAnEmployeeById(@Param('id') _id: string) {
    try {
      return await this.employeesService.getEmployeeDetails(_id);
    } catch (error) {
      throw new HttpException('Employee not found', HttpStatus.NOT_FOUND);
    }
  }

  @Get('employee-portal/details/:id')
  async getEmployeePortalDetails(@Param('id') _id: string) {
    return await this.employeesService.getEmployeePortalDetails(_id);
  }

  @Get('company-id/:company_id')
  async getEmployeeDetailsByCompanyId(@Param('company_id') companyId: string) {
    return await this.employeesService.getEmployeeDetailByCompanyId(companyId);
  }

  @Get('supervisors/:employee_id/subordinates')
  async getSubordinates(@Param('employee_id') employeeId: string) {
    return await this.employeesService.getSubordinates(employeeId);
  }

  /* find employee details by plantilla id */
  @Get('plantilla/:plantillaId')
  async getEmployeeDetailsByPlantillaId(@Param('plantillaId') plantillaId: string) {
    return await this.employeesService.getEmployeeDetailsByPlantillaId(plantillaId);
  }

  @Get('plantilla-positions/get-everything/:employee_id')
  async getEmployeePosition(@Param('employee_id') employeeId: string) {
    //return employeeId;
    return await this.employeesService.getEmployeePosition(employeeId);
  }

  /**
   * @dateCreated 2025-02-25
   * @description this function is used for updating Employee's (Name, Title Prefix/Suffix, Birthday, Sex)
   * @author RV
   * @param updateBasicEmployeeInfoDto
   * @returns Promise<BasicEmployeeInfo>
   */
  @Put('details/basic')
  async updateBasicEmployeeInfo(@Body() updateBasicEmployeeInfoDto: UpdateBasicEmployeeInfoDto): Promise<BasicEmployeeInfo> {
    const result = await this.employeesService.updateBasicEmployeeInfo(updateBasicEmployeeInfoDto);
    return result;
  }

  /**
   * @dateCreated 2025-02-25
   * @description this function is used for fetching Employee's (Name, Title Prefix/Suffix, Birthday, Sex,CivilStatus)
   * @param employeeId
   * @author RV
   * @returns Promise<BasicEmployeeInfo>
   */
  @Get('details/basic/:employee_id')
  async getBasicEmployeeInfo(@Param('employee_id') employeeId: string) {
    const result = await this.employeesService.getBasicEmployeeInfo(employeeId);
    return result;
  }

  @Get('reports/detailed/')
  async generateReportOnEmployeeDetails(
    @Query('company_id') companyId: boolean,
    @Query('employee_id') employeeId: string,
    @Query('nature_of_appointment') natureOfAppointment: NatureOfAppointment,
    @Query('personal_details') personalDetails: boolean,
    @Query('gsis') gsis: boolean,
    @Query('pagibig') pagibig: boolean,
    @Query('sss') sss: boolean,
    @Query('tin') tin: boolean,
    @Query('philhealth') philhealth: boolean,
    @Query('residential_address') residentialAddress: boolean,
    @Query('permanent_address') permanentAddress: boolean,
    @Query('primary_education') primaryEducation: boolean,
    @Query('secondary_education') secondaryEducation: boolean,
    @Query('vocational_course') vocationalCourse: boolean,
    @Query('college_education') collegeEducation: boolean,
    @Query('graduate_studies') graduateStudies: boolean,
    @Query('eligibility') eligibility: boolean,
    @Query('date_hired') dateHired: boolean,
    @Query('office') office: boolean,
    @Query('division') division: boolean,
    @Query('department') department: boolean,
    @Query('position_title') positionTitle: boolean,
    @Query('assignment') assignment: boolean,
    @Query('salary_grade') salaryGrade: boolean,
    @Query('amount') amount: boolean,
  ) {
    return await this.employeesService.generateReportOnEmployeeDetails({
      companyId,
      employeeId,
      natureOfAppointment,
      personalDetails,
      gsis,
      pagibig,
      sss,
      tin,
      residentialAddress,
      permanentAddress,
      primaryEducation,
      secondaryEducation,
      vocationalCourse,
      collegeEducation,
      graduateStudies,
      eligibility,
      philhealth,
      dateHired,
      assignment,
      positionTitle,
      department,
      division,
      office,
      salaryGrade,
      amount,
    });
  }

  @Get('meter-reading/all-employees/')
  async getAllEmployeesWithPagination(@Query('page') page: number, @Query('limit') limit: number, @Query('q') name: string) {
    return await this.employeesService.getAllEmployeesWithPagination({ page: page ? page : 0, limit: limit ? limit : 0, name: name ? name : '' });
  }
}
