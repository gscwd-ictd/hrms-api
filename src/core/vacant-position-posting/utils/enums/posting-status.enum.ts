export enum PostingStatus {
  FOR_CSC_APPROVAL = 'For CSC approval',
  OPEN_FOR_APPLICATION = 'Open for application',
  CLOSED_FOR_APPLICATION = 'Closed for application',
  REQUESTING_ENTITY_SELECTION = 'Requesting entity selection',
  REQUESTING_ENTITY_SELECTION_DONE = 'Requesting entity selection done',
  SCHEDULED_FOR_EXAMINATION = 'Scheduled for examination',
  EXAMINATION_DONE = 'Examination done',
  SCHEDULED_FOR_INTERVIEW = 'Scheduled for interview',
  INTERVIEW_ONGOING = 'Interview ongoing',
  INTERVIEW_DONE = 'Interview done',
  SELECTION_DONE = 'Selection done',
  APPOINTING_AUTHORITY_SELECTION = 'Appointing authority selection',
  APPOINTING_AUTHORITY_SELECTION_DONE = 'Appointing authority selection done',
  HIRING_PROCESS_DONE = 'Hiring process done',
  FOR_PRINTING = 'For printing',
}

/*

1. For CSC Approval 
2. Open for Application 
3. Closed for Application 

4.1 Scheduled for Examination (if prf withExam = true) 
4.2 Scheduled for Interview 

5. Selection Done


For CSC approval
Open for application
Closed for application
Requesting entity selection
Requesting entity selection done
Scheduled for examination
Examination done
Schedule for interview
Interview ongoing
Interview done
Appointing authority selection
Appointing authority selection done
Hiring process done

*/
