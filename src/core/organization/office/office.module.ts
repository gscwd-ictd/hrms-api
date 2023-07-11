import { Module } from '@nestjs/common';
import { OfficeService } from './office.service';
import { OfficeController } from './office.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Office } from './data/entities/office.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Office])],
  providers: [OfficeService],
  controllers: [OfficeController],
})
export class OfficeModule {}
