import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class GlobalJwtService {
  constructor(public jwtService: JwtService) {}
  async verifyToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        publicKey: readFileSync(join(__dirname, '../../../dist/keys/rsa_public_4096.pem'), 'utf-8'),
        algorithms: ['RS256'],
        audience: [process.env.PORTAL_AUDIENCE, process.env.HRIS_AUDIENCE],
      });
    } catch (error) {
      throw new HttpException({ error: error.message, name: 'Unauthorized' }, HttpStatus.UNAUTHORIZED);
    }
  }

  //async
}
