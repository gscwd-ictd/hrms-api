import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PDSFamilyChildren } from './data/entities/pds-family-children.entity';
import { PDSFamilyChildrenController } from './pds-family-children.controller';
import { PDSFamilyChildrenService } from './pds-family-children.service';

@Module({
  imports: [TypeOrmModule.forFeature([PDSFamilyChildren])],
  providers: [PDSFamilyChildrenService],
  controllers: [PDSFamilyChildrenController],
  exports: [PDSFamilyChildrenService],
})
export class PDSFamilyChildrenModule {}
