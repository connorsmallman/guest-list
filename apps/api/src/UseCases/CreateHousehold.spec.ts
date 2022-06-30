import { GuestListRepository } from '../Repositories/GuestListRepository';
import { taskEither as TE } from 'fp-ts';
import { CreateHousehold } from './CreateHousehold';
import { GuestList } from '../Domain/GuestList';

describe('Create Household', () => {
  test('should add a new household', async () => {
    const findMock = jest.fn();
    const saveMock = jest.fn();
    const GuestListRepositoryMock = <jest.Mock<GuestListRepository>>jest.fn(
      () => ({
        find: findMock,
        save: saveMock,
      }),
    );
    const guestListMock = GuestList.create({});
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

  test('should fail if unable to create id', async () => {});

  test('should fail if unable to generate code', async () => {});

  test('should fail if unable to create household', async () => {});

  test('should fail if unable to add new household to guest list', async () => {});

  test('should fail if unable to save guest list', async () => {});
});
