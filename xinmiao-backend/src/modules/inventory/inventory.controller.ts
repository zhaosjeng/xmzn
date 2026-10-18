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
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator';

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // 仓库
  @Get('warehouses')
  listWarehouses(@CurrentUser() user: JwtUser) {
    return this.inventoryService.listWarehouses(user.tenantId);
  }

  @Post('warehouses')
  createWarehouse(@CurrentUser() user: JwtUser, @Body() dto: any) {
    return this.inventoryService.createWarehouse(user.tenantId, dto);
  }

  @Put('warehouses/:id')
  updateWarehouse(@CurrentUser() user: JwtUser, @Param('id') id: number, @Body() dto: any) {
    return this.inventoryService.updateWarehouse(user.tenantId, +id, dto);
  }

  @Delete('warehouses/:id')
  removeWarehouse(@CurrentUser() user: JwtUser, @Param('id') id: number) {
    return this.inventoryService.removeWarehouse(user.tenantId, +id);
  }

  // 库存与流水
  @Get('stocks')
  listStocks(@CurrentUser() user: JwtUser, @Query() query: any) {
    return this.inventoryService.listStocks(user.tenantId, query);
  }

  @Get('movements')
  listMovements(@CurrentUser() user: JwtUser, @Query() query: any) {
    return this.inventoryService.listMovements(user.tenantId, query);
  }

  @Post('movements')
  createMovement(@CurrentUser() user: JwtUser, @Body() dto: any) {
    return this.inventoryService.createMovement(user.tenantId, user.sub, dto);
  }

  @Post('movements/batch')
  batchCreate(@CurrentUser() user: JwtUser, @Body() dto: any) {
    return this.inventoryService.batchCreate(user.tenantId, user.sub, dto);
  }
}
