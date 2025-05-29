import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CursorPaginationDto } from './cursor-pagination.dto';

export class FilterPatientDto extends CursorPaginationDto {
  @IsOptional()
  @IsString()
  @ApiProperty({required: false, description: 'Filter by patient status'})
  status?: string;
}
