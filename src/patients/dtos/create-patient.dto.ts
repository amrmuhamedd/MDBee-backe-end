import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePatientDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Patient name',
    example: 'John Doe'
  })
  name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Patient status',
    example: 'Active'
  })
  status: string;

  @IsNotEmpty()
  @Type(() => Date)
  @ApiProperty({
    description: 'Patient date',
    example: '2025-05-29'
  })
  date: Date;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Notes status',
    example: 'Completed'
  })
  notes_status: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Room number/name',
    example: 'Room 101'
  })
  room: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Location',
    example: 'Wing A'
  })
  location: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Collaborators',
    example: 'Dr. Smith, Dr. Johnson'
  })
  collabrators: string;
}
