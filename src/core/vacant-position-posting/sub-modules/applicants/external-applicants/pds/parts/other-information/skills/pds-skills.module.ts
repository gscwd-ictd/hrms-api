import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PDSSkills } from "./data/entities/pds-skills.entity";
import { PDSSkillsController } from "./pds-skills.controller";
import { PDSSkillsService } from "./pds-skills.service";

@Module({
    imports: [TypeOrmModule.forFeature([PDSSkills])],
    providers: [PDSSkillsService],
    controllers: [PDSSkillsController],
    exports: [PDSSkillsService]
})
export class PDSSkillsModule{}