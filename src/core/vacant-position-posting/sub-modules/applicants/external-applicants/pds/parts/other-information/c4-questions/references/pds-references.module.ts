import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PDSReferences } from './data/entities/pds-references.entity';
import { PDSReferencesController } from './pds-references.controller';
import { PDSReferencesService } from './pds-references.service';

@Module({
  imports: [TypeOrmModule.forFeature([PDSReferences])],
  providers: [PDSReferencesService],
  controllers: [PDSReferencesController],
  exports: [PDSReferencesService],
})
export class PDSReferencesModule {}
