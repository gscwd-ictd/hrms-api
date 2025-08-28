export type SalaryGradeType = {
  _id: string;
  salaryGrade: number;
  stepIncrement: number;
  amount: number;
};

export enum NosiNosaStatus {
  FOR_ISSUANCE = 'for issuance',
  FOR_GM_APPROVAL = 'for gm approval',
  APPROVED_NOSI = 'approved nosi',
}
