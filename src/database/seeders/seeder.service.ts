import { Injectable } from '@nestjs/common';
import { PatientSeeder } from './patient.seeder';

@Injectable()
export class SeederService {
  constructor(
    private readonly patientSeeder: PatientSeeder,
  ) {}

  async seed() {
    await this.seedPatients();
  }

  async seedPatients(count = 200) {
    await this.patientSeeder.seed(count);
  }

  async clearAll() {
    await this.patientSeeder.clear();
  }
}
