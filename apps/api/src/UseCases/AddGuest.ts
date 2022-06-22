import { Guest } from '../Domain/Guest';
import { Injectable } from '@nestjs/common';
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
  constructor(readonly guestListRepository: GuestListRepository) {}

  async execute(command: Command) {
    const guest = Guest.create({
      name: command.name,
      email: command.email,
      dietaryRequirements: command.dietaryRequirements || '',
      attending: command.attending || null,
      isChild: command.isChild || false,
    });

    const guestList = await this.guestListRepository.find();

    guestList.addGuest(guest);

    this.guestListRepository.save(guestList);
  }
}
