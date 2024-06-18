import { CertifiedOfAppointmentDto, PositionDescriptionFormBasicDTO } from './../parts/basic/data/position-description-form-basic.dto';
import { PositionDescriptionFormWorkingConditionDTO } from '../parts/working-condition/data/working-condition.dto';
import { PositionDescriptionFormTypeContacts } from '../utils/types/position-description-form.type';
import { IsNotEmpty, IsObject } from 'class-validator';
export class PositionDescriptionFormDTO {
  basic: PositionDescriptionFormBasicDTO;
  workingCondition: PositionDescriptionFormWorkingConditionDTO;
  contacts: PositionDescriptionFormTypeContacts;

  @IsNotEmpty({ message: 'certificate of appointment should not empty' })
  @IsObject({ message: 'certificate of appointment must be an object' })
  certificateOfAppointment: CertifiedOfAppointmentDto;
}
