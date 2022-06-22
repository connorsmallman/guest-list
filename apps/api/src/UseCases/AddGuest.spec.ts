import { randEmail, randFullName } from '@ngneat/falso';
import { taskEither as TE, either as E } from 'fp-ts';

import { AddGuest } from './AddGuest';
import { GuestListRepository } from '../Repositories/GuestListRepository';
import { GuestList } from '../Domain/GuestList';
import { GuestWithThatNameAlreadyExists } from '../Domain/problems/GuestWithThatNameAlreadyExists';

describe('Add guest', () => {
  test('add new guest', async () => {
    const findMock = jest.fn();
    const saveMock = jest.fn();
    const GuestRepositoryMock = <jest.Mock<GuestListRepository>>jest.fn(() => ({
      find: findMock,
      save: saveMock,
    }));
    const guestListMock = new GuestList();
    findMock.mockReturnValue(TE.of(guestListMock));
    saveMock.mockReturnValue(TE.of(null));
    const useCase = new AddGuest(new GuestRepositoryMock());
    const guestDTO = {
      name: randFullName(),
      email: randEmail(),
    };

    const response = await useCase.execute(guestDTO)();

    expect(findMock).toHaveBeenCalled();
    expect(saveMock).toHaveBeenCalled();
    expect(guestListMock.guests[0].name).toEqual(guestDTO.name);
    expect(guestListMock.guests[0].email).toEqual(guestDTO.email);
    expect(guestListMock.guests[0].dietaryRequirements).toEqual('');
    expect(guestListMock.guests[0].isChild).toEqual(false);
    expect(guestListMock.guests[0].attending).toEqual(null);
  });

  test('should fail if guest already exists', async () => {
    const findMock = jest.fn();
    const saveMock = jest.fn();
    const GuestRepositoryMock = <jest.Mock<GuestListRepository>>jest.fn(() => ({
      find: findMock,
      save: saveMock,
    }));
    const guestListMock = new GuestList();
    findMock.mockReturnValue(TE.of(guestListMock));
    saveMock.mockReturnValue(TE.of(null));
    const useCase = new AddGuest(new GuestRepositoryMock());
    const guestDTO = {
      name: randFullName(),
      email: randEmail(),
    };

    await useCase.execute(guestDTO)();
    const response = await useCase.execute(guestDTO)();
    expect(response).toEqual(E.left(new GuestWithThatNameAlreadyExists()));
  });
});
