import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PDSVoluntaryWork } from "./data/entities/pds-voluntary-work.entity";
import { PDSVoluntaryWorkController } from "./pds-voluntary-work.controller";
import { PDSVoluntaryWorkService } from "./pds-voluntary-work.service";

@Module({
    imports: [TypeOrmModule.forFeature([PDSVoluntaryWork])],
    providers: [PDSVoluntaryWorkService],
    controllers: [PDSVoluntaryWorkController],
    exports: [PDSVoluntaryWorkService]
})
export class PDSVoluntaryWorkModule{}