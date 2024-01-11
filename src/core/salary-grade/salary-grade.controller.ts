import { UserLogsInterceptor } from './../../global/user-logs/interceptors/user-logs.interceptor';
import { AuthenticatedGuard } from 'src/global/auth/guards/authenticated2.guard';
import { Body, Controller, Get, Param, Post, Put, UseGuards, UseInterceptors } from '@nestjs/common';
import { CreateSalaryGradeDto, SalaryGradeDto, SalaryGradeUpdateDTO } from './data/dtos/salary-grade.dto';
import { SalaryGradeService } from './salary-grade.service';
import { GetSalaryGradeInterceptor } from './interceptors/get-salary-grade.interceptor';

@UseGuards(AuthenticatedGuard)
@UseInterceptors(UserLogsInterceptor)
@Controller('salary-grade')
export class SalaryGradeController {
  constructor(private readonly salaryGradeService: SalaryGradeService) {}

  @Post()
  async createSalaryGrade(@Body() salaryGrade: CreateSalaryGradeDto) {
    return await this.salaryGradeService.createSalaryGrade(salaryGrade);
  }

  @Get('/step-increment/:step_increment')
  async getSalaryGradeByStepIncrement(@Param('step_increment') stepIncrement: number) {
    return await this.salaryGradeService.getSalaryGradeByStepIncrement(stepIncrement);
  }

  @Get('/step-increment/')
  async getAllSalaryGradeStepIncrement() {
    return await this.salaryGradeService.getAllSalaryGradeStepIncrement();
  }

  @Put()
  async updateSalaryGrade(@Body() salaryGradeUpdateDTO: SalaryGradeUpdateDTO) {
    return await this.salaryGradeService.updateSalaryGrade(salaryGradeUpdateDTO);
  }

  @Get()
  async findAllSalaryGrade() {
    return await this.salaryGradeService.getSalaryGradeTable();
  }

  @Get('/:id')
  async findSalaryGradeById(@Param('id') _id: string) {
    return await this.salaryGradeService.findEntityById(_id);
  }
}
