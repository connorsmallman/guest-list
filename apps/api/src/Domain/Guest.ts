import { v4 as uuidV4 } from 'uuid';
import { either as E } from 'fp-ts';

export interface Guest {
  id: string;
  name: string;
  email: string;
  dietaryRequirements: string;
  attending: null | boolean;
  isChild: boolean;
}

export const createGuest = (
  name: string,
  email: string,
  dietaryRequirements: string,
  attending: null | boolean = null,
  isChild = false,
): E.Either<Error, Guest> =>
  E.right({
    id: uuidV4(),
    name,
    email,
    dietaryRequirements,
    attending,
    isChild,
  });
