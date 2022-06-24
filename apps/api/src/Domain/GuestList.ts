import * as base62 from 'base62';
import { either as E } from 'fp-ts';

import { addGuest, hasGuest, Household } from './Household';
import { Guest } from './Guest';
import { GuestWithThatNameAlreadyExists } from './problems/GuestWithThatNameAlreadyExists';
import { GuestNotFound } from './problems/GuestNotFound';
import { HouseholdNotFound } from './problems/HouseholdNotFound';

export type GuestList = {
  households: Household[];
  guests: Guest[];
};

export const getNextHouseholdId = (
  guestList: GuestList,
): E.Either<Error, number> => E.right(guestList.households.length + 1);

export const generateHouseholdCode = (
  householdId: number,
): E.Either<Error, string> => E.right(base62.encode(householdId + 1000));

export const addHousehold = (
  guestList: GuestList,
  household: Household,
): E.Either<Error, GuestList> => {
  guestList.households.push(household);
  return E.right(guestList);
};

export const addGuestToList = (
  guestList: GuestList,
  guest: Guest,
): E.Either<GuestWithThatNameAlreadyExists, GuestList> => {
  const isExisting = guestList.guests.find((g) => g.name === guest.name);

  if (isExisting) {
    return E.left(new GuestWithThatNameAlreadyExists());
  }

  guestList.guests.push(guest);

  return E.right(guestList);
};

export const addGuestToHousehold = (
  guestList: GuestList,
  householdId: number,
  guestId: string,
): E.Either<GuestNotFound | HouseholdNotFound, GuestList> => {
  const guest = guestList.guests.find((g) => g.id === guestId);

  if (!guest) {
    return E.left(new GuestNotFound());
  }

  const household = guestList.households.find((h) => h.id === householdId);

  if (!household) {
    return E.left(new HouseholdNotFound());
  }

  return E.right({
    ...guestList,
    households: guestList.households.map((h) => {
      return addGuest(h, guest);
    }),
  });
};

export const rsvp = (
  guestList: GuestList,
  householdId: number,
  updatedGuests: Guest[],
) => {
  const household = guestList.households.find((g) => g.id === householdId);

  const guestIsInHousehold = updatedGuests.some((g) => hasGuest(household, g));

  if (!guestIsInHousehold) {
    throw new Error();
  }

  if (household.allowedNumberOfChildren) {
    const children = updatedGuests.filter((g) => g.isChild);
    if (children.length > household.allowedNumberOfChildren) {
      throw new Error();
    }
  }
  if (household.allowedNumberOfAdults) {
    const adults = updatedGuests.filter((g) => !g.isChild);
    if (adults.length > household.allowedNumberOfAdults) {
      throw new Error();
    }
  }

  return {
    ...guestList,
    households: guestList.households.map((h) => {
      if (h.id === householdId) {
        return {
          ...h,
          guests: h.guests.map((g) => {
            const guestUpdates = updatedGuests.find((ug) => ug.id === g.id);
            if (guestUpdates) {
              return {
                ...g,
                guestUpdates,
              };
            }
            return g;
          }),
        };
      }
    }),
  };
};
