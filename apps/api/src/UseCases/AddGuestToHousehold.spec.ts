import { taskEither as TE, either as E, option as O } from 'fp-ts';
import { randEmail, randFullName, randUuid } from '@ngneat/falso';

import { GuestListRepository } from '../Repositories/GuestListRepository';
import { GuestList } from '../Domain/GuestList';
import { Guest } from '../Domain/Guest';
import { pipe } from 'fp-ts/function';
import { AddGuestToHousehold } from './AddGuestToHousehold';
import { Household } from '../Domain/Household';
import { GuestNotFound } from '../Domain/problems/GuestNotFound';
import { HouseholdNotFound } from '../Domain/problems/HouseholdNotFound';
import { FailedToAddGuestToHousehold } from '../Domain/problems/FailedToAddGuestToHousehold';

describe('add guest to household', () => {
  test('should add guest to household', async () => {
    const findMock = jest.fn();
    const saveMock = jest.fn();
    const GuestRepositoryMock = <jest.Mock<GuestListRepository>>jest.fn(() => ({
      find: findMock,
      save: saveMock,
    }));
    const guestListMock = GuestList.create({});
    findMock.mockReturnValue(TE.of(guestListMock));
    saveMock.mockReturnValue(TE.of(null));

    const guestName = randFullName();
    const guestEmail = randEmail();
    const guestId = randUuid();

    const guest: Guest = pipe(
      Guest.create({ name: guestName, email: guestEmail }, guestId),
      E.getOrElse(() => {
        throw new Error('Failed to create guest');
      }),
    );

    const householdId = pipe(
      GuestList.getNextHouseholdId(guestListMock),
      E.getOrElse(() => {
        throw new Error('Failed to generate houseId');
      }),
    );

    const householdCode = pipe(
      GuestList.generateHouseholdCode(householdId),
      E.getOrElse(() => {
        throw new Error('Failed to generate household code');
      }),
    );

    const household: Household = pipe(
      Household.create({ id: householdId, code: householdCode }),
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

  test('should fail if guest not found', async () => {
    const findMock = jest.fn();
    const saveMock = jest.fn();
    const GuestRepositoryMock = <jest.Mock<GuestListRepository>>jest.fn(() => ({
      find: findMock,
      save: saveMock,
    }));
    const guestListMock = GuestList.create({});
    findMock.mockReturnValue(TE.of(guestListMock));
    saveMock.mockReturnValue(TE.of(null));

    const guestId = randUuid();

    const useCase = new AddGuestToHousehold(new GuestRepositoryMock());

    const response = await useCase.execute({
      guestId,
      householdId: 1,
    })();

    expect(response).toEqual(E.left(new GuestNotFound()));
  });

  test('should fail if household not found', async () => {
    const findMock = jest.fn();
    const saveMock = jest.fn();
    const GuestRepositoryMock = <jest.Mock<GuestListRepository>>jest.fn(() => ({
      find: findMock,
      save: saveMock,
    }));
    const guestListMock = GuestList.create({});
    findMock.mockReturnValue(TE.of(guestListMock));
    saveMock.mockReturnValue(TE.of(null));

    const guestName = randFullName();
    const guestEmail = randEmail();
    const guestId = randUuid();

    const guest: Guest = pipe(
      Guest.create({ name: guestName, email: guestEmail }, guestId),
      E.getOrElse(() => {
        throw new Error('Failed to create guest');
      }),
    );

    const householdId = pipe(
      GuestList.getNextHouseholdId(guestListMock),
      E.getOrElse(() => {
        throw new Error('Failed to generate houseId');
      }),
    );

    const householdCode = pipe(
      GuestList.generateHouseholdCode(householdId),
      E.getOrElse(() => {
        throw new Error('Failed to generate household code');
      }),
    );

    const household: Household = pipe(
      Household.create({ id: householdId, code: householdCode }),
      E.getOrElse(() => {
        throw new Error('Failed to create household');
      }),
    );

    guestListMock.guests.push(guest);
    guestListMock.households.push(household);

    const householdId2 = pipe(
      GuestList.getNextHouseholdId(guestListMock),
      E.getOrElse(() => {
        throw new Error('Failed to generate houseId');
      }),
    );

    const useCase = new AddGuestToHousehold(new GuestRepositoryMock());

    const response = await useCase.execute({
      guestId: guest.id,
      householdId: householdId2,
    })();

    expect(response).toEqual(E.left(new HouseholdNotFound()));
  });

  test('should fail if save fails', async () => {
    const findMock = jest.fn();
    const saveMock = jest.fn();
    const GuestRepositoryMock = <jest.Mock<GuestListRepository>>jest.fn(() => ({
      find: findMock,
      save: saveMock,
    }));
    const guestListMock = GuestList.create({});
    findMock.mockReturnValue(TE.of(guestListMock));
    saveMock.mockReturnValue(TE.left(new Error('Failed to save')));

    const guestName = randFullName();
    const guestEmail = randEmail();
    const guestId = randUuid();

    const guest: Guest = pipe(
      Guest.create({ name: guestName, email: guestEmail }, guestId),
      E.getOrElse(() => {
        throw new Error('Failed to create guest');
      }),
    );

    const householdId = pipe(
      GuestList.getNextHouseholdId(guestListMock),
      E.getOrElse(() => {
        throw new Error('Failed to generate houseId');
      }),
    );

    const householdCode = pipe(
      GuestList.generateHouseholdCode(householdId),
      E.getOrElse(() => {
        throw new Error('Failed to generate household code');
      }),
    );

    const household: Household = pipe(
      Household.create({ id: householdId, code: householdCode }),
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

    expect(response).toEqual(E.left(new FailedToAddGuestToHousehold()));
  });
});
