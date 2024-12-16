import { CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';

export class InternalApplicantGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    try {
      const { vppId, withRelevantExperience, workExperienceSheet } = request.body;

      if (withRelevantExperience) {

        workExperienceSheet.map((workExperienceSheetItem) => {
          const { basic, accomplishments, duties } = workExperienceSheetItem;

          if (basic.office.trim() === '' || basic.supervisor.trim() === '' || basic.workExperienceId === '') {

            throw new HttpException('Fields should not be empty.', HttpStatus.NOT_ACCEPTABLE);
          }
          if (duties.length === 0) throw new HttpException('Please supply at least one duty.', HttpStatus.NOT_ACCEPTABLE);
          duties.map((duty) => {
            if (duty.duty.trim() === '') throw new HttpException('Duty must not be empty', 406);
          });
          if (accomplishments.length > 0) {
            accomplishments.map((accomplishment) => {
              if (accomplishment.accomplishment.trim() === '') throw new HttpException('Accomplishment must not be empty', 406);
            });
          }
        });
      }
      return true;
    } catch (error) {
      throw new HttpException(error.response, error.status);
    }
  }
}
