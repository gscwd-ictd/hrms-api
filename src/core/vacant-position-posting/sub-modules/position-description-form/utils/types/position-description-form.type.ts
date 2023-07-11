import { PositionDescriptionFormExternalContactsDTO } from './../../parts/contacts/external/data/external-contacts.dto';
import { PositionDescriptionFormInternalContactsDTO } from '../../parts/contacts/internal/data/internal-contacts.dto';

export type PositionDescriptionFormTypeContacts = {
  internal: PositionDescriptionFormInternalContactsDTO;
  external: PositionDescriptionFormExternalContactsDTO;
};
