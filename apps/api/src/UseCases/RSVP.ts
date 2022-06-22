import { Guest } from '../Domain/Guest';
import { GuestDTO } from '../DTOs/GuestDTO';
import { GuestList } from '../Domain/GuestList';

type Command = {
  groupId: number;
  guests: GuestDTO[];
};

export class RSVP {
  execute(command: Command) {
    const guests = command.guests.map((dto) => Guest.create(dto));
    const guestList = GuestList.create();

    guestList.rsvp(command.groupId, guests);
  }
}
