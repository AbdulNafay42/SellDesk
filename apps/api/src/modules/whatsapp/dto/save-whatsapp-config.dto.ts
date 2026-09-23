import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SaveWhatsAppConfigDto {
  @IsString()
  @IsNotEmpty()
  phoneNumberId: string;

  @IsString()
  @IsOptional()
  wabaId?: string;

  @IsString()
  @IsNotEmpty()
  accessToken: string;

  @IsString()
  @IsOptional()
  verifyToken?: string;

  @IsString()
  @IsOptional()
  displayPhoneNumber?: string;

  @IsString()
  @IsOptional()
  verifiedName?: string;
}
