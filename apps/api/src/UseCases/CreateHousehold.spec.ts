import { GuestListRepository } from '../Repositories/GuestListRepository';
import { GuestList } from '../Domain/GuestList';
import { taskEither as TE } from 'fp-ts';
import { CreateHousehold } from './CreateHousehold';

describe('Create Household', () => {
  test('should add a new group', async () => {
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

    const useCase = new CreateHousehold(new GuestListRepository());

    const command = {
      allowedNumberOfChildren: 2,
      allowedNumberOfAdults: 2,
    };

    const response = await useCase.execute(command)();

    expect(response).toMatchInlineSnapshot(`
      Object {
        "_tag": "Right",
        "right": Object {
          "allowedNumberOfAdults": 2,
          "allowedNumberOfChildren": 2,
          "code": "g9",
          "guests": Array [],
          "id": 1,
        },
      }
    `);
  });
});
