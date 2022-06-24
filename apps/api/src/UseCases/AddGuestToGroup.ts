import { pipe } from 'fp-ts/function';
import { taskEither as TE } from 'fp-ts';
import { Injectable } from '@nestjs/common';
import { GuestListRepository } from '../Repositories/GuestListRepository';
import { Household } from '../Domain/Household';
import { GuestNotFound } from '../Domain/problems/GuestNotFound';
import { HouseholdNotFound } from '../Domain/problems/HouseholdNotFound';

type Command = {
  groupId: number;
  guestId: string;
};

@Injectable()
export class AddGuestToGroup {
  constructor(readonly guestListRepository: GuestListRepository) {}

  execute(
    command: Command,
  ): TE.TaskEither<GuestNotFound | HouseholdNotFound, Household> {
    return pipe(
      this.guestListRepository.find(),
      TE.chain((guestList) =>
        pipe(
          command,
          ({ groupId, guestId }) => guestList.addGuestToGroup(groupId, guestId),
          TE.fromEither,
        ),
      ),
    );
  }
}
