import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Patient } from './entity/patient.entity';
import { FilterPatientDto } from './dtos/filter.dto';
import { CreatePatientDto } from './dtos/create-patient.dto';
import { UpdatePatientDto } from './dtos/update-patient.dto';
import { IPatientRepository } from './repositories/patient-repository.interface';

@Injectable()
export class PatientsService {
  constructor(
    @Inject('IPatientRepository')
    private patientRepository: IPatientRepository
  ) {}

  async getAllPatients(filterData: FilterPatientDto) {
    return this.patientRepository.findAll(filterData);
  }
  
  async getPatientById(id: number) {
    const patient = await this.patientRepository.findById(id);
    
    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }
    
    return patient;
  }
  
  async createPatient(createPatientDto: CreatePatientDto) {
    return this.patientRepository.create(createPatientDto);
  }
  
  async updatePatient(id: number, updatePatientDto: UpdatePatientDto) {
    const updatedPatient = await this.patientRepository.update(id, updatePatientDto);
    
    if (!updatedPatient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }
    
    return updatedPatient;
  }
  
  async deletePatient(id: number) {
    const result = await this.patientRepository.delete(id);
    
    if (!result.deleted) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }
    
    return result;
  }
}
