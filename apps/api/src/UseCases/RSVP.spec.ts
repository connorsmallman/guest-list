import { pipe } from 'fp-ts/function';
import { randEmail, randFood, randFullName, randUuid } from '@ngneat/falso';
import { either as E, taskEither as TE, option as O } from 'fp-ts';

import { GuestListRepository } from '../Repositories/GuestListRepository';
import { Guest } from '../Domain/Guest';
import { RSVP } from './RSVP';
import { Household } from '../Domain/Household';
import { GuestList } from '../Domain/GuestList';
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
    const guestListMock = GuestList.create({});
    const householdId: number = pipe(
      GuestList.getNextHouseholdId(guestListMock),
      E.getOrElse(() => {
        throw new Error('Failed to get next household id');
      }),
    );
    const householdCode: string = pipe(
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
    const guestName1 = randFullName();
    const guestEmail1 = randEmail();
    const guestId1 = randUuid();
    const guest1: Guest = pipe(
      Guest.create(
        { name: guestName1, email: guestEmail1, household: household.id },
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
      Guest.create(
        { name: guestName2, email: guestEmail2, household: household.id },
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
          household: household.id,
        },
        {
          id: guestId2,
          name: guestName2,
          email: guestEmail2,
          dietaryRequirements: dietaryRequirements,
          attending: isAttending,
          isChild: isChild,
          household: household.id,
        },
      ],
    })();

    expect(findMock).toHaveBeenCalled();
    expect(saveMock).toHaveBeenCalledWith({
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
    });
    expect(response).toEqual(E.right(Household.toDTO(household)));
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
    const guestListMock = GuestList.create({});
    const householdId: number = pipe(
      GuestList.getNextHouseholdId(guestListMock),
      E.getOrElse(() => {
        throw new Error('Failed to get next household id');
      }),
    );
    const householdCode: string = pipe(
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
    const guestName = randFullName();
    const guestEmail = randEmail();
    const guestId = randUuid();
    const guest: GuestDTO = {
      name: guestName,
      email: guestEmail,
      id: guestId,
      dietaryRequirements: '',
      attending: true,
      isChild: true,
      household: 1,
    };

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
