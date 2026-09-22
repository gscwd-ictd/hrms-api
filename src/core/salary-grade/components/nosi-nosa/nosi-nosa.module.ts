import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NosiNosa } from './data/entities/nosi-nosa.entity';
import { NosiNosaController } from './nosi-nosa.controller';
import { NosiNosaService } from './nosi-nosa.service';
import { NosiNosaView } from './views/nosi-nosa.view';
import { NosiNosaViewService } from './nosi-nosa-view.service';

@Module({
  imports: [TypeOrmModule.forFeature([NosiNosa, NosiNosaView])],
  controllers: [NosiNosaController],
  providers: [NosiNosaService, NosiNosaViewService],
  exports: [NosiNosaService, NosiNosaViewService],
})
export class NosiNosaModule {}
