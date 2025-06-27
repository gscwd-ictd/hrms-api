import { InternalServerErrorException } from '@nestjs/common';
import { ClientProvider, ClientsModuleOptionsFactory, TcpClientOptions, Transport } from '@nestjs/microservices';

export class TcpConfig implements ClientsModuleOptionsFactory {
  createClientOptions(): TcpClientOptions | Promise<ClientProvider> {
    try {
      return {
        transport: Transport.TCP,
        options: {
          host: process.env.MS_HOST,
          port: parseInt(process.env.MS_TCP_PORT),
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}

export class RedisConfigForAuthN implements ClientsModuleOptionsFactory {
  createClientOptions(): ClientProvider | Promise<ClientProvider> {
    return {
      transport: Transport.REDIS,
      options: {
        url: `redis://${process.env.EMP_PORTAL_MS_HOST}:${process.env.EMP_PORTAL_MS_PORT}`,
        password: process.env.EMP_PORTAL_MS_PASS,
      },
    };
  }
}

export class RedisConfigLocal implements ClientsModuleOptionsFactory {
  createClientOptions(): ClientProvider | Promise<ClientProvider> {
    return {
      transport: Transport.REDIS,
      options: {
        url: `redis://${process.env.MS_HOST_LOCAL}:${process.env.MS_PORT_LOCAL}`,
        //password: process.env.MS_PASSWORD,
      },
    };
  }
}

export class RedisConfigForEmployeesMS implements ClientsModuleOptionsFactory {
  createClientOptions(): ClientProvider | Promise<ClientProvider> {
    return {
      transport: Transport.REDIS,
      options: {
        url: `redis://${process.env.MS_HOST_LOCAL}:${process.env.MS_EMPLOYEE_PORT}`,
        password: process.env.EMP_MONITORING_MS_PASSWORD,
      },
    };
  }
}

export class RedisConfigForPDSMS implements ClientsModuleOptionsFactory {
  createClientOptions(): ClientProvider | Promise<ClientProvider> {
    return {
      transport: Transport.REDIS,
      options: {
        url: `redis://${process.env.MS_HOST}:${process.env.MS_REDIS_PORT_PDS}`,
        password: 'gscwd_ictd',
      },
    };
  }
}

export class RedisConfigForEmployeeMonitoring implements ClientsModuleOptionsFactory {
  createClientOptions(): ClientProvider | Promise<ClientProvider> {
    return {
      transport: Transport.REDIS,
      options: {
        url: `redis://${process.env.EMP_MONITORING_MS_HOST}:${process.env.EMP_MONITORING_MS_PORT}`,
        password: process.env.EMP_MONITORING_MS_PASSWORD,
      },
    };
  }
}

export class RedisConfigForMailMS implements ClientsModuleOptionsFactory {
  createClientOptions(): ClientProvider | Promise<ClientProvider> {
    return {
      transport: Transport.REDIS,
      options: {
        url: `redis://${process.env.MS_HOST_REMOTE}:${process.env.MS_EMAIL_PORT}`,
      },
    };
  }
}
