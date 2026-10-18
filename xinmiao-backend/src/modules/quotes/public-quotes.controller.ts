import { Controller, Get, Param } from '@nestjs/common';
import { QuotesService } from './quotes.service';

/**
 * 公开报价接口（免登录）：客户通过分享链接查看
 * 路由：GET /api/public/quotes/:token
 */
@Controller('public/quotes')
export class PublicQuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Get(':token')
  getByToken(@Param('token') token: string) {
    return this.quotesService.getByShareToken(token);
  }
}
