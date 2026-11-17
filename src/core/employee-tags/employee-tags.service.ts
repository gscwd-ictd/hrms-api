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

  private isSeparatedSql(employeeIdExpr: string) {
    return `EXISTS (
      SELECT 1 FROM nosi_nosa nn
       WHERE nn.employee_id_fk = ${employeeIdExpr}
         AND nn.status = 'inactive'
         AND nn.effectivity_date <= CURDATE()
         AND nn.effectivity_date = (SELECT MAX(nn2.effectivity_date) FROM nosi_nosa nn2 WHERE nn2.employee_id_fk = ${employeeIdExpr})
    )`;
  }

  async getSupervisorByEmployeeTagsV3(tagIds: string[]) {
    try {
      // 1. tagged employees who are still active, with their plantilla-based supervisor
      const tagged: { employeeId: string; name: string; positionTitle: string; supervisorId: string | null }[] = await this.entityRepository.query(
        `SELECT DISTINCT
            emp._id employeeId,
            get_employee_fullname2(emp._id) name,
            get_employee_position_or_oic(emp._id) positionTitle,
            get_employee_supervisor(emp._id) supervisorId
          FROM employees emp
          INNER JOIN employee_tags et ON et.employee_id_fk = emp._id
          WHERE et.tag_id_fk IN (?)
            AND NOT ${this.isSeparatedSql('emp._id')}
          ORDER BY name ASC;`,
        [tagIds],
      );

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

      // cached lookups
      const separatedCache = new Map<string, boolean>();
      const isSeparated = async (id: string) => {
        if (!separatedCache.has(id)) {
          const [row] = await this.entityRepository.query(`SELECT ${this.isSeparatedSql('?')} separated;`, [id, id]);
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
          const oic = oicOf.get(current);
          if (oic && oic !== employeeId) return oic; // OIC acts for this position
          if (!oic && current !== employeeId && !(await isSeparated(current))) return current; // active holder, no OIC
          current = await supervisorOf(current); // employee is the OIC himself, or holder separated with no OIC
        }
        return null;
      };

      const groups = new Map<string, { employeeId: string; name: string; positionTitle: string }[]>();
      for (const emp of tagged) {
        const supervisorId = await resolveSupervisor(emp.employeeId, emp.supervisorId);
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
