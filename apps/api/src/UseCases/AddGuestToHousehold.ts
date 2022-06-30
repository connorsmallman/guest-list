import { pipe } from 'fp-ts/function';
import { taskEither as TE, array as A, either as E } from 'fp-ts';
import { Injectable } from '@nestjs/common';
import { GuestListRepository } from '../Repositories/GuestListRepository';
import { GuestNotFound } from '../Domain/problems/GuestNotFound';
import { HouseholdNotFound } from '../Domain/problems/HouseholdNotFound';
import { addGuestToHousehold } from '../Domain/GuestList';
import { FailedToAddGuestToHousehold } from '../Domain/problems/FailedToAddGuestToHousehold';
import { HouseholdDTO } from '../DTOs/HouseholdDTO';
import { Household } from '../Domain/Household';

type Command = {
  householdId: number;
  guestId: string;
};

@Injectable()
export class AddGuestToHousehold {
  constructor(readonly guestListRepository: GuestListRepository) {}

  execute(
    command: Command,
  ): TE.TaskEither<
    GuestNotFound | HouseholdNotFound | FailedToAddGuestToHousehold,
    HouseholdDTO
  > {
    return pipe(
      this.guestListRepository.find(),
      TE.chain((guestList) =>
        pipe(
          command,
          ({ householdId, guestId }) =>
            addGuestToHousehold(guestList, householdId, guestId),
          TE.fromEither,
        ),
      ),
      TE.chainFirst((guestList) =>
        pipe(
          this.guestListRepository.save(guestList),
          TE.mapLeft(() => new FailedToAddGuestToHousehold()),
        ),
      ),
      TE.chain((guestList) =>
        pipe(
          guestList.households,
          A.findFirst((h) => h.id === command.householdId),
          E.fromOption(() => new HouseholdNotFound()),
          TE.fromEither,
        ),
      ),
      TE.map(Household.toDTO),
    );
  }
}
