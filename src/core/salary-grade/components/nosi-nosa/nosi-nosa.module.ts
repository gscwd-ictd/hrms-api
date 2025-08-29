import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NosiNosa } from './data/entities/nosi-nosa.entity';
import { NosiNosaController } from './nosi-nosa.controller';
import { NosiNosaService } from './nosi-nosa.service';

@Module({
  imports: [TypeOrmModule.forFeature([NosiNosa])],
  controllers: [NosiNosaController],
  providers: [NosiNosaService],
  exports: [NosiNosaService],
})
export class NosiNosaModule {}
