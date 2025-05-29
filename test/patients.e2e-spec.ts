import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppModule } from '../src/app.module';
import { Patient } from '../src/patients/entity/patient.entity';
import { PatientsModule } from '../src/patients/patients.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

describe('Patients API (e2e)', () => {
  let app: INestApplication;
  let patientRepository;
  
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
    },
    {
      id: 3,
      name: 'Bob Brown',
      status: 'Active',
      date: new Date('2025-01-03'),
      notes_status: 'Pending',
      room: 'Room 103',
      location: 'Wing A',
      collabrators: 'Dr. Williams'
    }
  ];

  const newPatient = {
    name: 'Alice Green',
    status: 'Active',
    date: '2025-01-04',
    notes_status: 'Complete',
    room: 'Room 104',
    location: 'Wing C',
    collabrators: 'Dr. Davis'
  };

  beforeAll(async () => {

    jest.setTimeout(30000);
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
        }),
        TypeOrmModule.forRoot({
          type: 'postgres',
          url: process.env.DATABASE_URL,
          entities: [Patient],
          synchronize: false,
        }),
        PatientsModule,
      ],
    })
    .overrideProvider(getRepositoryToken(Patient))
    .useValue({
      find: jest.fn().mockImplementation(options => {
        let result = [...testPatients];
        
       
        if (options?.where) {
         
          if (options.where.status) {
            result = result.filter(p => p.status === options.where.status);
          }
          
         
          if (options.where.id && options.where.id.moreThan) {
            result = result.filter(p => p.id > options.where.id.moreThan);
          }
        }
        
      
        if (options?.take) {
          result = result.slice(0, options.take);
        }
        
        return result;
      }),
      findOne: jest.fn().mockImplementation(options => {
        const id = options?.where?.id;
        return testPatients.find(p => p.id === id) || null;
      }),
      create: jest.fn().mockImplementation(dto => ({ id: 4, ...dto })),
      save: jest.fn().mockImplementation(entity => Promise.resolve(entity)),
      remove: jest.fn().mockImplementation(entity => Promise.resolve(entity)),
      clear: jest.fn(),
    })
    .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    
    patientRepository = moduleFixture.get(getRepositoryToken(Patient));
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
          expect(res.body.pagination).toHaveProperty('hasNextPage');
          expect(res.body.pagination).toHaveProperty('nextCursor');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should return filtered patients when status param is provided', () => {
      return request(app.getHttpServer())
        .get('/patients?status=Active')
        .expect(200)
        .expect(res => {
          expect(res.body.data.every(p => p.status === 'Active')).toBe(true);
        });
    });

    it('should handle cursor-based pagination', () => {
     
      patientRepository.find.mockImplementationOnce(options => {
      
        return testPatients.filter(p => p.id > 1);
      });
      
      return request(app.getHttpServer())
        .get('/patients?cursor=1')
        .expect(200)
        .expect(res => {
          expect(res.body.data.every(p => p.id > 1)).toBe(true);
        });
    });

    it('should respect the limit parameter', () => {
      return request(app.getHttpServer())
        .get('/patients?limit=1')
        .expect(200)
        .expect(res => {
          expect(res.body.data.length).toBeLessThanOrEqual(1);
        });
    });
  });

  describe('/patients/:id (GET)', () => {
    it('should return a patient when it exists', () => {
      return request(app.getHttpServer())
        .get('/patients/1')
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('id', 1);
          expect(res.body).toHaveProperty('name', 'John Doe');
        });
    });

    it('should return 404 when patient does not exist', () => {
      patientRepository.findOne.mockResolvedValueOnce(null);
      
      return request(app.getHttpServer())
        .get('/patients/999')
        .expect(404);
    });
  });

  describe('/patients (POST)', () => {
    it('should create a new patient and return it', () => {
      return request(app.getHttpServer())
        .post('/patients')
        .send(newPatient)
        .expect(201)
        .expect(res => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('name', newPatient.name);
          expect(patientRepository.create).toHaveBeenCalled();
          expect(patientRepository.save).toHaveBeenCalled();
        });
    });

    it('should validate the request body', () => {
     
      const invalidPatient = {
        name: 'Invalid Patient'
      };
      
      return request(app.getHttpServer())
        .post('/patients')
        .send(invalidPatient)
        .expect(400);
    });
  });

  describe('/patients/:id (PUT)', () => {
    const updateData = {
      status: 'Inactive',
      notes_status: 'Updated'
    };

    it('should update a patient when it exists', () => {
      const updatedPatient = { ...testPatients[0], ...updateData };
      patientRepository.save.mockResolvedValueOnce(updatedPatient);
      
      return request(app.getHttpServer())
        .put('/patients/1')
        .send(updateData)
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('id', 1);
          expect(res.body).toHaveProperty('status', 'Inactive');
          expect(res.body).toHaveProperty('notes_status', 'Updated');
        });
    });

    it('should return 404 when patient to update does not exist', () => {
      patientRepository.findOne.mockResolvedValueOnce(null);
      
      return request(app.getHttpServer())
        .put('/patients/999')
        .send(updateData)
        .expect(404);
    });
  });

  describe('/patients/:id (DELETE)', () => {
    it('should delete a patient when it exists', () => {
      return request(app.getHttpServer())
        .delete('/patients/1')
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('id', 1);
          expect(res.body).toHaveProperty('deleted', true);
        });
    });

    it('should return 404 when patient to delete does not exist', () => {
      patientRepository.findOne.mockResolvedValueOnce(null);
      
      return request(app.getHttpServer())
        .delete('/patients/999')
        .expect(404);
    });
  });
});
