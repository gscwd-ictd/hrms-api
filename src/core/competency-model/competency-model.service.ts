import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseEntityCrudService } from '../base-entity/base-entity.service';
import { Repository } from 'typeorm';
import { CompetencyModelView } from './data/entities/views/competency-model-view.entity';
import { CompetencyDto, UpdateCompetencyDto } from './data/dtos/competency-model.dto';
import { CompetencyModel } from './data/entities/competency-model.entity';
import { ProficiencyDto } from '../proficiency/data/dtos/proficiency.dto';
import { ProficiencyService } from '../proficiency/proficiency.service';

@Injectable()
export class CompetencyModelService extends BaseEntityCrudService<CompetencyModel> {
  constructor(
    @InjectRepository(CompetencyModel)
    private readonly competencyModelRepository: Repository<CompetencyModel>,
    @InjectRepository(CompetencyModelView)
    private readonly competencyViewRepository: Repository<CompetencyModelView>,
    private readonly proficiencyService: ProficiencyService,
  ) {
    super(competencyModelRepository);
  }

  async createCompetency(competencyObj: CompetencyDto) {
    try {
      const { _id } = await this.saveEntity(competencyObj);

      const proficiency = new ProficiencyDto();

      await this.proficiencyService.saveEntity({ ...proficiency, _id, level: 'BASIC' });
      await this.proficiencyService.saveEntity({ ...proficiency, _id, level: 'INTERMEDIATE' });
      await this.proficiencyService.saveEntity({ ...proficiency, _id, level: 'ADVANCED' });
      await this.proficiencyService.saveEntity({ ...proficiency, _id, level: 'SUPERIOR' });
    } catch (error) {}
  }

  async updateCompetency(competencydto: CompetencyDto, competencyId: string) {
    try {
      await this.competencyModelRepository.createQueryBuilder().update().set(competencydto).where({ competencyId }).execute();
      return {
        _id: competencyId,
        name: competencydto.name,
        code: competencydto.code,
        domain: competencydto.domainId,
      };
    } catch (error) {}
  }

  async updateCompetencyAndProficiency(data: UpdateCompetencyDto) {
    try {
      const { competencyId, code, name, definition } = data;

      await this.competencyModelRepository.createQueryBuilder().update().set({ code, name, definition }).where({ _id: competencyId }).execute();
      await Promise.all(
        data.proficiencyKeyActions.map(async (proficiencyItem) => {
          const { _id, keyActions } = proficiencyItem;
          return await this.proficiencyService.entityRepository.createQueryBuilder().update().set({ keyActions }).where({ _id: _id }).execute();
        }),
      );
      return data;
    } catch (error) {
      Logger.log(error);
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
  }

  //////getters
  //getAllCoreDomain
  async getAllCoreFunctions() {
    try {
      return await this.getCompetencyModelByDomainId('136c50f0-8e3c-11ec-ae65-54ab3a99e60e');
    } catch (error) {}
  }

  //getAllCrossCuttingDomain
  async getAllCrossCutting() {
    try {
      return await this.getCompetencyModelByDomainId('1371f33c-8e3c-11ec-ae65-54ab3a99e60e');
    } catch (error) {}
  }

  async getAllManagerial() {
    try {
      return await this.getCompetencyModelByDomainId('13747e8b-8e3c-11ec-ae65-54ab3a99e60e');
    } catch (error) {}
  }

  private async getCompetencyModelByDomainId(domainId: string) {
    try {
      return await this.competencyModelRepository
        .createQueryBuilder('competency_model')
        .select('_id', 'competencyId')
        .addSelect('code')
        .addSelect('name')
        .addSelect('`desc`')
        .where(`domain_id_fk = :domainId`, { domainId })
        .getRawMany();
    } catch (error) {}
  }

  async getAllFunctionalCompetencyPerOccupation(occupationId: string) {
    const occupationName = (await this.competencyModelRepository.query(`SELECT occupation_name AS occupationName FROM occupations WHERE  _ID = ?`, [occupationId]))[0]
      .occupationName;

    const competencies = await this.competencyModelRepository
      .createQueryBuilder('cm')
      .select('cm._id', 'competencyId')
      .addSelect('cm.code', 'code')
      .addSelect('cm.name', 'name')
      .innerJoin('competency_model_occupation', 'cmo', 'cmo.competency_model_id_fk = cm._id')
      .orderBy('cm.code', 'ASC')
      .where('cmo.occupation_id_fk = :occupationId', { occupationId })
      .getRawMany();

    return {
      occupationName,
      competencies,
    };
  }

  async getAllFunctionsForOccupationalGroup() {
    return await this.competencyModelRepository
      .createQueryBuilder('competency_model')
      .select('competency_model._id', 'competencyId')
      .addSelect('competency_model.name', 'name')
      .addSelect('SUBSTRING(`competency_model`.`code`,1,3)', 'occupationCode')
      .addSelect('competency_model.code', 'code')
      .addSelect('competency_model.desc', 'desc')
      .distinct(true)
      .innerJoin('domain', 'domain', 'domain._id=competency_model.domain_id_fk')
      .innerJoin('proficiency', 'prof', 'prof.competency_id_fk = competency_model._id')
      .innerJoin('position_competency_proficiency_level', 'pcpl', 'pcpl.proficiency_id_fk = prof._id')
      .innerJoin('occupational_group', 'og', 'og._id = pcpl.occupational_group_id_fk')
      .innerJoin('occupations', 'occ', 'occ._id = og.occupation_id_fk')
      .where("domain.type = 'Functional'")
      .orderBy('code', 'ASC')
      .getRawMany();
  }

  async getFunctionsForOccupationalGroup(occupationId: string) {
    return await this.competencyModelRepository
      .createQueryBuilder('competency_model')
      .select('competency_model._id', 'competencyId')
      .addSelect('competency_model.name', 'name')
      .addSelect('competency_model.code', 'code')
      .addSelect('competency_model.desc', 'desc')
      .addSelect('occ.occupation_name', 'occupationName')
      .distinct(true)
      .where(" occ._id = :occid AND domain._id = '136f44fe-8e3c-11ec-ae65-54ab3a99e60e'", { occid: occupationId })
      .innerJoin('domain', 'domain', 'domain._id=competency_model.domain_id_fk')
      .innerJoin('proficiency', 'prof', 'prof.competency_id_fk = competency_model._id')
      .innerJoin('position_competency_proficiency_level', 'pcpl', 'pcpl.proficiency_id_fk = prof._id')
      .innerJoin('occupational_group', 'og', 'og._id = pcpl.occupational_group_id_fk')
      .innerJoin('occupations', 'occ', 'occ._id = og.occupation_id_fk')
      .printSql()
      .getRawMany();
  }

  async getEveryCompetencies(domainId: string) {
    return await this.competencyModelRepository.find({ select: ['_id', 'code', 'name'], where: { domainId } });
  }

  async getAllCompetenciesByDomain(domainId: string) {
    return await this.competencyViewRepository.find({ where: { domainId } });
  }

  async getAllCompetenciesByDomainAndOG(domainId: string, occId: string) {
    return await this.competencyModelRepository
      .createQueryBuilder('competency_model')
      .select('competency_model.name', 'name')
      .addSelect('competency_model.code', 'code')
      .distinct(true)
      .addSelect('competency_model.desc', 'desc')
      .where('domain._id = :domainId AND occ._id = :occId', { domainId, occId })
      .innerJoin('domain', 'domain', 'domain._id=competency_model.domain_id_fk')
      .innerJoin('proficiency', 'prof', 'prof.competency_id_fk = competency_model._id')
      .innerJoin('position_competency_proficiency_level', 'pcpl', 'pcpl.proficiency_id_fk = prof._id')
      .innerJoin('occupational_group', 'og', 'og._id = pcpl.occupational_group_id_fk')
      .innerJoin('occupations', 'occ', 'occ._id = og.occupation_id_fk')
      .getRawMany();
  }

  async getAllFunctions() {
    return await this.competencyModelRepository
      .createQueryBuilder('competency_model')
      .select('competency_model.name', 'name')
      .addSelect('competency_model.code', 'code')
      .distinct(true)
      .addSelect('competency_model.desc', 'desc')
      .addSelect('occ.occupation_name', 'occupationName')
      .where("domain._id = '136f44fe-8e3c-11ec-ae65-54ab3a99e60e' ")
      .innerJoin('domain', 'domain', 'domain._id=competency_model.domain_id_fk')
      .innerJoin('proficiency', 'prof', 'prof.competency_id_fk = competency_model._id')
      .innerJoin('position_competency_proficiency_level', 'pcpl', 'pcpl.proficiency_id_fk = prof._id')
      .innerJoin('occupational_group', 'og', 'og._id = pcpl.occupational_group_id_fk')
      .innerJoin('occupations', 'occ', 'occ._id = og.occupation_id_fk')
      .getRawMany();
  }

  async getFunctionsForDropdown(occupationId: string) {
    const competencies = await this.competencyModelRepository
      .createQueryBuilder('cm')
      .select(`concat(cm.code,'-',cm.name)`, 'label')
      .addSelect('cm._id', 'competencyId')
      .addSelect('d.type', 'type')
      .addSelect('cm.code', 'code')
      .innerJoin('domain', 'd', 'd._id = cm.domain_id_fk')
      .where(
        `cm._id NOT in (SELECT competency_model_id_fk FROM 
          competency_model_occupation WHERE 
          competency_model_occupation.occupation_id_fk = :occupationId) AND d.type='Functional'`,
        { occupationId },
      )
      .getRawMany();

    const _competencies = await Promise.all(
      competencies.map(async (competency) => {
        const { label, competencyId, type, code } = competency;
        return { label, value: { competencyId, type, code, name: label } };
      }),
    );
    return _competencies;
  }
}
