import { PositionDescriptionFormInternalContactsService } from './internal-contacts.service';
import { PositionDescriptionFormInternalContacts } from './data/internal-contacts.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { PositionDescriptionFormInternalContactsController } from './internal-contacts.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PositionDescriptionFormInternalContacts])],
  providers: [PositionDescriptionFormInternalContactsService],
  exports: [PositionDescriptionFormInternalContactsService, TypeOrmModule.forFeature([PositionDescriptionFormInternalContacts])],
  controllers: [PositionDescriptionFormInternalContactsController],
})
export class PositionDescriptionFormInternalContactsModule {}
