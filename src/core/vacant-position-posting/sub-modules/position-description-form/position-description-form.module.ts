import { OccupationalGroupDutiesResponsibilitiesModule } from 'src/core/occupational-group-duties-responsibilities/occupational-group-duties-responsibilities.module';
import { PositionDescriptionFormController } from './position-description-form.controller';
import { PositionDescriptionFormService } from './position-description-form.service';
import { PositionDescriptionFormWorkingConditionModule } from './parts/working-condition/working-condition.module';
import { PositionDescriptionFormInternalContactsModule } from './parts/contacts/internal/internal-contacts.module';
import { PositionDescriptionFormExternalContactsModule } from './parts/contacts/external/external-contacts.module';
import { PositionDescriptionFormBasicModule } from './parts/basic/basic.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    PositionDescriptionFormBasicModule,
    PositionDescriptionFormExternalContactsModule,
    PositionDescriptionFormInternalContactsModule,
    PositionDescriptionFormWorkingConditionModule,
    OccupationalGroupDutiesResponsibilitiesModule,
  ],
  providers: [PositionDescriptionFormService],
  controllers: [PositionDescriptionFormController],
})
export class PositionDescriptionFormModule {}
