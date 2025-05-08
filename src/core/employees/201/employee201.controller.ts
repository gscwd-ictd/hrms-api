import { Controller } from '@nestjs/common';
import { Employee201Service } from './employee201.service';

@Controller({ path: '201' })
export class Employee201Controller {
  constructor(private readonly employee201Service: Employee201Service) {}
}
