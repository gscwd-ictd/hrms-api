import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { handleRpcError } from 'src/global/utils/helper/error/rpc/rpc-error-handler';
import { MessagePattern } from '../types/message-pattern.type';

@Injectable()
export class MicroserviceHelper {
  constructor(public client: ClientProxy) {}

  async sendRequest(pattern: MessagePattern, payload: object) {
    try {
      return await lastValueFrom(this.client.send(pattern, payload));
    } catch (error) {
      console.log(error);
      handleRpcError(error);
    }
  }
}
