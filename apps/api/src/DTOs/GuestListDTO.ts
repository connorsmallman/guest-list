import { HouseholdDTO } from './HouseholdDTO';
import { GuestDTO } from './GuestDTO';

export type GuestListDTO = {
  households: HouseholdDTO[];
  guests: GuestDTO[];
};
