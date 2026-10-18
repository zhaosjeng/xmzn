import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FinanceService } from './finance.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator';

@Controller('finance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('payments')
  listPayments(@CurrentUser() user: JwtUser, @Query() query: any) {
    return this.financeService.listPayments(user.tenantId, query);
  }

  @Post('payments')
  createPayment(@CurrentUser() user: JwtUser, @Body() dto: any) {
    return this.financeService.createPayment(user.tenantId, dto);
  }

  @Put('payments/:id')
  updatePayment(@CurrentUser() user: JwtUser, @Param('id') id: number, @Body() dto: any) {
    return this.financeService.updatePayment(user.tenantId, +id, dto);
  }

  @Delete('payments/:id')
  removePayment(@CurrentUser() user: JwtUser, @Param('id') id: number) {
    return this.financeService.removePayment(user.tenantId, +id);
  }

  @Get('invoices')
  listInvoices(@CurrentUser() user: JwtUser, @Query() query: any) {
    return this.financeService.listInvoices(user.tenantId, query.keyword, query.status);
  }

  @Post('invoices')
  createInvoice(@CurrentUser() user: JwtUser, @Body() dto: any) {
    return this.financeService.createInvoice(user.tenantId, dto);
  }

  @Put('invoices/:id')
  updateInvoice(@CurrentUser() user: JwtUser, @Param('id') id: number, @Body() dto: any) {
    return this.financeService.updateInvoice(user.tenantId, +id, dto);
  }

  @Delete('invoices/:id')
  removeInvoice(@CurrentUser() user: JwtUser, @Param('id') id: number) {
    return this.financeService.removeInvoice(user.tenantId, +id);
  }

  @Get('stats')
  stats(@CurrentUser() user: JwtUser) {
    return this.financeService.stats(user.tenantId);
  }
}
