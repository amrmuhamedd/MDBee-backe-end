import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Patient } from '../src/patients/entity/patient.entity';
import { PatientsModule } from '../src/patients/patients.module';

describe('Patients API (e2e with mocks)', () => {
  let app: INestApplication;
  

  const testPatients = [
    {
      id: 1,
      name: 'John Doe',
      status: 'Active',
      date: new Date('2025-01-01'),
      notes_status: 'Complete',
      room: 'Room 101',
      location: 'Wing A',
      collabrators: 'Dr. Smith'
    },
    {
      id: 2,
      name: 'Jane Smith',
      status: 'Inactive',
      date: new Date('2025-01-02'),
      notes_status: 'Incomplete',
      room: 'Room 102',
      location: 'Wing B',
      collabrators: 'Dr. Johnson'
    }
  ];


  const mockPatientRepository = {
    find: jest.fn().mockImplementation(options => {
      let results = [...testPatients];
      
    
      if (options?.where) {
        if (options.where.status) {
          results = results.filter(p => p.status === options.where.status);
        }
        
        if (options.where.id && options.where.id.moreThan) {
          results = results.filter(p => p.id > options.where.id.moreThan);
        }
      }
      
      if (options?.take) {
        results = results.slice(0, options.take);
      }
      
      return Promise.resolve(results);
    }),
    findOne: jest.fn().mockImplementation(options => {
      const id = options?.where?.id;
      const patient = testPatients.find(p => p.id === id);
      return Promise.resolve(patient || null);
    }),
    create: jest.fn().mockImplementation(dto => ({ id: 3, ...dto })),
    save: jest.fn().mockImplementation(entity => Promise.resolve(entity)),
    remove: jest.fn().mockImplementation(entity => Promise.resolve(entity)),
  };

  beforeAll(async () => {

    jest.setTimeout(30000);
    
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PatientsModule],
    })
    .overrideProvider(getRepositoryToken(Patient))
    .useValue(mockPatientRepository)
    .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  }, 30000);

  afterAll(async () => {
    await app.close();
  }, 10000);
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('/patients (GET)', () => {
    it('should return all patients with pagination', () => {
      return request(app.getHttpServer())
        .get('/patients')
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('pagination');
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(mockPatientRepository.find).toHaveBeenCalled();
        });
    });

    it('should filter patients by status', () => {
      return request(app.getHttpServer())
        .get('/patients?status=Active')
        .expect(200)
        .expect(res => {
          expect(mockPatientRepository.find).toHaveBeenCalledWith(
            expect.objectContaining({
              where: expect.objectContaining({ status: 'Active' })
            })
          );
        });
    });

    it('should respect the limit parameter', () => {
      return request(app.getHttpServer())
        .get('/patients?limit=1')
        .expect(200)
        .expect(res => {
          expect(mockPatientRepository.find).toHaveBeenCalledWith(
            expect.objectContaining({ take: 2 }) 
          );
        });
    });
  });

  describe('/patients/:id (GET)', () => {
    it('should return a patient when it exists', () => {
      mockPatientRepository.findOne.mockResolvedValueOnce(testPatients[0]);
      
      return request(app.getHttpServer())
        .get('/patients/1')
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('id', 1);
          expect(mockPatientRepository.findOne).toHaveBeenCalledWith({
            where: { id: 1 }
          });
        });
    });

    it('should return 404 when patient does not exist', () => {
      mockPatientRepository.findOne.mockResolvedValueOnce(null);
      
      return request(app.getHttpServer())
        .get('/patients/999')
        .expect(404);
    });
  });

  describe('/patients (POST)', () => {
    it('should create a new patient', () => {
      const newPatient = {
        name: 'New Patient',
        status: 'Active',
        date: '2025-01-03',
        notes_status: 'Pending',
        room: 'Room 103',
        location: 'Wing C',
        collabrators: 'Dr. Davis'
      };
      
      mockPatientRepository.create.mockReturnValueOnce({ id: 3, ...newPatient });
      mockPatientRepository.save.mockResolvedValueOnce({ id: 3, ...newPatient });
      
      return request(app.getHttpServer())
        .post('/patients')
        .send(newPatient)
        .expect(201)
        .expect(res => {
          expect(res.body).toHaveProperty('id');
          expect(mockPatientRepository.create).toHaveBeenCalled();
          expect(mockPatientRepository.save).toHaveBeenCalled();
        });
    });

    it('should validate request data', () => {
      return request(app.getHttpServer())
        .post('/patients')
        .send({ name: 'Invalid Patient' })
        .expect(400);
    });
  });

  describe('/patients/:id (PUT)', () => {
    it('should update a patient when it exists', () => {
      const patientToUpdate = { ...testPatients[0] };
      const updateData = { status: 'Inactive' };
      
      mockPatientRepository.findOne.mockResolvedValueOnce(patientToUpdate);
      mockPatientRepository.save.mockImplementationOnce(data => 
        Promise.resolve({ ...patientToUpdate, ...updateData }));
      
      return request(app.getHttpServer())
        .put('/patients/1')
        .send(updateData)
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('status', 'Inactive');
          expect(mockPatientRepository.findOne).toHaveBeenCalledWith({
            where: { id: 1 }
          });
          expect(mockPatientRepository.save).toHaveBeenCalled();
        });
    });

    it('should return 404 when patient to update does not exist', () => {
      mockPatientRepository.findOne.mockResolvedValueOnce(null);
      
      return request(app.getHttpServer())
        .put('/patients/999')
        .send({ status: 'Inactive' })
        .expect(404);
    });
  });

  describe('/patients/:id (DELETE)', () => {
    it('should delete a patient when it exists', () => {
      mockPatientRepository.findOne.mockResolvedValueOnce(testPatients[0]);
      
      return request(app.getHttpServer())
        .delete('/patients/1')
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('deleted', true);
          expect(mockPatientRepository.findOne).toHaveBeenCalledWith({
            where: { id: 1 }
          });
          expect(mockPatientRepository.remove).toHaveBeenCalled();
        });
    });

    it('should return 404 when patient to delete does not exist', () => {
      mockPatientRepository.findOne.mockResolvedValueOnce(null);
      
      return request(app.getHttpServer())
        .delete('/patients/999')
        .expect(404);
    });
  });
});
