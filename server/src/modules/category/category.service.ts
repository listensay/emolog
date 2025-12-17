import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category, CategoryType } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  /**
   * 创建分类
   */
  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    if (!createCategoryDto.name) {
      throw new BadRequestException('分类名称不能为空');
    }

    // 检查同类型下分类名是否已存在
    const type = createCategoryDto.type || CategoryType.POST;
    const existing = await this.categoryRepository.findOne({
      where: { name: createCategoryDto.name, type, isDeleted: false },
    });
    if (existing) {
      throw new BadRequestException('分类名称已存在');
    }

    const category = this.categoryRepository.create(createCategoryDto);
    return await this.categoryRepository.save(category);
  }

  /**
   * 获取所有分类（分页）
   */
  async findAll(page = 1, pageSize = 10, isDeleted = false, type?: CategoryType) {
    const where: any = { isDeleted };
    if (type) {
      where.type = type;
    }

    const [list, total] = await this.categoryRepository.findAndCount({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { order: 'ASC', createdAt: 'DESC' },
    });
    return { list, total, page, pageSize };
  }

  /**
   * 获取所有分类（不分页，用于下拉选择）
   */
  async findAllList(type?: CategoryType) {
    const where: any = { isDeleted: false };
    if (type) {
      where.type = type;
    }

    return await this.categoryRepository.find({
      where,
      order: { order: 'ASC', createdAt: 'DESC' },
    });
  }

  /**
   * 获取分类详情
   */
  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id, isDeleted: false },
    });
    if (!category) {
      throw new NotFoundException('分类不存在');
    }
    return category;
  }

  /**
   * 更新分类
   */
  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOne(id);

    // 如果更新了名称，检查同类型下是否重复
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const type = updateCategoryDto.type || category.type;
      const existing = await this.categoryRepository.findOne({
        where: { name: updateCategoryDto.name, type, isDeleted: false },
      });
      if (existing) {
        throw new BadRequestException('分类名称已存在');
      }
    }

    Object.assign(category, updateCategoryDto);
    return await this.categoryRepository.save(category);
  }

  /**
   * 软删除分类（标记为已删除）
   */
  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);
    category.isDeleted = true;
    category.deletedAt = new Date();
    await this.categoryRepository.save(category);
  }

  /**
   * 获取分类统计信息
   */
  async getStatistics() {
    const total = await this.categoryRepository.count({
      where: { isDeleted: false },
    });
    return { total };
  }
}
