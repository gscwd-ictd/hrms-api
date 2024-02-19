import { Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { ClientsModule } from '@nestjs/microservices';
import { RedisConfigForAuthN, RedisConfigForEmployeeMonitoring, RedisConfigForMailMS } from 'src/global/utils/config-classes/clients.config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { MicroserviceType } from 'src/global/utils/enums/microservice-type.enum';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocalStrategy } from './strategies/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { AuthNService } from './services/auth-n.service';
//import { AuthZService } from './services/auth-z.service';
import { EmailService } from './services/email.service';
import { SuperUser } from '../../core/users/data/entities/superuser.entity';
import { Users } from '../../core/users/data/entities/users.entity';
import { SuperUserService } from '../../core/users/services/superuser.service';
import { UsersService } from '../../core/users/services/users.service';
import { JwtModule } from '@nestjs/jwt';
import { readFileSync } from 'fs';
import { GlobalJwtService } from './services/global-jwt.service';
import { join } from 'path';
import { EmployeesService } from 'src/core/employees/employees.service';
import { Employees } from 'src/core/employees/data/entities/employees.entity';
import { PlantillaPositionsDTO } from 'src/core/plantilla-positions/data/dtos/plantilla-positions.dto';
import { PlantillaPositions } from 'src/core/plantilla-positions/data/entities/plantilla-positions.entity';
import { PlantillaPositionsService } from 'src/core/plantilla-positions/plantilla-positions.service';
import { OfficerInChargeModule } from 'src/core/officer-in-charge/officer-in-charge.module';
import { OfficerInChargeService } from 'src/core/officer-in-charge/officer-in-charge.service';
import { OfficerInChargeViewService } from 'src/core/officer-in-charge/data/officer-in-charge-view/officer-in-charge-view.service';
import { OfficerInCharge } from 'src/core/officer-in-charge/data/officer-in-charge.entity';
import { OfficerInChargeView } from 'src/core/officer-in-charge/data/officer-in-charge-view/officer-incharge.view';
import { CommitteeMembersModule } from 'src/core/committee-members/committee-members.module';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: async () => ({
        signOptions: {
          expiresIn: '1d',
          audience: [process.env.PORTAL_AUDIENCE],
        },
        publicKey: readFileSync(join(__dirname, '../../../dist/keys/rsa_public_4096.pem'), 'utf-8'),
      }),
    }),
    PassportModule,
    TypeOrmModule.forFeature([Users, SuperUser, Employees, PlantillaPositions, OfficerInCharge, OfficerInChargeView]),
    ClientsModule.registerAsync([
      { name: MicroserviceType.AUTHN, useClass: RedisConfigForAuthN },
      { name: MicroserviceType.EMAIL, useClass: RedisConfigForMailMS },
      { name: MicroserviceType.EMPLOYEE_MONITORING, useClass: RedisConfigForEmployeeMonitoring },
    ]),
    OfficerInChargeModule,
    CommitteeMembersModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthNService,
    EmailService,
    JwtStrategy,
    LocalStrategy,
    UsersService,
    SuperUserService,
    GlobalJwtService,
    EmployeesService,
    PlantillaPositionsService,
    OfficerInChargeService,
    OfficerInChargeViewService,
  ],
  exports: [AuthNService, EmailService, PassportModule, UsersService, SuperUserService, GlobalJwtService],
})
export class AuthModule {}
