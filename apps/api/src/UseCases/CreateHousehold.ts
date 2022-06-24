import { Injectable } from '@nestjs/common';
import { pipe } from 'fp-ts/function';
import { taskEither as TE, either as E } from 'fp-ts';

import { GuestListRepository } from '../Repositories/GuestListRepository';
import { createHousehold, Household } from '../Domain/Household';
import {
  addHousehold,
  generateHouseholdCode,
  getNextHouseholdId,
} from '../Domain/GuestList';

type Command = {
  allowedNumberOfAdults: number;
  allowedNumberOfChildren: number;
};

@Injectable()
export class CreateHousehold {
  constructor(readonly guestListRepository: GuestListRepository) {}
  execute(command: Command): TE.TaskEither<Error, Household> {
    return pipe(
      TE.Do,
      TE.bind('guestList', this.guestListRepository.find),
      TE.bind('id', ({ guestList }) =>
        pipe(() => getNextHouseholdId(guestList), TE.fromEitherK)(),
      ),
      TE.bind('code', ({ id, guestList }) =>
        pipe(generateHouseholdCode(id), TE.fromEither),
      ),
      TE.bind('household', ({ id, code }) =>
        pipe(
          createHousehold(
            id,
            command.allowedNumberOfChildren,
            command.allowedNumberOfAdults,
            code,
          ),
          TE.fromEither,
        ),
      ),
      TE.chainFirst(({ guestList, household }) =>
        pipe(addHousehold(guestList, household), TE.fromEither),
      ),
      TE.map(({ household }) => household),
    );
  }
}
