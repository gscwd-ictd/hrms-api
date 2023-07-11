import { PositionDescriptionFormBasicDTO } from './../parts/basic/data/position-description-form-basic.dto';
import { PositionDescriptionFormWorkingConditionDTO } from '../parts/working-condition/data/working-condition.dto';
import { PositionDescriptionFormTypeContacts } from '../utils/types/position-description-form.type';
export class PositionDescriptionFormDTO {
  basic: PositionDescriptionFormBasicDTO;
  workingCondition: PositionDescriptionFormWorkingConditionDTO;
  contacts: PositionDescriptionFormTypeContacts;
}
