import { pipe } from 'fp-ts/function';
import { taskEither as TE, array as A, either as E, option as O } from 'fp-ts';

import { GuestDTO } from '../DTOs/GuestDTO';
import { GuestList } from '../Domain/GuestList';
import { GuestListRepository } from '../Repositories/GuestListRepository';
import { Guest } from '../Domain/Guest';
import { HouseholdNotFound } from '../Domain/problems/HouseholdNotFound';
import { GuestsNotFoundInHousehold } from '../Domain/problems/GuestsNotFoundInHousehold';
import { GuestListDTO } from '../DTOs/GuestListDTO';

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
    GuestListDTO
  > {
    return pipe(
      TE.Do,
      TE.bind('guestList', this.guestListRepository.find),
      TE.bind('guests', () =>
        pipe(
          command.guests,
          A.traverse(E.Applicative)((g) =>
            Guest.create(
              {
                name: g.name,
                email: g.email,
                dietaryRequirements: g.dietaryRequirements,
                attending: g.attending,
                isChild: g.isChild,
                household: g.household,
              },
              g.id,
            ),
          ),
          TE.fromEither,
        ),
      ),
      TE.chain(({ guestList, guests }) =>
        pipe(
          GuestList.rsvp(guestList, command.householdCode, guests),
          TE.fromEither,
        ),
      ),
      TE.chainFirst(this.guestListRepository.save),
      TE.map(GuestList.toDTO),
    );
  }
}
