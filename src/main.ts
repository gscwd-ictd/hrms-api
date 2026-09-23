import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as session from 'express-session';
import * as redis from 'redis';
import * as connectRedis from 'connect-redis';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import helmet from 'helmet';
import { fstat, readFileSync } from 'fs';
import { join } from 'path';

const whitelist = [
  'http://172.20.10.57:3109',
  'http://172.20.10.57:3005',
  'http://172.20.10.57:3006',
  'http://172.20.10.59:3001',
  'http://172.20.10.59:3002',
  'http://172.20.10.59:3003',
  'http://172.20.10.59:3004',
  'http://172.20.10.59:3005',
  'http://172.20.10.59:3006',
  'http://172.20.10.60:3102',
  'http://172.20.110.45:3010',
  'http://172.20.110.45:3001',
  'http://172.20.110.45:3002',
  'http://172.20.110.45:3003',
  'http://172.20.110.45:3004',
  'http://172.20.110.45:3005',
  'http://172.20.110.45:3006',
  'http://172.20.110.45:3005',
  'http://172.20.10.60:3002',
  'http://172.20.110.45:5286',
  'http://172.20.10.56:3000',
  'http://172.20.10.63:3001',
  'http://172.20.10.63:3002',
  'http://172.20.10.63:3003',
  'http://172.20.10.63:3004',
  'http://172.20.10.63:3005',
  'http://172.20.110.45:3007',
  'http://172.20.10.57:3000',
  'http://172.20.10.57:3002',
  'http://172.20.10.57:3003',
  'http://172.20.10.57:3004',
  'http://172.20.10.57:3006',
  'http://172.20.110.60:3001',
  'http://172.20.110.60:3002',
  'http://172.20.110.60:3003',
  'http://172.20.110.60:3004',
  'http://172.20.110.60:3005',
  'http://172.20.110.60:3006',
  'http://172.20.110.60:3007',
  'http://172.20.10.55:3000',
  'http://172.20.110.85:3001',
  'http://localhost:3000',
];

const redisClient = redis.createClient({
  url: `redis://${process.env.MS_HOST_LOCAL}:${process.env.RSP_AUTH_PORT}`,
  password: process.env.MS_PASSWORD,
});
console.log('-----------', redisClient);
//redisClient.get
// let RedisStore = require('connect-redis')(session);
const Redis = connectRedis(session);

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  /*
   httpsOptions: {
      key: readFileSync(join(__dirname, '../dist/ssl/localhost.key'), 'utf-8'),
      cert: readFileSync(join(__dirname, '../dist/ssl/localhost.crt'), 'utf-8'),
    },
  
  
  */

  app.use(
    helmet({
      xContentTypeOptions: true,
      xXssProtection: true,
      hsts: {
        maxAge: 31536000, // 1 year (in seconds)
        includeSubDomains: true, // Apply to all subdomains
        preload: true, // Allow browser preloading
      },
    }),
  );

  app.use((req: any, res: { setHeader: (arg0: string, arg1: string) => void }, next: () => void) => {
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  app.use(
    '/',
    session({
      store: new Redis({
        client: redisClient,
      }),
      name: 'ssid_hrms',
      secret: process.env.RSP_COOKIE_PASS,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        signed: true,
        secure: false,
        maxAge: 86000000,
        path: '/',
        //expires: new Date(new Date(Date.now()).setSeconds(new Date(Date.now()).getSeconds() + 86400)),
      },
    }),
  );

  const ms = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: {
      url: `redis://${process.env.MS_HOST_REMOTE}:${process.env.MS_EMPLOYEE_PORT}`,
      password: process.env.MS_PASSWORD,
    },
  });

  app.startAllMicroservices();
  app.set('trust proxy', 1);
  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     transform: true,
  //     forbidUnknownValues: false,
  //     whitelist: true,
  //     forbidNonWhitelisted: true,
  //     skipMissingProperties: false,
  //   }),
  // );
  //app.useGlobalPipes(new ParseUUIDPipe());
  app.setGlobalPrefix('api');

  // const config = new DocumentBuilder().setTitle('HRIS API').setDescription('The cats API description').setVersion('1.0').addTag('cats').build();
  // const document = SwaggerModule.createDocument(app, config);
  // SwaggerModule.setup('api/docs', app, document);

  app.enableCors({
    credentials: true,
    origin: whitelist,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const port = parseInt(process.env.APP_PORT) || 4000;
  await app.listen(port);
}
bootstrap();
