import { ExternalApplicants } from 'src/core/vacant-position-posting/sub-modules/applicants/external-applicants/data/entities/external-applicants.entity';
import { Sex, CivilStatus, BloodType, Citizenship, DualCitizenshipType } from '../../../../../utils/enums/pds.enum';

export class PDSBasicPersonalInfoDTO {
  birthDate: Date;
  birthPlace: string;
  sex: Sex;
  civilStatus: CivilStatus;
  height: number;
  weight: number;
  bloodType: BloodType;
  mobileNumber: string;
  telephoneNumber: string;
  citizenship: Citizenship;
  citizenshipType: DualCitizenshipType;
  country: string;
  externalApplicantId: ExternalApplicants;
}

export type PDSBasicPersonalInfoDTOUpdate = PDSBasicPersonalInfoDTO & {
  email: string;
  firstName: string;
  lastName: string;
  middleName: string;
  nameExtension: string;
  mobileNumber: string;
};
