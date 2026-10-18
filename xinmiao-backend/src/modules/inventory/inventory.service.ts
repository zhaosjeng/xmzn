import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Warehouse } from '../../entities/warehouse.entity';
import { Stock } from '../../entities/stock.entity';
import { StockMovement } from '../../entities/stock-movement.entity';
import { Product } from '../../entities/product.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Warehouse) private readonly warehouseRepo: Repository<Warehouse>,
    @InjectRepository(Stock) private readonly stockRepo: Repository<Stock>,
    @InjectRepository(StockMovement) private readonly movementRepo: Repository<StockMovement>,
    private readonly dataSource: DataSource,
  ) {}

  // ---------- 仓库 ----------
  async listWarehouses(tenantId: number) {
    return this.warehouseRepo.find({ where: { tenantId }, order: { id: 'ASC' } });
  }

  async createWarehouse(tenantId: number, dto: Partial<Warehouse>) {
    return this.warehouseRepo.save(this.warehouseRepo.create({ tenantId, ...dto }));
  }

  async updateWarehouse(tenantId: number, id: number, dto: Partial<Warehouse>) {
    const w = await this.warehouseRepo.findOne({ where: { id, tenantId } });
    if (!w) throw new NotFoundException('仓库不存在');
    Object.assign(w, dto);
    return this.warehouseRepo.save(w);
  }

  async removeWarehouse(tenantId: number, id: number) {
    const w = await this.warehouseRepo.findOne({ where: { id, tenantId } });
    if (!w) throw new NotFoundException('仓库不存在');
    await this.warehouseRepo.remove(w);
    return { ok: true };
  }

  // ---------- 库存 ----------
  async listStocks(tenantId: number, query: { warehouseId?: number; keyword?: string }) {
    const qb = this.stockRepo
      .createQueryBuilder('s')
      .leftJoinAndMapOne('s.product', Product, 'p', 'p.id = s.productId')
      .leftJoinAndMapOne('s.warehouse', Warehouse, 'w', 'w.id = s.warehouseId')
      .where('s.tenantId = :tenantId', { tenantId });
    if (query.warehouseId) {
      qb.andWhere('s.warehouseId = :warehouseId', { warehouseId: query.warehouseId });
    }
    if (query.keyword) {
      qb.andWhere('(p.name LIKE :kw OR p.brand LIKE :kw OR p.model LIKE :kw)', {
        kw: `%${query.keyword}%`,
      });
    }
    qb.orderBy('p.id', 'DESC');
    return qb.getMany();
  }

  async listMovements(tenantId: number, query: { warehouseId?: number; productId?: number; type?: string }) {
    const qb = this.movementRepo
      .createQueryBuilder('m')
      .leftJoinAndMapOne('m.product', Product, 'p', 'p.id = m.productId')
      .leftJoinAndMapOne('m.warehouse', Warehouse, 'w', 'w.id = m.warehouseId')
      .where('m.tenantId = :tenantId', { tenantId });
    if (query.warehouseId) qb.andWhere('m.warehouseId = :warehouseId', { warehouseId: query.warehouseId });
    if (query.productId) qb.andWhere('m.productId = :productId', { productId: query.productId });
    if (query.type) qb.andWhere('m.type = :type', { type: query.type });
    qb.orderBy('m.id', 'DESC').limit(200);
    return qb.getMany();
  }

  /**
   * 出入库（事务）：
   * - in 入库：库存增加
   * - out 出库：库存减少（不足则报错）
   * - adjust 盘点调整：quantity 为调整后的目标值
   */
  async createMovement(
    tenantId: number,
    operatorId: number,
    dto: { warehouseId: number; productId: number; type: string; quantity: number; relatedType?: string; relatedId?: number; remark?: string },
  ) {
    if (!dto.warehouseId || !dto.productId || !dto.type) {
      throw new BadRequestException('仓库、产品和类型必填');
    }
    return this.dataSource.transaction(async (manager) => {
      let stock = await manager.findOne(Stock, {
        where: { tenantId, warehouseId: dto.warehouseId, productId: dto.productId },
      });
      if (!stock) {
        stock = manager.create(Stock, {
          tenantId,
          warehouseId: dto.warehouseId,
          productId: dto.productId,
          quantity: 0,
        });
      }
      const quantity = Math.abs(Number(dto.quantity) || 0);
      if (dto.type === 'in') {
        stock.quantity += quantity;
      } else if (dto.type === 'out') {
        if (stock.quantity < quantity) {
          throw new BadRequestException(
            `库存不足：当前 ${stock.quantity}，出库 ${quantity}`,
          );
        }
        stock.quantity -= quantity;
      } else if (dto.type === 'adjust') {
        stock.quantity = quantity;
      } else {
        throw new BadRequestException('不支持的流水类型');
      }
      await manager.save(stock);
      const movement = manager.create(StockMovement, {
        tenantId,
        warehouseId: dto.warehouseId,
        productId: dto.productId,
        type: dto.type,
        quantity: dto.type === 'adjust' ? stock.quantity : quantity,
        relatedType: dto.relatedType || '',
        relatedId: dto.relatedId || null,
        operatorId,
        remark: dto.remark || '',
      });
      await manager.save(movement);
      return movement;
    });
  }

  /**
   * 批量出入库（一个事务里处理多个产品）：
   * - dto: { warehouseId, type, items: [{productId, quantity}], remark, relatedType }
   * - 任意一个产品库存不足则整体回滚
   */
  async batchCreate(
    tenantId: number,
    operatorId: number,
    dto: { warehouseId: number; type: string; items: { productId: number; quantity: number }[]; remark?: string; relatedType?: string },
  ) {
    if (!dto.warehouseId || !dto.type || !Array.isArray(dto.items) || !dto.items.length) {
      throw new BadRequestException('仓库、类型和至少一条产品明细必填');
    }
    return this.dataSource.transaction(async (manager) => {
      const batchNo = `${dto.type === 'in' ? 'RK' : 'CK'}-${Date.now().toString().slice(-8)}`;
      const created: any[] = [];
      for (const item of dto.items) {
        let stock = await manager.findOne(Stock, {
          where: { tenantId, warehouseId: dto.warehouseId, productId: item.productId },
        });
        if (!stock) {
          stock = manager.create(Stock, {
            tenantId,
            warehouseId: dto.warehouseId,
            productId: item.productId,
            quantity: 0,
          });
        }
        const quantity = Math.abs(Number(item.quantity) || 0);
        if (dto.type === 'in') {
          stock.quantity += quantity;
        } else if (dto.type === 'out') {
          if (stock.quantity < quantity) {
            throw new BadRequestException(`库存不足：产品ID ${item.productId}，当前 ${stock.quantity}，出库 ${quantity}`);
          }
          stock.quantity -= quantity;
        } else {
          throw new BadRequestException('批量接口暂不支持盘点调整');
        }
        await manager.save(stock);
        const movement = manager.create(StockMovement, {
          tenantId,
          warehouseId: dto.warehouseId,
          productId: item.productId,
          type: dto.type,
          quantity,
          relatedType: dto.relatedType || '',
          operatorId,
          remark: dto.remark || '',
          batchNo,
        });
        await manager.save(movement);
        created.push(movement);
      }
      return { ok: true, count: created.length, items: created };
    });
  }
}
