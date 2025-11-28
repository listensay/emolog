import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';
import { BusinessCode } from '../../common/dto/response.dto';
import { BusinessException } from '../../common/exceptions/business.exception';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * 用户登录
   */
  async login(loginDto: LoginDto) {
    const { usernameOrEmail, password } = loginDto;

    // 查找用户
    const user = await this.userService.findByUsernameOrEmail(usernameOrEmail);
    if (!user) {
      // 业务错误：用户名或密码错误 - 返回 HTTP 200 + success false
      throw new BusinessException(
        BusinessCode.INVALID_CREDENTIALS,
        '用户名或密码错误',
      );
    }

    // 验证密码
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      // 业务错误：用户名或密码错误 - 返回 HTTP 200 + success false
      throw new BusinessException(
        BusinessCode.INVALID_CREDENTIALS,
        '用户名或密码错误',
      );
    }

    // 检查用户是否被禁用
    if (!user.isActive) {
      // 业务错误：账号被禁用 - 返回 HTTP 200 + success false
      throw new BusinessException(
        BusinessCode.ACCOUNT_DISABLED,
        '账号已被禁用',
      );
    }

    // 生成 JWT token
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
      },
    };
  }

  /**
   * 验证 token
   */
  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return payload;
    } catch (error) {
      // HTTP 401: Token 无效或过期 - 这是真正的未授权
      throw new UnauthorizedException({
        code: BusinessCode.INVALID_TOKEN,
        message: 'Token 无效或已过期',
      });
    }
  }
}
