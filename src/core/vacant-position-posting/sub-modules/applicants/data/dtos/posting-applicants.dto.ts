import { PostingApplicants } from './../entities/posting-applicants.entity';
import { IsArray, IsBoolean, IsNotEmpty, IsNotEmptyObject, IsOptional, IsUUID, Length, Max, max, Min, ValidateNested } from 'class-validator';
import { ApplicantStatus } from '../../utils/enums/applicant-status.enum';
import { Type } from 'class-transformer';

export class PostingExternalApplicantsDTO {
  vacantPositionPostingId: string;
  externalApplicantId: string;
  applicantStatus: ApplicantStatus;
}

export class PostingInternalApplicantsDTO {
  vacantPositionPostingId: string;
  employeeId: string;
  applicantStatus: ApplicantStatus;
}

export class PostingApplicantsDTOForUpdate {
  _id?: string;
  vacantPositionPostingId: string;
  applicantId: string;
  internal: boolean;
  applicantStatus: ApplicantStatus;
  examScore?: number;
}

export class PostingApplicantRelevantExperienceUpdateDTO {
  withRelevantExperience: boolean;
}

export class ApplicantStatusDTO {
  applicantStatus: ApplicantStatus;
}

export class UpdateApplicantsExamDTO {
  postingApplicantId: string;

  @Max(40)
  @Min(0)
  examScore: number;
}

export class PostingApplicantsExamDTO {
  applicantsExamScores: UpdateApplicantsExamDTO[];
}

//Pseudo DTO from portal ms
export class EmployeeWorkExperienceSheet {
  basic: Basic;

  // @IsArray()
  // @ValidateNested({ each: true })
  // @Type(() => Duties)
  duties: Duties[];

  // @IsArray()
  // @ValidateNested({ each: true })
  // @Type(() => Accomplishments)
  accomplishments: Accomplishments[];
}

export class Duties {
  _id?: string;

  @IsUUID()
  workExperienceSheetBasicId: string;

  @IsNotEmpty()
  duty: string;
}

export class Accomplishments {
  _id?: string;

  @IsUUID()
  workExperienceSheetBasicId: string;

  @IsNotEmpty()
  accomplishment: string;
}

export class Basic {
  _id?: string;

  @IsUUID()
  workExperienceId: string;

  @IsUUID()
  postingApplicantId: PostingApplicants;

  @IsNotEmpty()
  office: string;

  @IsNotEmpty()
  supervisor: string;
}

//END PSEUDO DTO
export class AddEmployeePostingApplicantDTO {
  vppId: string;
  withRelevantExperience: boolean;
  workExperienceSheet: EmployeeWorkExperienceSheet[];
}
