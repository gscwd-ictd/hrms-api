import { IsUrl } from 'class-validator';

export class ModulesDTO {
  modules: ModulesType[];
}

export class ModulesUpdateDTO {
  _id: string;
  module: string;
  slug: string;
  url: string;
  app: string;
}

export type ModulesType = Omit<ModulesUpdateDTO, '_id'>;
