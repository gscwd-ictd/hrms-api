import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { CreateSalaryGradeDto, SalaryGradeUpdateDTO } from './data/dtos/salary-grade.dto';
import { SalaryGradeService } from './salary-grade.service';

//@UseGuards(AuthenticatedGuard)
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

  @Get('current')
  async getCurrentSalaryGradeTable() {
    return await this.salaryGradeService.getCurrentSalaryGradeTable();
  }

  @Get('previous')
  async getPreviousSalaryGradeTable() {
    return await this.salaryGradeService.getPreviousSalaryGradeTable();
  }

  @Get('/:id')
  async findSalaryGradeById(@Param('id') _id: string) {
    return await this.salaryGradeService.findEntityById(_id);
  }
}
