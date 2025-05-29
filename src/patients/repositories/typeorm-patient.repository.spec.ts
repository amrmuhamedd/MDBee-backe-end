import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { TypeOrmPatientRepository } from './typeorm-patient.repository';
import { Patient } from '../entity/patient.entity';
import { FilterPatientDto } from '../dtos/filter.dto';
import { CreatePatientDto } from '../dtos/create-patient.dto';
import { UpdatePatientDto } from '../dtos/update-patient.dto';

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

describe('TypeOrmPatientRepository', () => {
  let repository: TypeOrmPatientRepository;
  let typeOrmRepository: Repository<Patient>;

  const mockTypeOrmRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeOrmPatientRepository,
        {
          provide: getRepositoryToken(Patient),
          useValue: mockTypeOrmRepository,
        },
      ],
    }).compile();

    repository = module.get<TypeOrmPatientRepository>(TypeOrmPatientRepository);
    typeOrmRepository = module.get<Repository<Patient>>(getRepositoryToken(Patient));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAll', () => {
    it('should return patients with pagination info with default limit', async () => {
      const filterDto = new FilterPatientDto();
      const patients = [mockPatient];
      
      mockTypeOrmRepository.find.mockResolvedValue(patients);
      
      const result = await repository.findAll(filterDto);
      
      expect(result).toEqual({
        data: patients,
        pagination: {
          hasNextPage: false,
          nextCursor: '1'
        }
      });
      
      expect(mockTypeOrmRepository.find).toHaveBeenCalledWith({
        where: {},
        take: 11,
      });
    });

    it('should apply cursor-based pagination when cursor is provided', async () => {
      const filterDto = new FilterPatientDto();
      filterDto.cursor = '5';
      filterDto.limit = 20;
      
      const patients = [mockPatient];
      mockTypeOrmRepository.find.mockResolvedValue(patients);
      
      await repository.findAll(filterDto);
      
      expect(mockTypeOrmRepository.find).toHaveBeenCalledWith({
        where: { id: MoreThan(5) },
        take: 21,
      });
    });

    it('should apply status filter when provided', async () => {
      const filterDto = new FilterPatientDto();
      filterDto.status = 'Active';
      
      const patients = [mockPatient];
      mockTypeOrmRepository.find.mockResolvedValue(patients);
      
      await repository.findAll(filterDto);
      
      expect(mockTypeOrmRepository.find).toHaveBeenCalledWith({
        where: { status: 'Active' },
        take: 11,
      });
    });

    it('should handle hasNextPage correctly when more results exist', async () => {
      const filterDto = new FilterPatientDto();
      filterDto.limit = 2;
      
      const patients = [
        { ...mockPatient, id: 1 },
        { ...mockPatient, id: 2 },
        { ...mockPatient, id: 3 }
      ];
      
      mockTypeOrmRepository.find.mockResolvedValue(patients);
      
      const result = await repository.findAll(filterDto);
      

      expect(result.data.length).toEqual(2);
      expect(result.pagination.hasNextPage).toBe(true);
      expect(result.pagination.nextCursor).toEqual('2');
    });
  });

  describe('findById', () => {
    it('should return a patient when it exists', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(mockPatient);
      
      const result = await repository.findById(1);
      
      expect(result).toEqual(mockPatient);
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should return null when patient does not exist', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(null);
      
      const result = await repository.findById(999);
      
      expect(result).toBeNull();
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({ where: { id: 999 } });
    });
  });

  describe('create', () => {
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
      
      mockTypeOrmRepository.create.mockReturnValue(newPatient);
      mockTypeOrmRepository.save.mockResolvedValue(newPatient);
      
      const result = await repository.create(createPatientDto);
      
      expect(result).toEqual(newPatient);
      expect(mockTypeOrmRepository.create).toHaveBeenCalledWith(createPatientDto);
      expect(mockTypeOrmRepository.save).toHaveBeenCalledWith(newPatient);
    });
  });

  describe('update', () => {
    it('should update and return the patient when it exists', async () => {
      const updatePatientDto: UpdatePatientDto = {
        status: 'Inactive',
        notes_status: 'Incomplete'
      };
      
      const patient = { ...mockPatient };
      const updatedPatient = { 
        ...mockPatient, 
        status: 'Inactive', 
        notes_status: 'Incomplete' 
      };
      
      mockTypeOrmRepository.findOne.mockResolvedValue(patient);
      mockTypeOrmRepository.save.mockResolvedValue(updatedPatient);
      
      const result = await repository.update(1, updatePatientDto);
      
      expect(result).toEqual(updatedPatient);
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockTypeOrmRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        status: 'Inactive',
        notes_status: 'Incomplete'
      }));
    });

    it('should return null when patient to update does not exist', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(null);
      
      const result = await repository.update(999, { status: 'Inactive' });
      
      expect(result).toBeNull();
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({ where: { id: 999 } });
      expect(mockTypeOrmRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete and return success when patient exists', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(mockPatient);
      mockTypeOrmRepository.remove.mockResolvedValue(mockPatient);
      
      const result = await repository.delete(1);
      
      expect(result).toEqual({ id: 1, deleted: true });
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockTypeOrmRepository.remove).toHaveBeenCalledWith(mockPatient);
    });

    it('should return failure when patient to delete does not exist', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(null);
      
      const result = await repository.delete(999);
      
      expect(result).toEqual({ id: 999, deleted: false });
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({ where: { id: 999 } });
      expect(mockTypeOrmRepository.remove).not.toHaveBeenCalled();
    });
  });
});
