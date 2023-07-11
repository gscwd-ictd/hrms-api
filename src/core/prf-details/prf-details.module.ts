import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PrfTrailModule } from "../document-tracking/prf/trail/prf-trail.module";
import { PlantillaViewModule } from "../plantilla-positions/views/plantilla-view/plantilla-view.module";
import { PrfDetails } from "./data/entity/prf-details.entity";
import { PrfDetailsController } from "./prf-details.controller";
import { PrfDetailsService } from "./prf-details.service";
import { PrfPositions } from "./prf-positions/data/entity/prf-positions.entity";
import { PrfPositionsService } from "./prf-positions/prf-positions.service";

@Module({
    imports: [TypeOrmModule.forFeature([PrfDetails, PrfPositions]), PlantillaViewModule, PrfTrailModule],
    providers: [PrfDetailsService, PrfPositionsService],
    controllers: [PrfDetailsController],
    exports: [PrfDetailsService]
})
export class PrfDetailsModule{}