import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfig } from './global/utils/config-classes/typeorm.config';
import { modules } from './global/utils/arrays/app-modules';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: join(__dirname, '../.env') }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfig,
    }),
    ...modules,
  ],
})
export class AppModule {}
