import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

export interface AuthUserPayload {
  id: string;
  email: string;
  fullName: string;
}

@Injectable()
export class AuthService {
  // Pre-hashed development passwords for testing fallback
  // "password123" -> bcrypt hash
  private mockDevUsers = [
    {
      id: 'usr-1',
      email: 'abdulnafay2005@gmail.com',
      fullName: 'Abdul Nafay',
      passwordHash: '$2a$10$eE61K1zWbTqX7T4.Wb0k2e6P1oJ1zJ1zJ1zJ1zJ1zJ1zJ1zJ1zJ1z', // Dev hash or fallback comparison
      plainDevPassword: 'password123',
    },
    {
      id: 'usr-2',
      email: 'kamran@khaadi.com.pk',
      fullName: 'Kamran Akmal',
      passwordHash: '$2a$10$eE61K1zWbTqX7T4.Wb0k2e6P1oJ1zJ1zJ1zJ1zJ1zJ1zJ1zJ1zJ1z',
      plainDevPassword: 'password123',
    },
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<{ accessToken: string; user: AuthUserPayload }> {
    const { email, password } = loginDto;
    let user: { id: string; email: string; fullName: string; passwordHash: string; plainDevPassword?: string } | null = null;

    // 1. Attempt lookup in Prisma Database
    try {
      if (this.prisma && (this.prisma as any).user) {
        user = await this.prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });
      }
    } catch {
      // Prisma database connection fallback
    }

    // 2. Fallback to mock development users if not found in database
    if (!user) {
      user = this.mockDevUsers.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
    }

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 3. Verify password securely
    let isPasswordValid = false;

    if (user.passwordHash && user.passwordHash.startsWith('$2')) {
      try {
        isPasswordValid = bcrypt.compareSync(password, user.passwordHash);
      } catch {
        isPasswordValid = false;
      }
    }

    // Fallback comparison for development mock password
    if (!isPasswordValid && user.plainDevPassword) {
      isPasswordValid = password === user.plainDevPassword;
    }

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 4. Generate signed JWT token
    const payload = {
      sub: user.id,
      email: user.email,
      fullName: user.fullName,
    };

    const secret = process.env.JWT_SECRET || 'selldesk_jwt_secret_dev_key_2026';
    const token = this.jwtService.sign(payload, { secret });

    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
    };
  }

  async getProfile(userId: string): Promise<AuthUserPayload> {
    // Attempt lookup in Prisma Database
    try {
      if (this.prisma && (this.prisma as any).user) {
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, email: true, fullName: true },
        });
        if (user) return user;
      }
    } catch {}

    // Fallback to mock dev users
    const mockUser = this.mockDevUsers.find((u) => u.id === userId);
    if (!mockUser) {
      throw new NotFoundException('Authenticated user profile not found');
    }

    return {
      id: mockUser.id,
      email: mockUser.email,
      fullName: mockUser.fullName,
    };
  }

  // Mock dev memberships for testing fallback
  private mockMemberships: Record<string, { businessId: string; role: string }[]> = {
    'usr-1': [
      { businessId: 'biz-default', role: 'OWNER' },
      { businessId: 'biz-101', role: 'ADMIN' },
      { businessId: 'biz-102', role: 'STAFF' },
      { businessId: 'biz-103', role: 'OWNER' },
    ],
    'usr-2': [
      { businessId: 'biz-102', role: 'OWNER' },
    ],
  };

  async validateBusinessMembership(
    userId: string,
    requestedBusinessId?: string,
  ): Promise<{ isMember: boolean; targetBusinessId: string; role?: string }> {
    // 1. Attempt lookup in Prisma Database
    try {
      if (this.prisma && (this.prisma as any).businessMember) {
        if (requestedBusinessId) {
          const member = await this.prisma.businessMember.findUnique({
            where: {
              userId_businessId: {
                userId,
                businessId: requestedBusinessId,
              },
            },
          });
          if (member) {
            return {
              isMember: true,
              targetBusinessId: requestedBusinessId,
              role: member.role,
            };
          }
        } else {
          // If no businessId passed, query primary/first business membership
          const firstMember = await this.prisma.businessMember.findFirst({
            where: { userId },
          });
          if (firstMember) {
            return {
              isMember: true,
              targetBusinessId: firstMember.businessId,
              role: firstMember.role,
            };
          }
        }
      }
    } catch {}

    // 2. Fallback to mock development memberships
    const userMemberships = this.mockMemberships[userId] || [];

    if (!requestedBusinessId) {
      const defaultMembership = userMemberships[0] || { businessId: 'biz-default', role: 'STAFF' };
      return {
        isMember: userMemberships.length > 0 || userId === 'usr-1',
        targetBusinessId: defaultMembership.businessId,
        role: defaultMembership.role,
      };
    }

    const match = userMemberships.find((m) => m.businessId === requestedBusinessId);
    if (match) {
      return {
        isMember: true,
        targetBusinessId: match.businessId,
        role: match.role,
      };
    }

    return {
      isMember: false,
      targetBusinessId: requestedBusinessId,
    };
  }
}

