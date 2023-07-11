import { HttpException, HttpStatus } from '@nestjs/common';
import { RpcError } from 'src/global/auth/utils/types/auth.types';
import { RpcErrorTitle } from 'src/global/utils/enums/errors/rpc-errors.enum';

export function handleRpcError(error: RpcError) {
  console.log(error.message);
  switch (error.code) {
    case 'auth_n_01':
      throw new HttpException(RpcErrorTitle.AUTH_N_01, HttpStatus.UNAUTHORIZED);
    case 'auth_n_02':
      throw new HttpException(RpcErrorTitle.AUTH_N_02, HttpStatus.UNAUTHORIZED);
    case 'auth_n_03':
      throw new HttpException(RpcErrorTitle.AUTH_N_03, HttpStatus.UNAUTHORIZED);
    case 'auth_n_04':
      throw new HttpException(RpcErrorTitle.AUTH_N_04, HttpStatus.UNAUTHORIZED);
    case 'auth_n_05':
      throw new HttpException(RpcErrorTitle.AUTH_N_05, HttpStatus.UNAUTHORIZED);
    case 'auth_n_06':
      throw new HttpException(RpcErrorTitle.AUTH_N_06, HttpStatus.UNAUTHORIZED);
    case 'auth_n_07':
      throw new HttpException(RpcErrorTitle.AUTH_N_07, HttpStatus.UNAUTHORIZED);
    case 'auth_n_08':
      throw new HttpException(RpcErrorTitle.AUTH_N_08, HttpStatus.UNAUTHORIZED);
    case 'auth_z_01':
      throw new HttpException(RpcErrorTitle.AUTH_Z_01, HttpStatus.UNAUTHORIZED);
    case 'auth_z_02':
      throw new HttpException(RpcErrorTitle.AUTH_Z_02, HttpStatus.UNAUTHORIZED);
    case 'auth_z_03':
      throw new HttpException(RpcErrorTitle.AUTH_Z_03, HttpStatus.UNAUTHORIZED);
    case 'auth_z_04':
      throw new HttpException(RpcErrorTitle.AUTH_Z_04, HttpStatus.UNAUTHORIZED);
    case 'auth_z_05':
      throw new HttpException(RpcErrorTitle.AUTH_Z_05, HttpStatus.UNAUTHORIZED);
    case 'auth_z_06':
      throw new HttpException(RpcErrorTitle.AUTH_Z_06, HttpStatus.UNAUTHORIZED);
    default:
      throw new HttpException('Unknown Error Occured', HttpStatus.UNAUTHORIZED);
  }
}
