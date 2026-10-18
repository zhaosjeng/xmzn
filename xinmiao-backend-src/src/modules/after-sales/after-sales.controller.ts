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
import { AfterSalesService } from './after-sales.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator';

@Controller('after-sales')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AfterSalesController {
  constructor(private readonly afterSalesService: AfterSalesService) {}

  @Get()
  list(@CurrentUser() user: JwtUser, @Query() query: any) {
    return this.afterSalesService.list(user.tenantId, query);
  }

  @Get('stats')
  stats(@CurrentUser() user: JwtUser) {
    return this.afterSalesService.stats(user.tenantId);
  }

  @Get(':id')
  get(@CurrentUser() user: JwtUser, @Param('id') id: number) {
    return this.afterSalesService.get(user.tenantId, +id);
  }

  @Post()
  create(@CurrentUser() user: JwtUser, @Body() dto: any) {
    return this.afterSalesService.create(user.tenantId, dto);
  }

  @Post(':id/records')
  addRecord(@CurrentUser() user: JwtUser, @Param('id') id: number, @Body() dto: any) {
    return this.afterSalesService.addRecord(user.tenantId, +id, user.sub, dto);
  }

  @Put(':id')
  update(@CurrentUser() user: JwtUser, @Param('id') id: number, @Body() dto: any) {
    return this.afterSalesService.update(user.tenantId, +id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: JwtUser, @Param('id') id: number) {
    return this.afterSalesService.remove(user.tenantId, +id);
  }
}
