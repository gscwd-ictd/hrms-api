import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PDSFamilySpouse } from "./data/entities/pds-family-spouse.entity";
import { PDSFamilySpouseService } from "./pds-family-spouse.service";

@Module({
    imports: [TypeOrmModule.forFeature([PDSFamilySpouse])],
    providers: [PDSFamilySpouseService],
    exports: [PDSFamilySpouseService]
})
export class PDSFamilySpouseModule{}