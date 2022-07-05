import { Entity, Column, PrimaryColumn, OneToOne } from 'typeorm';
import { Household } from './Household';

@Entity()
export class Guest {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  dietaryRequirements: string;

  @Column({ nullable: true })
  attending: boolean;

  @Column({ default: false })
  isChild: boolean;

  @OneToOne(() => Household)
  household: Household;
}
