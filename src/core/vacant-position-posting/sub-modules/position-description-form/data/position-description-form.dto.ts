import { CertifiedOfAppointmentDto, PositionDescriptionFormBasicDTO } from './../parts/basic/data/position-description-form-basic.dto';
import { PositionDescriptionFormWorkingConditionDTO } from '../parts/working-condition/data/working-condition.dto';
import { PositionDescriptionFormTypeContacts } from '../utils/types/position-description-form.type';
import { IsBoolean, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { PostingApplicants } from '../../applicants/data/entities/posting-applicants.entity';
import { AppointmentType, PublicationMode, Supervisor, WorkStation } from '../utils/enums/position-description-form.enum';

export class PositionDescriptionFormDTO {
  @IsNotEmpty({ message: 'Basic should not be empty.' })
  @IsObject({ message: 'Basic must be an object.' })
  basic: PositionDescriptionFormBasicDTO;

  @IsNotEmpty({ message: 'Working condition should not be empty.' })
  @IsObject({ message: 'Working must be an object.' })
  workingCondition: PositionDescriptionFormWorkingConditionDTO;

  @IsNotEmpty({ message: 'Contacts should not be empty.' })
  @IsObject({ message: 'Contacts must be an object.' })
  contacts: PositionDescriptionFormTypeContacts;

  @IsNotEmpty({ message: 'Certificate of appointment should not be empty.' })
  @IsObject({ message: 'Certificate of appointment must be an object.' })
  certificateOfAppointment: CertifiedOfAppointmentDto;
}

export class UpdateBasicFormDto {
  @IsNotEmpty({ message: 'Basic should not be empty.' })
  @IsUUID()
  postingApplicantId: PostingApplicants;

  @IsNotEmpty({ message: 'Immediate supervisor should not be empty.' })
  @IsEnum(() => Supervisor)
  immediateSupervisor: Supervisor;

  @IsNotEmpty({ message: 'Supervisor next higher should not be empty.' })
  @IsEnum(() => Supervisor)
  supervisorNextHigher: Supervisor;

  @IsNotEmpty({ message: 'Tools used next higher should not be empty.' })
  @IsString()
  toolsUsed: string;

  @IsNotEmpty({ message: 'Workstation should not be empty.' })
  @IsEnum(() => WorkStation)
  workStation: WorkStation;

  @IsNotEmpty({ message: 'Appointment type should not be empty.' })
  @IsEnum(() => AppointmentType)
  appointmentType: AppointmentType;

  @IsNotEmpty({ message: 'Publication mode should not be empty.' })
  @IsEnum(() => PublicationMode)
  publicationMode: PublicationMode;

  @IsNotEmpty({ message: 'Directly supervised should not be empty' })
  @IsString({ message: 'Directly supervised should be string' })
  directlySupervised: string;

  @IsNotEmpty({ message: 'Directly supervised item numbers should not be empty' })
  @IsString({ message: 'Directly supervised item numbers should be string' })
  directlySupervisedItemNumbers: string;
}

export class UpdateWorkingStationDto {
  @IsOptional()
  @IsBoolean({ message: 'Is office work must be boolean' })
  isOfficeWork: boolean;

  @IsOptional()
  @IsBoolean({ message: 'Is field work must be boolean' })
  isFieldWork: boolean;

  @IsOptional()
  others: string;
}

export class UpdatePositionDescriptionFormDto {
  @IsNotEmpty({ message: 'Basic should not be empty.' })
  @IsObject({ message: 'Basic must be an object.' })
  basic: UpdateBasicFormDto;

  @IsNotEmpty({ message: 'Working condition should not be empty.' })
  @IsObject({ message: 'Working must be an object.' })
  workingCondition: UpdateWorkingStationDto;

  @IsNotEmpty({ message: 'Contacts should not be empty.' })
  @IsObject({ message: 'Contacts must be an object.' })
  contacts: PositionDescriptionFormTypeContacts;

  @IsNotEmpty({ message: 'Certificate of appointment should not be empty.' })
  @IsObject({ message: 'Certificate of appointment must be an object.' })
  certificateOfAppointment: CertifiedOfAppointmentDto;
}
