import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Image } from './entities/image.entity';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';

@Injectable()
export class ImageService {
  constructor(
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
  ) {}

  /**
   * 创建图片记录
   */
  async create(createImageDto: CreateImageDto): Promise<Image> {
    if (!createImageDto.name || !createImageDto.url) {
      throw new BadRequestException('图片名称和URL不能为空');
    }

    const image = this.imageRepository.create(createImageDto);
    return await this.imageRepository.save(image);
  }

  /**
   * 获取图片列表（分页）
   * @param page 页码
   * @param pageSize 每页数量
   * @param categoryId 分类ID，null表示未分类，undefined表示全部
   */
  async findAll(page = 1, pageSize = 20, categoryId?: number | null) {
    const where: any = { isDeleted: false };

    // categoryId 为 null 时查询未分类图片
    if (categoryId === null) {
      where.categoryId = IsNull();
    } else if (categoryId !== undefined) {
      where.categoryId = categoryId;
    }

    const [list, total] = await this.imageRepository.findAndCount({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });

    return { list, total, page, pageSize };
  }

  /**
   * 获取图片详情
   */
  async findOne(id: number): Promise<Image> {
    const image = await this.imageRepository.findOne({
      where: { id, isDeleted: false },
    });
    if (!image) {
      throw new NotFoundException('图片不存在');
    }
    return image;
  }

  /**
   * 更新图片信息
   */
  async update(id: number, updateImageDto: UpdateImageDto): Promise<Image> {
    const image = await this.findOne(id);
    Object.assign(image, updateImageDto);
    return await this.imageRepository.save(image);
  }

  /**
   * 软删除图片
   */
  async remove(id: number): Promise<void> {
    const image = await this.findOne(id);
    image.isDeleted = true;
    image.deletedAt = new Date();
    await this.imageRepository.save(image);
  }

  /**
   * 批量删除图片
   */
  async batchRemove(ids: number[]): Promise<void> {
    if (!ids || ids.length === 0) {
      throw new BadRequestException('请选择要删除的图片');
    }

    await this.imageRepository.update(
      ids.map((id) => ({ id, isDeleted: false })),
      { isDeleted: true, deletedAt: new Date() },
    );

    // 使用 QueryBuilder 批量更新
    await this.imageRepository
      .createQueryBuilder()
      .update(Image)
      .set({ isDeleted: true, deletedAt: new Date() })
      .whereInIds(ids)
      .andWhere('isDeleted = :isDeleted', { isDeleted: false })
      .execute();
  }

  /**
   * 获取图片统计信息
   */
  async getStatistics() {
    const total = await this.imageRepository.count({
      where: { isDeleted: false },
    });
    return { total };
  }
}
