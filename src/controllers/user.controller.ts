import { RequestHandler } from 'express';
import { v4 as uuid, validate } from 'uuid';
import { Users, IUser } from '@models/users.model';
import { Op } from 'sequelize';

export enum Messages {
  NotFound = 'User not found.',
  Deleted = 'User was deleted.'
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

    if (typeof loginSubstring === 'string') {
      const suggestedUser = await Users.findAll({
        limit,
        where: {
          [Op.and]: [
            { login: { [Op.like]: `%${loginSubstring}%` } },
            { isDeleted: false }
          ]
        }
      });

      return res.json(suggestedUser);
    } else if (Array.isArray(loginSubstring)) {
      const suggestedUsers = await Users.findAll({
        limit,
        where: {
          [Op.and]: [
            {
              login: {
                [Op.or]: loginSubstring.map((substring) => ({
                  [Op.like]: `%${substring}%`
                }))
              }
            },
            { isDeleted: false }
          ]
        }
      });

      return res.json(suggestedUsers);
    }

    const users = await Users.findAll({ limit, where: { isDeleted: false } });
    res.json(users);
  } catch (error) {
    res.status(500);
  }
};

export const createUser: RequestHandler = async (req, res) => {
  try {
    const { login, password, age }: Omit<IUser, 'id'> = req.body;
    const id = uuid();

    const user = await Users.create({
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

export const updateUser: RequestHandler = async (req, res) => {
  try {
    const { login, password, age }: Omit<IUser, 'id'> = req.body;
    const id = req.params.id;

    if (!validate(id)) {
      return res.status(400).json({ message: 'Incorrect type of id.' });
    }

    const currentUser = await Users.findByPk(id);

    if (!currentUser || currentUser.isDeleted) {
      return res.status(404).json({ message: Messages.NotFound });
    } else {
      await Users.update(
        { login, password, age },
        {
          where: {
            id
          }
        }
      );

      res.json({ id });
    }
  } catch (error) {
    res.status(500);
  }
};

export const getUserById: RequestHandler = async (req, res) => {
  try {
    if (!validate(req.params.id)) {
      return res.status(400).json({ message: 'Incorrect type of id.' });
    }

    const currentUser = await Users.findByPk(req.params.id);

    if (!currentUser || currentUser.isDeleted) {
      res.status(404).json({ message: Messages.NotFound });
    } else {
      return res.json(currentUser);
    }
  } catch (error) {
    res.status(500);
  }
};

export const deleteUser: RequestHandler = async (req, res) => {
  try {
    const id = req.params.id;

    if (!validate(id)) {
      return res.status(400).json({ message: 'Incorrect type of id.' });
    }

    const currentUser = await Users.findByPk(id);

    if (!currentUser || currentUser.isDeleted) {
      return res.status(404).json({ message: Messages.NotFound });
    } else {
      await Users.update(
        { isDeleted: true },
        {
          where: {
            id
          }
        }
      );

      res.json({ message: Messages.Deleted });
    }
  } catch (error) {
    res.status(500);
  }
};
