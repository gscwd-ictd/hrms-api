import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfig } from './global/utils/config-classes/typeorm.config';
import { modules } from './global/utils/arrays/app-modules';
import { join } from 'path';
import { UserlogsMiddleware } from './global/user-logs/middlewares/user-logs.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: join(__dirname, '../.env') }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfig,
    }),
    ...modules,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserlogsMiddleware).forRoutes('*');
  }
}
