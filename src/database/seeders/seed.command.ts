import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { SeederModule } from './seeder.module';
import { SeederService } from './seeder.service';

async function bootstrap() {
  const logger = new Logger('Seeder');
  logger.log('Starting seeder...');
  
  try {
    const app = await NestFactory.createApplicationContext(SeederModule);
    
    const command = process.argv[2];
    const count = process.argv[3] ? parseInt(process.argv[3], 10) : 200;
    
    logger.log(`Running command: ${command} with count: ${count}`);
    
    const seederService = app.get(SeederService);
    
    try {
      switch (command) {
        case 'seed':
          await seederService.seedPatients(count);
          break;
        case 'clear':
          await seederService.clearAll();
          break;
        case 'refresh':
          await seederService.clearAll();
          await seederService.seedPatients(count);
          break;
        default:
          logger.error('Command not recognized. Available commands: seed, clear, refresh');
      }
      
      logger.log('Seeding completed successfully!');
    } catch (error) {
      logger.error(`Error during seeding: ${error.message}`);
      logger.error(error.stack);
    } finally {
      await app.close();
    }
  } catch (error) {
    logger.error(`Failed to initialize application: ${error.message}`);
    logger.error(error.stack);
  }
  
  process.exit(0);
}

bootstrap();
