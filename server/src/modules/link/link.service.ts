import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Link } from './entities/link.entity';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';

@Injectable()
export class LinkService {
  constructor(
    @InjectRepository(Link)
    private readonly linkRepository: Repository<Link>,
  ) {}

  /**
   * 创建友情链接
   */
  async create(createLinkDto: CreateLinkDto): Promise<Link> {
    if (!createLinkDto.name || !createLinkDto.url) {
      throw new BadRequestException('链接名称和地址不能为空');
    }

    const link = this.linkRepository.create(createLinkDto);
    return await this.linkRepository.save(link);
  }

  /**
   * 获取所有友情链接（分页）
   */
  async findAll(page = 1, pageSize = 10, isDeleted = false) {
    const [list, total] = await this.linkRepository.findAndCount({
      where: { isDeleted },
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { order: 'ASC', createdAt: 'DESC' },
    });
    return { list, total, page, pageSize };
  }

  /**
   * 获取所有友情链接（不分页，用于前台展示）
   */
  async findAllList() {
    return await this.linkRepository.find({
      where: { isDeleted: false },
      order: { order: 'ASC', createdAt: 'DESC' },
    });
  }

  /**
   * 获取友情链接详情
   */
  async findOne(id: number): Promise<Link> {
    const link = await this.linkRepository.findOne({
      where: { id, isDeleted: false },
    });
    if (!link) {
      throw new NotFoundException('友情链接不存在');
    }
    return link;
  }

  /**
   * 更新友情链接
   */
  async update(id: number, updateLinkDto: UpdateLinkDto): Promise<Link> {
    const link = await this.findOne(id);
    Object.assign(link, updateLinkDto);
    return await this.linkRepository.save(link);
  }

  /**
   * 软删除友情链接
   */
  async remove(id: number): Promise<void> {
    const link = await this.findOne(id);
    link.isDeleted = true;
    link.deletedAt = new Date();
    await this.linkRepository.save(link);
  }

  /**
   * 获取友情链接统计信息
   */
  async getStatistics() {
    const total = await this.linkRepository.count({
      where: { isDeleted: false },
    });
    return { total };
  }
}
