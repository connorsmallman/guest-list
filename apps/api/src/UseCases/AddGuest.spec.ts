import { randEmail, randFullName, randUuid } from '@ngneat/falso';
import { taskEither as TE, either as E, option as O } from 'fp-ts';

import { AddGuest } from './AddGuest';
import { GuestListRepository } from '../Repositories/GuestListRepository';
import { GuestWithThatNameAlreadyExists } from '../Domain/problems/GuestWithThatNameAlreadyExists';
import { createGuest } from '../Domain/Guest';
import { pipe } from 'fp-ts/function';

describe('Add guest', () => {
  test('add new guest', async () => {
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
    saveMock.mockReturnValue(TE.of(guestListMock));
    const useCase = new AddGuest(new GuestRepositoryMock());
    const guestName = randFullName();
    const guestEmail = randEmail();
    const guestId = randUuid();
    const command = {
      name: guestName,
      email: guestEmail,
      id: guestId,
    };

    const guest = pipe(
      createGuest({ name: guestName, email: guestEmail }, guestId),
      E.getOrElse(() => {
        throw new Error('could not create guest');
      }),
    );

    const response = await useCase.execute(command)();

    if (E.isLeft(response)) {
      throw new Error(response.left.message);
    }

    expect(findMock).toHaveBeenCalled();
    expect(saveMock).toHaveBeenCalledWith({
      guests: [guest],
      households: [],
    });
    expect(response.right).toEqual(guest);
  });

  test('should fail if guest already exists', async () => {
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
    saveMock.mockReturnValue(TE.of(guestListMock));
    const useCase = new AddGuest(new GuestRepositoryMock());
    const guestName = randFullName();
    const guestEmail = randEmail();
    const guestId = randUuid();
    const command = {
      name: guestName,
      email: guestEmail,
      id: guestId,
    };

    const guest = pipe(
      createGuest({ name: guestName, email: guestEmail }, guestId),
      E.getOrElse(() => {
        throw new Error('could not create guest');
      }),
    );

    guestListMock.guests.push(guest);

    const response = await useCase.execute(command)();
    expect(response).toEqual(E.left(new GuestWithThatNameAlreadyExists()));
  });
});
