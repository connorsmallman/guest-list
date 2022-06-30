import { Injectable } from '@nestjs/common';
import { taskEither as TE, option as O } from 'fp-ts';
import { pipe } from 'fp-ts/function';

import { Guest } from '../Domain/Guest';
import { GuestListRepository } from '../Repositories/GuestListRepository';
import { addGuestToList } from '../Domain/GuestList';
import { GuestWithThatNameAlreadyExists } from '../Domain/problems/GuestWithThatNameAlreadyExists';
import { FailedToAddGuest } from '../Domain/problems/FailedToAddGuest';
import { FailedToCreateGuest } from '../Domain/problems/FailedtoCreateGuest';
import { GuestDTO } from '../DTOs/GuestDTO';

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
  ): TE.TaskEither<
    FailedToAddGuest | FailedToCreateGuest | GuestWithThatNameAlreadyExists,
    GuestDTO
  > {
    return pipe(
      TE.Do,
      TE.bind('guest', () =>
        pipe(
          Guest.create(
            { name: command.name, email: command.email },
            command.id,
          ),
          TE.fromEither,
          TE.mapLeft(() => new FailedToAddGuest()),
        ),
      ),
      TE.bind('guestList', this.guestListRepository.find),
      TE.chain(({ guest, guestList }) =>
        pipe(
          addGuestToList(guestList, guest),
          TE.fromEither,
          TE.map((guestList) => ({ guest, guestList })),
          TE.mapLeft(() => new FailedToAddGuest()),
        ),
      ),
      TE.chainFirst(({ guestList }) =>
        pipe(
          this.guestListRepository.save(guestList),
          TE.mapLeft(() => new FailedToAddGuest()),
        ),
      ),
      TE.map(({ guest }) => Guest.toDTO(guest)),
    );
  }
}
