import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('分类管理')
@Controller('category')
@UseInterceptors(ClassSerializerInterceptor)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  /**
   * 创建分类
   */
  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: '创建分类' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return await this.categoryService.create(createCategoryDto);
  }

  /**
   * 获取分类统计信息
   */
  @Public()
  @Get('stats/all')
  @ApiOperation({ summary: '获取分类统计信息' })
  async getStatistics() {
    return await this.categoryService.getStatistics();
  }

  /**
   * 获取所有分类（不分页，用于下拉选择）
   */
  @Public()
  @Get('list')
  @ApiOperation({ summary: '获取所有分类（不分页）' })
  async findAllList() {
    return await this.categoryService.findAllList();
  }

  /**
   * 获取分类列表（分页）
   */
  @Public()
  @Get()
  @ApiOperation({ summary: '获取分类列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    description: '每页数量',
    example: 10,
  })
  async findAll(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return await this.categoryService.findAll(page, pageSize);
  }

  /**
   * 获取分类详情
   */
  @Public()
  @Get(':id')
  @ApiOperation({ summary: '获取分类详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '分类不存在' })
  async findOne(@Param('id') id: string) {
    return await this.categoryService.findOne(+id);
  }

  /**
   * 更新分类
   */
  @Patch(':id')
  @ApiOperation({ summary: '更新分类' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '分类不存在' })
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return await this.categoryService.update(+id, updateCategoryDto);
  }

  /**
   * 删除分类
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除分类' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '分类不存在' })
  async remove(@Param('id') id: string) {
    await this.categoryService.remove(+id);
    return null;
  }
}
