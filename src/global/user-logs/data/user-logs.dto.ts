import { Users } from 'src/core/users/data/entities/users.entity';

export class UserLogsDTO {
  userId: string;
  route: string;
  method: string;
  body: string;
}
