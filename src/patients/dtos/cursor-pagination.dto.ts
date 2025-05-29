import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CursorPaginationDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Cursor for the next page (typically the id of the last item in the previous page)',
    required: false,
    example: '42'
  })
  cursor?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @ApiProperty({
    description: 'Number of records to return',
    required: false,
    default: 10,
    example: 10
  })
  limit?: number = 10;
}
