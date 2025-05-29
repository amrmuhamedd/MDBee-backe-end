import { Test, TestingModule } from '@nestjs/testing';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { FilterPatientDto } from './dtos/filter.dto';
import { CreatePatientDto } from './dtos/create-patient.dto';
import { UpdatePatientDto } from './dtos/update-patient.dto';
import { NotFoundException } from '@nestjs/common';

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

describe('PatientsController', () => {
  let controller: PatientsController;
  let service: PatientsService;

  const mockPatientsService = {
    getAllPatients: jest.fn(),
    getPatientById: jest.fn(),
    createPatient: jest.fn(),
    updatePatient: jest.fn(),
    deletePatient: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PatientsController],
      providers: [
        {
          provide: PatientsService,
          useValue: mockPatientsService,
        },
      ],
    }).compile();

    controller = module.get<PatientsController>(PatientsController);
    service = module.get<PatientsService>(PatientsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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
      
      mockPatientsService.getAllPatients.mockResolvedValue(expectedResult);
      
      const result = await controller.getAllPatients(filterDto);
      
      expect(result).toEqual(expectedResult);
      expect(mockPatientsService.getAllPatients).toHaveBeenCalledWith(filterDto);
    });
  });

  describe('getPatientById', () => {
    it('should return a patient when it exists', async () => {
      mockPatientsService.getPatientById.mockResolvedValue(mockPatient);
      
      const result = await controller.getPatientById(1);
      
      expect(result).toEqual(mockPatient);
      expect(mockPatientsService.getPatientById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when patient does not exist', async () => {
      mockPatientsService.getPatientById.mockRejectedValue(new NotFoundException());
      
      await expect(controller.getPatientById(999)).rejects.toThrow(NotFoundException);
      expect(mockPatientsService.getPatientById).toHaveBeenCalledWith(999);
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
      mockPatientsService.createPatient.mockResolvedValue(newPatient);
      
      const result = await controller.createPatient(createPatientDto);
      
      expect(result).toEqual(newPatient);
      expect(mockPatientsService.createPatient).toHaveBeenCalledWith(createPatientDto);
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
      
      mockPatientsService.updatePatient.mockResolvedValue(updatedPatient);
      
      const result = await controller.updatePatient(1, updatePatientDto);
      
      expect(result).toEqual(updatedPatient);
      expect(mockPatientsService.updatePatient).toHaveBeenCalledWith(1, updatePatientDto);
    });

    it('should throw NotFoundException when patient to update does not exist', async () => {
      const updatePatientDto: UpdatePatientDto = {
        status: 'Inactive'
      };
      
      mockPatientsService.updatePatient.mockRejectedValue(new NotFoundException());
      
      await expect(controller.updatePatient(999, updatePatientDto)).rejects.toThrow(NotFoundException);
      expect(mockPatientsService.updatePatient).toHaveBeenCalledWith(999, updatePatientDto);
    });
  });

  describe('deletePatient', () => {
    it('should delete and return success when patient exists', async () => {
      const deleteResult = { id: 1, deleted: true };
      mockPatientsService.deletePatient.mockResolvedValue(deleteResult);
      
      const result = await controller.deletePatient(1);
      
      expect(result).toEqual(deleteResult);
      expect(mockPatientsService.deletePatient).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when patient to delete does not exist', async () => {
      mockPatientsService.deletePatient.mockRejectedValue(new NotFoundException());
      
      await expect(controller.deletePatient(999)).rejects.toThrow(NotFoundException);
      expect(mockPatientsService.deletePatient).toHaveBeenCalledWith(999);
    });
  });
});
