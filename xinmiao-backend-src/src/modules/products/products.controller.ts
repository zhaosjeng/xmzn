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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import * as XLSX from 'xlsx';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator';

const IMPORT_DIR = join(process.cwd(), 'uploads', 'imports');
if (!existsSync(IMPORT_DIR)) mkdirSync(IMPORT_DIR, { recursive: true });

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  list(@CurrentUser() user: JwtUser, @Query('keyword') keyword?: string, @Query('category') category?: string, @Query('brandId') brandId?: string) {
    return this.productsService.list(user.tenantId, keyword, category, brandId ? +brandId : undefined);
  }

  @Get('categories')
  categories(@CurrentUser() user: JwtUser) {
    return this.productsService.categories(user.tenantId);
  }

  @Get(':id')
  get(@CurrentUser() user: JwtUser, @Param('id') id: number) {
    return this.productsService.get(user.tenantId, +id);
  }

  @Post()
  create(@CurrentUser() user: JwtUser, @Body() dto: any) {
    return this.productsService.create(user.tenantId, dto);
  }

  @Post('batch')
  batchCreate(@CurrentUser() user: JwtUser, @Body() dto: any) {
    return this.productsService.batchCreate(user.tenantId, dto.items || []);
  }

  // 导入预览：上传 Excel，返回解析后的数据
  @Post('import-preview')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: IMPORT_DIR,
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}${extname(file.originalname)}`;
          cb(null, unique);
        },
      }),
      limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
      fileFilter: (_req, file, cb) => {
        if (!/\.(xlsx|xls|csv)$/i.test(file.originalname)) {
          return cb(new BadRequestException('只允许 Excel/CSV 文件'), false);
        }
        cb(null, true);
      },
    }),
  )
  importPreview(@UploadedFile() file: any) {
    if (!file) throw new BadRequestException('未收到文件');
    try {
      const wb = XLSX.readFile(file.path);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<any>(ws, { defval: '' });
      if (!rows.length) return { items: [], total: 0 };

      // 智能表头识别
      const findCol = (keys: string[]) => {
        const first = rows[0];
        for (const k of Object.keys(first)) {
          const norm = String(k).replace(/[\s:：*（）()]/g, '').toLowerCase();
          if (keys.some((key) => norm === key.replace(/[\s:：*（）()]/g, '').toLowerCase() || norm.includes(key.replace(/[\s:：*（）()]/g, '').toLowerCase()))) return k;
        }
        return null;
      };

      const colName = findCol(['产品名', '名称', '品名', 'name']);
      const colModel = findCol(['型号', '规格', 'model']);
      const colCategory = findCol(['品类', '类别', '分类', 'category']);
      const colUnit = findCol(['单位', 'unit']);
      const colPrice = findCol(['销售价', '售价', '价格', 'price']);
      const colCost = findCol(['成本价', '进价', 'cost']);
      const colStock = findCol(['安全库存', '库存', 'stock']);
      const colImage = findCol(['图片', 'image', '图片地址', '图片URL']);

      if (!colName) {
        throw new BadRequestException('未识别到"产品名/名称"列，请检查表头');
      }

      const items = rows
        .filter((r) => String(r[colName] || '').trim())
        .map((r) => ({
          name: String(r[colName] || '').trim(),
          model: String(r[colModel] || '').trim(),
          category: String(r[colCategory] || '').trim(),
          unit: String(r[colUnit] || '个').trim(),
          price: Number(r[colPrice] || 0) || 0,
          cost: Number(r[colCost] || 0) || 0,
          safeStock: Number(r[colStock] || 0) || 0,
          image: String(r[colImage] || '').trim(),
        }));

      return { items, total: items.length, fileName: file.originalname };
    } catch (err: any) {
      throw new BadRequestException('解析失败: ' + err.message);
    }
  }

  @Put(':id')
  update(@CurrentUser() user: JwtUser, @Param('id') id: number, @Body() dto: any) {
    return this.productsService.update(user.tenantId, +id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: JwtUser, @Param('id') id: number) {
    return this.productsService.remove(user.tenantId, +id);
  }
}
