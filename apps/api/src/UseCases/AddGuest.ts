import { Injectable } from '@nestjs/common';
import { taskEither as TE, either as E } from 'fp-ts';
import { pipe } from 'fp-ts/function';

import { createGuest, Guest } from '../Domain/Guest';
import { GuestListRepository } from '../Repositories/GuestListRepository';
import { addGuestToList } from '../Domain/GuestList';

type Command = {
  name: string;
  email?: string;
  dietaryRequirements?: string;
  attending?: null | boolean;
  isChild?: boolean;
};

@Injectable()
export class AddGuest {
  constructor(readonly guestListRepository: GuestListRepository) {}

  execute(command: Command): TE.TaskEither<Error, Guest> {
    return pipe(
      E.bindTo('guest')(
        createGuest(
          command.name,
          command.email,
          command.dietaryRequirements || '',
        ),
      ),
      TE.fromEither,
      TE.bind('guestList', this.guestListRepository.find),
      TE.chainFirst(({ guest, guestList }) =>
        pipe(addGuestToList(guestList, guest), TE.fromEither),
      ),
      TE.chainFirst(({ guestList }) =>
        this.guestListRepository.save(guestList),
      ),
      TE.map(({ guest }) => guest),
      TE.mapLeft((error) => error),
    );
  }
}
