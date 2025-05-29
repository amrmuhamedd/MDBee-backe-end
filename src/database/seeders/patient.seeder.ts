import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../../patients/entity/patient.entity';
import { faker } from '@faker-js/faker';

@Injectable()
export class PatientSeeder {
  constructor(
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
  ) {}

  async seed(count = 200): Promise<void> {
    console.log(`Starting to seed ${count} patients...`);
    
    const patients: Partial<Patient>[] = Array.from({ length: count }, () => ({
      name: faker.person.fullName(),
      status: faker.helpers.arrayElement(['Active', 'Inactive', 'Pending', 'Discharged']),
      date: faker.date.between({ from: '2024-01-01', to: '2025-05-29' }),
      notes_status: faker.helpers.arrayElement(['Complete', 'Incomplete', '1/2 Copied', 'Not Started']),
      room: `Room ${faker.number.int({ min: 100, max: 999 })}`,
      location: faker.helpers.arrayElement(['Wing A', 'Wing B', 'ICU', 'Emergency', 'Outpatient']),
      collabrators: faker.helpers.multiple(
        () => faker.person.fullName(),
        { count: { min: 1, max: 3 } }
      ).join(', '),
    }));
    
    const chunks = this.chunkArray(patients, 50); 
    
    for (const chunk of chunks) {
      await this.patientRepository.save(chunk);
      console.log(`Inserted chunk of ${chunk.length} patients`);
    }
    
    console.log(`Successfully seeded ${count} patients`);
  }
  

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }
  
  async clear(): Promise<void> {
    console.log('Clearing all patients from the database...');
    await this.patientRepository.clear();
    console.log('All patients have been removed');
  }
}
