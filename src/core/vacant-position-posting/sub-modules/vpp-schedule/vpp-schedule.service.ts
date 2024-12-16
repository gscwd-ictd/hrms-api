import { InjectRepository } from '@nestjs/typeorm';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { Repository } from 'typeorm';
import { VppScheduleDto } from './data/dtos/vpp-schedule.dto';
import { VppSchedule } from './data/entities/vpp-schedule.entity';
import { InternalServerErrorException } from '@nestjs/common';

export class VppScheduleService extends BaseEntityCrudService<VppSchedule> {
  constructor(
    @InjectRepository(VppSchedule)
    protected vppScheduleRepository: Repository<VppSchedule>,
  ) {
    super(vppScheduleRepository);
  }

  async addPostingSchedule(vppId: string, vppScheduleDto: VppScheduleDto) {
    try {
      const schedule = await this.saveEntity({ vppId, ...vppScheduleDto });

      let status = 'Scheduled for interview';
      if (vppScheduleDto.scheduleType === 'examination') {
        status = 'Scheduled for examination';
      }
      const updatePosting = await this.entityRepository.query(`UPDATE vacant_position_posting SET posting_status=? WHERE _id = ?`, [status, vppId]);
      return schedule;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async updatePostingSchedule(_id: string, vppScheduleDTO: VppScheduleDto) {
    try {
      const { schedule } = vppScheduleDTO;
      const updateResult = await this.entityRepository.createQueryBuilder().update().set({ schedule }).where({ _id }).execute();
      if (updateResult.affected > 0) return { _id, ...vppScheduleDTO };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
