import { NatureOfAppointment } from 'src/global/utils/enums/nature-of-appointment.enum';
import { PostingApplicants } from '../../../../applicants/data/entities/posting-applicants.entity';
import { WorkStation, AppointmentType, PublicationMode, Supervisor } from '../../../utils/enums/position-description-form.enum';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ViceType } from '../utils/vice-type.enum';

export class PositionDescriptionFormBasicDTO {
  postingApplicantId: PostingApplicants;
  immediateSupervisor: Supervisor;
  supervisorNextHigher: Supervisor;
  toolsUsed: string;
  workStation: WorkStation;
  appointmentType: AppointmentType;
  employmentPeriodFrom: Date;
  employmentPeriodTo: Date;
  publicationMode: PublicationMode;
  directlySupervised: string;
  directlySupervisedItemNumbers: string;
  itemNumber: string;
}

export class CertifiedOfAppointmentDto {
  @IsOptional()
  @IsUUID()
  vice: string;

  @IsOptional()
  @IsEnum(() => ViceType)
  viceType: ViceType;

  @IsNotEmpty()
  @IsUUID()
  certifiedBy: string;

  @IsNotEmpty()
  @IsEnum(() => ViceType)
  natureOfAppointment: NatureOfAppointment.PERMANENT | NatureOfAppointment.TEMPORARY_PERMANENT;

  @IsOptional()
  @IsString()
  page: string;
}
