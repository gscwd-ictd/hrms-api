export type SalaryGradeType = {
  _id: string;
  salaryGrade: number;
  stepIncrement: number;
  amount: number;
};

export enum NosiNosaStatus {
  NOSI_FOR_ISSUANCE = 'nosi for issuance',
  NOSI_FOR_GM_APPROVAL = 'nosi for gm approval',
  NOSA_FOR_ISSUANCE = 'nosa for issuance',
  NOSA_FOR_GM_APPROVAL = 'nosa for gm approval',
  APPROVED_NOSI = 'approved nosi',
  APPROVED_NOSA = 'approved nosa',
}
