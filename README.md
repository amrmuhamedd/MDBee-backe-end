# Patients Management API

<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
</p>

## Description

A RESTful API for patient management built using NestJS, featuring cursor-based pagination and a clean repository pattern architecture. This API allows for efficient management of patient records with robust filtering and pagination capabilities.

## Technologies Used

- **Framework**: [NestJS](https://nestjs.com/) (v11) - A progressive Node.js framework
- **Language**: TypeScript
- **Database**: PostgreSQL with TypeORM
- **Testing**: Jest (Unit tests & E2E tests)
- **Documentation**: Swagger/OpenAPI
- **Validation**: class-validator and class-transformer
- **Data Generation**: Faker.js

## Key Features

- **Complete CRUD Operations**: Create, read, update, and delete patients
- **Cursor-Based Pagination**: Efficient data retrieval for large datasets
- **Repository Pattern**: Clean separation of data access logic
- **Comprehensive Testing**: Unit tests and E2E tests for all components
- **Data Seeding**: Easy database population with fake data
- **API Documentation**: Auto-generated using Swagger

## Project Setup

### Prerequisites

- Node.js (v16+)
- Yarn package manager
- PostgreSQL database

### Installation

```bash
# Install dependencies
$ yarn install

# Configure environment variables
$ cp .env.example .env
# Edit .env file with your database credentials
```

### Database Setup

Ensure PostgreSQL is running and the database specified in your `.env` file exists. The application will automatically create the necessary tables on startup if `synchronize: true` is set in the TypeORM configuration.

### Seeding the Database

To populate the database with sample patient data:

```bash
# Seed the database with 200 fake patient records (default)
$ yarn seed

# Seed with a specific number of records
$ yarn seed 500

# Clear all patient data
$ yarn seed:clear

# Clear and reseed the database
$ yarn seed:refresh
```

## Running the Application

```bash
# Development mode
$ yarn dev

# Production mode
$ yarn build
$ yarn start:prod
```

Once the application is running, you can access:

- API endpoints at http://localhost:3000/patients
- Swagger documentation at http://localhost:3000/api

## Running Tests

```bash
# Unit tests
$ yarn test

# E2E tests (mock-based)
$ yarn test:e2e

# All E2E tests (including integration tests that require a database)
$ yarn test:e2e:all

# Test coverage
$ yarn test:cov
```

## API Endpoints

### Patients

- `GET /patients` - List all patients with cursor-based pagination
  - Query parameters:
    - `cursor`: ID of the last item in the previous page
    - `limit`: Number of items per page (default: 10)
    - `status`: Filter patients by status

- `GET /patients/:id` - Get a specific patient by ID

- `POST /patients` - Create a new patient

- `PUT /patients/:id` - Update an existing patient

- `DELETE /patients/:id` - Delete a patient

## Architecture

The application follows a clean architecture approach with the following components:

- **Entity**: Defines the database schema for patients
- **DTO**: Data Transfer Objects for input validation and response formatting
- **Repository**: Interface and implementation for data access using TypeORM
- **Service**: Business logic layer
- **Controller**: HTTP request handling and route definitions
- **Module**: NestJS module for dependency injection and component organization

## Cursor-Based Pagination

This project implements cursor-based pagination (also known as keyset pagination) which offers several advantages over traditional offset-based pagination:

- Consistent performance regardless of dataset size
- No issues with concurrent inserts/deletes
- Prevents duplicates or skipped items when data changes between requests

The pagination response includes:

```json
{
  "data": [...],
  "pagination": {
    "hasNextPage": true,
    "nextCursor": "42"
  }
}
```
