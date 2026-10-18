import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AfterSaleOrder } from '../../entities/after-sale-order.entity';
import { AfterSaleRecord } from '../../entities/after-sale-record.entity';
import { AfterSalesService } from './after-sales.service';
import { AfterSalesController } from './after-sales.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AfterSaleOrder, AfterSaleRecord])],
  controllers: [AfterSalesController],
  providers: [AfterSalesService],
  exports: [AfterSalesService],
})
export class AfterSalesModule {}
