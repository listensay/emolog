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
import { TagService } from './tag.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('标签管理')
@Controller('tag')
@UseInterceptors(ClassSerializerInterceptor)
export class TagController {
  constructor(private readonly tagService: TagService) {}

  /**
   * 创建标签
   */
  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: '创建标签' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async create(@Body() createTagDto: CreateTagDto) {
    return await this.tagService.create(createTagDto);
  }

  /**
   * 获取标签统计信息
   */
  @Public()
  @Get('stats/all')
  @ApiOperation({ summary: '获取标签统计信息' })
  async getStatistics() {
    return await this.tagService.getStatistics();
  }

  /**
   * 获取所有标签（不分页，用于下拉选择）
   */
  @Public()
  @Get('list')
  @ApiOperation({ summary: '获取所有标签（不分页）' })
  async findAllList() {
    return await this.tagService.findAllList();
  }

  /**
   * 获取标签列表（分页）
   */
  @Public()
  @Get()
  @ApiOperation({ summary: '获取标签列表' })
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
    return await this.tagService.findAll(page, pageSize);
  }

  /**
   * 获取标签详情
   */
  @Public()
  @Get(':id')
  @ApiOperation({ summary: '获取标签详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '标签不存在' })
  async findOne(@Param('id') id: string) {
    return await this.tagService.findOne(+id);
  }

  /**
   * 更新标签
   */
  @Patch(':id')
  @ApiOperation({ summary: '更新标签' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '标签不存在' })
  async update(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
    return await this.tagService.update(+id, updateTagDto);
  }

  /**
   * 删除标签
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除标签' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '标签不存在' })
  async remove(@Param('id') id: string) {
    await this.tagService.remove(+id);
    return null;
  }
}
