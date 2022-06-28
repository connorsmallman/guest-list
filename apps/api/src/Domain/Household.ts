import { either as E } from 'fp-ts';
import { GuestId } from './GuestId';

export type Household = {
  id: number;
  code: string;
  guests: GuestId[];
};

export const createHousehold = (
  id: number,
  code: string,
): E.Either<Error, Household> => {
  return E.right({
    id,
    code,
    guests: [],
  });
};
