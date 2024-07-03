import { PostingApplicants } from '../../../../applicants/data/entities/posting-applicants.entity';
import { WorkStation, AppointmentType, PublicationMode, Supervisor, BasicFormNatureOfAppointment } from '../../../utils/enums/position-description-form.enum';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ViceType } from '../utils/vice-type.enum';

export class PositionDescriptionFormBasicDTO {
  postingApplicantId: PostingApplicants;
  immediateSupervisor: Supervisor;
  supervisorNextHigher: Supervisor;
  toolsUsed: string;
  workStation: WorkStation;
  appointmentType: AppointmentType;
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
  @IsEnum(() => BasicFormNatureOfAppointment)
  natureOfAppointment: BasicFormNatureOfAppointment;

  @IsNotEmpty()
  @IsString()
  fieldPage: string;

  @IsNotEmpty()
  @IsDateString()
  psbDurationStartDate: Date;
}
