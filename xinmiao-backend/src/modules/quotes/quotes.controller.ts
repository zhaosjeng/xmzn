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
import { QuotesService } from './quotes.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator';

@Controller('quotes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Get()
  list(@CurrentUser() user: JwtUser, @Query() query: any) {
    return this.quotesService.list(user.tenantId, query.keyword, query.status);
  }

  @Get(':id')
  get(@CurrentUser() user: JwtUser, @Param('id') id: number) {
    return this.quotesService.get(user.tenantId, +id);
  }

  @Post()
  create(@CurrentUser() user: JwtUser, @Body() dto: any) {
    return this.quotesService.create(user.tenantId, dto);
  }

  @Put(':id')
  update(@CurrentUser() user: JwtUser, @Param('id') id: number, @Body() dto: any) {
    return this.quotesService.update(user.tenantId, +id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: JwtUser, @Param('id') id: number) {
    return this.quotesService.remove(user.tenantId, +id);
  }

  @Post(':id/share')
  generateShare(@CurrentUser() user: JwtUser, @Param('id') id: number) {
    return this.quotesService.generateShareToken(user.tenantId, +id);
  }
}
