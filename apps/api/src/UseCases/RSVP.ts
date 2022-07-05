import { pipe } from 'fp-ts/function';
import { taskEither as TE, array as A, either as E } from 'fp-ts';

import { GuestDTO } from '../DTOs/GuestDTO';
import { GuestList } from '../Domain/GuestList';
import { GuestListRepository } from '../Repositories/GuestListRepository';
import { Guest } from '../Domain/Guest';
import { HouseholdNotFound } from '../Domain/problems/HouseholdNotFound';
import { GuestsNotFoundInHousehold } from '../Domain/problems/GuestsNotFoundInHousehold';
import { FailToRSVP } from '../Domain/problems/FailToRSVP';
import { HouseholdDTO } from '../DTOs/HouseholdDTO';
import { Household } from '../Domain/Household';

type Command = {
  householdCode: string;
  guests: GuestDTO[];
};

export class RSVP {
  constructor(readonly guestListRepository: GuestListRepository) {}

  execute(
    command: Command,
  ): TE.TaskEither<
    HouseholdNotFound | GuestsNotFoundInHousehold | FailToRSVP,
    HouseholdDTO
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
      TE.chainFirst((guestList) =>
        pipe(
          guestList,
          this.guestListRepository.save,
          TE.mapLeft(() => new FailToRSVP()),
        ),
      ),
      TE.chain((guestList) =>
        pipe(
          GuestList.findHousehold(guestList, command.householdCode),
          E.map(Household.toDTO),
          TE.fromEither,
        ),
      ),
    );
  }
}
