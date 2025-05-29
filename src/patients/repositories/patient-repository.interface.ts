import { Patient } from '../entity/patient.entity';
import { CreatePatientDto } from '../dtos/create-patient.dto';
import { UpdatePatientDto } from '../dtos/update-patient.dto';
import { FilterPatientDto } from '../dtos/filter.dto';

export interface IPatientRepository {
  findAll(filterData: FilterPatientDto): Promise<{
    data: Patient[];
    pagination: {
      hasNextPage: boolean;
      nextCursor: string | null;
    };
  }>;
  
  findById(id: number): Promise<Patient | null>;
  
  create(createPatientDto: CreatePatientDto): Promise<Patient>;
  
  update(id: number, updatePatientDto: UpdatePatientDto): Promise<Patient | null>;
  
  delete(id: number): Promise<{ id: number; deleted: boolean }>;
}
