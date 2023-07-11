import { Injectable, Session, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthNService } from '../services/auth-n.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthNService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.login({
      email,
      password,
      clientId: process.env.CLIENT_ID,
      secret: process.env.SECRET,
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    //session.user = user._id;
    return user;
  }
}
