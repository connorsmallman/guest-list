import { taskEither as TE, either as E, option as O } from 'fp-ts';
import { randEmail, randFullName, randUuid } from '@ngneat/falso';

import { GuestListRepository } from '../Repositories/GuestListRepository';
import { generateHouseholdCode, getNextHouseholdId } from '../Domain/GuestList';
import { createGuest, Guest } from '../Domain/Guest';
import { pipe } from 'fp-ts/function';
import { AddGuestToHousehold } from './AddGuestToHousehold';
import { createHousehold, Household } from '../Domain/Household';

describe('add guest to household', () => {
  test('should add guest to household', async () => {
    const findMock = jest.fn();
    const saveMock = jest.fn();
    const GuestRepositoryMock = <jest.Mock<GuestListRepository>>jest.fn(() => ({
      find: findMock,
      save: saveMock,
    }));
    const guestListMock = {
      guests: [],
      households: [],
    };
    findMock.mockReturnValue(TE.of(guestListMock));
    saveMock.mockReturnValue(TE.of(null));

    const guestName = randFullName();
    const guestEmail = randEmail();
    const guestId = randUuid();

    const guest: Guest = pipe(
      createGuest({ name: guestName, email: guestEmail }, guestId),
      E.getOrElse(() => {
        throw new Error('Failed to create guest');
      }),
    );

    const householdId = pipe(
      getNextHouseholdId(guestListMock),
      E.getOrElse(() => {
        throw new Error('Failed to generate houseId');
      }),
    );

    const householdCode = pipe(
      generateHouseholdCode(householdId),
      E.getOrElse(() => {
        throw new Error('Failed to generate household code');
      }),
    );

    const household: Household = pipe(
      createHousehold(householdId, householdCode),
      E.getOrElse(() => {
        throw new Error('Failed to create household');
      }),
    );

    guestListMock.guests.push(guest);
    guestListMock.households.push(household);

    const useCase = new AddGuestToHousehold(new GuestRepositoryMock());

    const response = await useCase.execute({
      guestId: guest.id,
      householdId: household.id,
    })();

    expect(response).toEqual(
      E.right({
        ...household,
        guests: [...household.guests, guest.id],
      }),
    );
  });
});
