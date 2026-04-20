import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { WechatLoginDto } from './dto/wechat-login.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import axios from 'axios';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async wechatLogin(wechatLoginDto: WechatLoginDto) {
    const { code } = wechatLoginDto;

    const appid = this.configService.get<string>('WECHAT_APPID');
    const secret = this.configService.get<string>('WECHAT_SECRET');

    try {
      const response = await axios.get(
        `https://api.weixin.qq.com/sns/jscode2session`,
        {
          params: {
            appid,
            secret,
            js_code: code,
            grant_type: 'authorization_code',
          },
        },
      );

      const { openid, session_key, unionid, errcode, errmsg } = response.data;

      if (errcode) {
        throw new UnauthorizedException(`微信登录失败: ${errmsg}`);
      }

      let user = await this.usersService.findByOpenid(openid);

      if (!user) {
        user = await this.usersService.create({
          openid,
          unionid,
          nickname: wechatLoginDto.nickname || '微信用户',
          avatar: wechatLoginDto.avatar,
        });
      }

      const payload = { sub: user.id, openid: user.openid };
      const accessToken = this.jwtService.sign(payload);

      return {
        accessToken,
        user,
      };
    } catch (error) {
      throw new UnauthorizedException('微信登录失败');
    }
  }

  async validateUser(userId: string) {
    return this.usersService.findOne(userId);
  }

  async register(registerDto: RegisterDto) {
    const { username, password, nickname, avatar } = registerDto;

    // 检查用户名是否已存在
    const existingUser = await this.usersService.findByUsername(username);
    if (existingUser) {
      throw new ConflictException('用户名已存在');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = await this.usersService.create({
      username,
      password: hashedPassword,
      nickname,
      avatar,
    });

    // 生成 token
    const payload = { sub: user.id, username: user.username };
    const accessToken = this.jwtService.sign(payload);

    // 不返回密码
    const { password: _, ...userWithoutPassword } = user;

    return {
      accessToken,
      user: userWithoutPassword,
    };
  }

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    // 查找用户
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 生成 token
    const payload = { sub: user.id, username: user.username };
    const accessToken = this.jwtService.sign(payload);

    // 不返回密码
    const { password: _, ...userWithoutPassword } = user;

    return {
      accessToken,
      user: userWithoutPassword,
    };
  }
}
