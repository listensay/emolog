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
import { LinkService } from './link.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('友情链接管理')
@Controller('link')
@UseInterceptors(ClassSerializerInterceptor)
export class LinkController {
  constructor(private readonly linkService: LinkService) {}

  /**
   * 创建友情链接
   */
  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: '创建友情链接' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async create(@Body() createLinkDto: CreateLinkDto) {
    return await this.linkService.create(createLinkDto);
  }

  /**
   * 获取友情链接统计信息
   */
  @Public()
  @Get('stats/all')
  @ApiOperation({ summary: '获取友情链接统计信息' })
  async getStatistics() {
    return await this.linkService.getStatistics();
  }

  /**
   * 获取所有友情链接（不分页，用于前台展示）
   */
  @Public()
  @Get('list')
  @ApiOperation({ summary: '获取所有友情链接（不分页）' })
  async findAllList() {
    return await this.linkService.findAllList();
  }

  /**
   * 获取友情链接列表（分页）
   */
  @Public()
  @Get()
  @ApiOperation({ summary: '获取友情链接列表' })
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
    return await this.linkService.findAll(page, pageSize);
  }

  /**
   * 获取友情链接详情
   */
  @Public()
  @Get(':id')
  @ApiOperation({ summary: '获取友情链接详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '友情链接不存在' })
  async findOne(@Param('id') id: string) {
    return await this.linkService.findOne(+id);
  }

  /**
   * 更新友情链接
   */
  @Patch(':id')
  @ApiOperation({ summary: '更新友情链接' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '友情链接不存在' })
  async update(@Param('id') id: string, @Body() updateLinkDto: UpdateLinkDto) {
    return await this.linkService.update(+id, updateLinkDto);
  }

  /**
   * 删除友情链接
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除友情链接' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '友情链接不存在' })
  async remove(@Param('id') id: string) {
    await this.linkService.remove(+id);
    return null;
  }
}
