import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TestAppModule } from './test-app.module';
import { clearDatabase, seedDatabase } from './utils/db-testing.utils';
import { Patient } from '../src/patients/entity/patient.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('Patients API Integration Tests (e2e)', () => {
  let app: INestApplication;
  let patientRepository: any;
  
  const testPatients = [
    {
      name: 'John Doe',
      status: 'Active',
      date: new Date('2025-01-01'),
      notes_status: 'Complete',
      room: 'Room 101',
      location: 'Wing A',
      collabrators: 'Dr. Smith'
    },
    {
      name: 'Jane Smith',
      status: 'Inactive',
      date: new Date('2025-01-02'),
      notes_status: 'Incomplete',
      room: 'Room 102',
      location: 'Wing B',
      collabrators: 'Dr. Johnson'
    },
    {
      name: 'Bob Brown',
      status: 'Active',
      date: new Date('2025-01-03'),
      notes_status: 'Pending',
      room: 'Room 103',
      location: 'Wing A',
      collabrators: 'Dr. Williams'
    }
  ];

  beforeAll(async () => { 
    if (!process.env.DATABASE_URL) {
      console.warn('Skipping integration tests: No DATABASE_URL provided');
      return;
    }
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    
    patientRepository = moduleFixture.get(getRepositoryToken(Patient));
    
    await clearDatabase(app);
    await seedDatabase(app, testPatients);
  });

  afterAll(async () => {
    await clearDatabase(app);
    await app.close();
  });

  describe('/patients (GET)', () => {
    it('should return all patients with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/patients')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('hasNextPage');
      expect(response.body.pagination).toHaveProperty('nextCursor');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(3);
    });

    it('should return filtered patients when status param is provided', async () => {
      const response = await request(app.getHttpServer())
        .get('/patients?status=Active')
        .expect(200);

      expect(response.body.data.length).toBe(2);
      expect(response.body.data.every(p => p.status === 'Active')).toBe(true);
    });

    it('should handle cursor-based pagination', async () => {
      const allResponse = await request(app.getHttpServer()).get('/patients');
      const firstPatientId = allResponse.body.data[0].id;
      
      const response = await request(app.getHttpServer())
        .get(`/patients?cursor=${firstPatientId}`)
        .expect(200);

      expect(response.body.data.every(p => p.id > firstPatientId)).toBe(true);
    });

    it('should respect the limit parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/patients?limit=1')
        .expect(200);

      expect(response.body.data.length).toBe(1);
      expect(response.body.pagination.hasNextPage).toBe(true);
    });
  });

  describe('/patients/:id (GET)', () => {
    it('should return a patient when it exists', async () => {
      const allResponse = await request(app.getHttpServer()).get('/patients');
      const patientId = allResponse.body.data[0].id;
      
      const response = await request(app.getHttpServer())
        .get(`/patients/${patientId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', patientId);
      expect(response.body).toHaveProperty('name');
    });

    it('should return 404 when patient does not exist', async () => {
      await request(app.getHttpServer())
        .get('/patients/999999')
        .expect(404);
    });
  });

  describe('/patients (POST)', () => {
    it('should create a new patient and return it', async () => {
      const newPatient = {
        name: 'Alice Green',
        status: 'Active',
        date: '2025-01-04T00:00:00.000Z',
        notes_status: 'Complete',
        room: 'Room 104',
        location: 'Wing C',
        collabrators: 'Dr. Davis'
      };
      
      const response = await request(app.getHttpServer())
        .post('/patients')
        .send(newPatient)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', newPatient.name);
      
      const savedPatient = await patientRepository.findOne({ where: { id: response.body.id } });
      expect(savedPatient).toBeDefined();
      expect(savedPatient.name).toBe(newPatient.name);
    });

    it('should validate the request body', async () => {
      const invalidPatient = {
        name: 'Invalid Patient'
      };
      
      await request(app.getHttpServer())
        .post('/patients')
        .send(invalidPatient)
        .expect(400);
    });
  });

  describe('/patients/:id (PUT)', () => {
    it('should update a patient when it exists', async () => {
      const allResponse = await request(app.getHttpServer()).get('/patients');
      const patientId = allResponse.body.data[0].id;
      
      const updateData = {
        status: 'Inactive',
        notes_status: 'Updated'
      };
      
      const response = await request(app.getHttpServer())
        .put(`/patients/${patientId}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('id', patientId);
      expect(response.body).toHaveProperty('status', 'Inactive');
      expect(response.body).toHaveProperty('notes_status', 'Updated');
      
      const updatedPatient = await patientRepository.findOne({ where: { id: patientId } });
      expect(updatedPatient.status).toBe('Inactive');
      expect(updatedPatient.notes_status).toBe('Updated');
    });

    it('should return 404 when patient to update does not exist', async () => {
      await request(app.getHttpServer())
        .put('/patients/999999')
        .send({ status: 'Inactive' })
        .expect(404);
    });
  });

  describe('/patients/:id (DELETE)', () => {
    it('should delete a patient when it exists', async () => {
        const newPatientResponse = await request(app.getHttpServer())
        .post('/patients')
        .send({
          name: 'To Be Deleted',
          status: 'Active',
          date: '2025-01-05T00:00:00.000Z',
          notes_status: 'Complete',
          room: 'Room 105',
          location: 'Wing D',
          collabrators: 'Dr. Brown'
        });
      
      const patientId = newPatientResponse.body.id;
      
      const response = await request(app.getHttpServer())
        .delete(`/patients/${patientId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', patientId);
      expect(response.body).toHaveProperty('deleted', true);
      
      const deletedPatient = await patientRepository.findOne({ where: { id: patientId } });
      expect(deletedPatient).toBeNull();
    });

    it('should return 404 when patient to delete does not exist', async () => {
      await request(app.getHttpServer())
        .delete('/patients/999999')
        .expect(404);
    });
  });
});
