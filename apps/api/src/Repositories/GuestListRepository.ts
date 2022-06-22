import { Injectable } from '@nestjs/common';
import { taskEither as TE } from 'fp-ts';

import { GuestList } from '../Domain/GuestList';

@Injectable()
export class GuestListRepository {
  find(): TE.TaskEither<Error, GuestList> {
    return TE.right(new GuestList());
  }

  save(guestList: GuestList): TE.TaskEither<Error, void> {
    return null;
  }
}
