import { either as E } from 'fp-ts';

import { Guest } from './Guest';

export type Household = {
  id: number;
  code: string;
  guests: Guest[];
  allowedNumberOfChildren: number;
  allowedNumberOfAdults: number;
};

export const hasGuest = (household: Household, guest: Guest): boolean =>
  household.guests.some((g) => g.id === guest.id);

export const updateGuest = (guest: Guest, household: Household): Household => {
  household.guests.map((g) => {
    if (g.id === guest.id) {
      return guest;
    }
    return g;
  });
  return household;
};

export const addGuest = (household: Household, guest: Guest) => {
  const isAlreadyInGroup = household.guests.find((g) => g.id === guest.id);

  if (isAlreadyInGroup) {
    throw new Error();
  }

  return {
    ...household,
    guests: [...household.guests, guest],
  };
};

export const createHousehold = (
  id: number,
  allowedNumberOfChildren: number,
  allowedNumberOfAdults: number,
  code: string,
): E.Either<Error, Household> => {
  return E.right({
    id,
    guests: [],
    allowedNumberOfAdults,
    allowedNumberOfChildren,
    code,
  });
};
