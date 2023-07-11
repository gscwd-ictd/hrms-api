import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PDSCandidateResigned } from "./data/entities/pds-candidate-resigned.entity";
import { PDSCandidateResignedController } from "./pds-candidate-resigned.controller";
import { PDSCandidateResignedService } from "./pds-candidate-resigned.service";

@Module({
    imports: [TypeOrmModule.forFeature([PDSCandidateResigned])],
    providers: [PDSCandidateResignedService],
    controllers:[PDSCandidateResignedController],
    exports: [PDSCandidateResignedService]
})
export class PDSCandidateResignedModule{}