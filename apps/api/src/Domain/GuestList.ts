import Base62str from 'base62str';
import {
  either as E,
  option as O,
  array as A,
  boolean as B,
  semigroup as SG,
} from 'fp-ts';
import { Eq as eqString } from 'fp-ts/string';
import { getEq } from 'fp-ts/Array';
import { identity, increment, pipe } from 'fp-ts/function';

import { Household } from './Household';
import { Guest } from './Guest';
import { GuestNotFound } from './problems/GuestNotFound';
import { HouseholdNotFound } from './problems/HouseholdNotFound';
import { HouseholdCode } from './HouseholdCode';
import { GuestId } from './GuestId';
import { GuestWithThatNameAlreadyExists } from './problems/GuestWithThatNameAlreadyExists';
import { HouseholdAlreadyExists } from './problems/HouseholdAlreadyExists';
import { GuestsNotFoundInHousehold } from './problems/GuestsNotFoundInHousehold';
import { HouseholdId } from './HouseholdId';
import { FailedToGetNextHouseholdId } from './problems/FailedToGetNextHouseholdId';
import { FailedToGenerateHouseholdCode } from './problems/FailedToGenerateHouseholdCode';
import { GuestListDTO } from '../DTOs/GuestListDTO';

const base62 = Base62str.createInstance();

type GuestListProps = {
  households?: Household[];
  guests?: Guest[];
};

export class GuestList {
  households: Household[];
  guests: Guest[];

  public static create(props: GuestListProps) {
    return {
      guests: props.guests || [],
      households: props.households || [],
    };
  }

  public static toDTO(guestList: GuestList): GuestListDTO {
    return {
      households: guestList.households.map(Household.toDTO),
      guests: guestList.guests.map(Guest.toDTO),
    };
  }
}

export const getNextHouseholdId = (
  guestList: GuestList,
): E.Either<FailedToGetNextHouseholdId, number> =>
  E.right(pipe(guestList.households, A.size, increment));

export const generateHouseholdCode = (
  householdId: number,
): E.Either<FailedToGenerateHouseholdCode, string> =>
  E.right(base62.encodeStr((1000 + householdId).toString()));

export const addHousehold = (
  guestList: GuestList,
  household: Household,
): E.Either<HouseholdAlreadyExists, GuestList> => {
  return pipe(
    guestList.households,
    A.findIndex((h: Household) => h.id === household.id),
    E.fromOption(() => household),
    E.swap,
    E.mapLeft(() => new HouseholdAlreadyExists()),
    E.map((h) => pipe(guestList.households, A.append(h))),
    E.map((updatedHouseholds) => ({
      ...guestList,
      households: updatedHouseholds,
    })),
  );
};

export const addGuestToList = (
  guestList: GuestList,
  guest: Guest,
): E.Either<GuestWithThatNameAlreadyExists, GuestList> => {
  return pipe(
    guestList.guests,
    A.exists((g: Guest) => g.name === guest.name),
    O.fromPredicate((s) => {
      return !s;
    }),
    E.fromOption(() => {
      return new GuestWithThatNameAlreadyExists();
    }),
    E.map(() => pipe(guestList.guests, A.append(guest))),
    E.map((updatedGuests) => ({
      ...guestList,
      guests: updatedGuests,
    })),
  );
};

export const addGuestToHousehold = (
  guestList: GuestList,
  householdId: number,
  guestId: GuestId,
): E.Either<GuestNotFound | HouseholdNotFound, GuestList> => {
  return pipe(
    E.Do,
    // Bind guestList to guestList
    E.bind('guestList', () => E.of(guestList)),
    // Bind guest or return GuestNotFound Error
    E.bind('guest', () =>
      pipe(
        guestList.guests,
        A.findFirst((g: Guest) => g.id === guestId),
        E.fromOption(() => new GuestNotFound()),
      ),
    ),
    // Bind household or return HouseholdNotFound Error
    E.bind('household', () =>
      pipe(
        guestList.households,
        A.findFirst((h: Household) => h.id === householdId),
        E.fromOption(() => new HouseholdNotFound()),
      ),
    ),
    // Return guestList with updated households and guests
    E.map(({ guestList, guest, household }) => {
      const updatedGuest = {
        ...guest,
        household: O.of(household.id),
      };
      const updatedHousehold = {
        ...household,
        guests: pipe(household.guests, A.append(updatedGuest.id)),
      };

      return {
        ...guestList,
        households: pipe(
          guestList.households,
          A.findIndex((h) => h.id === household.id),
          O.map((i) =>
            pipe(guestList.households, A.updateAt(i, updatedHousehold)),
          ),
          O.flatten,
          O.fold(() => guestList.households, identity),
        ),
        guests: pipe(
          guestList.guests,
          A.findIndex((g) => g.id === guest.id),
          O.map((i) => pipe(guestList.guests, A.updateAt(i, updatedGuest))),
          O.flatten,
          O.fold(() => guestList.guests, identity),
        ),
      };
    }),
  );
};

export const rsvp = (
  guestList: GuestList,
  householdCode: HouseholdCode,
  guests: Guest[],
): E.Either<HouseholdNotFound | GuestsNotFoundInHousehold, GuestList> => {
  const Eq = getEq(eqString);
  return pipe(
    guestList.households,
    // Find household or return error
    A.findFirst((h) => h.code === householdCode),
    E.fromOption(() => new HouseholdNotFound()),
    // Check guests are in the household
    E.chainFirst((household) =>
      pipe(
        Eq.equals(
          household.guests,
          guests.map((g) => g.id),
        ),
        B.fold(
          () => E.left(new GuestsNotFoundInHousehold()),
          () => E.right(household),
        ),
      ),
    ),
    E.map(() => {
      const semigroupGuest: SG.Semigroup<Guest> = SG.struct({
        id: SG.first<string>(),
        name: SG.last<string>(),
        email: SG.last<string>(),
        dietaryRequirements: O.getMonoid<string>(SG.last()),
        attending: O.getMonoid<boolean>(SG.last()),
        isChild: SG.last<boolean>(),
        household: O.getMonoid<HouseholdId>(SG.last()),
      });
      return {
        ...guestList,
        guests: pipe(
          guestList.guests,
          A.map((guest) =>
            pipe(
              guests,
              A.findFirst((update) => update.id === guest.id),
              O.fold(
                () => guest,
                (update) => semigroupGuest.concat(guest, update),
              ),
            ),
          ),
        ),
      };
    }),
  );
};
