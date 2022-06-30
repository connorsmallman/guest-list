import * as t from 'io-ts';
import { either as E } from 'fp-ts';
import { pipe } from 'fp-ts/function';

import { GuestId } from './GuestId';
import { FailedToCreateHousehold } from './problems/FailedToCreateHousehold';
import { HouseholdCodeC } from './HouseholdCode';

export type Household = {
  id: number;
  code: string;
  guests: GuestId[];
};

type HouseholdProps = {
  id: number;
  code: string;
};

const HouseholdC = t.type({
  id: t.number,
  code: HouseholdCodeC,
});

export const createHousehold = (
  props: HouseholdProps,
): E.Either<FailedToCreateHousehold, Household> => {
  return pipe(
    HouseholdC.decode(props),
    E.fold(
      () => E.left(new FailedToCreateHousehold()),
      (value) => E.right({ id: value.id, code: value.code, guests: [] }),
    ),
  );
};
