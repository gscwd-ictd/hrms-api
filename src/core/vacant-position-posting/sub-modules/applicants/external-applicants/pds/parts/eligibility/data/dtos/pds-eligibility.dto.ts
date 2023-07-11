export class PDSEligibilityDTO {
  _id?: string;
  name: string;
  rating: number;
  examPlace: string;
  licenseNumber: string;
  validity: Date;
  examDate: EligibilityExamDate;
  examDateFrom: string;
  examDateTo: string;
  externalApplicantId: string;
}

export type EligibilityExamDate = {
  from: string;
  to: string;
};

export type PDSEligibilityUpdateDTO = {
  update: PDSEligibilityDTO[];
  deleted: PDSEligibilityDTO[];
};
