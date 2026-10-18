import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractTemplate } from '../../entities/contract-template.entity';
import { ContractTemplatesService } from './contract-templates.service';
import { ContractTemplatesController } from './contract-templates.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ContractTemplate])],
  providers: [ContractTemplatesService],
  controllers: [ContractTemplatesController],
  exports: [ContractTemplatesService],
})
export class ContractTemplatesModule {}
