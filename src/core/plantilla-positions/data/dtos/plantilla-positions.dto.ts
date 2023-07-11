export class PlantillaPositionsDTO {
  employeeId: string;
}

export class PlantillaPositionsAddDTO {
  orgId: string;
  positionData: {
    itemNumber: string;
    positionTitle: string;
    salaryGrade?: number;
    summary: string;
    dailyRate?: number;
  };
}
