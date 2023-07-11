import { PositionDescriptionFormExternalContactsController } from './external-contacts.controller';
import { PositionDescriptionFormExternalContacts } from './data/external-contacts.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { PositionDescriptionFormExternalContactsService } from './external-contacts.service';

@Module({
  imports: [TypeOrmModule.forFeature([PositionDescriptionFormExternalContacts])],
  controllers: [PositionDescriptionFormExternalContactsController],
  providers: [PositionDescriptionFormExternalContactsService],
  exports: [PositionDescriptionFormExternalContactsService, TypeOrmModule.forFeature([PositionDescriptionFormExternalContacts])],
})
export class PositionDescriptionFormExternalContactsModule {}
