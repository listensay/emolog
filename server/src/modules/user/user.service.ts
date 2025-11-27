import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 创建用户（注册）
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    // 检查用户名是否已存在
    const existingUsername = await this.userRepository.findOne({
      where: { username: createUserDto.username },
    });
    if (existingUsername) {
      throw new ConflictException('用户名已存在');
    }

    // 检查邮箱是否已存在
    const existingEmail = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existingEmail) {
      throw new ConflictException('邮箱已存在');
    }

    // 创建新用户
    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  /**
   * 根据用户名查找用户
   */
  async findByUsername(username: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { username } });
  }

  /**
   * 根据邮箱查找用户
   */
  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  /**
   * 根据用户名或邮箱查找用户
   */
  async findByUsernameOrEmail(usernameOrEmail: string): Promise<User | null> {
    return await this.userRepository
      .createQueryBuilder('user')
      .where('user.username = :usernameOrEmail', { usernameOrEmail })
      .orWhere('user.email = :usernameOrEmail', { usernameOrEmail })
      .getOne();
  }

  /**
   * 获取所有用户（分页）
   */
  async findAll(page = 1, pageSize = 10) {
    const [list, total] = await this.userRepository.findAndCount({
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });
    return { list, total, page, pageSize };
  }

  /**
   * 根据 ID 查找用户
   */
  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return user;
  }

  /**
   * 更新用户信息
   */
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  /**
   * 删除用户
   */
  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }
}
