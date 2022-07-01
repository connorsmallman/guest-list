import { GuestListRepository } from '../Repositories/GuestListRepository';
import { taskEither as TE, either as E } from 'fp-ts';
import { CreateHousehold } from './CreateHousehold';
import { GuestList } from '../Domain/GuestList';
import { FailedToGetNextHouseholdId } from '../Domain/problems/FailedToGetNextHouseholdId';
import { FailedToCreateHousehold } from '../Domain/problems/FailedToCreateHousehold';
import { FailedToGenerateHouseholdCode } from '../Domain/problems/FailedToGenerateHouseholdCode';
import { Household } from '../Domain/Household';
import { pipe } from 'fp-ts/function';
import { HouseholdAlreadyExists } from '../Domain/problems/HouseholdAlreadyExists';

describe('Create Household', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

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

  test('should fail if unable to create id', async () => {
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

    jest
      .spyOn(GuestList, 'getNextHouseholdId')
      .mockReturnValue(E.left(new FailedToGetNextHouseholdId()));

    const useCase = new CreateHousehold(new GuestListRepositoryMock());

    const response = await useCase.execute()();

    expect(response).toEqual(E.left(new FailedToCreateHousehold()));
  });

  test('should fail if unable to generate code', async () => {
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

    jest
      .spyOn(GuestList, 'generateHouseholdCode')
      .mockReturnValue(E.left(new FailedToGenerateHouseholdCode()));

    const useCase = new CreateHousehold(new GuestListRepositoryMock());

    const response = await useCase.execute()();

    expect(response).toEqual(E.left(new FailedToCreateHousehold()));
  });

  test('should fail if unable to create household', async () => {
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

    jest
      .spyOn(Household, 'create')
      .mockReturnValue(E.left(new FailedToCreateHousehold()));

    const useCase = new CreateHousehold(new GuestListRepositoryMock());

    const response = await useCase.execute()();

    expect(response).toEqual(E.left(new FailedToCreateHousehold()));
  });

  test('should fail if unable to add new household to guest list', async () => {
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

    const household = pipe(
      Household.create({
        id: 1,
        code: 'tqd3B',
      }),
      E.getOrElse(() => {
        throw new Error('unable to create household');
      }),
    );

    GuestList.addHousehold(guestListMock, household);

    jest
      .spyOn(GuestList, 'addHousehold')
      .mockReturnValue(E.left(new HouseholdAlreadyExists()));

    const useCase = new CreateHousehold(new GuestListRepositoryMock());

    const response = await useCase.execute()();

    expect(response).toEqual(E.left(new FailedToCreateHousehold()));
  });

  test('should fail if unable to save guest list', async () => {
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
    saveMock.mockReturnValue(TE.left(new Error()));

    const useCase = new CreateHousehold(new GuestListRepositoryMock());

    const response = await useCase.execute()();

    expect(response).toEqual(E.left(new FailedToCreateHousehold()));
  });
});
