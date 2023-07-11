import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PDSEligibility } from "./data/entities/pds-eligibility.entity";
import { PDSEligibilityController } from "./pds-eligibility.controller";
import { PDSEligibilityService } from "./pds-eligibility.service";

@Module({
    imports: [TypeOrmModule.forFeature([PDSEligibility])],
    providers: [PDSEligibilityService],
    controllers: [PDSEligibilityController],
    exports: [PDSEligibilityService],
})
export class PDSEligibilityModule{}