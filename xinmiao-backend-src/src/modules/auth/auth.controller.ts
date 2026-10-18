import { Controller, Post, Body, Get, UseGuards, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator';

class LoginDto {
  username: string;
  password: string;
}

class CloudLoginDto {
  cloudToken: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.username, dto.password);
  }

  /** 统一身份：用云账号凭证换取后端 JWT（云账号即本系统登录身份） */
  @Post('cloud-login')
  @HttpCode(200)
  cloudLogin(@Body() dto: CloudLoginDto) {
    return this.authService.cloudLogin(dto.cloudToken);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  profile(@CurrentUser() user: JwtUser) {
    return this.authService.profile(user.sub);
  }
}
