import { PostingApplicants } from '../../../../applicants/data/entities/posting-applicants.entity';
import { WorkStation, AppointmentType, PublicationMode, Supervisor, BasicFormNatureOfAppointment } from '../../../utils/enums/position-description-form.enum';
import { IsArray, IsDateString, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { ViceType } from '../utils/vice-type.enum';
import { Type } from 'class-transformer';

export class DirectlySupervisedDto {
  @IsString()
  itemNumber: string;

  @IsString()
  positionTitle: string;
}

export class PositionDescriptionFormBasicDTO {
  @IsNotEmpty()
  @IsUUID('all')
  postingApplicantId: PostingApplicants;

  @IsString()
  itemNumber: string;

  @IsString()
  immediateSupervisor: Supervisor;

  @IsString()
  supervisorNextHigher: Supervisor;

  @IsString()
  toolsUsed: string;

  @IsString()
  workStation: WorkStation;

  @IsString()
  appointmentType: AppointmentType;

  @IsString()
  publicationMode: PublicationMode;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DirectlySupervisedDto)
  directlySupervised: DirectlySupervisedDto;
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
