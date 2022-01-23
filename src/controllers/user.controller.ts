import { RequestHandler } from 'express';
import { v4 as uuid, validate } from 'uuid';
import { IUser } from '@src/models/user.model';
import * as UsersDataAccess from '@src/data-access/users.data-access';
import { CommonMessages } from '@controllers/common-messages';
import { ApiError } from '@src/utils/error.utils';

export enum UsersMessages {
  NotFound = 'User not found.',
  Deleted = 'User was deleted.'
}

export const getAllUsers: RequestHandler = async (
  { query: { loginSubstring, limit: clientLimit } },
  res,
  next
) => {
  try {
    let limit = 500;

    if (
      typeof clientLimit === 'string' &&
      !isNaN(Number(clientLimit)) &&
      Number(clientLimit) <= limit
    ) {
      limit = Number(clientLimit);
    }

    if (loginSubstring) {
      const suggestedUser = await UsersDataAccess.getSuggestUsers(
        loginSubstring as string | string[],
        limit
      );

      if (suggestedUser) {
        res.json(suggestedUser);
        return;
      }
    }

    const users = await UsersDataAccess.getAllUsers(limit);
    res.json(users);
    return next();
  } catch (error) {
    next(error);
  }
};

export const createUser: RequestHandler = async (req, res, next) => {
  try {
    const { login, password, age }: Omit<IUser, 'id'> = req.body;
    const id = uuid();

    const user = await UsersDataAccess.createUser({
      login,
      password,
      age,
      id,
      isDeleted: false
    });

    res.status(201).json(user);
    return next();
  } catch (error) {
    next(error);
  }
};

export const updateUser: RequestHandler = async (req, res, next) => {
  try {
    const { login, password, age }: Omit<IUser, 'id'> = req.body;
    const id = req.params.id;

    if (!validate(id)) {
      next(new ApiError(CommonMessages.IncorrectId));
      return;
    }

    const currentUser = await UsersDataAccess.findUserById(id);

    if (!currentUser || currentUser.isDeleted) {
      next(new ApiError(UsersMessages.NotFound));
      return;
    } else {
      const resultOfOperation = await UsersDataAccess.updateUser({
        login,
        password,
        age,
        id
      });

      if (resultOfOperation) {
        res.json({ id });
        return next();
      }

      next({ message: CommonMessages.Unexpected });
    }
  } catch (error) {
    next(error);
  }
};

export const getUserById: RequestHandler = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!validate(id)) {
      next(new ApiError(CommonMessages.IncorrectId));
      return;
    }

    const currentUser = await UsersDataAccess.findUserById(id);

    if (!currentUser || currentUser.isDeleted) {
      next(new ApiError(UsersMessages.NotFound));
      return;
    } else {
      res.json(currentUser);
      return next();
    }
  } catch (error) {
    next(error);
  }
};

export const deleteUser: RequestHandler = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!validate(id)) {
      next(new ApiError(CommonMessages.IncorrectId));
      return;
    }

    const currentUser = await UsersDataAccess.findUserById(id);

    if (!currentUser || currentUser.isDeleted) {
      next(new ApiError(UsersMessages.NotFound));
      return;
    } else {
      const resultOfOperation = await UsersDataAccess.deleteUser(id);
      if (resultOfOperation) {
        res.json({ message: UsersMessages.Deleted });
        return next();
      }

      next({ message: CommonMessages.Unexpected });
    }
  } catch (error) {
    next(error);
  }
};
