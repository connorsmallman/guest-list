import { Injectable, Logger } from '@nestjs/common';
import { pipe } from 'fp-ts/function';
import { taskEither as TE, io as IO } from 'fp-ts';

import { GuestListRepository } from '../Repositories/GuestListRepository';
import { createHousehold, Household } from '../Domain/Household';
import {
  addHousehold,
  generateHouseholdCode,
  getNextHouseholdId,
} from '../Domain/GuestList';
import { FailedToCreateHousehold } from '../Domain/problems/FailedToCreateHousehold';

@Injectable()
export class CreateHousehold {
  constructor(readonly guestListRepository: GuestListRepository) {}
  execute(): TE.TaskEither<FailedToCreateHousehold, Household> {
    return pipe(
      TE.Do,
      TE.bind('guestList', this.guestListRepository.find),
      TE.bind('id', ({ guestList }) =>
        pipe(
          getNextHouseholdId(guestList),
          TE.fromEither,
          TE.mapLeft(() => new FailedToCreateHousehold()),
        ),
      ),
      TE.bind('code', ({ id }) =>
        pipe(
          generateHouseholdCode(id),
          TE.fromEither,
          TE.mapLeft(() => new FailedToCreateHousehold()),
        ),
      ),
      TE.bind('household', ({ id, code }) =>
        pipe(createHousehold({ id, code }), TE.fromEither),
      ),
      TE.chain(({ guestList, household }) =>
        pipe(
          addHousehold(guestList, household),
          TE.fromEither,
          TE.map((updatedGuestList) => ({
            guestList: updatedGuestList,
            household,
          })),
          TE.mapLeft(() => new FailedToCreateHousehold()),
        ),
      ),
      TE.chainFirst(({ guestList }) =>
        pipe(
          this.guestListRepository.save(guestList),
          TE.mapLeft(() => new FailedToCreateHousehold()),
        ),
      ),
      TE.map(({ household }) => household),
    );
  }
}
