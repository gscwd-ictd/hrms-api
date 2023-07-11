import { Module } from "@nestjs/common";
import { PDSEducationCollegeModule } from "./pds-education-college/pds-education-college.module";
import { PDSEducationElementaryModule } from "./pds-education-elementary/pds-education-elementary.module";
import { PDSEducationGraduateModule } from "./pds-education-graduate/pds-education-graduate.module";
import { PDSEducationSecondaryModule } from "./pds-education-secondary/pds-education-secondary.module";
import { PDSEducationVocationalModule } from "./pds-education-vocational/pds-education-vocational.module";

@Module({
    imports: [
        PDSEducationCollegeModule,
        PDSEducationGraduateModule,
        PDSEducationElementaryModule,
        PDSEducationSecondaryModule,
        PDSEducationVocationalModule
    ],
    exports: [ 
        PDSEducationCollegeModule,
        PDSEducationGraduateModule,
        PDSEducationElementaryModule,
        PDSEducationSecondaryModule,
        PDSEducationVocationalModule
    ]
})
export class PDSEducationModule{}