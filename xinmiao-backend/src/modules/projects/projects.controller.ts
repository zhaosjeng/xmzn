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
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator';

@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  list(@CurrentUser() user: JwtUser, @Query() query: any) {
    return this.projectsService.list(user.tenantId, query);
  }

  @Get('stats')
  stats(@CurrentUser() user: JwtUser) {
    return this.projectsService.stats(user.tenantId);
  }

  @Get(':id')
  get(@CurrentUser() user: JwtUser, @Param('id') id: number) {
    return this.projectsService.get(user.tenantId, +id);
  }

  @Post()
  create(@CurrentUser() user: JwtUser, @Body() dto: any) {
    return this.projectsService.create(user.tenantId, dto);
  }

  @Put(':id')
  update(@CurrentUser() user: JwtUser, @Param('id') id: number, @Body() dto: any) {
    return this.projectsService.update(user.tenantId, +id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: JwtUser, @Param('id') id: number) {
    return this.projectsService.remove(user.tenantId, +id);
  }
}
