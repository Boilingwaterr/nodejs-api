import { RequestHandler } from 'express';
import { v4 as uuid, validate } from 'uuid';
import { IUser } from '@models/users.model';
import * as UsersDataAccess from '@src/data-access/users.data-access';

export enum Messages {
  NotFound = 'User not found.',
  Deleted = 'User was deleted.',
  IncorrectId = 'Incorrect type of id.',
  Unexpected = 'Something went wrong.'
}

export const getAllUsers: RequestHandler = async (
  { query: { loginSubstring, limit: clientLimit } },
  res
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

    const suggestedUser = await UsersDataAccess.getSuggestUsers(
      loginSubstring as string | string[],
      limit
    );

    if (suggestedUser) {
      return res.json(suggestedUser);
    }

    const users = await UsersDataAccess.getAllUsers(limit);
    res.json(users);
  } catch (error) {
    res.status(500);
  }
};

export const createUser: RequestHandler = async (req, res) => {
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
  } catch (error) {
    res.status(500);
  }
};

export const updateUser: RequestHandler = async (req, res, next) => {
  try {
    const { login, password, age }: Omit<IUser, 'id'> = req.body;
    const id = req.params.id;

    if (!validate(id)) {
      return res.status(400).json({ message: Messages.IncorrectId });
    }

    const currentUser = await UsersDataAccess.findUserById(id);

    if (!currentUser || currentUser.isDeleted) {
      return res.status(404).json({ message: Messages.NotFound });
    } else {
      const resultOfOperation = await UsersDataAccess.updateUser({
        login,
        password,
        age,
        id
      });

      if (resultOfOperation) {
        return res.json({ id });
      }

      next(Messages.Unexpected);
    }
  } catch (error) {
    res.status(500);
  }
};

export const getUserById: RequestHandler = async (req, res) => {
  try {
    const id = req.params.id;

    if (!validate(id)) {
      return res.status(400).json({ message: Messages.IncorrectId });
    }

    const currentUser = await UsersDataAccess.findUserById(id);

    if (!currentUser || currentUser.isDeleted) {
      res.status(404).json({ message: Messages.NotFound });
    } else {
      return res.json(currentUser);
    }
  } catch (error) {
    res.status(500);
  }
};

export const deleteUser: RequestHandler = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!validate(id)) {
      return res.status(400).json({ message: Messages.IncorrectId });
    }

    const currentUser = await UsersDataAccess.findUserById(id);

    if (!currentUser || currentUser.isDeleted) {
      return res.status(404).json({ message: Messages.NotFound });
    } else {
      const resultOfOperation = await UsersDataAccess.deleteUser(id);
      if (resultOfOperation) {
        return res.json({ message: Messages.Deleted });
      }

      next(Messages.Unexpected);
    }
  } catch (error) {
    res.status(500);
  }
};
