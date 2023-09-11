import { Controller, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PDSBasicGovernmentAgenciesIds } from './data/entities/pds-basic-government-agencies-id.entity';
import { PDSBasicGovernmentAgenciesIdsController } from './pds-basic-government-agencies-ids.controller';
import { PDSBasicGovernmentAgenciesIdsService } from './pds-basic-government-agencies-ids.service';

@Module({
  imports: [TypeOrmModule.forFeature([PDSBasicGovernmentAgenciesIds])],
  providers: [PDSBasicGovernmentAgenciesIdsService],
  controllers: [PDSBasicGovernmentAgenciesIdsController],
  exports: [PDSBasicGovernmentAgenciesIdsService],
})
export class PDSBasicGovernmentAgenciesIdsModule {}
