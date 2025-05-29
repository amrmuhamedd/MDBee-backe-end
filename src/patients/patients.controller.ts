import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PatientsService } from './patients.service';
import { FilterPatientDto } from './dtos/filter.dto';
import { CreatePatientDto } from './dtos/create-patient.dto';
import { UpdatePatientDto } from './dtos/update-patient.dto';
import { Patient } from './entity/patient.entity';


@ApiTags('patients')
@Controller('/patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all patients with cursor-based pagination and optional filtering' })
  @ApiResponse({ status: 200, description: 'Returns patients data with pagination info' })
  getAllPatients(@Query() filterData: FilterPatientDto) {
    return this.patientsService.getAllPatients(filterData);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a patient by ID' })
  @ApiParam({ name: 'id', description: 'Patient ID' })
  @ApiResponse({ status: 200, description: 'Returns a single patient' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  getPatientById(@Param('id', ParseIntPipe) id: number) {
    return this.patientsService.getPatientById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new patient' })
  @ApiResponse({ status: 201, description: 'Patient created successfully', type: Patient })
  createPatient(@Body() createPatientDto: CreatePatientDto) {
    return this.patientsService.createPatient(createPatientDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a patient' })
  @ApiParam({ name: 'id', description: 'Patient ID' })
  @ApiResponse({ status: 200, description: 'Patient updated successfully' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  updatePatient(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePatientDto: UpdatePatientDto,
  ) {
    return this.patientsService.updatePatient(id, updatePatientDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a patient' })
  @ApiParam({ name: 'id', description: 'Patient ID' })
  @ApiResponse({ status: 200, description: 'Patient deleted successfully' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  deletePatient(@Param('id', ParseIntPipe) id: number) {
    return this.patientsService.deletePatient(id);
  }
}
