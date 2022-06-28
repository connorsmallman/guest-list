import { Injectable } from '@nestjs/common';
import { pipe } from 'fp-ts/function';
import { taskEither as TE, either as E, array as A } from 'fp-ts';

import { GuestListRepository } from '../Repositories/GuestListRepository';
import { createHousehold, Household } from '../Domain/Household';
import {
  addHousehold,
  generateHouseholdCode,
  getNextHouseholdId,
} from '../Domain/GuestList';

@Injectable()
export class CreateHousehold {
  constructor(readonly guestListRepository: GuestListRepository) {}
  execute(): TE.TaskEither<Error, Household> {
    return pipe(
      TE.Do,
      TE.bind('guestList', this.guestListRepository.find),
      TE.bind('id', ({ guestList }) =>
        pipe(getNextHouseholdId(guestList), TE.fromEither),
      ),
      TE.bind('code', ({ id }) =>
        pipe(generateHouseholdCode(id), TE.fromEither),
      ),
      TE.bind('household', ({ id, code }) =>
        pipe(createHousehold(id, code), TE.fromEither),
      ),
      TE.chain(({ guestList, household }) =>
        pipe(
          addHousehold(guestList, household),
          TE.fromEither,
          TE.map((updatedGuestList) => ({
            guestList: updatedGuestList,
            household,
          })),
        ),
      ),
      TE.chainFirst(({ guestList }) =>
        this.guestListRepository.save(guestList),
      ),
      TE.map(({ household }) => household),
    );
  }
}
