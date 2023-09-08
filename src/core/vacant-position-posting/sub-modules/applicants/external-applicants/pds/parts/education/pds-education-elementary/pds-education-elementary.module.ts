import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PDSEducationElementary } from './data/entities/pds-education-elementary.entity';
import { PDSEducationElementaryController } from './pds-education-elementary.controller';
import { PDSEducationElementaryService } from './pds-education-elementary.service';

@Module({
  imports: [TypeOrmModule.forFeature([PDSEducationElementary])],
  providers: [PDSEducationElementaryService],
  controllers: [PDSEducationElementaryController],
  exports: [PDSEducationElementaryService],
})
export class PDSEducationElementaryModule {}
