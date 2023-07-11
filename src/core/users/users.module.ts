import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/core/users/data/entities/users.entity';
import { ClientsModule } from '@nestjs/microservices';
import { MicroserviceType } from 'src/global/utils/enums/microservice-type.enum';
import { SuperUserService } from './services/superuser.service';
import { PlantillaPositions } from '../plantilla-positions/data/entities/plantilla-positions.entity';
import { SuperUser } from './data/entities/superuser.entity';
import { AuthModule } from 'src/global/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users, SuperUser, PlantillaPositions]),
    //ClientsModule.registerAsync([{ name: MicroserviceType.AUTHZ, useClass: RedisConfigForAuthZ }]),
  ],
  providers: [UsersService, SuperUserService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
