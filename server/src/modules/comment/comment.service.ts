import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
  ) {}

  async create(createCommentDto: CreateCommentDto): Promise<Comment> {
    const comment = this.commentRepository.create(createCommentDto);
    return this.commentRepository.save(comment);
  }

  async findAll(page = 1, pageSize = 10) {
    const [list, total] = await this.commentRepository.findAndCount({
      where: { isDeleted: false },
      relations: ['user', 'post'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return { list, total, page, pageSize };
  }

  async findByPost(postId: number, page = 1, pageSize = 20) {
    const [list, total] = await this.commentRepository.findAndCount({
      where: { postId, isDeleted: false },
      relations: ['user', 'parentComment'],
      order: { createdAt: 'ASC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return { list, total, page, pageSize };
  }

  async findOne(id: number): Promise<Comment | null> {
    return this.commentRepository.findOne({
      where: { id },
      relations: ['user', 'post', 'parentComment'],
    });
  }

  async update(id: number, updateCommentDto: UpdateCommentDto): Promise<Comment | null> {
    await this.commentRepository.update(id, updateCommentDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.commentRepository.update(id, {
      isDeleted: true,
      deletedAt: new Date(),
    });
  }

  async getStatistics() {
    const total = await this.commentRepository.count({
      where: { isDeleted: false },
    });

    const thisMonth = await this.commentRepository
      .createQueryBuilder('comment')
      .where('comment.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('comment.createdAt >= :startOfMonth', {
        startOfMonth: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      })
      .getCount();

    return { total, thisMonth };
  }
}
