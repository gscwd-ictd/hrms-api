import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PDSBasicResidentialAddress } from './data/entities/pds-basic-residential-address.entity';
import { PDSBasicResidentialAddressService } from './pds-basic-residential-address.service';

@Module({
  imports: [TypeOrmModule.forFeature([PDSBasicResidentialAddress])],
  providers: [PDSBasicResidentialAddressService],
  exports: [PDSBasicResidentialAddressService],
})
export class PDSBasicResidentialAddressModule {}
