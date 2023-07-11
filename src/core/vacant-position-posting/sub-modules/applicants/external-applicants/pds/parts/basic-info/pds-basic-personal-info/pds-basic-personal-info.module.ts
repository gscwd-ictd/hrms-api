import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PDSBasicPersonalInfo } from "./data/entities/pds-basic-personal-info.entity";
import { PDSBasicPersonalInfoController } from "./pds-basic-personal-info.controller";
import { PDSBasicPersonalInfoService } from "./pds-basic-personal-info.service";

@Module({
    imports: [TypeOrmModule.forFeature([PDSBasicPersonalInfo])],
    providers: [PDSBasicPersonalInfoService],
    controllers: [PDSBasicPersonalInfoController],
    exports: [PDSBasicPersonalInfoService]
})
export class PDSBasicPersonalInfoModule{}