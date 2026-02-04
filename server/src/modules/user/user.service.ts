import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

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

  /**
   * 修改密码
   */
  async changePassword(
    id: number,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 验证当前密码
    const isPasswordValid = await user.validatePassword(
      changePasswordDto.currentPassword,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('当前密码不正确');
    }

    // 更新密码
    user.password = await bcrypt.hash(changePasswordDto.newPassword, 10);
    await this.userRepository.save(user);
  }

  /**
   * 更新用户资料（不包含密码）
   */
  async updateProfile(
    id: number,
    updateData: {
      nickname?: string;
      avatar?: string;
      profileBackground?: string;
      links?: Array<{ order: number; icon: string; name: string; url: string }>;
    },
  ): Promise<User> {
    const user = await this.findOne(id);
    if (updateData.nickname !== undefined) {
      user.nickname = updateData.nickname;
    }
    if (updateData.avatar !== undefined) {
      user.avatar = updateData.avatar;
    }
    if (updateData.profileBackground !== undefined) {
      user.profileBackground = updateData.profileBackground;
    }
    if (updateData.links !== undefined) {
      user.links = updateData.links;
    }
    return await this.userRepository.save(user);
  }

  /**
   * 获取博主公开资料（最近活跃的用户）
   */
  async getOwnerProfile(): Promise<Partial<User> | null> {
    const user = await this.userRepository.findOne({
      where: { isActive: true },
      order: { updatedAt: 'DESC' },
    });
    if (!user) {
      return null;
    }
    // 只返回公开信息
    return {
      id: user.id,
      nickname: user.nickname,
      avatar: user.avatar,
      profileBackground: user.profileBackground,
      links: user.links,
    };
  }
}
