import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { User, UserRole } from '../../entities/user.entity';
import { Tenant } from '../../entities/tenant.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Tenant) private readonly tenantRepo: Repository<Tenant>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  /** 首次启动时初始化默认租户与管理员 */
  async ensureBootstrap() {
    let tenant = await this.tenantRepo.findOne({ where: { id: 1 } });
    if (!tenant) {
      tenant = this.tenantRepo.create({ id: 1, name: '默认租户', plan: 'internal' });
      await this.tenantRepo.save(tenant);
    }
    const adminUsername = this.config.get('INIT_ADMIN_USERNAME', 'admin');
    const count = await this.userRepo.count({ where: { tenantId: 1 } });
    if (count === 0) {
      const admin = this.userRepo.create({
        tenantId: 1,
        username: adminUsername,
        password: bcrypt.hashSync(
          this.config.get('INIT_ADMIN_PASSWORD', 'admin123'),
          10,
        ),
        name: '系统管理员',
        role: 'admin',
      });
      await this.userRepo.save(admin);
    }
  }

  async login(username: string, password: string) {
    const user = await this.userRepo.findOne({ where: { username } });
    if (!user || user.status !== 1) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    const ok = bcrypt.compareSync(password, user.password);
    if (!ok) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    return this.buildToken(user);
  }

  /**
   * 统一身份：校验云账号凭证并签发后端 JWT。
   * 云账号（手机号）即本系统统一登录身份；首次登录自动创建对应后端账号。
   */
  async cloudLogin(cloudToken: string) {
    if (!cloudToken) {
      throw new UnauthorizedException('缺少云身份凭证');
    }
    const endpoint = this.config.get<string>(
      'CLOUD_ENDPOINT',
      'https://magellan-platform.app.workbuddy.host',
    );
    const accessKey = this.config.get<string>(
      'CLOUD_PUBLISHABLE_KEY',
      'wbpk_FSmM2dV32A7CowPVbygtTP_q51N1PJYUHQQ6k5VSHY60FRKY736OKd6',
    );
    let res: Response;
    try {
      res = await fetch(`${endpoint}/.cloud/auth/v1/user/me`, {
        method: 'GET',
        headers: {
          'x-wb-webapp-access-key': accessKey,
          Authorization: `Bearer ${cloudToken}`,
        },
      });
    } catch {
      throw new UnauthorizedException('云服务不可达，请稍后重试');
    }
    if (!res.ok) {
      throw new UnauthorizedException('云身份校验失败，请重新登录云账号');
    }
    const body: any = await res.json().catch(() => ({}));
    const phoneNumber =
      body?.phone_number ?? body?.phoneNumber ?? body?.user?.phone_number ?? body?.data?.user?.phone_number ?? null;
    if (!phoneNumber) {
      throw new UnauthorizedException('云账号缺少手机号信息');
    }
    const phone = String(phoneNumber);
    const name = body?.name ?? phone;
    let user = await this.userRepo.findOne({ where: [{ cloudPhone: phone }, { username: phone }] });
    if (!user) {
      user = this.userRepo.create({
        tenantId: 1,
        username: phone,
        cloudPhone: phone,
        name,
        // 云账号登录用户无本地密码，仅凭云身份凭证登录
        password: '',
        role: UserRole.STAFF,
        status: 1,
      });
      await this.userRepo.save(user);
    }
    return this.buildToken(user);
  }

  private buildToken(user: User) {
    const payload = {
      sub: user.id,
      username: user.username,
      tenantId: user.tenantId,
      role: user.role,
      name: user.name,
    };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
        menus: user.menus || null,
      },
    };
  }

  /** 刷新用户信息（供 /auth/profile 使用） */
  async profile(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }
    return {
      id: user.id,
      username: user.username,
      name: user.name,
      phone: user.phone,
      role: user.role,
      tenantId: user.tenantId,
    };
  }
}
