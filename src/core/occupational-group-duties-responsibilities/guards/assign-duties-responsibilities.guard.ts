import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OccupationalGroupDutiesResponsibilities } from '../data/entities/occupational-group-duties-responsibilities.entity';

@Injectable()
export class AssignDutiesResponsibilitiesGuard implements CanActivate {
  constructor(@InjectRepository(OccupationalGroupDutiesResponsibilities) ogdr: Repository<OccupationalGroupDutiesResponsibilities>) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    return true;
  }
}
