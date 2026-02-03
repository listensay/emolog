import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ConfigService } from './config.service';
import { SetConfigDto, SetConfigsDto } from './dto/set-config.dto';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('系统配置')
@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: '获取所有配置' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getAll() {
    return await this.configService.getAll();
  }

  @Public()
  @Get('keys')
  @ApiOperation({ summary: '获取指定配置' })
  @ApiQuery({ name: 'keys', description: '配置键名，多个用逗号分隔', example: 'site_title,site_description' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getMany(@Query('keys') keys: string) {
    const keyArray = keys.split(',').map(k => k.trim()).filter(Boolean);
    return await this.configService.getMany(keyArray);
  }

  @Public()
  @Get(':key')
  @ApiOperation({ summary: '获取单个配置' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async get(@Param('key') key: string) {
    const value = await this.configService.get(key);
    return { key, value };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '批量设置配置' })
  @ApiResponse({ status: 200, description: '设置成功' })
  async setMany(@Body() setConfigsDto: SetConfigsDto) {
    return await this.configService.setMany(setConfigsDto.configs);
  }

  @Post(':key')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '设置单个配置' })
  @ApiResponse({ status: 200, description: '设置成功' })
  async set(@Param('key') key: string, @Body() setConfigDto: SetConfigDto) {
    return await this.configService.set(key, setConfigDto.value ?? '');
  }

  @Delete(':key')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除配置' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async delete(@Param('key') key: string) {
    await this.configService.delete(key);
    return null;
  }
}
