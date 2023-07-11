import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PDSEducationCollege } from "./data/entities/pds-education-college.entity";
import { PDSEducationCollegeController } from "./pds-education-college.controller";
import { PDSEducationCollegeService } from "./pds-education-college.service";

@Module({
    imports: [TypeOrmModule.forFeature([PDSEducationCollege])],
    providers: [PDSEducationCollegeService],
    controllers: [PDSEducationCollegeController],
    exports: [PDSEducationCollegeService]
})
export class PDSEducationCollegeModule{}