import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quote } from '../../entities/quote.entity';
import { QuoteItem } from '../../entities/quote-item.entity';
import { Customer } from '../../entities/customer.entity';
import { QuotesService } from './quotes.service';
import { QuotesController } from './quotes.controller';
import { PublicQuotesController } from './public-quotes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Quote, QuoteItem, Customer])],
  controllers: [QuotesController, PublicQuotesController],
  providers: [QuotesService],
  exports: [QuotesService],
})
export class QuotesModule {}
