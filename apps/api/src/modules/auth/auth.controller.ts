import { Controller, Post, Get, Body, Param, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get('invitation/:token')
  async validateInvitation(@Param('token') token: string) {
    return this.authService.validateInvitation(token);
  }

  @Post('accept-invite')
  @HttpCode(HttpStatus.OK)
  async acceptInvitation(@Body() acceptInviteDto: AcceptInviteDto) {
    return this.authService.acceptInvitation(acceptInviteDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: any) {
    return this.authService.getProfile(req.user.id);
  }

  @Get('memberships')
  @UseGuards(JwtAuthGuard)
  async getMemberships(@Request() req: any) {
    return this.authService.getUserMemberships(req.user.id);
  }
}


