import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PDSGovernmentIssuedId } from './data/entities/pds-government-issued-id.entity';
import { PDSGovernmentIssuedIdController } from './pds-government-issued-id.controller';
import { PDSGovernmentIssuedIdService } from './pds-government-issued-id.service';

@Module({
  imports: [TypeOrmModule.forFeature([PDSGovernmentIssuedId])],
  providers: [PDSGovernmentIssuedIdService],
  controllers: [PDSGovernmentIssuedIdController],
  exports: [PDSGovernmentIssuedIdService],
})
export class PDSGovernmentIssuedIdModule {}
