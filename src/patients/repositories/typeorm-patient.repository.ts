import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, LessThan, MoreThan, Repository } from 'typeorm';
import { Patient } from '../entity/patient.entity';
import { CreatePatientDto } from '../dtos/create-patient.dto';
import { UpdatePatientDto } from '../dtos/update-patient.dto';
import { FilterPatientDto } from '../dtos/filter.dto';
import { IPatientRepository } from './patient-repository.interface';

@Injectable()
export class TypeOrmPatientRepository implements IPatientRepository {
  constructor(
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>
  ) { }

  async findAll(filterData: FilterPatientDto) {

    let limit = 10;
    if (filterData.limit !== undefined) {
      limit = parseInt(String(filterData.limit), 10) || 10;
    }

    const { cursor, status } = filterData;


    const where: FindOptionsWhere<Patient> = {};


    if (status) {
      where.status = status;
    }


    if (cursor) {

      const cursorValue = parseInt(cursor, 10);
      where.id = MoreThan(cursorValue);
    }


    const safeLimit = Math.min(Math.max(1, limit), 100);

    const take = safeLimit + 1;

    const patients = await this.patientRepository.find({
      where,
      take,
    });

    const hasNextPage = patients.length > safeLimit;

    if (hasNextPage) {
      patients.pop();
    }

    const nextCursor = patients.length > 0 ? String(patients[patients.length - 1].id) : null;

    return {
      data: patients,
      pagination: {
        hasNextPage,
        nextCursor
      }
    };
  }

  async findById(id: number): Promise<Patient | null> {
    return this.patientRepository.findOne({ where: { id } });
  }

  async create(createPatientDto: CreatePatientDto): Promise<Patient> {
    const patient = this.patientRepository.create(createPatientDto);
    return this.patientRepository.save(patient);
  }

  async update(id: number, updatePatientDto: UpdatePatientDto): Promise<Patient | null> {
    const patient = await this.findById(id);

    if (!patient) {
      return null;
    }

    Object.assign(patient, updatePatientDto);

    return this.patientRepository.save(patient);
  }

  async delete(id: number): Promise<{ id: number; deleted: boolean }> {
    const patient = await this.findById(id);

    if (!patient) {
      return { id, deleted: false };
    }

    await this.patientRepository.remove(patient);

    return { id, deleted: true };
  }
}
