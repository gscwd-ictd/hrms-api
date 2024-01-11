import { Inject, Injectable, UploadedFiles } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalaryGrade } from 'src/core/salary-grade/data/entities/salary-grade.entity';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { CreateSalaryGradeDto, SalaryGradeDto, SalaryGradeUpdateDTO } from './data/dtos/salary-grade.dto';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class SalaryGradeService extends BaseEntityCrudService<SalaryGrade> {
  constructor(
    @InjectRepository(SalaryGrade)
    public readonly salaryGradeRepository: Repository<SalaryGrade>,
  ) {
    super(salaryGradeRepository);
  }

  async createSalaryGrade(dto: CreateSalaryGradeDto) {
    const effectivityYear = new Date().getFullYear();
    console.log(dto);
    // return await Promise.all(
    //   dto.salaryGradeList.map(async (salaryGradeItem) => {
    //     const { salaryGrade, stepIncrement, amount } = salaryGradeItem;
    //     return await salaryGradeItem;
    //     //return await this.entityRepository.createQueryBuilder().insert().values({ salaryGrade, stepIncrement, amount, effectivityYear: effectivityYear }).execute();
    //   }),
    // );
  }

  async updateSalaryGrade(salaryGradeUpdateDTO: SalaryGradeUpdateDTO) {
    console.log(salaryGradeUpdateDTO);
    const updatedSalaryGrade = await Promise.all(
      salaryGradeUpdateDTO.salaryGradeList.map(async (salaryGradeItem) => {
        const { _id, salaryGrade, stepIncrement, amount } = salaryGradeItem;
        return await this.entityRepository.createQueryBuilder().update().set({ salaryGrade, stepIncrement, amount }).where('_id = :_id', { _id }).execute();
      }),
    );
    return updatedSalaryGrade;
  }

  async getSalaryGradeTable() {
    const salaryGrades = await this.entityRepository.query('SELECT DISTINCT salary_grade FROM salary_grade ORDER BY salary_grade ASC');

    const sgStepsArray = await Promise.all(
      salaryGrades.map(async (sg) => {
        const sgStep = await this.salaryGradeRepository.find({ select: ['salaryGrade', 'stepIncrement', 'amount'], where: { salaryGrade: sg.salary_grade } });
        const sgStepArrayToObject = await Promise.all(
          sgStep.map(async (sgStepArrayToObjectItem) => {
            return sgStepArrayToObjectItem.amount;
          }),
        );
        return [sg.salary_grade, ...sgStepArrayToObject];
      }),
    );

    return [...sgStepsArray];
  }

  async getSalaryGradeByStepIncrement(stepIncrement: number) {
    return await this.entityRepository.query(
      'SELECT _id, salary_grade salaryGrade, step_increment stepIncrement, amount FROM salary_grade WHERE step_increment = ? ORDER BY salary_grade',
      [stepIncrement],
    );
  }

  async getAllSalaryGradeStepIncrement() {
    return await this.entityRepository.query(
      'SELECT _id, salary_grade salaryGrade, step_increment stepIncrement, amount FROM salary_grade ORDER BY salary_grade ASC,step_increment ASC',
    );
  }
}
