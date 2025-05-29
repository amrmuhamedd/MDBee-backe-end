import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../../src/patients/entity/patient.entity';


export async function seedDatabase(app: INestApplication, data: Partial<Patient>[]) {
  const patientRepository = app.get<Repository<Patient>>(getRepositoryToken(Patient));
  await patientRepository.save(data);
}


export async function clearDatabase(app: INestApplication) {
  const patientRepository = app.get<Repository<Patient>>(getRepositoryToken(Patient));
  await patientRepository.clear();
}


export async function cleanup(app: INestApplication) {
  await clearDatabase(app);
  await app.close();
}