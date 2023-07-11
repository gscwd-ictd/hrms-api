import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PDSImmigrant } from "./data/entities/pds-immigrant.entity";
import { PDSImmigrantController } from "./pds-immigrant.controller";
import { PDSImmigrantService } from "./pds-immigrant.service";

@Module({
    imports: [TypeOrmModule.forFeature([PDSImmigrant])],
    providers: [PDSImmigrantService],
    controllers: [PDSImmigrantController],
    exports: [PDSImmigrantService]
})
export class PDSImmigrantModule{}