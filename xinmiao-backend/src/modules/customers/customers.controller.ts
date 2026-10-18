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
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator';

@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  list(@CurrentUser() user: JwtUser, @Query() query: any) {
    return this.customersService.list(user.tenantId, query);
  }

  @Get('stats')
  stats(@CurrentUser() user: JwtUser) {
    return this.customersService.stats(user.tenantId);
  }

  @Get(':id')
  get(@CurrentUser() user: JwtUser, @Param('id') id: number) {
    return this.customersService.get(user.tenantId, +id);
  }

  @Post()
  create(@CurrentUser() user: JwtUser, @Body() dto: any) {
    return this.customersService.create(user.tenantId, dto);
  }

  @Put(':id')
  update(@CurrentUser() user: JwtUser, @Param('id') id: number, @Body() dto: any) {
    return this.customersService.update(user.tenantId, +id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: JwtUser, @Param('id') id: number) {
    return this.customersService.remove(user.tenantId, +id);
  }
}
