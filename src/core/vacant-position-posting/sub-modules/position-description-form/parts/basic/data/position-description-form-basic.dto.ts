import { PostingApplicants } from '../../../../applicants/data/entities/posting-applicants.entity';
import { WorkStation, AppointmentType, PublicationMode, Supervisor } from '../../../utils/enums/position-description-form.enum';

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
  presentAppropriationAct: string;
  previousAppropriationAct: string;
}
