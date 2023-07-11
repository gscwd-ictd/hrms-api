export class PDSBasicAddressDTO {
  houseNumber: string;
  street: string;
  subdivision: string;
  barangay: string;
  city: string;
  province: string;
  zipCode: string;
  externalApplicantId: string;
}

export type PDSBasicAddressUpdateDTO = PDSBasicAddressDTO & {
  cityCode?: string;
  provCode?: string;
  brgyCode?: string;
};
