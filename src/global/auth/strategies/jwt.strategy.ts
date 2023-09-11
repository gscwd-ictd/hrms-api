import { Injectable, Headers } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { readFileSync } from 'fs';
import { UserDto } from 'src/core/users/data/dtos/users.dto';
import { join } from 'path';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    const key = readFileSync(join(__dirname, '../../../keys/jwtRS256.pub.pem'), 'utf-8');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      algorithms: ['RS256'],
      secretOrKey: key,
    });
  }
  async validate(payload: UserDto) {
    return payload;
  }
}
