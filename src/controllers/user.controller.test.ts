import {
  createUser,
  getAllUsers,
  updateUser,
  getUserById,
  deleteUser,
  UsersMessages
} from '@controllers/user.controller';
import {
  getAllUsers as getAllUsersDataAccess,
  createUser as createUserDataAccess,
  updateUser as updateUserDataAccess,
  deleteUser as deleteUserDataAccess,
  getSuggestUsers,
  findUserById
} from '@src/data-access/users.data-access';
import { UsersModel } from '@models/user.model';
import { mocked } from 'ts-jest/utils';
import { RequestHandler } from 'express';
import { v4 as uuid, validate } from 'uuid';
import { ApiError } from '@src/utils/error.utils';
import { CommonMessages } from '@controllers/common-messages';

jest.mock('@src/data-access/users.data-access');
jest.mock('uuid');

const mockedUser = {
  id: 'id',
  login: 'login',
  password: 'password',
  age: 25,
  isDeleted: false
};

describe(getAllUsers, () => {
  const mockedGetAllUsersDataAccess = mocked(getAllUsersDataAccess);
  const mockedGetSuggestUsers = mocked(getSuggestUsers);
  const mockedCallback = jest.fn();

  it('calls "getAllUsersDataAccess" with default value when controller is triggered', async () => {
    await getAllUsers(
      {
        query: {}
      } as unknown as Parameters<RequestHandler>[0],
      {} as unknown as Parameters<RequestHandler>[1],
      jest.fn()
    );

    expect(mockedGetAllUsersDataAccess).toBeCalledWith(500);
  });

  it('calls "getAllUsersDataAccess" with limit equal 100 when controller is triggered and limit is passed', async () => {
    await getAllUsers(
      {
        query: { limit: '100' }
      } as unknown as Parameters<RequestHandler>[0],
      {} as unknown as Parameters<RequestHandler>[1],
      jest.fn()
    );

    expect(mockedGetAllUsersDataAccess).toBeCalledWith(100);
  });

  it('calls "getAllUsersDataAccess" with default value when controller is triggered and limit is passed but with wrong type', async () => {
    await getAllUsers(
      {
        query: { limit: [100] }
      } as unknown as Parameters<RequestHandler>[0],
      {} as unknown as Parameters<RequestHandler>[1],
      jest.fn()
    );

    expect(mockedGetAllUsersDataAccess).toBeCalledWith(500);
  });

  it('calls "getSuggestUsers" when controller is triggered and substring is passed', async () => {
    await getAllUsers(
      {
        query: { limit: '100', loginSubstring: 'login' }
      } as unknown as Parameters<RequestHandler>[0],
      {} as unknown as Parameters<RequestHandler>[1],
      jest.fn()
    );

    expect(mockedGetSuggestUsers).toBeCalledWith('login', 100);
  });

  it('returns suggested user when "getSuggestUsers" is triggered and he is exist in db', async () => {
    mockedGetSuggestUsers.mockReturnValue([mockedUser] as unknown as Promise<
      UsersModel[]
    >);

    await getAllUsers(
      {
        query: { loginSubstring: 'login' }
      } as unknown as Parameters<RequestHandler>[0],
      { json: mockedCallback } as unknown as Parameters<RequestHandler>[1],
      jest.fn()
    );

    expect(mockedCallback).toBeCalledWith([mockedUser]);
  });

  it('returns user list when "getAllUsers" is triggered', async () => {
    mockedGetAllUsersDataAccess.mockReturnValue([
      mockedUser
    ] as unknown as Promise<UsersModel[]>);

    await getAllUsers(
      {
        query: {}
      } as unknown as Parameters<RequestHandler>[0],
      { json: mockedCallback } as unknown as Parameters<RequestHandler>[1],
      jest.fn()
    );

    expect(mockedCallback).toBeCalledWith([mockedUser]);
  });

  it('calls next middleware with error when method gets some error', async () => {
    const mockedNext = jest.fn();

    mockedGetAllUsersDataAccess.mockImplementation(() => {
      throw new Error('error');
    });

    await getAllUsers(
      {
        query: {}
      } as unknown as Parameters<RequestHandler>[0],
      {} as unknown as Parameters<RequestHandler>[1],
      mockedNext
    );

    expect(mockedNext).toBeCalled();
  });
});

describe(createUser, () => {
  const mockedCreateUserDataAccess = mocked(createUserDataAccess);
  const mockedUuid = mocked(uuid);
  const mockedCallback = jest.fn();

  const body = { login: 'login', password: 'password', age: 'age' };

  beforeEach(() => {
    mockedUuid.mockReturnValue('id');
  });

  it('calls "createUserDataAccess" when controller is triggered', async () => {
    await createUser(
      {
        body
      } as unknown as Parameters<RequestHandler>[0],
      {} as unknown as Parameters<RequestHandler>[1],
      jest.fn()
    );

    expect(mockedCreateUserDataAccess).toBeCalledWith({
      ...body,
      id: 'id',
      isDeleted: false
    });
  });

  it('returns user  when "createUser" is triggered', async () => {
    mockedCreateUserDataAccess.mockReturnValue(
      mockedUser as unknown as Promise<UsersModel>
    );

    const mockedJson = jest.fn();
    const mockedStatus = jest
      .fn()
      .mockImplementation(() => ({ json: mockedJson }));

    await createUser(
      {
        body
      } as unknown as Parameters<RequestHandler>[0],
      {
        status: mockedStatus,
        json: mockedJson
      } as unknown as Parameters<RequestHandler>[1],
      jest.fn()
    );

    expect(mockedStatus).toBeCalledWith(201);
    expect(mockedJson).toBeCalledWith(mockedUser);
  });

  it('calls next middleware with error when method gets some error', async () => {
    mockedCreateUserDataAccess.mockImplementation(() => {
      throw new Error('error');
    });

    await createUser(
      {
        query: { body }
      } as unknown as Parameters<RequestHandler>[0],
      {} as unknown as Parameters<RequestHandler>[1],
      mockedCallback
    );

    expect(mockedCallback).toBeCalled();
  });
});

describe('with find user by id', () => {
  const mockedFindUserById = mocked(findUserById);
  const mockedUuid = mocked(uuid);
  const mockedValidate = mocked(validate);
  const mockedCallback = jest.fn();

  beforeEach(() => {
    mockedUuid.mockReturnValue('id');
    mockedValidate.mockReturnValue(true);
  });
  describe(updateUser, () => {
    const mockedUpdateUserDataAccess = mocked(updateUserDataAccess);

    const body = { login: 'login', password: 'password', age: 'age' };

    it('calls next middleware with error when validate returns false', async () => {
      const error = new ApiError(CommonMessages.IncorrectId);

      mockedValidate.mockReturnValue(false);

      await updateUser(
        {
          body,
          params: { id: 'params-id' }
        } as unknown as Parameters<RequestHandler>[0],
        {} as unknown as Parameters<RequestHandler>[1],
        mockedCallback
      );

      expect(mockedCallback).toBeCalledWith(error);
    });

    it('calls "findUserById" with id from params when controller is triggered', async () => {
      await updateUser(
        {
          body,
          params: { id: 'params-id' }
        } as unknown as Parameters<RequestHandler>[0],
        {} as unknown as Parameters<RequestHandler>[1],
        jest.fn()
      );

      expect(mockedFindUserById).toBeCalledWith('params-id');
    });

    it('calls next middleware with error when user not found', async () => {
      const error = new ApiError(UsersMessages.NotFound);
      mockedFindUserById.mockReturnValue(
        null as unknown as Promise<UsersModel>
      );
      mockedValidate.mockReturnValue(true);

      await updateUser(
        {
          body,
          params: { id: 'params-id' }
        } as unknown as Parameters<RequestHandler>[0],
        {} as unknown as Parameters<RequestHandler>[1],
        mockedCallback
      );

      expect(mockedCallback).toBeCalledWith(error);
    });

    it('calls next middleware with error when user is deleted', async () => {
      const error = new ApiError(UsersMessages.NotFound);
      mockedFindUserById.mockReturnValue({
        ...mockedUser,
        isDeleted: true
      } as unknown as Promise<UsersModel>);

      mockedValidate.mockReturnValue(true);

      await updateUser(
        {
          body,
          params: { id: 'params-id' }
        } as unknown as Parameters<RequestHandler>[0],
        {} as unknown as Parameters<RequestHandler>[1],
        mockedCallback
      );

      expect(mockedCallback).toBeCalledWith(error);
    });

    it('triggers "UpdateUserDataAccess" when user exist and it called', async () => {
      mockedValidate.mockReturnValue(true);
      mockedFindUserById.mockReturnValue(
        mockedUser as unknown as Promise<UsersModel>
      );

      await updateUser(
        {
          body,
          params: { id: 'params-id' }
        } as unknown as Parameters<RequestHandler>[0],
        {} as unknown as Parameters<RequestHandler>[1],
        jest.fn()
      );

      expect(mockedUpdateUserDataAccess).toBeCalledWith({
        ...body,
        id: 'params-id'
      });
    });

    it('returns id of updated user when user successfully updated', async () => {
      mockedValidate.mockReturnValue(true);
      mockedFindUserById.mockReturnValue(
        mockedUser as unknown as Promise<UsersModel>
      );

      mockedUpdateUserDataAccess.mockReturnValue(
        1 as unknown as Promise<number>
      );

      await updateUser(
        {
          body,
          params: { id: 'params-id' }
        } as unknown as Parameters<RequestHandler>[0],
        { json: mockedCallback } as unknown as Parameters<RequestHandler>[1],
        jest.fn()
      );

      expect(mockedCallback).toBeCalledWith({ id: 'params-id' });
    });

    it('calls next middleware with error when updated failed', async () => {
      mockedFindUserById.mockReturnValue({
        ...mockedUser,
        isDeleted: true
      } as unknown as Promise<UsersModel>);
      mockedFindUserById.mockReturnValue(
        mockedUser as unknown as Promise<UsersModel>
      );
      mockedValidate.mockReturnValue(true);
      mockedUpdateUserDataAccess.mockReturnValue(
        0 as unknown as Promise<number>
      );

      await updateUser(
        {
          body,
          params: { id: 'params-id' }
        } as unknown as Parameters<RequestHandler>[0],
        {} as unknown as Parameters<RequestHandler>[1],
        mockedCallback
      );

      expect(mockedCallback).toBeCalledWith({
        message: CommonMessages.Unexpected
      });
    });

    it('calls next middleware with error when method gets some error', async () => {
      mockedFindUserById.mockImplementation(() => {
        throw new Error('error');
      });

      await updateUser(
        {
          query: { body }
        } as unknown as Parameters<RequestHandler>[0],
        {} as unknown as Parameters<RequestHandler>[1],
        mockedCallback
      );

      expect(mockedCallback).toBeCalled();
    });
  });

  describe(getUserById, () => {
    it('calls next middleware with error when validate returns false', async () => {
      const error = new ApiError(CommonMessages.IncorrectId);

      mockedValidate.mockReturnValue(false);

      await getUserById(
        {
          params: { id: 'params-id' }
        } as unknown as Parameters<RequestHandler>[0],
        {} as unknown as Parameters<RequestHandler>[1],
        mockedCallback
      );

      expect(mockedCallback).toBeCalledWith(error);
    });

    it('calls "findUserById" with id from params when controller is triggered', async () => {
      await getUserById(
        {
          params: { id: 'params-id' }
        } as unknown as Parameters<RequestHandler>[0],
        {} as unknown as Parameters<RequestHandler>[1],
        jest.fn()
      );

      expect(mockedFindUserById).toBeCalledWith('params-id');
    });

    it('calls next middleware with error when user not found', async () => {
      const error = new ApiError(UsersMessages.NotFound);
      mockedFindUserById.mockReturnValue(
        null as unknown as Promise<UsersModel>
      );
      mockedValidate.mockReturnValue(true);

      await getUserById(
        {
          params: { id: 'params-id' }
        } as unknown as Parameters<RequestHandler>[0],
        {} as unknown as Parameters<RequestHandler>[1],
        mockedCallback
      );

      expect(mockedCallback).toBeCalledWith(error);
    });

    it('calls next middleware with error when user is deleted', async () => {
      const error = new ApiError(UsersMessages.NotFound);
      mockedFindUserById.mockReturnValue({
        ...mockedUser,
        isDeleted: true
      } as unknown as Promise<UsersModel>);

      mockedValidate.mockReturnValue(true);

      await getUserById(
        {
          params: { id: 'params-id' }
        } as unknown as Parameters<RequestHandler>[0],
        {} as unknown as Parameters<RequestHandler>[1],
        mockedCallback
      );

      expect(mockedCallback).toBeCalledWith(error);
    });

    it('returns user', async () => {
      mockedValidate.mockReturnValue(true);
      mockedFindUserById.mockReturnValue(
        mockedUser as unknown as Promise<UsersModel>
      );

      await getUserById(
        {
          params: { id: 'params-id' }
        } as unknown as Parameters<RequestHandler>[0],
        { json: mockedCallback } as unknown as Parameters<RequestHandler>[1],
        jest.fn()
      );

      expect(mockedCallback).toBeCalledWith(mockedUser);
    });

    it('calls next middleware with error when method gets some error', async () => {
      mockedFindUserById.mockImplementation(() => {
        throw new Error('error');
      });

      await getUserById(
        {
          query: {}
        } as unknown as Parameters<RequestHandler>[0],
        {} as unknown as Parameters<RequestHandler>[1],
        mockedCallback
      );

      expect(mockedCallback).toBeCalled();
    });
  });

  describe(deleteUser, () => {
    const mockedDeleteUserDataAccess = mocked(deleteUserDataAccess);

    it('calls next middleware with error when validate returns false', async () => {
      const error = new ApiError(CommonMessages.IncorrectId);

      mockedValidate.mockReturnValue(false);

      await deleteUser(
        {
          params: { id: 'params-id' }
        } as unknown as Parameters<RequestHandler>[0],
        {} as unknown as Parameters<RequestHandler>[1],
        mockedCallback
      );

      expect(mockedCallback).toBeCalledWith(error);
    });

    it('calls "findUserById" with id from params when controller is triggered', async () => {
      await deleteUser(
        {
          params: { id: 'params-id' }
        } as unknown as Parameters<RequestHandler>[0],
        {} as unknown as Parameters<RequestHandler>[1],
        jest.fn()
      );

      expect(mockedFindUserById).toBeCalledWith('params-id');
    });

    it('calls next middleware with error when user not found', async () => {
      const error = new ApiError(UsersMessages.NotFound);
      mockedFindUserById.mockReturnValue(
        null as unknown as Promise<UsersModel>
      );
      mockedValidate.mockReturnValue(true);

      await deleteUser(
        {
          params: { id: 'params-id' }
        } as unknown as Parameters<RequestHandler>[0],
        {} as unknown as Parameters<RequestHandler>[1],
        mockedCallback
      );

      expect(mockedCallback).toBeCalledWith(error);
    });

    it('calls next middleware with error when user is deleted', async () => {
      const error = new ApiError(UsersMessages.NotFound);
      mockedFindUserById.mockReturnValue({
        ...mockedUser,
        isDeleted: true
      } as unknown as Promise<UsersModel>);

      mockedValidate.mockReturnValue(true);

      await deleteUser(
        {
          params: { id: 'params-id' }
        } as unknown as Parameters<RequestHandler>[0],
        {} as unknown as Parameters<RequestHandler>[1],
        mockedCallback
      );

      expect(mockedCallback).toBeCalledWith(error);
    });

    it('calls "findUserById" with id from params when it triggered', async () => {
      mockedValidate.mockReturnValue(true);

      await deleteUser(
        {
          params: { id: 'params-id' }
        } as unknown as Parameters<RequestHandler>[0],
        { json: mockedCallback } as unknown as Parameters<RequestHandler>[1],
        jest.fn()
      );

      expect(mockedFindUserById).toBeCalledWith('params-id');
    });

    it('triggers "deleteUserDataAccess" when user exist and it called', async () => {
      mockedValidate.mockReturnValue(true);
      mockedFindUserById.mockReturnValue(
        mockedUser as unknown as Promise<UsersModel>
      );

      await deleteUser(
        {
          params: { id: 'params-id' }
        } as unknown as Parameters<RequestHandler>[0],
        {} as unknown as Parameters<RequestHandler>[1],
        jest.fn()
      );

      expect(mockedDeleteUserDataAccess).toBeCalledWith('params-id');
    });

    it('returns id of updated user when user successfully updated', async () => {
      mockedValidate.mockReturnValue(true);
      mockedFindUserById.mockReturnValue(
        mockedUser as unknown as Promise<UsersModel>
      );

      mockedDeleteUserDataAccess.mockReturnValue(
        1 as unknown as Promise<number>
      );

      await deleteUser(
        {
          params: { id: 'params-id' }
        } as unknown as Parameters<RequestHandler>[0],
        { json: mockedCallback } as unknown as Parameters<RequestHandler>[1],
        jest.fn()
      );

      expect(mockedCallback).toBeCalledWith({ message: 'User was deleted.' });
    });

    it('calls next middleware with error when method gets some error', async () => {
      mockedFindUserById.mockImplementation(() => {
        throw new Error('error');
      });

      await deleteUser(
        {
          query: {}
        } as unknown as Parameters<RequestHandler>[0],
        {} as unknown as Parameters<RequestHandler>[1],
        mockedCallback
      );

      expect(mockedCallback).toBeCalled();
    });
  });
});
