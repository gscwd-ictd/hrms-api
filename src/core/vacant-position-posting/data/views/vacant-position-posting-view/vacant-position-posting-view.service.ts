import { Inject, Injectable, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { PlantillaViewService } from 'src/core/plantilla-positions/views/plantilla-view/plantilla-view.service';
import { Repository } from 'typeorm';
import { VacantPositionPostingPublicationView } from './data/vacant-position-posting-publication.view';
import { VacantPositionPostingView } from './data/vacant-position-posting.view';

@Injectable()
export class VacantPositionPostingViewService extends BaseEntityCrudService<VacantPositionPostingView> {
  constructor(
    @InjectRepository(VacantPositionPostingView) private vppPostingViewRepository: Repository<VacantPositionPostingView>,
    @InjectRepository(VacantPositionPostingPublicationView) private vppPostingPublicationViewRepository: Repository<VacantPositionPostingPublicationView>,
    private readonly plantillaViewService: PlantillaViewService,
  ) {
    super(vppPostingViewRepository);
  }

  async getOpenPostingDetails(vppId: string) {
    try {
      console.log(vppId);
      const result = await this.entityRepository.findOne({ where: { vppId, postingStatus: 'Open for application' } });
      if (!result) {
        throw new HttpException('Publication not found', 404);
      }
      console.log(result);
      return result;
    } catch (error) {
      console.log(error);
      throw new HttpException(error, 404);
    }
  }

  async getPosting(prfId: string) {
    const vpp = await this.entityRepository.find({ where: { prfId } });

    const vppCompetencies = await Promise.all(
      vpp.map(async (posting) => {
        const positionId = posting.positionId.split(',')[0];
        const numberOfApplicants = (await this.entityRepository.query(`SELECT COUNT(*) numberOfApplicants FROM posting_applicants_detailed_view WHERE vppId=?`, [posting.vppId]))[0]
          .numberOfApplicants;
        const withExam = (await this.entityRepository.query(`SELECT IF(with_exam = true, 'Yes','No') withExam FROM prf_details WHERE _id=?`, [posting.prfId]))[0].withExam;
        const core = await this.entityRepository.query(
          `SELECT DISTINCT cm.name \`name\`, p.key_actions \`description\`, p.level FROM competency_model cm
        INNER JOIN proficiency p ON p.competency_id_fk = cm._id 
        INNER JOIN domain d ON d._id = cm.domain_id_fk
        INNER JOIN position_competency_proficiency_level pcpl ON pcpl.proficiency_id_fk = p._id
        INNER JOIN occupational_group og ON og._id = pcpl.occupational_group_id_fk
    WHERE (d.type = 'Core') AND og.position_id_fk = ?`,
          [positionId],
        );

        const functional = await this.entityRepository.query(
          `SELECT DISTINCT cm.name \`name\`, p.key_actions \`description\`, p.level FROM competency_model cm
        INNER JOIN proficiency p ON p.competency_id_fk = cm._id 
        INNER JOIN domain d ON d._id = cm.domain_id_fk
        INNER JOIN position_competency_proficiency_level pcpl ON pcpl.proficiency_id_fk = p._id
        INNER JOIN occupational_group og ON og._id = pcpl.occupational_group_id_fk
    WHERE (d.type = 'Functional' OR d.type='Cross-Cutting Functional') AND og.position_id_fk = ?`,
          [positionId],
        );

        const managerial = await this.entityRepository.query(
          `SELECT DISTINCT cm.name \`name\`, p.key_actions \`description\`, p.level FROM competency_model cm
        INNER JOIN proficiency p ON p.competency_id_fk = cm._id 
        INNER JOIN domain d ON d._id = cm.domain_id_fk
        INNER JOIN position_competency_proficiency_level pcpl ON pcpl.proficiency_id_fk = p._id
        INNER JOIN occupational_group og ON og._id = pcpl.occupational_group_id_fk
    WHERE (d.type = 'Leadership/Managerial') AND og.position_id_fk = ?`,
          [positionId],
        );
        return { ...posting, numberOfApplicants, withExam, competencies: { core, functional, managerial } };
      }),
    );
    return vppCompetencies;
  }

  async getPostingsByPrfId(prfId: string) {
    const vpps = await this.vppPostingPublicationViewRepository.find({ where: { prfId } });

    const postings = await Promise.all(
      vpps.map(async (vpp) => {
        const positionId = vpp.positionId.split(',')[0];

        const functional = await this.entityRepository.query(
          `SELECT DISTINCT cm.name \`name\`, p.key_actions \`description\`, p.level FROM competency_model cm
          INNER JOIN proficiency p ON p.competency_id_fk = cm._id 
          INNER JOIN domain d ON d._id = cm.domain_id_fk
          INNER JOIN position_competency_proficiency_level pcpl ON pcpl.proficiency_id_fk = p._id
          INNER JOIN occupational_group og ON og._id = pcpl.occupational_group_id_fk
      WHERE (d.type = 'Functional' OR d.type='Cross-Cutting Functional') AND og.position_id_fk = ?`,
          [positionId],
        );

        const core = await this.entityRepository.query(
          `SELECT DISTINCT cm.name \`name\`, p.key_actions \`description\`, p.level FROM competency_model cm
          INNER JOIN proficiency p ON p.competency_id_fk = cm._id 
          INNER JOIN domain d ON d._id = cm.domain_id_fk
          INNER JOIN position_competency_proficiency_level pcpl ON pcpl.proficiency_id_fk = p._id
          INNER JOIN occupational_group og ON og._id = pcpl.occupational_group_id_fk
      WHERE (d.type = 'Core') AND og.position_id_fk = ?`,
          [positionId],
        );

        const managerial = await this.entityRepository.query(
          `SELECT DISTINCT cm.name \`name\`, p.key_actions \`description\`, p.level FROM competency_model cm
      INNER JOIN proficiency p ON p.competency_id_fk = cm._id 
      INNER JOIN domain d ON d._id = cm.domain_id_fk
      INNER JOIN position_competency_proficiency_level pcpl ON pcpl.proficiency_id_fk = p._id
      INNER JOIN occupational_group og ON og._id = pcpl.occupational_group_id_fk
  WHERE (d.type = 'Leadership/Managerial') AND og.position_id_fk = ?`,
          [positionId],
        );

        return { ...vpp, competencies: { core, functional, managerial } };
      }),
    );

    return postings;
  }

  async getSinglePosting(vppId: string) {
    const vpp = await this.entityRepository.findOne({ vppId });

    const schedule = (
      await this.entityRepository.query(
        `SELECT DATE_FORMAT(schedule,'%Y-%m-%d %H:%i:%s') \`dateTime\`, venue FROM vpp_schedule WHERE schedule_type='interview' AND vacant_position_posting_id_fk=?`,
        [vppId],
      )
    )[0];

    const positionId = vpp.positionId.split(',')[0];

    const functional = await this.entityRepository.query(
      `SELECT DISTINCT cm.name \`name\`, cm.desc \`description\`, p.level,d.type FROM competency_model cm
        INNER JOIN proficiency p ON p.competency_id_fk = cm._id 
        INNER JOIN domain d ON d._id = cm.domain_id_fk
        INNER JOIN position_competency_proficiency_level pcpl ON pcpl.proficiency_id_fk = p._id
        INNER JOIN occupational_group og ON og._id = pcpl.occupational_group_id_fk
    WHERE (d.type = 'Functional' OR d.type='Cross-Cutting Functional') AND og.position_id_fk = ? 
    ORDER BY d.type ASC, cm.name ASC`,
      [positionId],
    );

    const core = await this.entityRepository.query(
      `SELECT DISTINCT cm.name \`name\`, cm.desc \`description\`, p.level FROM competency_model cm
        INNER JOIN proficiency p ON p.competency_id_fk = cm._id 
        INNER JOIN domain d ON d._id = cm.domain_id_fk
        INNER JOIN position_competency_proficiency_level pcpl ON pcpl.proficiency_id_fk = p._id
        INNER JOIN occupational_group og ON og._id = pcpl.occupational_group_id_fk
    WHERE (d.type = 'Core') AND og.position_id_fk = ?`,
      [positionId],
    );

    const managerial = await this.entityRepository.query(
      `SELECT DISTINCT cm.name \`name\`, cm.desc \`description\`, p.level FROM competency_model cm
            INNER JOIN proficiency p ON p.competency_id_fk = cm._id 
            INNER JOIN domain d ON d._id = cm.domain_id_fk
            INNER JOIN position_competency_proficiency_level pcpl ON pcpl.proficiency_id_fk = p._id
            INNER JOIN occupational_group og ON og._id = pcpl.occupational_group_id_fk
        WHERE (d.type = 'Leadership/Managerial') AND og.position_id_fk = ?`,
      [positionId],
    );

    const dutiesAndResponsibilities = await this.plantillaViewService.getPositionDutiesAndResponsibilities(positionId);
    return { ...vpp, schedule: { ...schedule }, competencies: { core, functional, managerial }, dutiesAndResponsibilities };
  }
}
