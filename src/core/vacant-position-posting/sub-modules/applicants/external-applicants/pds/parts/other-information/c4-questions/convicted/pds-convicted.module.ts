import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PDSConvicted } from './data/entities/pds-convicted.entity';
import { PDSConvictedController } from './pds-convicted.controller';
import { PDSConvictedService } from './pds-convicted.service';

@Module({
  imports: [TypeOrmModule.forFeature([PDSConvicted])],
  providers: [PDSConvictedService],
  controllers: [PDSConvictedController],
  exports: [PDSConvictedService],
})
export class PDSConvictedModule {}
