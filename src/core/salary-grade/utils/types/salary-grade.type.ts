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
  INACTIVE = 'inactive',
  ACTIVE = 'active',
}

export enum InactiveReason {
  // Voluntary
  RESIGNATION = 'resignation',

  // Non-disciplinary (Administrative)
  DROPPED_FROM_ROLLS_AWOL = 'dropped_from_rolls_awol',
  DROPPED_FROM_ROLLS_POOR_PERFORMANCE = 'dropped_from_rolls_poor_performance',
  DROPPED_FROM_ROLLS_PHYSICAL_MENTAL_UNFITNESS = 'dropped_from_rolls_physical_mental_unfitness',

  REORGANIZATION = 'reorganization',
  REDUCTION_IN_FORCE = 'reduction_in_force',

  // Disciplinary
  DISMISSAL = 'dismissal',

  // Other legal causes
  MANDATORY_RETIREMENT = 'mandatory_retirement',
  OPTIONAL_RETIREMENT = 'optional_retirement',
  EXPIRATION_OF_APPOINTMENT = 'expiration_of_appointment',
  DEATH = 'death',

  //Job Order
  END_OF_CONTRACT = 'end_of_contract',
}
