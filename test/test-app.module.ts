import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientsModule } from '../src/patients/patients.module';
import { Patient } from '../src/patients/entity/patient.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.test',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.TEST_DB_HOST || 'localhost',
      port: process.env.TEST_DB_PORT ? parseInt(process.env.TEST_DB_PORT, 10) : 5432,
      username: process.env.TEST_DB_USERNAME || 'postgres',
      password: process.env.TEST_DB_PASSWORD || 'postgres',
      database: process.env.TEST_DB_NAME || 'test_patients_db',
      entities: [Patient],
      synchronize: true, 
      dropSchema: true, 
    }),
    PatientsModule,
  ],
})
export class TestAppModule {}
