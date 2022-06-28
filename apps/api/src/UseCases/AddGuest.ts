import { Injectable } from '@nestjs/common';
import { taskEither as TE, either as E } from 'fp-ts';
import { pipe } from 'fp-ts/function';

import { createGuest, Guest } from '../Domain/Guest';
import { GuestListRepository } from '../Repositories/GuestListRepository';
import { addGuestToList } from '../Domain/GuestList';
import { GuestWithThatNameAlreadyExists } from '../Domain/problems/GuestWithThatNameAlreadyExists';

type Command = {
  id?: string;
  name: string;
  email?: string;
  dietaryRequirements?: string;
  attending?: null | boolean;
  isChild?: boolean;
};

@Injectable()
export class AddGuest {
  constructor(readonly guestListRepository: GuestListRepository) {}

  execute(
    command: Command,
  ): TE.TaskEither<Error | GuestWithThatNameAlreadyExists, Guest> {
    return pipe(
      TE.Do,
      TE.bind('guest', () =>
        pipe(
          createGuest({ name: command.name, email: command.email }, command.id),
          TE.fromEither,
        ),
      ),
      TE.bind('guestList', this.guestListRepository.find),
      TE.chain(({ guest, guestList }) =>
        pipe(
          addGuestToList(guestList, guest),
          TE.fromEither,
          TE.map((guestList) => ({ guest, guestList })),
        ),
      ),
      TE.chainFirst(({ guestList }) =>
        this.guestListRepository.save(guestList),
      ),
      TE.map(({ guest }) => guest),
    );
  }
}
