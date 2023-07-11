import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PDSBasicPermanentAddress } from "./data/entities/pds-basic-permanent-address.entity";
import { PDSBasicPermanentAddressService } from "./pds-basic-permanent-address.service";

@Module({
    imports: [TypeOrmModule.forFeature([PDSBasicPermanentAddress])],
    providers: [PDSBasicPermanentAddressService],
    exports: [PDSBasicPermanentAddressService]
})
export class PDSBasicPermanentAddressModule{}