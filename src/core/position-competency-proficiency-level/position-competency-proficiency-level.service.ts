import { HttpCode, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { Repository } from 'typeorm';
import { CompetencyModelService } from '../competency-model/competency-model.service';
import { SalaryGradeService } from '../salary-grade/salary-grade.service';
import { PlantillaPositionsService } from '../plantilla-positions/plantilla-positions.service';
import { PositionCompetencyProficiencyLevel } from './data/entities/position-competency-proficiency-level.entity';
import { PcplDeleteDTO, PcplDTO, PcplUpdateDTO } from './data/dtos/position-competency-proficiency-level.dto';
import { Proficiency } from '../proficiency/data/entities/proficiency.entity';
import { PcplUpdateType } from './utils/types/pcpl-update.type';

@Injectable()
export class PositionCompetencyProficiencyLevelService extends BaseEntityCrudService<PositionCompetencyProficiencyLevel> {
  constructor(
    @InjectRepository(PositionCompetencyProficiencyLevel)
    private readonly pcpl: Repository<PositionCompetencyProficiencyLevel>,
    private readonly competencyService: CompetencyModelService,
    private readonly salaryGrade: SalaryGradeService,
    private readonly position: PlantillaPositionsService,
  ) {
    super(pcpl);
  }

  private async getCompetencyPerDomainPerPosition(posId: string, domainId: string) {
    return await this.competencyService.entityRepository
      .createQueryBuilder('competency_model')
      .select('pcpl._id', 'pcplId')
      .addSelect('code')
      .addSelect('name')
      .addSelect('competency_model.desc', 'description')
      .addSelect('prof.level', 'level')
      .addSelect('prof.key_actions', 'keyActions')
      .innerJoin('domain', 'domain', 'domain._id = competency_model.domain_id_fk')
      .innerJoin('proficiency', 'prof', 'prof.competency_id_fk = competency_model._id')
      .innerJoin('position_competency_proficiency_level', 'pcpl', 'pcpl.proficiency_id_fk=prof._id')
      .innerJoin('occupational_group', 'og', 'og._id = pcpl.occupational_group_id_fk')
      .where('og.position_id_fk = :pos_id AND competency_model.domain_id_fk = :domainId', {
        pos_id: posId,
        domainId: domainId,
      })
      .orderBy('code', 'ASC')
      .getRawMany();
  }

  private async getCompetencyIdCodeNamePerPosition(posId: string, domainId: string) {
    return await this.competencyService.entityRepository
      .createQueryBuilder('competency_model')
      .select('pcpl._id', 'pcplId')
      .addSelect('code')
      .addSelect('name')
      .addSelect('prof.level', 'level')
      .addSelect('`desc`', 'competencyDescription')
      .addSelect('key_actions', 'keyActions')
      .innerJoin('domain', 'domain', 'domain._id = competency_model.domain_id_fk')
      .innerJoin('proficiency', 'prof', 'prof.competency_id_fk = competency_model._id')
      .innerJoin('position_competency_proficiency_level', 'pcpl', 'pcpl.proficiency_id_fk=prof._id')
      .innerJoin('occupational_group', 'og', 'og._id = pcpl.occupational_group_id_fk')
      .where('og.position_id_fk = :pos_id AND competency_model.domain_id_fk = :domainId', {
        pos_id: posId,
        domainId: domainId,
      })
      .orderBy('code', 'ASC')
      .getRawMany();
  }

  private async countAssignedCompetenciesPerPosition(positionId: string) {
    try {
      return await this.competencyService.entityRepository
        .createQueryBuilder('cm')
        .select('count(pcpl._id)', 'currentCompetencyCount')
        .innerJoin('domain', 'd', 'd._id=cm.domain_id_fk')
        .innerJoin('proficiency', 'p', 'p.competency_id_fk=cm._id')
        .innerJoin('position_competency_proficiency_level', 'pcpl', 'pcpl.proficiency_id_fk = p._id')
        .innerJoin('occupational_group', 'og', 'og._id = pcpl.occupational_group_id_fk')
        .where(`position_id_fk = :positionId AND (d.type = 'Functional' OR d.type= 'Cross-Cutting Functional')`, { positionId })
        .getRawOne();
    } catch (error) {
      throw new HttpException(error, 500);
    }
  }

  async assignCompetenciesToPosition(positionId: string, proficiencyIds: PcplDTO) {
    try {
      const occupationalGroupId = (
        await this.competencyService.entityRepository.query(`SELECT _id as occupationalGroupId FROM occupational_group WHERE position_id_fk = ?`, [positionId])
      )[0].occupationalGroupId;

      const addedCompetencies = await Promise.all(
        proficiencyIds.proficiencyIds.map(async (proficiency) => {
          //check count competencycount if = 4
          const countPositionCompetency = await this.countAssignedCompetenciesPerPosition(positionId);
          //console.log(countPositionCompetency);
          if (countPositionCompetency.currentCompetencyCount == '4') throw new HttpException('Four (4) competencies already assigned to this position', HttpStatus.FORBIDDEN);
          return await this.saveEntity({ occupationalGroupId, profId: proficiency });
        }),
      );
      return addedCompetencies;
    } catch (error) {
      console.log(error.message);
      throw new HttpException(error, 500);
    }
  }

  async removeCompetenciesFromPosition(pcplDeleteDTO: PcplDeleteDTO) {
    try {
      const removeResult = await this.entityRepository.query('DELETE FROM position_competency_proficiency_level WHERE _id IN (?);', [pcplDeleteDTO.pcplIds]);
      if (removeResult.affectedRows !== 0) {
        return { deleted: pcplDeleteDTO.pcplIds };
      }
    } catch (error) {
      throw new HttpException(error, 500);
    }
  }

  async getAllComptenciesPerOccupations(occupationId: string) {
    const occupationalGroupCompetency = await this.entityRepository
      .createQueryBuilder('pcpl')
      .select('og._id', 'occupationalGroupId')
      .addSelect('o.occupation_name', 'occupationName')
      .innerJoin('occupational_group', 'og', 'pcpl.occupational_group_id_fk = og._id')
      .innerJoin('occupations', 'o', 'o._id = og.occupation_id_fk')
      .where('o._id=:occupationId', { occupationId })
      .getRawOne();

    const { occupationalGroupId, ...rest } = occupationalGroupCompetency;

    const competencies = await this.pcpl
      .createQueryBuilder('pcpl')
      .select('d.type', 'type')
      .addSelect('cm._id', 'competencyId')
      .addSelect('cm.code', 'code')
      .addSelect('cm.name', 'name')
      .innerJoin('proficiency', 'p', 'p._id=pcpl.proficiency_id_fk')
      .innerJoin('competency_model', 'cm', 'cm._id = p.competency_id_fk')
      .innerJoin('domain', 'd', 'd._id = cm.domain_id_fk')
      .where("pcpl.occupational_group_id_fk = :occupationalGroupId AND d.type not in ('Core','Leadership/Managerial')", { occupationalGroupId })
      .getRawMany();
    return { ...rest, competencies };
  }

  async getAllCompetencyProficiencies(posId: string) {
    try {
      const salarygrade = await this.salaryGrade.entityRepository
        .createQueryBuilder('salary_grade')
        .select('salary_grade')
        .innerJoin('plantilla_positions', 'pp', 'pp.salary_grade_id_fk = salary_grade._id')
        .where('pp._id = :posId', { posId })
        .getRawOne();

      const pos_name = await this.position.entityRepository.createQueryBuilder('plantilla_positions').select('position_title').where('_id = :posId', { posId }).getRawOne();

      return {
        positionId: posId,
        positionName: pos_name.position_title,
        salaryGrade: salarygrade.salary_grade_salary_grade,
        core: await this.getCompetencyPerDomainPerPosition(posId, '136c50f0-8e3c-11ec-ae65-54ab3a99e60e'),
        functional: await this.getCompetencyPerDomainPerPosition(posId, '136f44fe-8e3c-11ec-ae65-54ab3a99e60e'),
        crossCutting: await this.getCompetencyPerDomainPerPosition(posId, '1371f33c-8e3c-11ec-ae65-54ab3a99e60e'),
        managerial: await this.getCompetencyPerDomainPerPosition(posId, '13747e8b-8e3c-11ec-ae65-54ab3a99e60e'),
      };
    } catch (error) {
      throw new HttpException('Position not found', 404);
    }
  }

  async getAllCompetencyProficienciesFunctional(posId: string) {
    try {
      const salarygrade = await this.salaryGrade.entityRepository
        .createQueryBuilder('salary_grade')
        .select('salary_grade')
        .innerJoin('plantilla_positions', 'pp', 'pp.salary_grade_id_fk = salary_grade._id')
        .where('pp._id = :posId', { posId })
        .getRawOne();

      const pos_name = await this.position.entityRepository.createQueryBuilder('plantilla_positions').select('position_title').where('_id = :posId', { posId }).getRawOne();
      const functional = await this.getCompetencyIdCodeNamePerPosition(posId, '136f44fe-8e3c-11ec-ae65-54ab3a99e60e');
      const crossCutting = await this.getCompetencyIdCodeNamePerPosition(posId, '1371f33c-8e3c-11ec-ae65-54ab3a99e60e');
      return {
        positionId: posId,
        positionName: pos_name.position_title,
        salaryGrade: salarygrade.salary_grade_salary_grade,
        functional: [...functional, ...crossCutting],
      };
    } catch (error) {
      throw new HttpException('Position not found', 404);
    }
  }

  async getOccupationCompetenciesForPositionForDropdown(positionId: string) {
    const salaryGrade = await this.salaryGrade.entityRepository
      .createQueryBuilder('salary_grade')
      .select('salary_grade', 'salaryGrade')
      .innerJoin('plantilla_positions', 'pp', 'pp.salary_grade_id_fk = salary_grade._id')
      .where('pp._id = :positionId', { positionId })
      .getRawOne();

    if (salaryGrade.salary_grade_salary_grade <= 20) {
      //1. count competencies currently assigned to the position
      const countCurrentAssignedCompetencies = this.countAssignedCompetenciesPerPosition(positionId);
      //2. check if count reached 4
      // if ((countCurrentAssignedCompetencies.currentCompetencyCount = 4)) {
      //   throw new HttpException('Competencies already set for this positions.', HttpStatus.FORBIDDEN);
      // }
      const occupationId = (
        await this.competencyService.entityRepository.query('SELECT occupation_id_fk as occupationId FROM occupational_group WHERE position_id_fk = ?', [positionId])
      )[0].occupationId;

      const functionalCompetencies = await this.competencyService.entityRepository
        .createQueryBuilder('cm')
        .select('p._id', 'proficiencyId')
        .addSelect(`concat(cm.code,'-',cm.name)`, 'label')
        .addSelect('cm.code', 'code')
        .addSelect('p.level', 'level')
        .innerJoin('proficiency', 'p', 'p.competency_id_fk = cm._id')
        .innerJoin('domain', 'd', 'cm.domain_id_fk = d._id')
        .where(
          `p.level = 'BASIC' AND  cm._id IN (SELECT competency_model_id_fk FROM competency_model_occupation WHERE occupation_id_fk = :occupationId) AND d.type='Functional' 
              `,
          {
            occupationId,
          },
        )
        .orderBy('cm.code', 'ASC')
        .getRawMany();

      const crossCuttingCompetencies = await this.competencyService.entityRepository
        .createQueryBuilder('cm')
        .select('p._id', 'proficiencyId')
        .addSelect(`concat(cm.code,'-',cm.name)`, 'label')
        .addSelect('cm.code', 'code')
        .addSelect('p.level', 'level')
        .innerJoin('proficiency', 'p', 'p.competency_id_fk = cm._id')
        .innerJoin('domain', 'd', 'cm.domain_id_fk = d._id')
        .where(`p.level = 'BASIC' AND d.type='Cross-Cutting Functional'`)
        .orderBy('cm.code', 'ASC')
        .getRawMany();

      const crossCutting = await Promise.all(
        crossCuttingCompetencies.map(async (competency) => {
          const { proficiencyId, label, code, level } = competency;
          return { label, value: { proficiencyId, code, name: label } };
        }),
      );

      const functional = await Promise.all(
        functionalCompetencies.map(async (competency) => {
          const { proficiencyId, label, code, level } = competency;
          return { label, value: { proficiencyId, code, name: label } };
        }),
      );
      return [
        { label: 'Functional', options: functional },
        { label: 'Cross-Cutting Functional', options: crossCutting },
      ];
    } else {
      const managerialCompetencies = await this.competencyService.entityRepository
        .createQueryBuilder('cm')
        .select('p._id', 'proficiencyId')
        .addSelect(`concat(cm.code,'-',cm.name)`, 'label')
        .addSelect('cm.code', 'code')
        .addSelect('p.level', 'level')
        .innerJoin('proficiency', 'p', 'p.competency_id_fk = cm._id')
        .innerJoin('domain', 'd', 'cm.domain_id_fk = d._id')
        .where(`p.level = 'BASIC' AND d.type='Leadership/Managerial'`)
        .orderBy('cm.code', 'ASC')
        .getRawMany();
      const managerial = await Promise.all(
        managerialCompetencies.map(async (competency) => {
          const { proficiencyId, label, code, level } = competency;
          return { label, value: { proficiencyId, code, name: label } };
        }),
      );
      return [{ label: 'Managerial', options: managerial }];
    }
  }

  private async updatePcplPerDomain(pcplsPerDomain: PcplUpdateType[]) {
    try {
      return await Promise.all(
        pcplsPerDomain.map(async (pcplPerDomain) => {
          //1. Get ProficiencyId using PcplId;
          const proficiencyId = (
            await this.entityRepository.query('SELECT proficiency_id_fk AS proficiencyId FROM position_competency_proficiency_level WHERE _id = ?', [pcplPerDomain.pcplId])
          )[0].proficiencyId;

          //2. Get Competency Model and Level using proficiencyId;
          const competencyModelId = (
            await this.entityRepository.query(
              `SELECT cm._id AS competencyModelId from competency_model cm INNER JOIN 
            proficiency p ON p.competency_id_fk = cm._id WHERE p._id = ?
          `,
              [proficiencyId],
            )
          )[0].competencyModelId;

          //3. Get the Updated proficiencyId using the fetched Competency Model and the level from the payload;
          const updatedProficiencyId = (
            await this.entityRepository.query(`SELECT _id  AS updatedProficiencyId FROM proficiency WHERE competency_id_fk = ? AND level = ?`, [
              competencyModelId,
              pcplPerDomain.level,
            ])
          )[0].updatedProficiencyId;

          //4. Update proficiencyId of the selected pcpl using the pcplId from the payload;
          const result = await this.entityRepository
            .createQueryBuilder()
            .update()
            .set({ profId: updatedProficiencyId })
            .where('_id=:pcplId', { pcplId: pcplPerDomain.pcplId })
            .execute();
          if (result.affected > 0) return pcplPerDomain;
        }),
      );
    } catch (error) {
      throw new HttpException(error, 500);
    }
  }

  async updateRankandFilePcpl(pcplRankFileUpdateDTO: PcplUpdateDTO) {
    let functional: object, crossCutting: object, managerial: object;
    const core = await this.updatePcplPerDomain(pcplRankFileUpdateDTO.core);
    if (pcplRankFileUpdateDTO.functional.length > 0) functional = await this.updatePcplPerDomain(pcplRankFileUpdateDTO.functional);
    if (pcplRankFileUpdateDTO.crossCutting.length > 0) crossCutting = await this.updatePcplPerDomain(pcplRankFileUpdateDTO.crossCutting);
    if (pcplRankFileUpdateDTO.managerial.length > 0) managerial = await this.updatePcplPerDomain(pcplRankFileUpdateDTO.managerial);
    return {
      core,
      functional,
      crossCutting,
      managerial,
    };
  }
}
