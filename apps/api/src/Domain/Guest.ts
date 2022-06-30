import { v4 as uuidV4 } from 'uuid';
import * as t from 'io-ts';
import { either as E, option as O } from 'fp-ts';
import { formatValidationErrors } from 'io-ts-reporters';

import { HouseholdId } from './HouseholdId';
import { FailedToCreateGuest } from './problems/FailedtoCreateGuest';
import { pipe } from 'fp-ts/function';
import { GuestNameC } from './GuestName';
import { GuestId, GuestIdC } from './GuestId';
import { Logger } from '@nestjs/common';

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
  attending?: boolean;
  isChild?: boolean;
  householdId?: number;
};

const GuestC = t.type({
  id: GuestIdC,
  name: GuestNameC,
  email: t.string,
  dietaryRequirements: t.union([t.string, t.null]),
  attending: t.union([t.boolean, t.null]),
  isChild: t.union([t.boolean, t.null]),
  householdId: t.union([t.number, t.null]),
});

export const createGuest = (
  {
    name,
    email,
    dietaryRequirements = null,
    attending = null,
    isChild = false,
    householdId = null,
  }: CreateGuestProps,
  id?: GuestId,
): E.Either<FailedToCreateGuest, Guest> => {
  return pipe(
    GuestC.decode({
      name,
      email,
      dietaryRequirements,
      attending,
      isChild,
      householdId,
      id: id || uuidV4(),
    }),
    E.mapLeft(formatValidationErrors),
    E.fold(
      (errors) => {
        Logger.error(errors);
        return E.left(
          new FailedToCreateGuest(
            `Failed to create guest: ${JSON.stringify(errors)}`,
          ),
        );
      },
      (value) =>
        E.right({
          id: value.id,
          name: value.name,
          email: value.email,
          dietaryRequirements: O.fromNullable(value.dietaryRequirements),
          attending: O.fromNullable(value.attending),
          isChild: value.isChild,
          household: O.fromNullable(value.householdId),
        }),
    ),
  );
};
