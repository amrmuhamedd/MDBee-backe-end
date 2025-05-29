import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Patient } from '../../patients/entity/patient.entity';
import { PatientSeeder } from './patient.seeder';
import { SeederService } from './seeder.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [Patient],
      synchronize: false,
    }),
    TypeOrmModule.forFeature([Patient]),
  ],
  providers: [PatientSeeder, SeederService],
  exports: [SeederService],
})
export class SeederModule {}
