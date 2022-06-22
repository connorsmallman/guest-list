import { GuestList } from '../Domain/GuestList';

type Command = {
  groupId: number;
  guestId: string;
};

class AddGuestToGroup {
  execute(command: Command) {
    const guestList = GuestList.create();

    guestList.addGuestToGroup(command.groupId, command.guestId);
  }
}
