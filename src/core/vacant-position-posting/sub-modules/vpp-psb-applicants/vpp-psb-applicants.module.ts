import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VppPsbApplicants } from './data/entities/vpp-psb-applicants.entity';
import { VppPsbApplicantsController } from './vpp-psb-applicants.controller';
import { VppPsbApplicantsService } from './vpp-psb-applicants.service';

@Module({
  imports: [TypeOrmModule.forFeature([VppPsbApplicants])],
  providers: [VppPsbApplicantsService],
  controllers: [VppPsbApplicantsController],
  exports: [VppPsbApplicantsService],
})
export class VppPsbApplicantsModule {}
