import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePatientDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Patient name',
    example: 'John Doe',
    required: false
  })
  name?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Patient status',
    example: 'Active',
    required: false
  })
  status?: string;

  @IsOptional()
  @Type(() => Date)
  @ApiProperty({
    description: 'Patient date',
    example: '2025-05-29',
    required: false
  })
  date?: Date;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Notes status',
    example: 'Completed',
    required: false
  })
  notes_status?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Room number/name',
    example: 'Room 101',
    required: false
  })
  room?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Location',
    example: 'Wing A',
    required: false
  })
  location?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Collaborators',
    example: 'Dr. Smith, Dr. Johnson',
    required: false
  })
  collabrators?: string;
}
