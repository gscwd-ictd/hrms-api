import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommitteeMembersController } from './committee-members.controller';
import { CommitteeMembersService } from './committee-members.service';
import { CommitteeMembers } from './data/entities/committee-members.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CommitteeMembers])],
  controllers: [CommitteeMembersController],
  providers: [CommitteeMembersService],
})
export class CommitteeMembersModule {}
