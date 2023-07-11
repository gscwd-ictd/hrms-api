import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlantillaView } from 'src/core/plantilla-positions/views/plantilla-view/data/entities/plantilla.view';
import { PlantillaViewModule } from 'src/core/plantilla-positions/views/plantilla-view/plantilla-view.module';
import { VacantPositionPostingPublicationView } from './data/vacant-position-posting-publication.view';
import { VacantPositionPostingView } from './data/vacant-position-posting.view';
import { VacantPositionPostingViewService } from './vacant-position-posting-view.service';

@Module({
  imports: [TypeOrmModule.forFeature([VacantPositionPostingView, VacantPositionPostingPublicationView]), PlantillaViewModule],
  providers: [VacantPositionPostingViewService],
  exports: [VacantPositionPostingViewService],
})
export class VacantPositionPostingViewModule {}
