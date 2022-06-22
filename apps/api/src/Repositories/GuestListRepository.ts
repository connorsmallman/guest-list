import { Injectable } from '@nestjs/common';
import { GuestList } from '../Domain/GuestList';

@Injectable()
export class GuestListRepository {
  find(): GuestList {
    return new GuestList();
  }

  save(guestList: GuestList): void {}
}
