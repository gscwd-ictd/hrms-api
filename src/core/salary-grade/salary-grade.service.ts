import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalaryGrade } from 'src/core/salary-grade/data/entities/salary-grade.entity';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { CreateSalaryGradeDto, SalaryGradeUpdateDTO } from './data/dtos/salary-grade.dto';
@Injectable()
export class SalaryGradeService extends BaseEntityCrudService<SalaryGrade> {
  constructor(
    @InjectRepository(SalaryGrade)
    public readonly salaryGradeRepository: Repository<SalaryGrade>,
  ) {
    super(salaryGradeRepository);
  }

  async createSalaryGrade(dto: CreateSalaryGradeDto) {
    try {
      const effectivityYear = new Date().getFullYear();

      // sp_update_plantill_salary_grade()
      const result = await Promise.all(
        dto.salaryGradeList.map(async (salaryGradeItem) => {
          const { salaryGrade, stepIncrement, amount } = salaryGradeItem;
          return await this.entityRepository.createQueryBuilder().insert().values({ salaryGrade, stepIncrement, amount, effectivityYear: effectivityYear }).execute();
        }),
      );

      await this.entityRepository.query(`CALL sp_update_plantilla_salary_grade()`);

      return result;
    } catch (error) {
      Logger.log(error);
      if (error.errno === 1062) throw new HttpException('Duplicate Entry', HttpStatus.CONFLICT);
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
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

  async getCurrentSalaryGradeTable() {
    try {
      const effectivityYear = await this.entityRepository.query('SELECT DISTINCT effectivity_year FROM salary_grade ORDER BY effectivity_year DESC LIMIT 1');

      const salaryGrades = await this.entityRepository.query('SELECT DISTINCT salary_grade FROM salary_grade WHERE effectivity_year = ? ORDER BY salary_grade ASC', [
        effectivityYear[0].effectivity_year,
      ]);

      const sgStepsArray = await Promise.all(
        salaryGrades.map(async (sg) => {
          const sgStep = await this.salaryGradeRepository.find({
            select: ['salaryGrade', 'stepIncrement', 'amount'],
            where: { salaryGrade: sg.salary_grade, effectivityYear: effectivityYear[0].effectivity_year },
          });
          const sgStepArrayToObject = await Promise.all(
            sgStep.map(async (sgStepArrayToObjectItem) => {
              return sgStepArrayToObjectItem.amount;
            }),
          );
          return [sg.salary_grade, ...sgStepArrayToObject];
        }),
      );

      return [...sgStepsArray];
    } catch (error) {
      Logger.log(error);
      throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getPreviousSalaryGradeTable() {
    try {
      const effectivityYear = await this.entityRepository.query('SELECT DISTINCT effectivity_year FROM salary_grade ORDER BY effectivity_year DESC LIMIT 1 OFFSET 1');

      if (effectivityYear.length === 0) {
        return [];
      } else {
        const salaryGrades = await this.entityRepository.query('SELECT DISTINCT salary_grade FROM salary_grade WHERE effectivity_year = ? ORDER BY salary_grade ASC', [
          effectivityYear[0].effectivity_year,
        ]);
        const sgStepsArray = await Promise.all(
          salaryGrades.map(async (sg) => {
            const sgStep = await this.salaryGradeRepository.find({
              select: ['salaryGrade', 'stepIncrement', 'amount'],
              where: { salaryGrade: sg.salary_grade, effectivityYear: effectivityYear[0].effectivity_year },
            });
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
    } catch (error) {
      Logger.log(error);
      throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getSalaryGradeByStepIncrement(stepIncrement: number) {
    const effectivityYear = await this.entityRepository.query('SELECT DISTINCT effectivity_year FROM salary_grade ORDER BY effectivity_year DESC LIMIT 1');

    return await this.entityRepository.query(
      'SELECT _id, salary_grade salaryGrade, step_increment stepIncrement, amount FROM salary_grade WHERE step_increment = ? AND effectivity_year = ? ORDER BY salary_grade',
      [stepIncrement, effectivityYear[0].effectivity_year],
    );
  }

  async getAllSalaryGradeStepIncrement() {
    const effectivityYear = await this.entityRepository.query('SELECT DISTINCT effectivity_year FROM salary_grade ORDER BY effectivity_year DESC LIMIT 1');

    return await this.entityRepository.query(
      'SELECT _id, salary_grade salaryGrade, step_increment stepIncrement, amount FROM salary_grade WHERE effectivity_year = ? ORDER BY salary_grade ASC,step_increment ASC',
      [effectivityYear[0].effectivity_year],
    );
  }
}
