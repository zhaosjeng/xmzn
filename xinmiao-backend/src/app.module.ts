import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join, dirname } from 'path';
import { mkdirSync } from 'fs';
import { Tenant } from './entities/tenant.entity';
import { User } from './entities/user.entity';
import { Customer } from './entities/customer.entity';
import { Product } from './entities/product.entity';
import { Quote } from './entities/quote.entity';
import { QuoteItem } from './entities/quote-item.entity';
import { Project } from './entities/project.entity';
import { ProjectTask } from './entities/project-task.entity';
import { Warehouse } from './entities/warehouse.entity';
import { Stock } from './entities/stock.entity';
import { StockMovement } from './entities/stock-movement.entity';
import { AfterSaleOrder } from './entities/after-sale-order.entity';
import { AfterSaleRecord } from './entities/after-sale-record.entity';
import { Payment } from './entities/payment.entity';
import { Invoice } from './entities/invoice.entity';
import { Contract } from './entities/contract.entity';
import { Brand } from './entities/brand.entity';
import { ContractTemplate } from './entities/contract-template.entity';
import { AuthModule } from './modules/auth/auth.module';
import { AuthService } from './modules/auth/auth.service';
import { UsersModule } from './modules/users/users.module';
import { CustomersModule } from './modules/customers/customers.module';
import { ProductsModule } from './modules/products/products.module';
import { QuotesModule } from './modules/quotes/quotes.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { AfterSalesModule } from './modules/after-sales/after-sales.module';
import { FinanceModule } from './modules/finance/finance.module';
import { ContractsModule } from './modules/contracts/contracts.module';
import { UploadModule } from './modules/upload/upload.module';
import { BrandsModule } from './modules/brands/brands.module';
import { ContractTemplatesModule } from './modules/contract-templates/contract-templates.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: join(process.cwd(), '.env') }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const dbType = config.get<string>('DB_TYPE', 'sqlite');
        if (dbType === 'postgres') {
          return {
            type: 'postgres',
            host: config.get('DB_HOST', 'localhost'),
            port: +config.get('DB_PORT', 5432),
            username: config.get('DB_USER', 'postgres'),
            password: config.get('DB_PASSWORD', 'postgres'),
            database: config.get('DB_NAME', 'magellan'),
            entities: [Tenant, User, Customer, Product, Quote, QuoteItem, Project, ProjectTask, Warehouse, Stock, StockMovement, AfterSaleOrder, AfterSaleRecord, Payment, Invoice, Contract, Brand, ContractTemplate],
            synchronize: true,
          } as any;
        }
        const dbFile = config.get('DB_FILE', 'data/magellan.db');
        mkdirSync(dirname(dbFile), { recursive: true });
        return {
          // sql.js：纯 WASM SQLite 实现，无需本地编译工具链
          type: 'sqljs',
          location: dbFile,
          autoSave: true,
          entities: [Tenant, User, Customer, Product, Quote, QuoteItem, Project, ProjectTask, Warehouse, Stock, StockMovement, AfterSaleOrder, AfterSaleRecord, Payment, Invoice, Contract, Brand, ContractTemplate],
          synchronize: true,
        } as any;
      },
    }),
    AuthModule,
    UsersModule,
    CustomersModule,
    ProductsModule,
    QuotesModule,
    ProjectsModule,
    InventoryModule,
    AfterSalesModule,
    FinanceModule,
    ContractsModule,
    UploadModule,
    BrandsModule,
    ContractTemplatesModule,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly authService: AuthService) {}

  async onModuleInit() {
    // 首次启动：创建默认租户与管理员账号
    await this.authService.ensureBootstrap();
  }
}
