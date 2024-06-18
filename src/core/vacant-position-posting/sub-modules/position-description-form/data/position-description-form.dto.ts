import { CertifiedOfAppointmentDto, PositionDescriptionFormBasicDTO } from './../parts/basic/data/position-description-form-basic.dto';
import { PositionDescriptionFormWorkingConditionDTO } from '../parts/working-condition/data/working-condition.dto';
import { PositionDescriptionFormTypeContacts } from '../utils/types/position-description-form.type';
import { IsNotEmpty, IsObject } from 'class-validator';
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
