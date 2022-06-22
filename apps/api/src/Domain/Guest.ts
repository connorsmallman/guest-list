import { v4 as uuidv4 } from 'uuid';
import { either as E } from 'fp-ts';

import { GuestName } from './GuestName';
import { GuestEmail } from './GuestEmail';
import { GuestDTO } from '../DTOs/GuestDTO';
import { GuestWithThatNameAlreadyExists } from './problems/GuestWithThatNameAlreadyExists';

type GuestProps = {
  name: GuestName;
  email: GuestEmail;
  dietaryRequirements: string;
  attending: null | boolean;
  isChild: boolean;
};

export class Guest {
  constructor(readonly props: GuestProps, readonly id?: string) {
    this.id = id || uuidv4();
    this.props = props;
  }

  get name(): string {
    return this.props.name.value;
  }

  get email(): string {
    return this.props.email.value;
  }

  get isChild(): boolean {
    return this.props.isChild;
  }

  get dietaryRequirements(): string {
    return this.props.dietaryRequirements;
  }

  get attending() {
    return this.props.attending;
  }

  equals(guest: Guest) {
    return guest.name === this.name;
  }

  static create(
    dto: GuestDTO,
  ): E.Either<GuestWithThatNameAlreadyExists, Guest> {
    const name = GuestName.create(dto.name);
    const email = GuestEmail.create(dto.email);

    return E.right(
      new Guest(
        {
          name,
          email,
          dietaryRequirements: dto.dietaryRequirements,
          attending: dto.attending,
          isChild: dto.isChild,
        },
        dto.id,
      ),
    );
  }
}
