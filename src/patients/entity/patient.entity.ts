import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  status: string;

  @Column({ type: 'date' })
  date: Date;

  @Column()
  notes_status: string;

  @Column()
  room: string;

  @Column()
  location: string;

  @Column()
  collabrators: string;
}
