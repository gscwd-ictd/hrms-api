import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as session from 'express-session';
import * as redis from 'redis';
import * as connectRedis from 'connect-redis';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import * as helmet from 'helmet';

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
  'http://172.20.10.57:3002',
  'http://172.20.10.57:3003',
  'http://172.20.10.57:3004',
  'http://172.20.10.57:3006',
  'http://localhost:3000',
];

const redisClient = redis.createClient({
  url: `redis://${process.env.MS_HOST_LOCAL}:6479`,
});
console.log('-----------', redisClient);
//redisClient.get
// let RedisStore = require('connect-redis')(session);
const Redis = connectRedis(session);

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(helmet());

  app.use(
    '/',
    session({
      store: new Redis({
        client: redisClient,
      }),
      name: 'ssid_hrms',
      secret: '1234',
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
    },
  });

  app.startAllMicroservices();
  app.set('trust proxy', 1);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
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
