import { pipe } from 'fp-ts/function';
import { taskEither as TE, array as A, either as E } from 'fp-ts';

import { GuestDTO } from '../DTOs/GuestDTO';
import { GuestList, rsvp } from '../Domain/GuestList';
import { GuestListRepository } from '../Repositories/GuestListRepository';
import { createGuest } from '../Domain/Guest';
import { HouseholdNotFound } from '../Domain/problems/HouseholdNotFound';
import { GuestsNotFoundInHousehold } from '../Domain/problems/GuestsNotFoundInHousehold';

type Command = {
  householdCode: string;
  guests: GuestDTO[];
};

export class RSVP {
  constructor(readonly guestListRepository: GuestListRepository) {}

  execute(
    command: Command,
  ): TE.TaskEither<
    HouseholdNotFound | GuestsNotFoundInHousehold | Error,
    GuestList
  > {
    return pipe(
      TE.Do,
      TE.bind('guestList', this.guestListRepository.find),
      TE.bind('guests', () =>
        pipe(
          command.guests,
          A.traverse(E.Applicative)((g) =>
            createGuest(
              {
                name: g.name,
                email: g.email,
                dietaryRequirements: g.dietaryRequirements,
                attending: g.attending,
                isChild: g.isChild,
                householdId: g.householdId,
              },
              g.id,
            ),
          ),
          TE.fromEither,
        ),
      ),
      TE.chain(({ guestList, guests }) =>
        pipe(rsvp(guestList, command.householdCode, guests), TE.fromEither),
      ),
      TE.chainFirst(this.guestListRepository.save),
    );
  }
}
