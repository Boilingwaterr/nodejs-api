import { CommonMessages } from '@src/controllers/common-messages';
import { UserGroup, IUserGroup } from '@src/models/user-group.model';
import { Transaction } from 'sequelize/types';

export const getUserGroupListFromUsersIds = (
  groupId: IUserGroup['groupId'],
  usersIds: IUserGroup['userId'][]
) => usersIds.map((userId) => ({ userId, groupId }));

export const addUsersToGroup = async (
  {
    groupId,
    usersIds
  }: { groupId: IUserGroup['groupId']; usersIds: IUserGroup['userId'][] },
  options?: { transaction: Transaction }
) => {
  try {
    const userGroupList = getUserGroupListFromUsersIds(groupId, usersIds);

    for (const userGroup of userGroupList) {
      await UserGroup.create(userGroup, options);
    }

    return { code: 1 };
  } catch (error) {
    throw new Error(CommonMessages.Unexpected);
  }
};

export const getAllUserGroup = async () => UserGroup.findAll();
