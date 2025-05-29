import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { IPatientRepository } from './repositories/patient-repository.interface';
import { CreatePatientDto } from './dtos/create-patient.dto';
import { UpdatePatientDto } from './dtos/update-patient.dto';
import { FilterPatientDto } from './dtos/filter.dto';

const mockPatient = {
  id: 1,
  name: 'John Doe',
  status: 'Active',
  date: new Date('2025-01-01'),
  notes_status: 'Complete',
  room: 'Room 101',
  location: 'Wing A',
  collabrators: 'Dr. Smith'
};


const mockPatientRepository = {
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('PatientsService', () => {
  let service: PatientsService;
  let repository: IPatientRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientsService,
        {
          provide: 'IPatientRepository',
          useValue: mockPatientRepository,
        },
      ],
    }).compile();

    service = module.get<PatientsService>(PatientsService);
    repository = module.get<IPatientRepository>('IPatientRepository');

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllPatients', () => {
    it('should return patients with pagination info', async () => {
      const filterDto = new FilterPatientDto();
      const expectedResult = {
        data: [mockPatient],
        pagination: {
          hasNextPage: false,
          nextCursor: '1'
        }
      };
      
      mockPatientRepository.findAll.mockResolvedValue(expectedResult);
      
      const result = await service.getAllPatients(filterDto);
      
      expect(result).toEqual(expectedResult);
      expect(mockPatientRepository.findAll).toHaveBeenCalledWith(filterDto);
    });
  });

  describe('getPatientById', () => {
    it('should return a patient when it exists', async () => {
      mockPatientRepository.findById.mockResolvedValue(mockPatient);
      
      const result = await service.getPatientById(1);
      
      expect(result).toEqual(mockPatient);
      expect(mockPatientRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when patient does not exist', async () => {
      mockPatientRepository.findById.mockResolvedValue(null);
      
      await expect(service.getPatientById(999)).rejects.toThrow(NotFoundException);
      expect(mockPatientRepository.findById).toHaveBeenCalledWith(999);
    });
  });

  describe('createPatient', () => {
    it('should create and return a new patient', async () => {
      const createPatientDto: CreatePatientDto = {
        name: 'Jane Doe',
        status: 'Active',
        date: new Date('2025-02-01'),
        notes_status: 'Pending',
        room: 'Room 202',
        location: 'Wing B',
        collabrators: 'Dr. Johnson'
      };
      
      const newPatient = { id: 2, ...createPatientDto };
      mockPatientRepository.create.mockResolvedValue(newPatient);
      
      const result = await service.createPatient(createPatientDto);
      
      expect(result).toEqual(newPatient);
      expect(mockPatientRepository.create).toHaveBeenCalledWith(createPatientDto);
    });
  });

  describe('updatePatient', () => {
    it('should update and return the patient when it exists', async () => {
      const updatePatientDto: UpdatePatientDto = {
        status: 'Inactive',
        notes_status: 'Incomplete'
      };
      
      const updatedPatient = { 
        ...mockPatient, 
        status: 'Inactive', 
        notes_status: 'Incomplete' 
      };
      
      mockPatientRepository.update.mockResolvedValue(updatedPatient);
      
      const result = await service.updatePatient(1, updatePatientDto);
      
      expect(result).toEqual(updatedPatient);
      expect(mockPatientRepository.update).toHaveBeenCalledWith(1, updatePatientDto);
    });

    it('should throw NotFoundException when patient to update does not exist', async () => {
      const updatePatientDto: UpdatePatientDto = {
        status: 'Inactive'
      };
      
      mockPatientRepository.update.mockResolvedValue(null);
      
      await expect(service.updatePatient(999, updatePatientDto)).rejects.toThrow(NotFoundException);
      expect(mockPatientRepository.update).toHaveBeenCalledWith(999, updatePatientDto);
    });
  });

  describe('deletePatient', () => {
    it('should delete and return success when patient exists', async () => {
      const deleteResult = { id: 1, deleted: true };
      mockPatientRepository.delete.mockResolvedValue(deleteResult);
      
      const result = await service.deletePatient(1);
      
      expect(result).toEqual(deleteResult);
      expect(mockPatientRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when patient to delete does not exist', async () => {
      mockPatientRepository.delete.mockResolvedValue({ id: 999, deleted: false });
      
      await expect(service.deletePatient(999)).rejects.toThrow(NotFoundException);
      expect(mockPatientRepository.delete).toHaveBeenCalledWith(999);
    });
  });
});
