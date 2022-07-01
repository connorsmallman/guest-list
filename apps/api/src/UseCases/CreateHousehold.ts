import { Injectable } from '@nestjs/common';
import { pipe } from 'fp-ts/function';
import { taskEither as TE } from 'fp-ts';

import { GuestListRepository } from '../Repositories/GuestListRepository';
import { Household } from '../Domain/Household';
import { GuestList } from '../Domain/GuestList';
import { FailedToCreateHousehold } from '../Domain/problems/FailedToCreateHousehold';
import { HouseholdDTO } from '../DTOs/HouseholdDTO';

@Injectable()
export class CreateHousehold {
  constructor(readonly guestListRepository: GuestListRepository) {}
  execute(): TE.TaskEither<FailedToCreateHousehold, HouseholdDTO> {
    return pipe(
      TE.Do,
      TE.bind('guestList', this.guestListRepository.find),
      TE.bind('id', ({ guestList }) =>
        pipe(
          GuestList.getNextHouseholdId(guestList),
          TE.fromEither,
          TE.mapLeft(() => new FailedToCreateHousehold()),
        ),
      ),
      TE.bind('code', ({ id }) =>
        pipe(
          GuestList.generateHouseholdCode(id),
          TE.fromEither,
          TE.mapLeft(() => new FailedToCreateHousehold()),
        ),
      ),
      TE.bind('household', ({ id, code }) =>
        pipe(Household.create({ id, code }), TE.fromEither),
      ),
      TE.chain(({ guestList, household }) =>
        pipe(
          GuestList.addHousehold(guestList, household),
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
      TE.map(({ household }) => ({
        id: household.id,
        code: household.code,
        guests: household.guests,
      })),
    );
  }
}
