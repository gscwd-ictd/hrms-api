import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PDSFamilyParents } from './data/entities/pds-family-parents.entity';
import { PDSFamilyParentsController } from './pds-family-parents.controller';
import { PDSFamilyParentsService } from './pds-family-parents.service';

@Module({
  imports: [TypeOrmModule.forFeature([PDSFamilyParents])],
  providers: [PDSFamilyParentsService],
  controllers: [PDSFamilyParentsController],
  exports: [PDSFamilyParentsService],
})
export class PDSFamilyParentsModule {}
