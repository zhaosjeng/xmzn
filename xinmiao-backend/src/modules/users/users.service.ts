import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async list(tenantId: number, keyword?: string) {
    const qb = this.userRepo
      .createQueryBuilder('user')
      .where('user.tenantId = :tenantId', { tenantId })
      .select([
        'user.id',
        'user.username',
        'user.name',
        'user.phone',
        'user.role',
        'user.status',
        'user.menus',
        'user.createdAt',
      ])
      .orderBy('user.id', 'ASC');
    if (keyword) {
      qb.andWhere('(user.name LIKE :kw OR user.username LIKE :kw OR user.phone LIKE :kw)', {
        kw: `%${keyword}%`,
      });
    }
    return qb.getMany();
  }

  async create(tenantId: number, dto: Partial<User>) {
    const user = this.userRepo.create({
      tenantId,
      username: dto.username,
      password: bcrypt.hashSync(dto.password || '123456', 10),
      name: dto.name || '',
      phone: dto.phone || '',
      role: dto.role || 'staff',
    });
    return this.userRepo.save(user);
  }

  async update(tenantId: number, id: number, dto: Partial<User>) {
    const user = await this.userRepo.findOne({ where: { id, tenantId } });
    if (!user) throw new NotFoundException('用户不存在');
    if (dto.password) {
      dto.password = bcrypt.hashSync(dto.password, 10);
    } else {
      delete dto.password;
    }
    Object.assign(user, dto);
    return this.userRepo.save(user);
  }

  async remove(tenantId: number, id: number) {
    const user = await this.userRepo.findOne({ where: { id, tenantId } });
    if (!user) throw new NotFoundException('用户不存在');
    if (user.role === 'admin') {
      const admins = await this.userRepo.count({ where: { tenantId, role: 'admin' } });
      if (admins <= 1) throw new NotFoundException('至少保留一名管理员');
    }
    await this.userRepo.remove(user);
    return { ok: true };
  }
}
