import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PDSOrganization } from "./data/entities/pds-organization.entity";
import { PDSOrganizationController } from "./pds-organization.controller";
import { PDSOrganizationService } from "./pds-organization.service";

@Module({
    imports: [TypeOrmModule.forFeature([PDSOrganization])],
    providers: [PDSOrganizationService],
    controllers: [PDSOrganizationController],
    exports: [PDSOrganizationService]
})
export class PDSOrganizationModule{}