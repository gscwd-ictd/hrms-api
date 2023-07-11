import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommitteesController } from './committees.controller';
import { CommitteesService } from './committees.service';
import { Committees } from './data/entities/committees.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Committees])],
  controllers: [CommitteesController],
  providers: [CommitteesService],
})
export class CommitteesModule {}
