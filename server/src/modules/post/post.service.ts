import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Post } from './entities/post.entity';
import { Tag } from '../tag/entities/tag.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  /**
   * 创建文章
   */
  async create(createPostDto: CreatePostDto): Promise<Post> {
    if (
      !createPostDto.title ||
      !createPostDto.authorId ||
      !createPostDto.categoryId
    ) {
      throw new BadRequestException('标题、作者和分类不能为空');
    }

    const { tagIds, ...postData } = createPostDto;
    const post = this.postRepository.create(postData);

    // 处理标签关联
    if (tagIds && tagIds.length > 0) {
      const tags = await this.tagRepository.find({
        where: { id: In(tagIds), isDeleted: false },
      });
      post.tags = tags;
    }

    return await this.postRepository.save(post);
  }

  /**
   * 获取所有文章（分页）
   */
  async findAll(page = 1, pageSize = 10, type?: number) {
    const whereCondition: any = { isDeleted: false };

    // 如果指定了 type，则添加到查询条件
    if (type !== undefined && type !== null) {
      whereCondition.type = type;
    }

    const [list, total] = await this.postRepository.findAndCount({
      where: whereCondition,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
      relations: ['author', 'tags', 'comments'],
    });

    // 添加评论数量并移除完整的 comments 数组
    const listWithCommentCount = list.map((post) => {
      const commentCount = post.comments?.filter((c) => !c.isDeleted).length || 0;
      const { comments, ...postWithoutComments } = post;
      return { ...postWithoutComments, commentCount };
    });

    return { list: listWithCommentCount, total, page, pageSize };
  }

  /**
   * 获取文章详情
   */
  async findOne(id: number): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['author', 'tags'],
    });
    if (!post) {
      throw new NotFoundException('文章不存在');
    }
    return post;
  }

  /**
   * 获取作者的所有文章
   */
  async findByAuthor(authorId: number, page = 1, pageSize = 10) {
    const [list, total] = await this.postRepository.findAndCount({
      where: { authorId, isDeleted: false },
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
      relations: ['author', 'tags', 'comments'],
    });

    // 添加评论数量并移除完整的 comments 数组
    const listWithCommentCount = list.map((post) => {
      const commentCount = post.comments?.filter((c) => !c.isDeleted).length || 0;
      const { comments, ...postWithoutComments } = post;
      return { ...postWithoutComments, commentCount };
    });

    return { list: listWithCommentCount, total, page, pageSize };
  }

  /**
   * 更新文章
   */
  async update(id: number, updatePostDto: UpdatePostDto): Promise<Post> {
    const post = await this.findOne(id);
    const { tagIds, ...postData } = updatePostDto;

    Object.assign(post, postData);

    // 处理标签关联
    if (tagIds !== undefined) {
      if (tagIds.length > 0) {
        const tags = await this.tagRepository.find({
          where: { id: In(tagIds), isDeleted: false },
        });
        post.tags = tags;
      } else {
        post.tags = [];
      }
    }

    return await this.postRepository.save(post);
  }

  /**
   * 软删除文章（标记为已删除）
   */
  async remove(id: number): Promise<void> {
    const post = await this.findOne(id);
    post.isDeleted = true;
    post.deletedAt = new Date();
    await this.postRepository.save(post);
  }

  /**
   * 增加浏览量
   */
  async incrementViews(id: number): Promise<Post> {
    const post = await this.findOne(id);
    post.views += 1;
    return await this.postRepository.save(post);
  }

  /**
   * 增加点赞数
   */
  async incrementLikes(id: number): Promise<Post> {
    const post = await this.findOne(id);
    post.likes += 1;
    return await this.postRepository.save(post);
  }

  /**
   * 获取文章统计信息
   */
  async getStatistics() {
    const total = await this.postRepository.count({
      where: { isDeleted: false },
    });
    const thisMonth = await this.postRepository.count({
      where: { isDeleted: false },
    });

    return { total, thisMonth };
  }
}
