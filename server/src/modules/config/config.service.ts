import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Config } from './entities/config.entity';
import { SetConfigDto } from './dto/set-config.dto';

// 默认配置项
const DEFAULT_CONFIGS: SetConfigDto[] = [
  { key: 'site_title', value: 'Emolog' },
  { key: 'site_description', value: '一个简洁的博客系统' },
  { key: 'site_icon', value: '' },
  { key: 'site_logo', value: '' },
  { key: 'site_keywords', value: '博客,技术,分享' },
  { key: 'site_footer', value: '© 2025 Emolog. All rights reserved.' },
];

@Injectable()
export class ConfigService {
  constructor(
    @InjectRepository(Config)
    private configRepository: Repository<Config>,
  ) {
    // 初始化默认配置
    this.initDefaultConfigs();
  }

  /**
   * 初始化默认配置项
   */
  private async initDefaultConfigs() {
    for (const config of DEFAULT_CONFIGS) {
      const existing = await this.configRepository.findOne({
        where: { key: config.key },
      });
      if (!existing) {
        await this.configRepository.save({
          key: config.key,
          value: config.value,
        });
      }
    }
  }

  /**
   * 获取单个配置
   */
  async get(key: string): Promise<string | null> {
    const config = await this.configRepository.findOne({ where: { key } });
    return config?.value ?? null;
  }

  /**
   * 获取多个配置
   */
  async getMany(keys: string[]): Promise<Record<string, string>> {
    const configs = await this.configRepository.find({
      where: { key: In(keys) },
    });
    const result: Record<string, string> = {};
    for (const config of configs) {
      result[config.key] = config.value;
    }
    return result;
  }

  /**
   * 获取所有配置
   */
  async getAll(): Promise<Record<string, string>> {
    const configs = await this.configRepository.find();
    const result: Record<string, string> = {};
    for (const config of configs) {
      result[config.key] = config.value;
    }
    return result;
  }

  /**
   * 设置单个配置
   */
  async set(key: string, value: string): Promise<Config> {
    let config = await this.configRepository.findOne({ where: { key } });
    if (config) {
      config.value = value;
    } else {
      config = this.configRepository.create({ key, value });
    }
    return await this.configRepository.save(config);
  }

  /**
   * 批量设置配置
   */
  async setMany(configs: SetConfigDto[]): Promise<Record<string, string>> {
    for (const { key, value } of configs) {
      await this.set(key, value ?? '');
    }
    return await this.getAll();
  }

  /**
   * 删除配置
   */
  async delete(key: string): Promise<void> {
    await this.configRepository.delete({ key });
  }
}
