import { Module } from "@nestjs/common";
import { PDSBasicAddressModule } from "./address/pds-basic-address.module";
import { PDSBasicGovernmentAgenciesIdsModule } from "./pds-basic-government-agencies-ids/pds-basic-government-agencies-ids.module";
import { PDSBasicPersonalInfoModule } from "./pds-basic-personal-info/pds-basic-personal-info.module";

@Module({
    imports: [PDSBasicGovernmentAgenciesIdsModule,PDSBasicPersonalInfoModule, PDSBasicAddressModule],
    exports: [PDSBasicGovernmentAgenciesIdsModule,PDSBasicPersonalInfoModule, PDSBasicAddressModule]
})
export class PDSBasicInfoModule{}