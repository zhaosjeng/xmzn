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
import { ContractsService } from './contracts.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator';

@Controller('contracts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Get()
  list(@CurrentUser() user: JwtUser, @Query() query: any) {
    return this.contractsService.list(user.tenantId, query.keyword, query.status);
  }

  @Get(':id')
  get(@CurrentUser() user: JwtUser, @Param('id') id: number) {
    return this.contractsService.get(user.tenantId, +id);
  }

  @Post()
  create(@CurrentUser() user: JwtUser, @Body() dto: any) {
    return this.contractsService.create(user.tenantId, dto);
  }

  @Put(':id')
  update(@CurrentUser() user: JwtUser, @Param('id') id: number, @Body() dto: any) {
    return this.contractsService.update(user.tenantId, +id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: JwtUser, @Param('id') id: number) {
    return this.contractsService.remove(user.tenantId, +id);
  }
}
