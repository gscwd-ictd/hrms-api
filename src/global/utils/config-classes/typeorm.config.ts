import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { typeormEntities } from '../arrays/typeorm-entities';

@Injectable()
export class TypeOrmConfig implements TypeOrmOptionsFactory {
  createTypeOrmOptions(connectionName?: string): TypeOrmModuleOptions | Promise<TypeOrmModuleOptions> {
    return {
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: typeormEntities,
      logging: false,
      // DB_SYNCHRONIZE=false in .env: no automatic table changes on start-up (recommended on production; an entity
      // that does not match its table makes TypeORM drop and re-add columns, losing their data)
      synchronize: process.env.DB_SYNCHRONIZE !== 'false',
      charset: 'utf8mb4_0900_ai_ci',
    };
  }
}
