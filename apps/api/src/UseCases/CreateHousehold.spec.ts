import { GuestListRepository } from '../Repositories/GuestListRepository';
import { taskEither as TE } from 'fp-ts';
import { CreateHousehold } from './CreateHousehold';

describe('Create Household', () => {
  test('should add a new group', async () => {
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
    findMock.mockReturnValue(TE.of(guestListMock));
    saveMock.mockReturnValue(TE.of(null));

    const useCase = new CreateHousehold(new GuestListRepositoryMock());

    const response = await useCase.execute()();

    expect(response).toMatchInlineSnapshot(`
      Object {
        "_tag": "Right",
        "right": Object {
          "code": "tqd3B",
          "guests": Array [],
          "id": 1,
        },
      }
    `);
  });
});
