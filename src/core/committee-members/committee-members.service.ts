import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommitteeMembersType } from 'src/core/committee-members/utils/types/committee-members.type';
import { Repository } from 'typeorm';
import { BaseEntityCrudService } from '../base-entity/base-entity.service';
import { CommitteeMembersDTO } from './data/dtos/committee-members.dto';
import { CommitteeMembers } from './data/entities/committee-members.entity';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class CommitteeMembersService extends BaseEntityCrudService<CommitteeMembers> {
  constructor(@InjectRepository(CommitteeMembers) private readonly committeeMembersRepo: Repository<CommitteeMembers>) {
    super(committeeMembersRepo);
  }

  async removeCommitteeMembers(committeeMembers: CommitteeMembersType) {
    if (committeeMembers.employeeIds.length === 0) {
      throw new HttpException('No employees selected.', HttpStatus.NOT_ACCEPTABLE);
    } else {
      const committeeMembersDeleted = await this.committeeMembersRepo.query('DELETE FROM committee_members WHERE employee_id_fk IN (?) AND committee_id_fk=?;', [
        committeeMembers.employeeIds,
        committeeMembers.committeeId,
      ]);
      if (committeeMembersDeleted.affectedRows != 0) return committeeMembers;
      return committeeMembersDeleted;
    }
  }

  async addCommitteeMembers(commiteeMembers: CommitteeMembersType) {
    const addedMembers = await Promise.all(
      commiteeMembers.employeeIds.map(async (employeeId) => {
        const memberAdded = await this.saveEntity({ employeeId, committeeId: commiteeMembers.committeeId });
        return { ...memberAdded };
      }),
    );
    return addedMembers;
  }

  async getEmployeesNotInTheCommittee(committeeId: string) {
    const employees = await this.committeeMembersRepo.query(
      `SELECT DISTINCT emp._id AS employeeId, get_employee_fullname(emp._id) AS fullName 
    FROM employees emp WHERE emp._id NOT IN (SELECT DISTINCT employee_id_fk FROM committee_members WHERE committee_id_fk = ?) ORDER BY get_employee_fullname(emp._id) ASC`,
      [committeeId],
    );

    const optionItems = await Promise.all(
      employees.map(async (employee) => {
        return {
          label: employee.fullName,
          value: {
            employeeId: employee.employeeId,
            fullName: employee.fullName,
          },
        };
      }),
    );

    return [{ options: optionItems }];
  }

  async isPdcChairman(employeeId: string) {
    try {
      const { isPdcChairman } = (
        await this.entityRepository.query(
          `
      SELECT IF(COUNT(cm._id) > 0, true,false) isPdcChairman 
      FROM committee_members cm 
        INNER JOIN committees c ON cm.committee_id_fk = c._id
      WHERE c.name = 'Personnel Development Committee' AND cm.committee_role = 'Chairman'
      AND cm.employee_id_fk = ?;`,
          [employeeId],
        )
      )[0];

      if (isPdcChairman === '1') return true;
      return false;
    } catch {
      throw new RpcException('500');
    }
  }

  async isPdcSecretariat(employeeId: string) {
    try {
      const { isPdcSecretariat } = (
        await this.entityRepository.query(
          `
      SELECT IF(COUNT(cm._id) > 0, true,false) isPdcSecretariat
      FROM committee_members cm 
        INNER JOIN committees c ON cm.committee_id_fk = c._id
      WHERE c.name = 'Personnel Development Committee' AND cm.committee_role = 'Secretariat'
      AND cm.employee_id_fk = ?;`,
          [employeeId],
        )
      )[0];

      if (isPdcSecretariat === '1') return true;
      return false;
    } catch {
      throw new RpcException('500');
    }
  }

  async getSingleCommitteeMember(_id: string) {
    const committee = (
      await this.committeeMembersRepo.query(
        `SELECT _id AS committeeId,name AS committeeName, description 
    FROM committees WHERE _id = ?`,
        [_id],
      )
    )[0];

    if (!committee) {
      throw new HttpException('Committee does not exist', 404);
    }
    const employees = await this.committeeMembersRepo
      .createQueryBuilder('cm')
      .select('emp._id', 'employeeId')
      .addSelect('emp.first_name', 'firstName')
      .addSelect('emp.middle_name', 'middleName')
      .addSelect('emp.last_name', 'lastName')
      .addSelect('emp.name_extension', 'nameExtension')
      .addSelect('cm.committee_role', 'committeeRole')
      .addSelect('get_employee_fullname(emp._id)', 'fullName')
      .innerJoin('employees', 'emp', 'cm.employee_id_fk = emp._id')
      .where('cm.committee_id_fk = :_id', { _id })
      .getRawMany();
    return { ...committee, employees };
  }

  async getCommitteeMembers() {
    const committees = await this.committeeMembersRepo
      .createQueryBuilder('cm')
      .select('c._id', 'committeeId')
      .addSelect('c.name', 'committeeName')
      .addSelect('c.description', 'description')
      .distinct(true)
      .from('committees', 'c')
      .getRawMany();

    const committeeMembers = await Promise.all(
      committees.map(async (committee) => {
        const employees = await this.committeeMembersRepo
          .createQueryBuilder('cm')
          .select('emp._id', 'employeeId')
          .addSelect('emp.first_name', 'firstName')
          .addSelect('emp.middle_name', 'middleName')
          .addSelect('emp.last_name', 'lastName')
          .addSelect('emp.name_extension', 'nameExtension')
          .addSelect('cm.committee_role', 'committeeRole')
          .addSelect('get_employee_fullname(emp._id)', 'fullName')
          .innerJoin('employees', 'emp', 'cm.employee_id_fk = emp._id')
          .where('cm.committee_id_fk = :_id', { _id: committee.committeeId })
          .getRawMany();
        return { ...committee, employees };
      }),
    );
    return committeeMembers;
  }
}
