import { Module } from '@nestjs/common';
import { PDSFamilyChildrenModule } from './pds-family-children/pds-family-children.module';
import { PDSFamilyParentsModule } from './pds-family-parents/pds-family-parents.module';
import { PDSFamilySpouseModule } from './pds-family-spouse/pds-family-spouse.module';

@Module({
  imports: [PDSFamilySpouseModule, PDSFamilyParentsModule, PDSFamilyChildrenModule],
  exports: [PDSFamilySpouseModule, PDSFamilyParentsModule, PDSFamilyChildrenModule],
})
export class PDSFamilyBackgroundModule {}
