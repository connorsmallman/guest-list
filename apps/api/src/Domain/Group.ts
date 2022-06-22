import { Guest } from './Guest';

type GroupProps = {
  code: string;
  guests: Guest[];
  allowedNumberOfChildren: number;
  allowedNumberOfAdults: number;
};

export class Group {
  constructor(readonly props: GroupProps, readonly id?: number) {
    this.props = props;
    this.id = id;
  }

  get allowedNumberOfChildren() {
    return this.props.allowedNumberOfChildren;
  }

  get allowedNumberOfAdults() {
    return this.props.allowedNumberOfAdults;
  }

  get code() {
    return this.props.code;
  }

  hasGuest(guest: Guest) {
    return this.props.guests.some((g) => g.equals(guest));
  }

  updateGuest(guest: Guest) {
    this.props.guests = this.props.guests.map((g) => {
      if (g.equals(guest)) {
        return guest;
      }
      return g;
    });
  }

  addGuest(guest: Guest) {
    const isAlreadyInGroup = this.props.guests.find((g) => g.equals(guest));

    if (isAlreadyInGroup) {
      throw new Error();
    }

    this.props.guests.push(guest);
  }

  equals(group: Group) {
    return this.id === group.id;
  }

  static create(props: GroupProps, id?: number) {
    return new Group(props, id);
  }
}
