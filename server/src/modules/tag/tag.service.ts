import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './entities/tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  /**
   * 创建标签
   */
  async create(createTagDto: CreateTagDto): Promise<Tag> {
    if (!createTagDto.name) {
      throw new BadRequestException('标签名称不能为空');
    }

    // 检查标签名是否已存在
    const existing = await this.tagRepository.findOne({
      where: { name: createTagDto.name, isDeleted: false },
    });
    if (existing) {
      throw new BadRequestException('标签名称已存在');
    }

    const tag = this.tagRepository.create(createTagDto);
    return await this.tagRepository.save(tag);
  }

  /**
   * 获取所有标签（分页）
   */
  async findAll(page = 1, pageSize = 10, isDeleted = false) {
    const [list, total] = await this.tagRepository.findAndCount({
      where: { isDeleted },
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });
    return { list, total, page, pageSize };
  }

  /**
   * 获取所有标签（不分页，用于下拉选择）
   */
  async findAllList() {
    return await this.tagRepository.find({
      where: { isDeleted: false },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 获取标签详情
   */
  async findOne(id: number): Promise<Tag> {
    const tag = await this.tagRepository.findOne({
      where: { id, isDeleted: false },
    });
    if (!tag) {
      throw new NotFoundException('标签不存在');
    }
    return tag;
  }

  /**
   * 更新标签
   */
  async update(id: number, updateTagDto: UpdateTagDto): Promise<Tag> {
    const tag = await this.findOne(id);

    // 如果更新了名称，检查是否重复
    if (updateTagDto.name && updateTagDto.name !== tag.name) {
      const existing = await this.tagRepository.findOne({
        where: { name: updateTagDto.name, isDeleted: false },
      });
      if (existing) {
        throw new BadRequestException('标签名称已存在');
      }
    }

    Object.assign(tag, updateTagDto);
    return await this.tagRepository.save(tag);
  }

  /**
   * 软删除标签（标记为已删除）
   */
  async remove(id: number): Promise<void> {
    const tag = await this.findOne(id);
    tag.isDeleted = true;
    tag.deletedAt = new Date();
    await this.tagRepository.save(tag);
  }

  /**
   * 获取标签统计信息
   */
  async getStatistics() {
    const total = await this.tagRepository.count({
      where: { isDeleted: false },
    });
    return { total };
  }
}
