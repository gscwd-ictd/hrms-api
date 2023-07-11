import { CallHandler, ExecutionContext, HttpException, Injectable, NestInterceptor } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { map } from 'rxjs';
import { Repository } from 'typeorm';
import { OgdrDto } from '../data/dtos/occupational-group-duties-responsibilities.dto';
import { OccupationalGroupDutiesResponsibilities } from '../data/entities/occupational-group-duties-responsibilities.entity';
import { OccupationalGroupDutiesResponsibilitiesType } from '../utils/occupational-group-duties-responsibilities.types';

@Injectable()
export class AssignDutiesResponsibilitiesInterceptor implements NestInterceptor {
  constructor(@InjectRepository(OccupationalGroupDutiesResponsibilities) private ogdrRepository: Repository<OccupationalGroupDutiesResponsibilities>) {}
  async intercept(context: ExecutionContext, next: CallHandler<any>) {
    const request = context.switchToHttp().getRequest();

    const empPositionId = request.params.emp_position_id;
    const positionId = request.params.position_id;
    const og = await this.ogdrRepository.query('SELECT _id,occupation_id_fk FROM occupational_group WHERE position_id_fk = ?', [positionId]);
    //check validation of core occupations duties responsibilities Id
    const core = await Promise.all(
      request.body.core.map(async (ogdr: OccupationalGroupDutiesResponsibilitiesType) => {
        const occupationId = await this.ogdrRepository.query(`SELECT occupation_id_fk FROM occupations_duties_responsibilities WHERE _id=?`, [ogdr.odrId]);
        console.log(occupationId);
        //duty and responsibility must only be on the position's occupation;
        if (occupationId[0].occupation_id_fk !== og[0].occupation_id_fk) throw new HttpException('Occupation does not match', 403);
        //d&r must not be added if it already exists in the position;
        const { isExist } = (
          await this.ogdrRepository.query(
            `SELECT IF(count(odr_id_fk) > 0, TRUE, FALSE) isExist FROM occupational_group_duties_responsibilities  ogdr 
        INNER JOIN occupational_group og ON ogdr.occupational_group_id_fk = og._id 
    WHERE odr_id_fk = ? AND og.position_id_fk = ?;`,
            [ogdr.odrId, positionId],
          )
        )[0];
        if (isExist > 0) throw new HttpException('Duty for the specified position already exists.', 403);
        return ogdr;
      }),
    );
    //check validation of support occupations duties responsibilities Id
    const support = await Promise.all(
      request.body.core.map(async (ogdr: OccupationalGroupDutiesResponsibilitiesType) => {
        const occupationId = await this.ogdrRepository.query(`SELECT occupation_id_fk FROM occupations_duties_responsibilities WHERE _id=?`, [ogdr.odrId]);
        //duty and responsibility must only be on the position's occupation;
        if (occupationId[0].occupation_id_fk !== og[0].occupation_id_fk) throw new HttpException('Occupation does not match', 403);

        const { isExist } = (
          await this.ogdrRepository.query(
            `SELECT IF(count(odr_id_fk) > 0, TRUE, FALSE) isExist 
             FROM occupational_group_duties_responsibilities ogdr 
                INNER JOIN occupational_group og ON ogdr.occupational_group_id_fk = og._id 
             WHERE odr_id_fk = ? AND og.position_id_fk = ?;`,
            [ogdr.odrId, positionId],
          )
        )[0];
        //d&r must not be added if it already exists in the position;
        if (isExist > 0) throw new HttpException('Duty for the specified position already exists.', 403);
        return ogdr;
      }),
    );
    //position must only be under the managers orgstruct;
    const { isUnderManager } = (await this.ogdrRepository.query(`SELECT is_under_manager(?,?) isUnderManager`, [empPositionId, positionId]))[0];
    console.log(isUnderManager);

    if (isUnderManager < 1) throw new HttpException('Position not is not under manager.', 403);

    return next.handle().pipe(map((data: OgdrDto) => ({ ...data })));
  }
}
