import {
  getAllGroups,
  createGroup,
  updateGroup,
  GroupMessages,
  getGroupById,
  deleteGroup
} from '@controllers/groups.controller';
import { mocked } from 'ts-jest/utils';
import { RequestHandler } from 'express';
import { v4 as uuid, validate } from 'uuid';
import { ApiError } from '@utils/error.utils';
import { CommonMessages } from '@controllers/common-messages';
import {
  getAllGroups as getAllGroupsDataAccess,
  createGroup as createGroupDataAccess,
  updateGroup as updateGroupDataAccess,
  findGroupById as findGroupByIdDataAccess,
  deleteGroup as deleteGroupDataAccess
} from '@src/data-access/groups.data-access';
import { GroupModel, Permissions } from '@src/models/group.model';
import sequelize from '@src/db';
import { Transaction } from 'sequelize/types';
import * as UsersGroupsDataAccess from '@src/data-access/user-group.data-access';
import { MockedFunction } from 'ts-jest/dist/utils/testing';

jest.mock('uuid');
jest.mock('@src/db');
jest.mock('@src/models/user-group.model');
jest.mock('@src/data-access/groups.data-access');
jest.mock('@src/data-access/user-group.data-access', () => ({
  addUsersToGroup: jest.fn()
}));

const mockedGroup = {
  id: 'id',
  name: 'name',
  permissions: [Permissions.READ]
} as GroupModel;

describe(getAllGroups, () => {
  const mockedGetAllGroupsDataAccess = mocked(getAllGroupsDataAccess);
  const mockedNext = jest.fn();
  const mockedJson = jest.fn();

  it('calls "getAllGroupsDataAccess" when controller is triggered', async () => {
    await getAllGroups(
      {
        query: {}
      } as unknown as Parameters<RequestHandler>[0],
      {} as unknown as Parameters<RequestHandler>[1],
      mockedNext
    );

    expect(mockedGetAllGroupsDataAccess).toBeCalled();
  });

  it('returns group list when controller is triggered', async () => {
    mockedGetAllGroupsDataAccess.mockResolvedValue([mockedGroup]);

    await getAllGroups(
      {
        query: {}
      } as unknown as Parameters<RequestHandler>[0],
      { json: mockedJson } as unknown as Parameters<RequestHandler>[1],
      mockedNext
    );

    expect(mockedJson).toBeCalledWith([mockedGroup]);
  });

  it('calls next middleware with error when method gets some error', async () => {
    mockedGetAllGroupsDataAccess.mockImplementation(() => {
      throw new Error('error');
    });

    await getAllGroups(
      {} as unknown as Parameters<RequestHandler>[0],
      {} as unknown as Parameters<RequestHandler>[1],
      mockedNext
    );

    expect(mockedNext).toBeCalled();
  });
});

describe(createGroup, () => {
  const mockedUuid = mocked(uuid);
  const mockedSequelize = mocked(sequelize);
  const mockedCreateGroupDataAccess = mocked(createGroupDataAccess);

  const mockedNext = jest.fn();
  const mockedJson = jest.fn();

  const mockedCommit = jest.fn();
  const mockedRollback = jest.fn();

  const mockedAddUsersToGroup =
    UsersGroupsDataAccess.addUsersToGroup as MockedFunction<
      () => Promise<{ code: number }>
    >;

  const transaction = { commit: mockedCommit, rollback: mockedRollback };
  const body = { name: 'name', permissions: [] };

  beforeEach(() => {
    mockedUuid.mockReturnValue('id');
    mockedSequelize.transaction.mockReturnValue({
      commit: mockedCommit,
      rollback: mockedRollback
    } as unknown as Promise<Transaction>);
  });

  it('calls "createGroupDataAccess" when controller is triggered', async () => {
    await createGroup(
      {
        body
      } as unknown as Parameters<RequestHandler>[0],
      {} as unknown as Parameters<RequestHandler>[1],
      mockedNext
    );

    expect(mockedCreateGroupDataAccess).toBeCalledWith(
      { ...body, id: 'id' },
      { transaction }
    );
  });

  it('calls "addUsersToGroup" when controller is triggered and users ids are passed', async () => {
    await createGroup(
      {
        body: { ...body, usersIds: ['1'] }
      } as unknown as Parameters<RequestHandler>[0],
      {} as unknown as Parameters<RequestHandler>[1],
      mockedNext
    );

    expect(mockedAddUsersToGroup).toBeCalledWith(
      { groupId: 'id', usersIds: ['1'] },
      { transaction }
    );
  });

  it('commits transaction and sends result when group is exist and adding users to group passed successfully', async () => {
    mockedAddUsersToGroup.mockResolvedValue({
      code: 1
    });
    mockedCreateGroupDataAccess.mockResolvedValue({} as GroupModel);

    await createGroup(
      {
        body: { ...body, usersIds: ['1'] }
      } as unknown as Parameters<RequestHandler>[0],
      { json: mockedJson } as unknown as Parameters<RequestHandler>[1],
      mockedNext
    );

    expect(mockedCommit).toBeCalled();
    expect(mockedJson).toBeCalledWith({ id: 'id' });
  });

  it('commits transaction and sends result when users ids are not passed', async () => {
    mockedCreateGroupDataAccess.mockResolvedValue({} as GroupModel);
    const mockedStatus = jest
      .fn()
      .mockImplementation(() => ({ json: mockedJson }));

    await createGroup(
      {
        body
      } as unknown as Parameters<RequestHandler>[0],
      {
        status: mockedStatus,
        json: mockedJson
      } as unknown as Parameters<RequestHandler>[1],
      mockedNext
    );

    expect(mockedCommit).toBeCalled();
    expect(mockedStatus).toBeCalledWith(201);
    expect(mockedJson).toBeCalledWith({});
  });

  it('rollbacks transaction and calls next middleware with error when method gets some error', async () => {
    mockedCreateGroupDataAccess.mockImplementation(() => {
      throw new Error('error');
    });

    await createGroup(
      {
        query: { body }
      } as unknown as Parameters<RequestHandler>[0],
      {} as unknown as Parameters<RequestHandler>[1],
      mockedNext
    );

    expect(mockedNext).toBeCalled();
  });
});

describe('with find group by id', () => {
  const mockedFindGroupById = mocked(findGroupByIdDataAccess);
  const mockedUuid = mocked(uuid);
  const mockedValidate = mocked(validate);

  const mockedNext = jest.fn();
  const mockedJson = jest.fn();

  beforeEach(() => {
    mockedUuid.mockReturnValue('id');
    mockedValidate.mockReturnValue(true);
  });

  describe(updateGroup, () => {
    const mockedSequelize = mocked(sequelize);
    const mockedUpdateGroupDataAccess = mocked(updateGroupDataAccess);

    const mockedCommit = jest.fn();
    const mockedRollback = jest.fn();

    const mockedAddUsersToGroup =
      UsersGroupsDataAccess.addUsersToGroup as MockedFunction<
        () => Promise<{ code: number }>
      >;

    const transaction = { commit: mockedCommit, rollback: mockedRollback };
    const body = {
      name: mockedGroup.name,
      permissions: mockedGroup.permissions
    };

    beforeEach(() => {
      mockedUuid.mockReturnValue('id');
      mockedSequelize.transaction.mockResolvedValue({
        commit: mockedCommit,
        rollback: mockedRollback
      } as unknown as Transaction);
    });

    it('calls next middleware with error when validate returns false', async () => {
      mockedValidate.mockReturnValue(false);
      const error = new ApiError(CommonMessages.IncorrectId);
      await updateGroup(
        {
          body,
          params: { id: 'params-id' }
        } as unknown as Parameters<RequestHandler>[0],
        {} as unknown as Parameters<RequestHandler>[1],
        mockedNext
      );

      expect(mockedNext).toBeCalledWith(error);
    });

    it('calls "findGroupById" with id from params when controller is triggered', async () => {
      await updateGroup(
        {
          body,
          params: { id: 'params-id' }
        } as unknown as Parameters<RequestHandler>[0],
        {} as unknown as Parameters<RequestHandler>[1],
        mockedNext
      );

      expect(mockedFindGroupById).toBeCalledWith('params-id');
    });

    it('calls next middleware with error when group not found', async () => {
      const error = new ApiError(GroupMessages.NotFound);

      mockedFindGroupById.mockResolvedValue(null);

      await updateGroup(
        {
          body,
          params: { id: 'params-id' }
        } as unknown as Parameters<RequestHandler>[0],
        {} as unknown as Parameters<RequestHandler>[1],
        mockedNext
      );

      expect(mockedNext).toBeCalledWith(error);
    });

    it('calls next middleware with error when group is not exist', async () => {
      const error = new ApiError(GroupMessages.NotFound);
      mockedFindGroupById.mockResolvedValue(null);

      await updateGroup(
        {
          body,
          params: { id: 'params-id' }
        } as unknown as Parameters<RequestHandler>[0],
        {} as unknown as Parameters<RequestHandler>[1],
        mockedNext
      );

      expect(mockedNext).toBeCalledWith(error);
    });

    it('triggers "updateGroupDataAccess" when group is exist and it called', async () => {
      mockedFindGroupById.mockResolvedValue(mockedGroup);

      await updateGroup(
        {
          body,
          params: { id: 'params-id' }
        } as unknown as Parameters<RequestHandler>[0],
        {} as unknown as Parameters<RequestHandler>[1],
        mockedNext
      );

      expect(mockedUpdateGroupDataAccess).toBeCalledWith(
        {
          ...body,
          id: 'params-id'
        },
        { transaction }
      );
    });

    it('calls "addUsersToGroup" when controller is triggered and users ids are passed', async () => {
      mockedFindGroupById.mockResolvedValue(mockedGroup);
      await updateGroup(
        {
          body: { ...body, usersIds: ['1'] },
          params: { id: 'params-id' }
        } as unknown as Parameters<RequestHandler>[0],
        {} as unknown as Parameters<RequestHandler>[1],
        mockedNext
      );

      expect(mockedAddUsersToGroup).toBeCalledWith(
        { groupId: 'params-id', usersIds: ['1'] },
        { transaction }
      );
    });

    it('commits transaction and sends result when group is exist and adding users to group passed successfully', async () => {
      mockedFindGroupById.mockResolvedValue(mockedGroup);
      mockedAddUsersToGroup.mockResolvedValue({
        code: 1
      });
      mockedUpdateGroupDataAccess.mockResolvedValue(1);

      await updateGroup(
        {
          body: { ...body, usersIds: ['1'] },
          params: { id: 'params-id' }
        } as unknown as Parameters<RequestHandler>[0],
        { json: mockedJson } as unknown as Parameters<RequestHandler>[1],
        mockedNext
      );

      expect(mockedCommit).toBeCalled();
      expect(mockedJson).toBeCalledWith({ id: 'params-id' });
    });

    it('commits transaction and sends result when users ids are not passed', async () => {
      mockedFindGroupById.mockResolvedValue(mockedGroup);
      mockedUpdateGroupDataAccess.mockResolvedValue(1);

      await updateGroup(
        {
          body,
          params: { id: 'params-id' }
        } as unknown as Parameters<RequestHandler>[0],
        {
          json: mockedJson
        } as unknown as Parameters<RequestHandler>[1],
        mockedNext
      );

      expect(mockedCommit).toBeCalled();
      expect(mockedJson).toBeCalledWith({ id: 'params-id' });
    });

    it('rollbacks transaction and calls next middleware with error when method gets some error', async () => {
      mockedUpdateGroupDataAccess.mockImplementation(() => {
        throw new Error('error');
      });

      await updateGroup(
        {
          query: { body }
        } as unknown as Parameters<RequestHandler>[0],
        {} as unknown as Parameters<RequestHandler>[1],
        mockedNext
      );

      expect(mockedNext).toBeCalled();
    });
  });

  describe(getGroupById, () => {
    it('calls next middleware with error when validate returns false', async () => {
      const error = new ApiError(CommonMessages.IncorrectId);

      mockedValidate.mockReturnValue(false);

      await getGroupById(
        {
          params: { id: 'params-id' }
        } as unknown as Parameters<RequestHandler>[0],
        {} as unknown as Parameters<RequestHandler>[1],
        mockedNext
      );

      expect(mockedNext).toBeCalledWith(error);
    });

    it('calls "findGroupById" with id from params when controller is triggered', async () => {
      await getGroupById(
        {
          params: { id: 'params-id' }
        } as unknown as Parameters<RequestHandler>[0],
        {} as unknown as Parameters<RequestHandler>[1],
        jest.fn()
      );

      expect(mockedFindGroupById).toBeCalledWith('params-id');
    });

    it('calls next middleware with error when group is not exist', async () => {
      const error = new ApiError(GroupMessages.NotFound);
      mockedFindGroupById.mockResolvedValue(null);

      mockedValidate.mockReturnValue(true);

      await getGroupById(
        {
          params: { id: 'params-id' }
        } as unknown as Parameters<RequestHandler>[0],
        {} as unknown as Parameters<RequestHandler>[1],
        mockedNext
      );

      expect(mockedNext).toBeCalledWith(error);
    });

    it('returns group', async () => {
      mockedValidate.mockReturnValue(true);
      mockedFindGroupById.mockResolvedValue(mockedGroup);

      await getGroupById(
        {
          params: { id: 'params-id' }
        } as unknown as Parameters<RequestHandler>[0],
        { json: mockedJson } as unknown as Parameters<RequestHandler>[1],
        mockedNext
      );

      expect(mockedJson).toBeCalledWith(mockedGroup);
    });

    it('calls next middleware with error when method gets some error', async () => {
      mockedFindGroupById.mockImplementation(() => {
        throw new Error('error');
      });

      await getGroupById(
        {
          query: {}
        } as unknown as Parameters<RequestHandler>[0],
        {} as unknown as Parameters<RequestHandler>[1],
        mockedNext
      );

      expect(mockedNext).toBeCalled();
    });
  });

  describe(deleteGroup, () => {
    const mockedDeleteGroupDataAccess = mocked(deleteGroupDataAccess);

    it('calls next middleware with error when validate returns false', async () => {
      const error = new ApiError(CommonMessages.IncorrectId);
      mockedValidate.mockReturnValue(false);

      await deleteGroup(
        {
          params: { id: 'params-id' }
        } as unknown as Parameters<RequestHandler>[0],
        {} as unknown as Parameters<RequestHandler>[1],
        mockedNext
      );

      expect(mockedNext).toBeCalledWith(error);
    });

    it('calls "findGroupById" with id from params when controller is triggered', async () => {
      await deleteGroup(
        {
          params: { id: 'params-id' }
        } as unknown as Parameters<RequestHandler>[0],
        {} as unknown as Parameters<RequestHandler>[1],
        jest.fn()
      );

      expect(mockedFindGroupById).toBeCalledWith('params-id');
    });

    it('calls next middleware with error when group is not found', async () => {
      const error = new ApiError(GroupMessages.NotFound);
      mockedFindGroupById.mockResolvedValue(null);

      await deleteGroup(
        {
          params: { id: 'params-id' }
        } as unknown as Parameters<RequestHandler>[0],
        {} as unknown as Parameters<RequestHandler>[1],
        mockedNext
      );

      expect(mockedNext).toBeCalledWith(error);
    });

    it('calls "findGroupById" with id from params when it triggered', async () => {
      mockedValidate.mockReturnValue(true);

      await deleteGroup(
        {
          params: { id: 'params-id' }
        } as unknown as Parameters<RequestHandler>[0],
        { json: mockedJson } as unknown as Parameters<RequestHandler>[1],
        mockedNext
      );

      expect(mockedFindGroupById).toBeCalledWith('params-id');
    });

    it('triggers "deleteGroupDataAccess" when group exist and it called', async () => {
      mockedFindGroupById.mockResolvedValue(mockedGroup);

      await deleteGroup(
        {
          params: { id: 'params-id' }
        } as unknown as Parameters<RequestHandler>[0],
        {} as unknown as Parameters<RequestHandler>[1],
        mockedNext
      );

      expect(mockedDeleteGroupDataAccess).toBeCalledWith('params-id');
    });

    it('returns id of updated group when group successfully updated', async () => {
      mockedFindGroupById.mockResolvedValue(mockedGroup);
      mockedDeleteGroupDataAccess.mockResolvedValue(1);

      await deleteGroup(
        {
          params: { id: 'params-id' }
        } as unknown as Parameters<RequestHandler>[0],
        { json: mockedJson } as unknown as Parameters<RequestHandler>[1],
        mockedNext
      );

      expect(mockedJson).toBeCalledWith({ message: 'Group was deleted.' });
    });
    it('calls next middleware with error when method gets some error', async () => {
      mockedFindGroupById.mockImplementation(() => {
        throw new Error('error');
      });

      await deleteGroup(
        {
          query: {}
        } as unknown as Parameters<RequestHandler>[0],
        {} as unknown as Parameters<RequestHandler>[1],
        mockedNext
      );

      expect(mockedNext).toBeCalled();
    });
  });
});
