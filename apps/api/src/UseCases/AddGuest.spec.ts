import { randEmail, randFullName } from '@ngneat/falso';

import { AddGuest } from './AddGuest';
import { GuestListRepository } from '../Repositories/GuestListRepository';
import { GuestList } from '../Domain/GuestList';

describe('Add guest', () => {
  test('add new guest', async () => {
    const findMock = jest.fn();
    const saveMock = jest.fn();
    const GuestRepositoryMock = <jest.Mock<GuestListRepository>>jest.fn(() => ({
      find: findMock,
      save: saveMock,
    }));
    const guestListMock = new GuestList();
    findMock.mockResolvedValue(guestListMock);
    const useCase = new AddGuest(new GuestRepositoryMock());
    const guestDTO = {
      name: randFullName(),
      email: randEmail(),
    };

    await useCase.execute(guestDTO);

    expect(findMock).toHaveBeenCalled();
    expect(saveMock).toHaveBeenCalled();
    expect(guestListMock.guests[0].name).toEqual(guestDTO.name);
    expect(guestListMock.guests[0].email).toEqual(guestDTO.email);
    expect(guestListMock.guests[0].dietaryRequirements).toEqual('');
    expect(guestListMock.guests[0].isChild).toEqual(false);
    expect(guestListMock.guests[0].attending).toEqual(null);
  });
});
