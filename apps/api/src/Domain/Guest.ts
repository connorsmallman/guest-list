import { v4 as uuidV4 } from 'uuid';
import { either as E } from 'fp-ts';
import { struct } from 'fp-ts/Eq';
import { Eq as eqString } from 'fp-ts/string';
import { Eq as eqBoolean } from 'fp-ts/boolean';
import { option as O } from 'fp-ts';

import { HouseholdId } from './HouseholdId';
import { eqHousehold, Household } from './Household';

export const eqGuest = struct({
  id: eqString,
  name: eqString,
  email: eqString,
  dietaryRequirements: O.getEq(eqString),
  attending: O.getEq(eqBoolean),
  isChild: eqBoolean,
  household: eqHousehold,
});

export interface Guest {
  id: string;
  name: string;
  email: string;
  dietaryRequirements: O.Option<string>;
  attending: O.Option<boolean>;
  isChild: boolean;
  household: O.Option<HouseholdId>;
}

type CreateGuestProps = {
  name: string;
  email: string;
  dietaryRequirements?: string;
  attending?: null | boolean;
  isChild?: null | boolean;
  householdId?: null | HouseholdId;
};

export const createGuest = (
  {
    name,
    email,
    dietaryRequirements = '',
    attending = null,
    isChild = false,
    householdId = null,
  }: CreateGuestProps,
  id?: string,
): E.Either<Error, Guest> => {
  return E.right({
    id: id || uuidV4(),
    name,
    email,
    dietaryRequirements: O.fromNullable(dietaryRequirements),
    attending: O.fromNullable(attending),
    isChild,
    household: O.fromNullable(householdId),
  });
};
