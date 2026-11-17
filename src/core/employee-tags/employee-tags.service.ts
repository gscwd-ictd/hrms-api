import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { getManager, Repository } from 'typeorm';
import { BaseEntityCrudService } from '../base-entity/base-entity.service';
import { CheckEmployeeTagsDto, CreateEmployeeTagsDto, DeleteEmployeeTagDto } from './data/employee-tags.dto';
import { EmployeeTags } from './data/employee-tags.entity';

@Injectable()
export class EmployeeTagsService extends BaseEntityCrudService<EmployeeTags> {
  constructor(@InjectRepository(EmployeeTags) private readonly employeeTagsRepository: Repository<EmployeeTags>) {
    super(employeeTagsRepository);
  }

  async addEmployeeTags(employeeTagsDto: CreateEmployeeTagsDto) {
    try {
      const { employees, tags } = employeeTagsDto;
      const addResult = await getManager().transaction(async (entityManager) => {
        const addEmployeeTagsResult = await Promise.all(
          employees.map(async (employee) => {
            const addTagsResult = await Promise.all(
              tags.map(async (tag) => {
                return await entityManager.getRepository(EmployeeTags).save({ employeeId: employee, tagId: tag });
              }),
            );
            return { employee, tags };
          }),
        );
        return addEmployeeTagsResult;
      });

      return addResult;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async getSupervisorByEmployeeTagsV2(tagIds: string[]) {
    try {
      //1. GET EMPLOYEE NAMES WITH TAGS
      const supervisors = await this.entityRepository.query(
        ` SELECT DISTINCT supervisorId,supervisorName FROM (SELECT distinct 
          get_employee_assignment_or_oic(emp._id) assignmentName,
          get_employee_position_or_oic(emp._id) positionTitle,
          emp._id employeeId,
          get_employee_fullname2(emp._id) employeeFullName, 
          get_employee_supervisor_without_bod(emp._id) supervisorId, 
          get_employee_fullname2(get_employee_supervisor_without_bod(emp._id)) supervisorName FROM employees emp 
         INNER JOIN employee_tags et ON et.employee_id_fk = emp._id WHERE et.tag_id_fk IN (?)) supervisorInfo;
        `,
        [tagIds],
      );

      const employees = await Promise.all(
        supervisors.map(async (supervisor) => {
          const { supervisorId, supervisorName } = supervisor;
          const employees = await this.entityRepository.query(
            `
         SELECT DISTINCT employeeId,employeeFullName name,positionTitle FROM (SELECT distinct 
          get_employee_assignment_or_oic(emp._id) assignmentName,
          get_employee_position_or_oic(emp._id) positionTitle,
          emp._id employeeId,
          get_employee_fullname2(emp._id) employeeFullName, 
          get_employee_supervisor_without_bod(emp._id) supervisorId, 
          get_employee_fullname2(get_employee_supervisor_without_bod(emp._id)) supervisorName FROM employees emp 
         INNER JOIN employee_tags et ON et.employee_id_fk = emp._id WHERE et.tag_id_fk IN (?)) supervisorInfo WHERE supervisorInfo.supervisorId = ?;
         `,
            [tagIds, supervisorId],
          );
          return { supervisor: { supervisorId: supervisorId, name: supervisorName }, employees };
        }),
      );
      return employees;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async getSupervisorByEmployeeTags(tagId: string) {
    try {
      //1. GET EMPLOYEE NAMES WITH TAGS
      const supervisors = await this.entityRepository.query(
        ` SELECT DISTINCT supervisorId,supervisorName FROM (SELECT distinct 
          get_employee_assignment_or_oic(emp._id) assignmentName,
          get_employee_position_or_oic(emp._id) positionTitle,
          emp._id employeeId,
          get_employee_fullname2(emp._id) employeeFullName, 
          get_employee_supervisor(emp._id) supervisorId, 
          get_employee_fullname2(get_employee_supervisor(emp._id)) supervisorName FROM employees emp 
         INNER JOIN employee_tags et ON et.employee_id_fk = emp._id WHERE et.tag_id_fk IN (?)) supervisorInfo;
        `,
        [tagId],
      );

      const employees = await Promise.all(
        supervisors.map(async (supervisor) => {
          const { supervisorId, supervisorName } = supervisor;
          const employees = await this.entityRepository.query(
            `
         SELECT DISTINCT employeeId,employeeFullName name,positionTitle FROM (SELECT distinct 
          get_employee_assignment_or_oic(emp._id) assignmentName,
          get_employee_position_or_oic(emp._id) positionTitle,
          emp._id employeeId,
          get_employee_fullname2(emp._id) employeeFullName, 
          get_employee_supervisor(emp._id) supervisorId, 
          get_employee_fullname2(get_employee_supervisor(emp._id)) supervisorName FROM employees emp 
         INNER JOIN employee_tags et ON et.employee_id_fk = emp._id WHERE et.tag_id_fk IN (?)) supervisorInfo WHERE supervisorInfo.supervisorId = ?;
         `,
            [tagId, supervisorId],
          );
          return { supervisor: { supervisorId, name: supervisorName }, employees };
        }),
      );
      return employees;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  // async getSupervisorByEmployeeTagsV3(tagIds: string[]) {
  //   try {
  //     //1. GET EMPLOYEE NAMES WITH TAGS
  //     const supervisors = await this.entityRepository.query(
  //       ` SELECT DISTINCT supervisorId,supervisorName FROM (SELECT distinct
  //         get_employee_assignment_or_oic(emp._id) assignmentName,
  //         get_employee_position_or_oic(emp._id) positionTitle,
  //         emp._id employeeId,
  //         get_employee_fullname2(emp._id) employeeFullName,
  //         get_employee_supervisor(emp._id) supervisorId,
  //         get_employee_fullname2(get_employee_supervisor(emp._id)) supervisorName FROM employees emp
  //        INNER JOIN employee_tags et ON et.employee_id_fk = emp._id WHERE et.tag_id_fk IN (?)) supervisorInfo;
  //       `,
  //       [tagIds],
  //     );

  //     const employees = await Promise.all(
  //       supervisors.map(async (supervisor) => {
  //         const { supervisorId, supervisorName } = supervisor;
  //         const employees = await this.entityRepository.query(
  //           `
  //        SELECT DISTINCT employeeId,employeeFullName name,positionTitle FROM (SELECT distinct
  //         get_employee_assignment_or_oic(emp._id) assignmentName,
  //         get_employee_position_or_oic(emp._id) positionTitle,
  //         emp._id employeeId,
  //         get_employee_fullname2(emp._id) employeeFullName,
  //         get_employee_supervisor(emp._id) supervisorId,
  //         get_employee_fullname2(get_employee_supervisor(emp._id)) supervisorName FROM employees emp
  //        INNER JOIN employee_tags et ON et.employee_id_fk = emp._id WHERE et.tag_id_fk IN (?)) supervisorInfo WHERE supervisorInfo.supervisorId = ?;
  //        `,
  //           [tagIds, supervisorId],
  //         );
  //         return { supervisor: { supervisorId: supervisorId, name: supervisorName }, employees };
  //       }),
  //     );
  //     return employees;
  //   } catch (error) {
  //     throw new RpcException(error);
  //   }
  // }

  /**
   * SQL condition: true when the employee's latest NOSI/NOSA is "inactive" and already effective (separated).
   * Same rule used by getAllManagersForLnd.
   */
  private isSeparatedSql(employeeIdExpr: string) {
    return `(EXISTS (
      SELECT 1 FROM nosi_nosa nn
       WHERE nn.employee_id_fk = ${employeeIdExpr}
         AND nn.status = 'inactive'
         AND nn.effectivity_date <= CURDATE()
         AND nn.effectivity_date = (SELECT MAX(nn2.effectivity_date) FROM nosi_nosa nn2 WHERE nn2.employee_id_fk = ${employeeIdExpr})
    ) OR (
      EXISTS (SELECT 1 FROM plantilla_positions ppa WHERE ppa.employee_id_fk = ${employeeIdExpr} AND ppa.nature_of_appointment = 'permanent')
      AND COALESCE(is_active_employee(${employeeIdExpr}, NOW()), 1) = 0
    ))`;
  }

  /** Employee IDs that must never appear in LND nominations (env LND_EXCLUDED_EMPLOYEE_IDS, comma-separated). */
  private lndExcludedIds() {
    return new Set(
      (process.env.LND_EXCLUDED_EMPLOYEE_IDS ?? '')
        .split(',')
        .map((id) => id.trim())
        .filter((id) => id),
    );
  }

  /**
   * Groups the tagged employees under the supervisor who should endorse them (LND nominations).
   *
   * - Separated employees are excluded, both as nominees and as supervisors.
   * - If a supervisor's position has an Officer-in-Charge, the OIC is used instead of the position holder.
   * - If the employee is the OIC of their own supervisor's position (or the supervisor is separated with no OIC),
   *   the next supervisor up the chain is used.
   * - Only permanent, casual and job order employees can be nominated (Board of Directors excluded).
   * - is_active_employee() is only applied to permanent employees; casual/JO rely on NOSI/NOSA.
   * - The General Manager (plantilla position 'General Manager A') is endorsed by the head of the Human Resource Department (code HRD).
   * - IDs listed in LND_EXCLUDED_EMPLOYEE_IDS never appear, as nominee or as supervisor.
   */
  async getSupervisorByEmployeeTagsV3(tagIds: string[]) {
    try {
      // 1. tagged employees who are still active, with their plantilla-based supervisor
      const excluded = this.lndExcludedIds();
      const taggedRows: { employeeId: string; name: string; positionTitle: string; supervisorId: string | null; isGm: number | string }[] = await this.entityRepository.query(
        `SELECT DISTINCT
            emp._id employeeId,
            EXISTS (
              SELECT 1 FROM plantilla_positions ppg
               WHERE ppg.employee_id_fk = emp._id AND ppg.position_title = 'General Manager A'
            ) isGm,
            get_employee_fullname2(emp._id) name,
            get_employee_position_or_oic(emp._id) positionTitle,
            get_employee_supervisor(emp._id) supervisorId
          FROM employees emp
          INNER JOIN employee_tags et ON et.employee_id_fk = emp._id
          WHERE et.tag_id_fk IN (?)
            AND EXISTS (
              SELECT 1 FROM plantilla_positions ppn
               WHERE ppn.employee_id_fk = emp._id
                 AND ppn.nature_of_appointment IN ('permanent', 'casual', 'job order')
            )
            AND NOT ${this.isSeparatedSql('emp._id')}
          ORDER BY name ASC;`,
        [tagIds],
      );
      const tagged = taggedRows.filter((e) => !excluded.has(e.employeeId));

      // HRD department head (endorses the General Manager and anyone at the top of the chain):
      // highest salary grade among the HRD department positions; OIC/separation handled by resolveSupervisor
      const [hrdHead] = await this.entityRepository.query(
        `SELECT pp.employee_id_fk employeeId
           FROM department_positions dp
          INNER JOIN departments d ON d._id = dp.department_id_fk AND d.code = 'HRD'
          INNER JOIN plantilla_positions pp ON pp._id = dp.position_id_fk
          INNER JOIN salary_grade sg ON sg._id = pp.salary_grade_id_fk
          WHERE pp.employee_id_fk IS NOT NULL
          ORDER BY sg.salary_grade DESC
          LIMIT 1;`,
      );
      const hrdHeadId: string | null = hrdHead?.employeeId ?? null;

      // 2. position holder -> active OIC of that position
      const oicRows: { holderId: string; oicId: string }[] = await this.entityRepository.query(
        `SELECT pp.employee_id_fk holderId, oic.employee_id_fk oicId
           FROM officer_in_charge oic
           LEFT JOIN division_positions dvp ON dvp._id = oic.division_positions_id_fk
           LEFT JOIN department_positions dpp ON dpp._id = oic.department_positions_id_fk
           LEFT JOIN office_positions op ON op._id = oic.office_positions_id_fk
           INNER JOIN plantilla_positions pp ON pp._id = COALESCE(dvp.position_id_fk, dpp.position_id_fk, op.position_id_fk)
          WHERE pp.employee_id_fk IS NOT NULL
            AND oic.employee_id_fk IS NOT NULL
            AND NOT ${this.isSeparatedSql('oic.employee_id_fk')};`,
      );
      const oicOf = new Map(oicRows.map((r) => [r.holderId, r.oicId]));

      // Board of Directors appointees never endorse LND nominees; the chain stops there (-> HRD head)
      const bodRows: { employeeId: string }[] = await this.entityRepository.query(
        `SELECT DISTINCT employee_id_fk employeeId FROM plantilla_positions
          WHERE nature_of_appointment = 'board of directors' AND employee_id_fk IS NOT NULL;`,
      );
      const isTopOfChain = (id: string) => excluded.has(id) || bodRows.some((b) => b.employeeId === id);

      // cached lookups
      const separatedCache = new Map<string, boolean>();
      const isSeparated = async (id: string) => {
        if (!separatedCache.has(id)) {
          const [row] = await this.entityRepository.query(`SELECT ${this.isSeparatedSql('?')} separated;`, [id, id, id, id]);
          separatedCache.set(id, Number(row?.separated) === 1);
        }
        return separatedCache.get(id);
      };
      const supervisorCache = new Map<string, string | null>();
      const supervisorOf = async (id: string) => {
        if (!supervisorCache.has(id)) {
          const [row] = await this.entityRepository.query(`SELECT get_employee_supervisor(?) supervisorId;`, [id]);
          supervisorCache.set(id, row?.supervisorId ?? null);
        }
        return supervisorCache.get(id);
      };

      // 3. walk up the chain until we reach someone who can actually endorse this employee
      const resolveSupervisor = async (employeeId: string, startId: string | null) => {
        let current = startId;
        for (let hops = 0; current && hops < 6; hops++) {
          if (isTopOfChain(current)) return null; // reached the Board / an excluded person -> HRD head fallback
          const oic = oicOf.get(current);
          if (oic && oic !== employeeId && !excluded.has(oic)) return oic; // OIC acts for this position
          if (!oic && current !== employeeId && !excluded.has(current) && !(await isSeparated(current))) return current; // active holder, no OIC
          current = await supervisorOf(current); // employee is the OIC himself, or holder separated with no OIC
        }
        return null;
      };

      const groups = new Map<string, { employeeId: string; name: string; positionTitle: string }[]>();
      for (const emp of tagged) {
        const isGm = Number(emp.isGm) === 1; // plantilla position 'General Manager A'
        let supervisorId = isGm ? null : await resolveSupervisor(emp.employeeId, emp.supervisorId);
        // GM, or nobody left above (e.g. supervisor excluded/separated at the top) -> HRD head
        if (!supervisorId && hrdHeadId && hrdHeadId !== emp.employeeId) {
          supervisorId = await resolveSupervisor(emp.employeeId, hrdHeadId);
        }
        const key = supervisorId ?? '';
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push({ employeeId: emp.employeeId, name: emp.name, positionTitle: emp.positionTitle });
      }

      // 4. supervisor names, same response shape as before
      const supervisorIds = [...groups.keys()].filter((id) => id);
      const names: { supervisorId: string; name: string }[] = supervisorIds.length
        ? await this.entityRepository.query(`SELECT _id supervisorId, get_employee_fullname2(_id) name FROM employees WHERE _id IN (?);`, [supervisorIds])
        : [];
      const nameOf = new Map(names.map((n) => [n.supervisorId, n.name]));

      return [...groups.entries()]
        .map(([supervisorId, employees]) => ({
          supervisor: { supervisorId: supervisorId || null, name: nameOf.get(supervisorId) ?? null },
          employees,
        }))
        .sort((a, b) => (a.supervisor.name ?? '').localeCompare(b.supervisor.name ?? ''));
    } catch (error) {
      throw new RpcException(error);
    }
  }
  async getTagsByEmployeeId(employeeId: string) {
    try {
      const tags = await this.entityRepository.find({ where: { employeeId }, select: ['tagId'], order: { createdAt: 'ASC' } });
      const arrayOfTags = await Promise.all(
        tags.map(async (tag) => {
          return tag.tagId;
        }),
      );
      return arrayOfTags;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async deleteEmployeeTag(deleteEmployeeTagsDto: DeleteEmployeeTagDto) {
    try {
      const { employeeId, tagId } = deleteEmployeeTagsDto;
      const deleteResult = await this.entityRepository.query(`DELETE FROM employee_tags WHERE tag_id_fk =?  AND employee_id_fk=?`, [tagId, employeeId]);
      if (deleteResult.affectedRows > 0) return deleteEmployeeTagsDto;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async getEmployeeByTagId(tagId: string) {
    const employeeDetails = await this.entityRepository.query(
      `
        SELECT 
          emp._id employeeId, 
          get_employee_fullname2(emp._id) fullName, 
          get_employee_position_or_oic(emp._id) positionTitle
        FROM employee_tags et 
          INNER JOIN employees emp ON emp._id = et.employee_id_fk 
        WHERE et.tag_id_fk = ? ORDER BY et.created_at ASC
    `,
      [tagId],
    );
    return employeeDetails;
  }

  async countEmployeeTags(tagId: string) {
    try {
      return (await this.entityRepository.query(`SELECT distinct count(employee_id_fk) employeeCount FROM employee_tags WHERE tag_id_fk=?`, [tagId]))[0].employeeCount;
    } catch {
      throw new RpcException('RPC Error');
    }
  }

  async checkEmployeeTags(data: CheckEmployeeTagsDto) {
    try {
      const { employeeId, tagsId } = data;
      return (
        await this.entityRepository.query(`select case when exists(select 1 from employee_tags where employee_id_fk = ? and tag_id_fk in (?)) then true else false end as result`, [
          employeeId,
          tagsId,
        ])
      )[0].result;
    } catch (error) {
      Logger.error(error);
      throw new RpcException('check employee tags error');
    }
  }
}
