import { Body, Controller, Post } from '@nestjs/common';
import { NosiNosaService } from './nosi-nosa.service';
import { NosiNosaDto } from './data/dto/nosi-nosa.dto';

@Controller('nosi-nosa')
export class NosiNosaController {
  constructor(private readonly nosiNosaService: NosiNosaService) {}

  @Post()
  async addNosiNosa(@Body() nosiNosaDto: NosiNosaDto) {
    //asd
    //
  }
}
