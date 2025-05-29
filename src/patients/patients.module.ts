import { Module } from '@nestjs/common';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from './entity/patient.entity';
import { TypeOrmPatientRepository } from './repositories/typeorm-patient.repository';


@Module({
  imports: [TypeOrmModule.forFeature([Patient])], 
  controllers: [PatientsController],
  providers: [
    PatientsService,
    {
      provide: 'IPatientRepository',
      useClass: TypeOrmPatientRepository
    },
    TypeOrmPatientRepository
  ],
})
export class PatientsModule {}
