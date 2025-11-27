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
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResponseUtil } from '../../common/utils/response.util';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('用户管理')
@Controller('user')
@UseInterceptors(ClassSerializerInterceptor) // 自动排除 @Exclude 标记的字段
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: '用户注册' })
  @ApiResponse({ status: 201, description: '注册成功' })
  @ApiResponse({ status: 409, description: '用户名或邮箱已存在' })
  async register(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    return ResponseUtil.created(user, '注册成功');
  }

  @Get()
  @ApiOperation({ summary: '获取用户列表' })
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
    const {
      list,
      total,
      page: currentPage,
      pageSize: currentPageSize,
    } = await this.userService.findAll(page, pageSize);
    return ResponseUtil.paginate(list, total, currentPage, currentPageSize);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取用户详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findOne(+id);
    return ResponseUtil.success(user);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新用户信息' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.userService.update(+id, updateUserDto);
    return ResponseUtil.success(user, '更新成功');
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除用户' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async remove(@Param('id') id: string) {
    await this.userService.remove(+id);
    return ResponseUtil.success(null, '删除成功');
  }
}
