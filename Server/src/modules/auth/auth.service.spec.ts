import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let service: AuthService;
  const usersService = {
    findByOpenid: jest.fn(),
    create: jest.fn(),
    findByUsername: jest.fn(),
  };
  const jwtService = {
    sign: jest.fn(),
  };
  const configService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  it('registers with a hashed password and returns a sanitized user', async () => {
    usersService.findByUsername.mockResolvedValue(null);
    usersService.create.mockImplementation(async (payload: any) => ({
      id: 'user-1',
      ...payload,
    }));
    jwtService.sign.mockReturnValue('token-123');

    const result = await service.register({
      username: 'iris',
      password: 'secret123',
      nickname: 'Iris',
      avatar: '',
    });

    expect(usersService.create).toHaveBeenCalledTimes(1);
    const createdPayload = usersService.create.mock.calls[0][0];
    expect(createdPayload.username).toBe('iris');
    expect(createdPayload.nickname).toBe('Iris');
    expect(createdPayload.password).not.toBe('secret123');
    await expect(bcrypt.compare('secret123', createdPayload.password)).resolves.toBe(true);

    expect(result).toEqual({
      accessToken: 'token-123',
      access_token: 'token-123',
      user: expect.objectContaining({
        id: 'user-1',
        username: 'iris',
        nickname: 'Iris',
      }),
    });
    expect((result.user as any).password).toBeUndefined();
  });

  it('logs in with the stored password hash', async () => {
    const hashedPassword = await bcrypt.hash('secret123', 10);
    usersService.findByUsername.mockResolvedValue({
      id: 'user-1',
      username: 'iris',
      nickname: 'Iris',
      password: hashedPassword,
      avatar: '',
    });
    jwtService.sign.mockReturnValue('token-456');

    await expect(
      service.login({
        username: 'iris',
        password: 'secret123',
      }),
    ).resolves.toEqual({
      accessToken: 'token-456',
      access_token: 'token-456',
      user: expect.objectContaining({
        id: 'user-1',
        username: 'iris',
        nickname: 'Iris',
      }),
    });
  });

  it('rejects duplicate usernames during registration', async () => {
    usersService.findByUsername.mockResolvedValue({ id: 'user-1' });

    await expect(
      service.register({
        username: 'iris',
        password: 'secret123',
        nickname: 'Iris',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects invalid passwords during login', async () => {
    const hashedPassword = await bcrypt.hash('secret123', 10);
    usersService.findByUsername.mockResolvedValue({
      id: 'user-1',
      username: 'iris',
      password: hashedPassword,
    });

    await expect(
      service.login({
        username: 'iris',
        password: 'wrong-pass',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
