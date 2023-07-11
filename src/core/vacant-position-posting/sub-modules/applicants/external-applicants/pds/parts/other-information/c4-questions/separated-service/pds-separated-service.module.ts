import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PDSSeparatedService } from "./data/entities/pds-separated-service.entity";
import { PDSSeparatedServiceController } from "./pds-separated-service.controller";
import { PDSSeparatedServiceService } from "./pds-separated-service.service";

@Module({
    imports: [TypeOrmModule.forFeature([PDSSeparatedService])],
    providers: [PDSSeparatedServiceService],
    controllers: [PDSSeparatedServiceController],
    exports: [PDSSeparatedServiceService]
})
export class PDSSeparatedServiceModule{}