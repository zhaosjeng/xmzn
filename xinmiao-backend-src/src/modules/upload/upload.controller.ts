import {
  Controller,
  Post,
  Get,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync, readdirSync } from 'fs';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

const UPLOAD_DIR = 'uploads';
if (!existsSync(UPLOAD_DIR)) {
  mkdirSync(UPLOAD_DIR, { recursive: true });
}

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  // 列出所有已上传的图片
  @Get('list')
  list() {
    try {
      const files = readdirSync(UPLOAD_DIR)
        .filter((f) => /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(f))
        .map((f) => ({ url: `/uploads/${f}`, name: f }))
        .reverse(); // 最新的在前
      return files;
    } catch {
      return [];
    }
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: UPLOAD_DIR,
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}${extname(file.originalname)}`;
          cb(null, unique);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!/^image\//.test(file.mimetype)) {
          return cb(new BadRequestException('只允许上传图片文件'), false);
        }
        cb(null, true);
      },
    }),
  )
  upload(@UploadedFile() file: any) {
    if (!file) throw new BadRequestException('未收到文件');
    return {
      url: `/uploads/${file.filename}`,
      size: file.size,
    };
  }
}
