import { RequestHandler } from 'express';
import { v4 as uuid, validate } from 'uuid';
import * as GroupsDataAccess from '@src/data-access/groups.data-access';
import * as UsersGroupsDataAccess from '@src/data-access/user-group.data-access';
import { IGroup } from '@src/models/group.model';
import { CommonMessages } from '@controllers/common-messages';
import { IUser } from '@src/models/user.model';
import sequelize from '@src/db';
import { ApiError } from '@src/utils/error.utils';

export enum GroupMessages {
  NotFound = 'Group not found.',
  Deleted = 'Group was deleted.'
}

export const getAllGroups: RequestHandler = async (_req, res, next) => {
  try {
    const groups = await GroupsDataAccess.getAllGroups();
    res.json(groups);
    return next();
  } catch (error) {
    next(error);
  }
};

export const createGroup: RequestHandler = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      name,
      permissions,
      usersIds
    }: Omit<IGroup, 'id'> & { usersIds?: IUser['id'][] } = req.body;

    const id = uuid();

    const group = await GroupsDataAccess.createGroup(
      {
        name,
        permissions,
        id
      },
      { transaction }
    );

    if (usersIds) {
      const { code } = await UsersGroupsDataAccess.addUsersToGroup(
        { groupId: id, usersIds },
        { transaction }
      );

      if (group && code) {
        await transaction.commit();

        res.json({ id });
        return next();
      }
    }

    await transaction.commit();
    res.status(201).json(group);
  } catch (error) {
    await transaction.rollback();

    next(error);
  }
};

export const updateGroup: RequestHandler = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      name,
      permissions,
      usersIds
    }: Omit<IGroup, 'id'> & { usersIds?: IUser['id'][] } = req.body;

    const id = req.params.id;

    if (!validate(id)) {
      next(new ApiError(CommonMessages.IncorrectId));
      return;
    }

    const currentGroup = await GroupsDataAccess.findGroupById(id);

    if (!currentGroup) {
      next(new ApiError(GroupMessages.NotFound));
      return;
    } else {
      const resultOfOperation = await GroupsDataAccess.updateGroup(
        {
          name,
          permissions,
          id
        },
        { transaction }
      );

      if (usersIds) {
        const { code } = await UsersGroupsDataAccess.addUsersToGroup(
          { groupId: id, usersIds },
          { transaction }
        );

        if (resultOfOperation && code) {
          await transaction.commit();

          res.json({ id });
          return next();
        }
      }

      if (resultOfOperation) {
        await transaction.commit();

        res.json({ id });
        return next();
      }

      next({ message: CommonMessages.Unexpected });
    }
  } catch (error) {
    await transaction.rollback();

    next(error);
  }
};

export const getGroupById: RequestHandler = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!validate(id)) {
      next(new ApiError(CommonMessages.IncorrectId));
      return;
    }

    const currentGroup = await GroupsDataAccess.findGroupById(id);

    if (!currentGroup) {
      next(new ApiError(GroupMessages.NotFound));
      return;
    } else {
      res.json(currentGroup);
      return next();
    }
  } catch (error) {
    next(error);
  }
};

export const deleteGroup: RequestHandler = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!validate(id)) {
      next(new ApiError(CommonMessages.IncorrectId));
      return;
    }

    const currentGroup = await GroupsDataAccess.findGroupById(id);

    if (!currentGroup) {
      next(new ApiError(GroupMessages.NotFound));
      return;
    } else {
      const resultOfOperation = await GroupsDataAccess.deleteGroup(id);
      if (resultOfOperation) {
        res.json({ message: GroupMessages.Deleted });
        return next();
      }

      next({ message: CommonMessages.Unexpected });
    }
  } catch (error) {
    next(error);
  }
};
