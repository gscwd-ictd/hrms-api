import { Module } from '@nestjs/common';
import { PDSBasicAddressController } from './pds-basic-address.controller';
import { PDSBasicPermanentAddressModule } from './pds-basic-permanent-address/pds-basic-permanent-address.module';
import { PDSBasicResidentialAddressModule } from './pds-basic-residential-address/pds-basic-residential-address.module';

@Module({
  imports: [PDSBasicPermanentAddressModule, PDSBasicResidentialAddressModule],
  controllers: [PDSBasicAddressController],
  exports: [PDSBasicPermanentAddressModule, PDSBasicResidentialAddressModule],
})
export class PDSBasicAddressModule {}
