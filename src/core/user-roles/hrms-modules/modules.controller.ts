import { UserLogsInterceptor } from './../../../global/user-logs/interceptors/user-logs.interceptor';
import { AuthenticatedGuard } from './../../../global/auth/guards/authenticated2.guard';
import { ModulesService } from './modules.service';
import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards, UseInterceptors } from '@nestjs/common';
import { ModulesDTO, ModulesType, ModulesUpdateDTO } from './data/modules.dto';

@UseGuards(AuthenticatedGuard)
@Controller('modules')
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Get()
  async getModules() {
    return await this.modulesService.findEntityAll();
  }

  @UseInterceptors(UserLogsInterceptor)
  @Post()
  async saveModules(@Body() modulesDTO: ModulesType) {
    return await this.modulesService.saveModule(modulesDTO);
  }

  @UseInterceptors(UserLogsInterceptor)
  @Delete(':module_id')
  async deleteModules(@Param('module_id') _id: string) {
    return await this.modulesService.removeEntity(_id);
  }

  @UseInterceptors(UserLogsInterceptor)
  @Patch(':module_id')
  async updateModule(@Param('module_id') _id: string, @Body() modulesUpdateDTO: ModulesUpdateDTO) {
    return await this.modulesService.updateEntity({ _id, ...modulesUpdateDTO });
  }
}
