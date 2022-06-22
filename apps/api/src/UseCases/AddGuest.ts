import { Injectable } from '@nestjs/common';
import { taskEither as TE, either as E } from 'fp-ts';
import { pipe } from 'fp-ts/function';

import { Guest } from '../Domain/Guest';
import { GuestListRepository } from '../Repositories/GuestListRepository';

type Command = {
  name: string;
  email?: string;
  dietaryRequirements?: string;
  attending?: null | boolean;
  isChild?: boolean;
};

@Injectable()
export class AddGuest {
  private Either: any;
  constructor(readonly guestListRepository: GuestListRepository) {}

  execute(command: Command): TE.TaskEither<Error, Guest> {
    return pipe(
      E.bindTo('guest')(
        Guest.create({
          name: command.name,
          email: command.email,
          dietaryRequirements: command.dietaryRequirements || '',
          attending: command.attending || null,
          isChild: command.isChild || false,
        }),
      ),
      TE.fromEither,
      TE.bind('guestList', this.guestListRepository.find),
      TE.chainFirst(({ guest, guestList }) =>
        pipe(guest, (g) => guestList.addGuest(g), TE.fromEither),
      ),
      TE.chainFirst(({ guestList }) =>
        this.guestListRepository.save(guestList),
      ),
      TE.map(({ guest }) => guest),
      TE.mapLeft((error) => error),
    );
  }
}
