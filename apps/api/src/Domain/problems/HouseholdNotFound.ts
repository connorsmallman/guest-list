export class HouseholdNotFound extends Error {
  readonly code: string;
  constructor() {
    super();
    this.code = 'GROUP_NOT_FOUND';
  }
}
