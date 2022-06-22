export class GuestEmail {
  constructor(readonly value: string) {}

  static create(email: string) {
    return new GuestEmail(email);
  }
}
