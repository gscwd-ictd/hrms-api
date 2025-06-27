import { PositionCompetencyProficiencyLevelService } from './../../../position-competency-proficiency-level/position-competency-proficiency-level.service';
import { QualificationStandardsService } from 'src/core/qualification-standards/qualification-standards.service';
import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OccupationsDutiesResponsibilitiesService } from '../../../occupations-duties-responsibilities/occupations-duties-responsibilities.service';
import { DepartmentService } from '../../../organization/department/department.service';
import { DivisionService } from '../../../organization/division/division.service';
import { OfficeService } from '../../../organization/office/office.service';
import { PlantillaPositionsService } from '../../plantilla-positions.service';
import { PlantillaView } from './data/entities/plantilla.view';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { Departments } from 'src/core/organization/department/data/entities/departments.entity';
import { Divisions } from 'src/core/organization/division/data/entities/divisions.entity';
import { Office } from 'src/core/organization/office/data/entities/office.entity';

@Injectable()
export class PlantillaViewService extends BaseEntityCrudService<PlantillaView> {
  constructor(
    @InjectRepository(PlantillaView)
    public readonly plantillaViewRepository: Repository<PlantillaView>,
    private readonly deptService: DepartmentService,
    private readonly divisionService: DivisionService,
    private readonly officeService: OfficeService,
    private readonly occupationDutiesResponsibilities: OccupationsDutiesResponsibilitiesService,
    private readonly posService: PlantillaPositionsService,
    private readonly qualificationStandardsService: QualificationStandardsService,
    private readonly positionCompetencyProficiencyLevelService: PositionCompetencyProficiencyLevelService,
  ) {
    super(plantillaViewRepository);
  }

  async findAllPermanentPlantillaPositions() {
    const result = await this.plantillaViewRepository.find({
      order: { itemNumber: 'ASC' },
    });
    const positions = result.map((item) => {
      return { ...item, isFilled: item.isFilled.toString() === '0' ? false : true };
    });
    return positions;
  }

  async getJD(_id: string) {
    let department: Departments;
    let office: Office;
    let description: string;
    let reportsTo: any;

    console.log(_id);
    const result = await this.plantillaViewRepository.findOne({ where: { positionId: _id } });
    console.log(result);
    //#region JD
    let division = await this.divisionService.divisionRepository.findOne({
      where: {
        code: result.assignedTo,
      },
      loadRelationIds: true,
    });

    if (division) {
      department = await this.deptService.departmentRepository.findOne({
        where: { _id: division.departmentId },
        loadRelationIds: true,
      });
      office = await this.officeService.officeRepository.findOne({ where: { _id: department.officeId } });
      description = division.description;

      reportsTo = await this.posService.plantillaPositionsRepository
        .createQueryBuilder('plantilla_positions')
        .select('pp.position_title', 'reportsTo')
        .from('plantilla_positions', 'pp')
        .innerJoin('division_positions', 'orgpos', 'orgpos.position_id_fk = pp._id')
        .innerJoin('salary_grade', 'sg', 'sg._id = pp.salary_grade_id_fk')
        .where('sg.salary_grade = 24 AND orgpos.division_id_fk = :div_id_fk AND pp._id <> :posId', {
          div_id_fk: division._id,
          posId: _id,
        })
        .getRawOne();

      if (!reportsTo) {
        //check sa department
        reportsTo = await this.posService.plantillaPositionsRepository
          .createQueryBuilder('plantilla_positions')
          .select('pp.position_title', 'reportsTo')
          .from('plantilla_positions', 'pp')
          .innerJoin('department_positions', 'orgpos', 'orgpos.position_id_fk = pp._id')
          .innerJoin('salary_grade', 'sg', 'sg._id = pp.salary_grade_id_fk')
          .where('sg.salary_grade = 26 AND orgpos.department_id_fk = :dept_id_fk AND pp._id <> :posId', {
            dept_id_fk: department._id,
            posId: _id,
          })
          .getRawOne();
        if (!reportsTo) {
          //check sa office
          reportsTo = await this.posService.plantillaPositionsRepository
            .createQueryBuilder('plantilla_positions')
            .select('pp.position_title', 'reportsTo')
            .from('plantilla_positions', 'pp')
            .innerJoin('office_positions', 'orgpos', 'orgpos.position_id_fk = pp._id')
            .innerJoin('salary_grade', 'sg', 'sg._id = pp.salary_grade_id_fk')
            .where("(sg.salary_grade = 27 or pp.position_title='Chairman') AND orgpos.office_id_fk = :office_id_fk AND pp._id <> :posId", {
              office_id_fk: office._id,
              posId: _id,
            })
            .getRawOne();
        }
      }
    } else {
      //check kung department pos siya
      department = await this.deptService.departmentRepository.findOne({
        where: { code: result.assignedTo },
        loadRelationIds: true,
      });
      if (department) {
        office = await this.officeService.officeRepository.findOne({
          where: { _id: department.officeId },
          loadRelationIds: true,
        });
        description = department.description;
        division = new Divisions();
        //check iyang bossing sa department
        reportsTo = await this.posService.plantillaPositionsRepository
          .createQueryBuilder('plantilla_positions')
          .select('pp.position_title', 'reportsTo')
          .from('plantilla_positions', 'pp')
          .innerJoin('department_positions', 'orgpos', 'orgpos.position_id_fk = pp._id')
          .innerJoin('salary_grade', 'sg', 'sg._id = pp.salary_grade_id_fk')
          .where('sg.salary_grade = 26 AND orgpos.department_id_fk = :dept_id_fk AND pp._id <> :posId', {
            dept_id_fk: department._id,
            posId: _id,
          })
          .getRawOne();
        if (!reportsTo) {
          //check sa office
          console.log('haha asdasdasd');
          reportsTo = await this.posService.plantillaPositionsRepository
            .createQueryBuilder('plantilla_positions')
            .select('pp.position_title', 'reportsTo')
            .from('plantilla_positions', 'pp')
            .innerJoin('office_positions', 'orgpos', 'orgpos.position_id_fk = pp._id')
            .innerJoin('salary_grade', 'sg', 'sg._id = pp.salary_grade_id_fk')
            .where('sg.salary_grade = 27  AND orgpos.office_id_fk = :office_id_fk AND pp._id <> :posId', {
              office_id_fk: office._id,
              posId: _id,
            })
            .getRawOne();
        }
      } else {
        office = await this.officeService.officeRepository.findOne({ where: { code: result.assignedTo } });
        description = office.description;
        division = new Divisions();
        department = new Departments();
        const { positionTitle } = (await this.officeService.entityRepository.query(`SELECT position_title positionTitle FROM plantilla_positions WHERE _id = ?`, [_id]))[0];
        if (positionTitle === 'Assistant General Manager') reportsTo = { reportsTo: 'General Manager A' };
        else if (positionTitle === 'General Manager A') {
          reportsTo = { reportsTo: 'N/A' };
        } else {
          console.log('haha');
          reportsTo = await this.posService.plantillaPositionsRepository
            .createQueryBuilder('plantilla_positions')
            .select('pp.position_title', 'reportsTo')
            .from('plantilla_positions', 'pp')
            .innerJoin('office_positions', 'orgpos', 'orgpos.position_id_fk = pp._id')
            .innerJoin('salary_grade', 'sg', 'sg._id = pp.salary_grade_id_fk')
            .where('(sg.salary_grade = 27 OR sg.salary_grade = 28) AND orgpos.office_id_fk = :office_id_fk AND pp._id <> :posId', {
              office_id_fk: office._id,
              posId: _id,
            })
            .getRawOne();
          if (!reportsTo) reportsTo = { reportsTo: 'General Manager A' };
        }
      }
    }
    //#endregion JD
    const { actualSalary, salaryGradeId, stepIncrement, salaryGrade, ...rest } = result;

    return {
      ...rest,
      salary: {
        id: salaryGradeId,
        salaryGrade,
        stepIncrement,
        amount: actualSalary,
      },
      assignedTo: { division: { id: division._id, name: division.name }, office: { id: office._id, name: office.name }, department: { id: department._id, name: department.name } },
      description,
      reportsTo: reportsTo['reportsTo'],
    };
  }

  async getDuties(_id: string) {
    const result = await this.plantillaViewRepository.findOne({ where: { positionId: _id } });

    //#region Duties and Responsibilities

    /* const coreDuties = await this.occupationDutiesResponsibilities.entityRepository
      .createQueryBuilder('odr')
      .select('dr.description', 'description')
      .addSelect('ogdr.percentage', 'percentage')
      .addSelect('cm.name', 'competency')
      .addSelect('p.level', 'level')
      .addSelect('d.type', 'domain')
      .distinct(true)
      .innerJoin('occupational_group_duties_responsibilities', 'ogdr', 'ogdr.odr_id_fk = odr._id')
      .innerJoin('position_competency_proficiency_level', 'pcpl', 'pcpl._id = ogdr.pcpl_id_fk')
      .innerJoin('proficiency', 'p', 'p._id = pcpl.proficiency_id_fk')
      .innerJoin('occupational_group', 'og', 'og._id = ogdr.occupational_group_id_fk')
      .innerJoin('duties_responsibilities', 'dr', 'dr._id = odr.duties_responsibilities_id_fk')
      .innerJoin('competency_model', 'cm', 'cm._id = p.competency_id_fk')
      .innerJoin('domain', 'd', 'd._id = cm.domain_id_fk')
      .where("ogdr.duty_type = 'core' AND og.position_id_fk = :_id", { _id })
      .orderBy('d.type', 'ASC')
      .addOrderBy('cm.name', 'ASC')
      .getRawMany(); */

    const coreDuties = await this.occupationDutiesResponsibilities.entityRepository
      .createQueryBuilder('odr')
      .select('dr.description', 'description')
      .addSelect('ogdr.percentage', 'percentage')
      .addSelect('cm.name', 'competency')
      .addSelect('p.level', 'level')
      .addSelect('d.type', 'domain')
      .distinct(true)
      .innerJoin('occupational_group_duties_responsibilities', 'ogdr', 'ogdr.odr_id_fk = odr._id')
      .innerJoin('position_competency_proficiency_level', 'pcpl', 'pcpl._id = ogdr.pcpl_id_fk')
      .innerJoin('proficiency', 'p', 'p._id = pcpl.proficiency_id_fk')
      .innerJoin('occupational_group', 'og', 'og._id = ogdr.occupational_group_id_fk')
      .innerJoin('duties_responsibilities', 'dr', 'dr._id = odr.duties_responsibilities_id_fk')
      .innerJoin('competency_model', 'cm', 'cm._id = p.competency_id_fk')
      .innerJoin('domain', 'd', 'd._id = cm.domain_id_fk')
      .where("ogdr.duty_type = 'core' AND og.position_id_fk = :_id", { _id })
      .orderBy('ogdr.percentage', 'DESC')
      .addOrderBy('cm.name', 'ASC')
      .getRawMany();

    /* const supportDuties = await this.occupationDutiesResponsibilities.entityRepository
      .createQueryBuilder('odr')
      .select('dr.description', 'description')
      .addSelect('ogdr.percentage', 'percentage')
      .addSelect('cm.name', 'competency')
      .addSelect('p.level', 'level')
      .addSelect('d.type', 'domain')
      .distinct(true)
      .innerJoin('occupational_group_duties_responsibilities', 'ogdr', 'ogdr.odr_id_fk = odr._id')
      .innerJoin('position_competency_proficiency_level', 'pcpl', 'pcpl._id = ogdr.pcpl_id_fk')
      .innerJoin('proficiency', 'p', 'p._id = pcpl.proficiency_id_fk')
      .innerJoin('occupational_group', 'og', 'og._id = ogdr.occupational_group_id_fk')
      .innerJoin('duties_responsibilities', 'dr', 'dr._id = odr.duties_responsibilities_id_fk')
      .innerJoin('competency_model', 'cm', 'cm._id = p.competency_id_fk')
      .innerJoin('domain', 'd', 'd._id = cm.domain_id_fk')
      .where("ogdr.duty_type = 'support' AND og.position_id_fk = :_id", { _id })
      .orderBy('d.type', 'ASC')
      .addOrderBy('cm.name', 'ASC')
      .getRawMany(); */

    const supportDuties = await this.occupationDutiesResponsibilities.entityRepository
      .createQueryBuilder('odr')
      .select('dr.description', 'description')
      .addSelect('ogdr.percentage', 'percentage')
      .addSelect('cm.name', 'competency')
      .addSelect('p.level', 'level')
      .addSelect('d.type', 'domain')
      .distinct(true)
      .innerJoin('occupational_group_duties_responsibilities', 'ogdr', 'ogdr.odr_id_fk = odr._id')
      .innerJoin('position_competency_proficiency_level', 'pcpl', 'pcpl._id = ogdr.pcpl_id_fk')
      .innerJoin('proficiency', 'p', 'p._id = pcpl.proficiency_id_fk')
      .innerJoin('occupational_group', 'og', 'og._id = ogdr.occupational_group_id_fk')
      .innerJoin('duties_responsibilities', 'dr', 'dr._id = odr.duties_responsibilities_id_fk')
      .innerJoin('competency_model', 'cm', 'cm._id = p.competency_id_fk')
      .innerJoin('domain', 'd', 'd._id = cm.domain_id_fk')
      .where("ogdr.duty_type = 'support' AND og.position_id_fk = :_id", { _id })
      .orderBy('ogdr.percentage', 'DESC')
      .addOrderBy('cm.name', 'ASC')
      .getRawMany();

    //#endregion

    return {
      positionId: _id,
      summary: result.summary,
      duties: {
        core: coreDuties,
        support: supportDuties,
      },
    };
  }

  async getPositionDescription(positionId: string) {
    try {
      const jobDescription = await this.getJD(positionId);
      const qualificationStandards = await this.qualificationStandardsService.entityRepository.findOne({
        select: ['eligibility', 'education', 'experience', 'training'],
        where: {
          positionId,
        },
      });
      const competencies = await this.positionCompetencyProficiencyLevelService.findAllCompetenciesProficienciesByPositionId(positionId);

      return {
        jobDescription,
        qualificationStandards,
        competencies,
      };
    } catch (error) {}
  }

  async getPositionDutiesAndResponsibilities(positionId: string) {
    try {
      const core = await this.entityRepository.query(
        `
        SELECT ogdr.percentage percentage, dr.description \`description\`,cm.name competency, prof.level \`level\`,d.type \`domain\` 
        FROM occupational_group_duties_responsibilities ogdr 
          INNER JOIN occupations_duties_responsibilities odr ON odr._id = ogdr.odr_id_fk 
          INNER JOIN occupational_group og ON og._id = ogdr.occupational_group_id_fk 
          INNER JOIN duties_responsibilities dr ON dr._id = odr.duties_responsibilities_id_fk 
            INNER JOIN position_competency_proficiency_level pcpl ON pcpl._id = ogdr.pcpl_id_fk 
            INNER JOIN proficiency prof ON prof._id = pcpl.proficiency_id_fk 
            INNER JOIN competency_model cm ON cm._id = prof.competency_id_fk 
            INNER JOIN domain d ON d._id = cm.domain_id_fk 
        WHERE og.position_id_fk = ? AND ogdr.duty_type='core' ORDER by ogdr.percentage desc, cm.name asc;
      `,
        [positionId],
      );

      const support = await this.entityRepository.query(
        `
        SELECT ogdr.percentage percentage, dr.description \`description\`,cm.name competency, prof.level \`level\`,d.type \`domain\` 
        FROM occupational_group_duties_responsibilities ogdr 
          INNER JOIN occupations_duties_responsibilities odr ON odr._id = ogdr.odr_id_fk 
          INNER JOIN occupational_group og ON og._id = ogdr.occupational_group_id_fk 
          INNER JOIN duties_responsibilities dr ON dr._id = odr.duties_responsibilities_id_fk 
            INNER JOIN position_competency_proficiency_level pcpl ON pcpl._id = ogdr.pcpl_id_fk 
            INNER JOIN proficiency prof ON prof._id = pcpl.proficiency_id_fk 
            INNER JOIN competency_model cm ON cm._id = prof.competency_id_fk 
            INNER JOIN domain d ON d._id = cm.domain_id_fk 
        WHERE og.position_id_fk = ? AND ogdr.duty_type='support'  ORDER by ogdr.percentage desc, cm.name asc;
      `,
        [positionId],
      );

      return { core, support };
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
}
