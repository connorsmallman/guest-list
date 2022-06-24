import { GuestListRepository } from '../Repositories/GuestListRepository';
import { GuestList } from '../Domain/GuestList';
import { taskEither as TE, either as E } from 'fp-ts';
import { randEmail, randFullName } from '@ngneat/falso';
import { Guest } from '../Domain/Guest';
import { pipe } from 'fp-ts/function';
import { AddGuest } from './AddGuest';
import { AddGuestToGroup } from './AddGuestToGroup';

describe('add guest to group', () => {
  test('should add guest to group', () => {
    // const findMock = jest.fn();
    // const saveMock = jest.fn();
    // const GuestRepositoryMock = <jest.Mock<GuestListRepository>>jest.fn(() => ({
    //   find: findMock,
    //   save: saveMock,
    // }));
    // const guestListMock = new GuestList();
    // findMock.mockReturnValue(TE.of(guestListMock));
    // saveMock.mockReturnValue(TE.of(null));
    //
    // const guest = pipe(
    //   Guest.create({
    //     name: randFullName(),
    //     email: randEmail(),
    //     dietaryRequirements: '',
    //     isChild: false,
    //     attending: null,
    //   }),
    //   E.getOrElse(() => {
    //     throw new Error();
    //   }),
    // );
    //
    // const createdGuest = pipe(
    //   guestListMock.addGuest(guest),
    //   E.getOrElse(() => {
    //     throw new Error();
    //   }),
    // );
    //
    // const useCase = new AddGuestToGroup(new GuestRepositoryMock());
    //
    // await useCase.execute(createdGuest.id)();
  });
});
