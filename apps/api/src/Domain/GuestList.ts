import * as base62 from 'base62';

import { Group } from './Group';
import { Guest } from './Guest';

type GroupDTO = {
  allowedNumberOfChildren: number;
  allowedNumberOfAdults: number;
};

export class GuestList {
  groups: Group[] = [];
  guests: Guest[] = [];

  createGroup(dto: GroupDTO) {
    const nextId = this.groups.length + 1;
    const props = {
      allowedNumberOfChildren: dto.allowedNumberOfChildren,
      allowedNumberOfAdults: dto.allowedNumberOfAdults,
      guests: [],
      code: base62.encode(nextId + 1000),
    };
    const group = Group.create(props, nextId);
    this.groups.push(group);
  }

  addGuest(guest: Guest) {
    const isExisting = this.guests.find((g) => g.equals(guest));
    if (isExisting) {
      throw new Error();
    }
    this.guests.push(guest);
  }

  addGuestToGroup(groupId: number, guestId: string) {
    const guest = this.guests.find((g) => g.id === guestId);

    if (guest) {
      throw new Error();
    }

    this.groups = this.groups.map((g) => {
      if (g.id === groupId) {
        g.addGuest(guest);
      }
      return g;
    });
  }

  rsvp(groupId: number, updatedGuests: Guest[]) {
    const group = this.groups.find((g) => g.id === groupId);

    const guestIsInGroup = updatedGuests.some((g) => group.hasGuest(g));

    if (!guestIsInGroup) {
      throw new Error();
    }

    if (group.allowedNumberOfChildren) {
      const children = updatedGuests.filter((g) => g.isChild);
      if (children.length > group.allowedNumberOfChildren) {
        throw new Error();
      }
    }
    if (group.allowedNumberOfAdults) {
      const adults = updatedGuests.filter((g) => !g.isChild);
      if (adults.length > group.allowedNumberOfAdults) {
        throw new Error();
      }
    }
    for (const guest of updatedGuests) {
      group.updateGuest(guest);
    }
  }

  static create() {
    return new GuestList();
  }
}
