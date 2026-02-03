import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ImageService } from './image.service';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { BatchDeleteDto } from './dto/batch-delete.dto';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

// 确保上传目录存在
const uploadDir = join(process.cwd(), 'uploads', 'images');
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

@ApiTags('图片管理')
@Controller('image')
@UseInterceptors(ClassSerializerInterceptor)
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  /**
   * 上传图片
   */
  @Post('upload')
  @ApiOperation({ summary: '上传图片' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        name: {
          type: 'string',
        },
        categoryId: {
          type: 'number',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: '上传成功' })
  @ApiResponse({ status: 400, description: '上传失败' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: uploadDir,
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/^image\/(jpeg|png|gif|webp|svg\+xml)$/)) {
          return callback(new BadRequestException('只允许上传图片文件'), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('name') name?: string,
    @Body('categoryId') categoryId?: string,
  ) {
    if (!file) {
      throw new BadRequestException('请选择要上传的文件');
    }

    const createImageDto: CreateImageDto = {
      name: name || file.originalname,
      url: `/uploads/images/${file.filename}`,
      size: file.size,
      mimeType: file.mimetype,
      categoryId: categoryId ? parseInt(categoryId, 10) : undefined,
    };

    return await this.imageService.create(createImageDto);
  }

  /**
   * 获取图片统计信息
   */
  @Get('stats/all')
  @ApiOperation({ summary: '获取图片统计信息' })
  async getStatistics() {
    return await this.imageService.getStatistics();
  }

  /**
   * 获取图片列表（分页）
   */
  @Get()
  @ApiOperation({ summary: '获取图片列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页数量', example: 20 })
  @ApiQuery({ name: 'categoryId', required: false, description: '分类ID，null表示未分类' })
  async findAll(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('categoryId') categoryId?: string,
  ) {
    // 处理 categoryId：'null' 字符串转为 null，数字字符串转为数字
    let parsedCategoryId: number | null | undefined;
    if (categoryId === 'null' || categoryId === '') {
      parsedCategoryId = null;
    } else if (categoryId !== undefined) {
      parsedCategoryId = parseInt(categoryId, 10);
    }

    return await this.imageService.findAll(page, pageSize, parsedCategoryId);
  }

  /**
   * 获取图片详情
   */
  @Get(':id')
  @ApiOperation({ summary: '获取图片详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '图片不存在' })
  async findOne(@Param('id') id: string) {
    return await this.imageService.findOne(+id);
  }

  /**
   * 更新图片信息
   */
  @Patch(':id')
  @ApiOperation({ summary: '更新图片信息' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '图片不存在' })
  async update(@Param('id') id: string, @Body() updateImageDto: UpdateImageDto) {
    return await this.imageService.update(+id, updateImageDto);
  }

  /**
   * 删除图片
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除图片' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '图片不存在' })
  async remove(@Param('id') id: string) {
    await this.imageService.remove(+id);
    return null;
  }

  /**
   * 批量删除图片
   */
  @Post('batch-delete')
  @ApiOperation({ summary: '批量删除图片' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async batchDelete(@Body() batchDeleteDto: BatchDeleteDto) {
    await this.imageService.batchRemove(batchDeleteDto.ids);
    return null;
  }
}
