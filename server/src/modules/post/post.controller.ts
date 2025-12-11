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
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('文章管理')
@Controller('post')
@UseInterceptors(ClassSerializerInterceptor)
export class PostController {
  constructor(private readonly postService: PostService) {}

  /**
   * 创建文章
   */
  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: '创建文章' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async create(@Body() createPostDto: CreatePostDto) {
    return await this.postService.create(createPostDto);
  }

  /**
   * 获取文章统计信息（需要在 :id 之前）
   */
  @Public()
  @Get('stats/all')
  @ApiOperation({ summary: '获取文章统计信息' })
  async getStatistics() {
    return await this.postService.getStatistics();
  }

  /**
   * 获取作者的文章（需要在 :id 之前）
   */
  @Public()
  @Get('author/:authorId')
  @ApiOperation({ summary: '获取作者的文章列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    description: '每页数量',
    example: 10,
  })
  async findByAuthor(
    @Param('authorId') authorId: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return await this.postService.findByAuthor(+authorId, page, pageSize);
  }

  /**
   * 获取文章列表
   */
  @Public()
  @Get()
  @ApiOperation({ summary: '获取文章列表' })
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
    return await this.postService.findAll(page, pageSize);
  }

  /**
   * 获取文章详情
   */
  @Public()
  @Get(':id')
  @ApiOperation({ summary: '获取文章详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '文章不存在' })
  async findOne(@Param('id') id: string) {
    return await this.postService.findOne(+id);
  }

  /**
   * 更新文章
   */
  @Patch(':id')
  @ApiOperation({ summary: '更新文章' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '文章不存在' })
  async update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return await this.postService.update(+id, updatePostDto);
  }

  /**
   * 删除文章
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除文章' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '文章不存在' })
  async remove(@Param('id') id: string) {
    await this.postService.remove(+id);
    return null;
  }

  /**
   * 增加浏览量
   */
  @Public()
  @Post(':id/views')
  @ApiOperation({ summary: '增加文章浏览量' })
  @ApiResponse({ status: 200, description: '成功' })
  async incrementViews(@Param('id') id: string) {
    return await this.postService.incrementViews(+id);
  }

  /**
   * 增加点赞数
   */
  @Post(':id/likes')
  @ApiOperation({ summary: '增加文章点赞数' })
  @ApiResponse({ status: 200, description: '成功' })
  async incrementLikes(@Param('id') id: string) {
    return await this.postService.incrementLikes(+id);
  }
}
