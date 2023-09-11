import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PDSOfficeRelation } from './data/entities/pds-office-relation.entity';
import { PDSOfficeRelationController } from './pds-office-relation.controller';
import { PDSOfficeRelationService } from './pds-office-relation.service';

@Module({
  imports: [TypeOrmModule.forFeature([PDSOfficeRelation])],
  providers: [PDSOfficeRelationService],
  controllers: [PDSOfficeRelationController],
  exports: [PDSOfficeRelationService],
})
export class PDSOfficeRelationModule {}
