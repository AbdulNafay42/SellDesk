import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class RejectBusinessDto {
  @IsString()
  @IsNotEmpty({ message: 'Rejection reason is required' })
  @MinLength(3, { message: 'Rejection reason must be at least 3 characters long' })
  @MaxLength(500, { message: 'Rejection reason cannot exceed 500 characters' })
  reason: string;
}
