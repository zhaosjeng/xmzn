import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator';
import { ContractTemplatesService } from './contract-templates.service';

@Controller('contract-templates')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContractTemplatesController {
  constructor(private readonly service: ContractTemplatesService) {}

  @Get()
  list(@CurrentUser() user: JwtUser) {
    return this.service.list(user.tenantId);
  }

  @Get(':id')
  get(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.service.get(user.tenantId, Number(id));
  }

  @Post()
  create(@CurrentUser() user: JwtUser, @Body() dto: any) {
    return this.service.create(user.tenantId, dto);
  }

  @Put(':id')
  async update(@CurrentUser() user: JwtUser, @Param('id') id: string, @Body() dto: any) {
    const t = await this.service.get(user.tenantId, Number(id));
    Object.assign(t, dto);
    return this.service.create(user.tenantId, t);
  }

  @Delete(':id')
  remove(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.service.remove(user.tenantId, Number(id));
  }
}
