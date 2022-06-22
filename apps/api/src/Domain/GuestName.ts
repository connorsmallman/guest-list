export class GuestName {
  static minLength: 2;

  constructor(readonly value: string) {}

  static create(name: string) {
    if (name.length > GuestName.minLength) {
      throw new Error();
    }
    return new GuestName(name);
  }
}
