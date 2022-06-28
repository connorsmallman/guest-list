import { pipe } from 'fp-ts/function';
import { randEmail, randFood, randFullName, randUuid } from '@ngneat/falso';
import { either as E, taskEither as TE, option as O } from 'fp-ts';

import { GuestListRepository } from '../Repositories/GuestListRepository';
import { createGuest, Guest } from '../Domain/Guest';
import { RSVP } from './RSVP';
import { createHousehold, Household } from '../Domain/Household';
import { generateHouseholdCode, getNextHouseholdId } from '../Domain/GuestList';
import { HouseholdNotFound } from '../Domain/problems/HouseholdNotFound';
import { GuestDTO } from '../DTOs/GuestDTO';

describe('RSVP', () => {
  test('it should update the guests', async () => {
    const findMock = jest.fn();
    const saveMock = jest.fn();
    const GuestListRepositoryMock = <jest.Mock<GuestListRepository>>jest.fn(
      () => ({
        find: findMock,
        save: saveMock,
      }),
    );
    const guestListMock = {
      guests: [],
      households: [],
    };
    const householdId: number = pipe(
      getNextHouseholdId(guestListMock),
      E.getOrElse(() => {
        throw new Error('Failed to get next household id');
      }),
    );
    const householdCode: string = pipe(
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
    const guestName1 = randFullName();
    const guestEmail1 = randEmail();
    const guestId1 = randUuid();
    const guest1: Guest = pipe(
      createGuest(
        { name: guestName1, email: guestEmail1, householdId: household.id },
        guestId1,
      ),
      E.getOrElse(() => {
        throw new Error('Failed to create guest');
      }),
    );

    const guestName2 = randFullName();
    const guestEmail2 = randEmail();
    const guestId2 = randUuid();
    const guest2: Guest = pipe(
      createGuest(
        { name: guestName2, email: guestEmail2, householdId: household.id },
        guestId2,
      ),
      E.getOrElse(() => {
        throw new Error('Failed to create guest');
      }),
    );

    guestListMock.guests.push(guest1);
    guestListMock.guests.push(guest2);
    household.guests = [guestId1, guestId2];
    guestListMock.households.push(household);

    findMock.mockReturnValue(TE.of(guestListMock));
    saveMock.mockReturnValue(TE.of(null));

    const dietaryRequirements = randFood();
    const isAttending = true;
    const isChild = true;

    const useCase = new RSVP(new GuestListRepositoryMock());

    const response = await useCase.execute({
      householdCode,
      guests: [
        {
          id: guestId1,
          name: guestName1,
          email: guestEmail1,
          dietaryRequirements: dietaryRequirements,
          attending: isAttending,
          isChild: isChild,
          householdId: household.id,
        },
        {
          id: guestId2,
          name: guestName2,
          email: guestEmail2,
          dietaryRequirements: dietaryRequirements,
          attending: isAttending,
          isChild: isChild,
          householdId: household.id,
        },
      ],
    })();

    expect(findMock).toHaveBeenCalled();
    expect(saveMock).toHaveBeenCalled();
    expect(response).toEqual(
      E.right({
        guests: [
          {
            ...guest1,
            dietaryRequirements: O.some(dietaryRequirements),
            attending: O.some(isAttending),
            isChild: isChild,
          },
          {
            ...guest2,
            dietaryRequirements: O.some(dietaryRequirements),
            attending: O.some(isAttending),
            isChild: isChild,
          },
        ],
        households: [household],
      }),
    );
  });

  test('should fail if household not found', async () => {
    const findMock = jest.fn();
    const saveMock = jest.fn();
    const GuestListRepositoryMock = <jest.Mock<GuestListRepository>>jest.fn(
      () => ({
        find: findMock,
        save: saveMock,
      }),
    );
    const guestListMock = {
      guests: [],
      households: [],
    };
    const householdId: number = pipe(
      getNextHouseholdId(guestListMock),
      E.getOrElse(() => {
        throw new Error('Failed to get next household id');
      }),
    );
    const householdCode: string = pipe(
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
    const guestName = randFullName();
    const guestEmail = randEmail();
    const guestId = randUuid();
    const guest: GuestDTO = pipe(
      createGuest({ name: guestName, email: guestEmail }, guestId),
      E.getOrElse(() => {
        throw new Error('Failed to create guest');
      }),
    );

    guestListMock.households.push(household);
    findMock.mockReturnValue(TE.of(guestListMock));
    saveMock.mockReturnValue(TE.of(null));

    const useCase = new RSVP(new GuestListRepositoryMock());

    const response = await useCase.execute({
      householdCode: 'some-wrong-code',
      guests: [guest],
    })();

    expect(response).toEqual(E.left(new HouseholdNotFound()));
  });
});
