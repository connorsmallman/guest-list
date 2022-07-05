import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Guest } from './Guest';

@Entity()
export class Household {
  @PrimaryColumn()
  id: number;

  @Column()
  code: string;

  @OneToMany(() => Guest, (guest) => guest.household)
  guests: Guest[];
}
