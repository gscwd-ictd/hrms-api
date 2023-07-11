import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CompetencyModelOccupationController } from "./competency-model-occupation.controller";
import { CompetencyModelOccupationService } from "./competency-model-occupation.service";
import { CompetencyModelOccupation } from "./data/entities/competency-model-occupation.entity";

@Module({
    imports: [TypeOrmModule.forFeature([CompetencyModelOccupation])],
    providers: [CompetencyModelOccupationService],
    controllers: [CompetencyModelOccupationController]

})
export class CompetencyModelOccupationModule{}