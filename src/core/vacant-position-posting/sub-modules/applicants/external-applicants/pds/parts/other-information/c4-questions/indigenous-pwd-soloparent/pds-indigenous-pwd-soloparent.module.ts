import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PDSIndigenousPWDSoloParent } from "./data/entities/pds-indigenous-pwd-soloparent.entity";
import { PDSIndigenousPWDSoloParentController } from "./pds-indigenous-pwd-soloparent.controller";
import { PDSIndigenousPWDSoloParentService } from "./pds-indigenous-pwd-soloparent.service";

@Module({
    imports: [TypeOrmModule.forFeature([PDSIndigenousPWDSoloParent])],
    controllers: [PDSIndigenousPWDSoloParentController],
    providers: [PDSIndigenousPWDSoloParentService],
    exports: [PDSIndigenousPWDSoloParentService]
})
export class PDSIndigenousPWDSoloParentModule{}