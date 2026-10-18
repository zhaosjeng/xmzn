import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator';

@Controller('brands')
@UseGuards(JwtAuthGuard)
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
  list(@CurrentUser() user: JwtUser) {
    return this.brandsService.list(user.tenantId);
  }

  @Post()
  create(@CurrentUser() user: JwtUser, @Body() dto: any) {
    return this.brandsService.create(user.tenantId, dto);
  }

  @Put(':id')
  update(@CurrentUser() user: JwtUser, @Param('id') id: number, @Body() dto: any) {
    return this.brandsService.update(user.tenantId, +id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: JwtUser, @Param('id') id: number) {
    return this.brandsService.remove(user.tenantId, +id);
  }
}
