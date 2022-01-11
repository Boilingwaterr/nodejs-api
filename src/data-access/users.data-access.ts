import { Users } from '@src/models/users.model';
import { IUser } from '@models/users.model';
import { throwDataBaseError } from '@src/utils/has-error-message.utils';
import { Op } from 'sequelize';

export const findUserById = async (id: IUser['id']) => {
  try {
    const user = await Users.findByPk(id);

    return user;
  } catch (error) {
    throwDataBaseError(error);
  }
};

export const createUser = async (user: IUser) => {
  try {
    const userInstance = await Users.create(user);

    return userInstance;
  } catch (error) {
    throwDataBaseError(error);
  }
};

export const updateUser = async ({
  login,
  password,
  age,
  id
}: Partial<IUser>) => {
  try {
    const [resultOfOperation] = await Users.update(
      { login, password, age },
      { where: { id } }
    );

    return resultOfOperation;
  } catch (error) {
    throwDataBaseError(error);
  }
};

export const deleteUser = async (id: IUser['id']) => {
  try {
    const [resultOfOperation] = await Users.update(
      { isDeleted: true },
      {
        where: {
          id
        }
      }
    );
    return resultOfOperation;
  } catch (error) {
    throwDataBaseError(error);
  }
};

export const getAllUsers = async (limit: number) => {
  try {
    const users = await Users.findAll({ limit, where: { isDeleted: false } });

    return users;
  } catch (error) {
    throwDataBaseError(error);
  }
};

export const getSuggestUsers = async (
  login: string | string[],
  limit: number
) => {
  try {
    if (typeof login === 'string') {
      const suggestedUser = await Users.findAll({
        limit,
        where: {
          [Op.and]: [
            { login: { [Op.like]: `%${login}%` } },
            { isDeleted: false }
          ]
        }
      });

      return suggestedUser;
    } else if (Array.isArray(login)) {
      const suggestedUsers = await Users.findAll({
        limit,
        where: {
          [Op.and]: [
            {
              login: {
                [Op.or]: login.map((substring) => ({
                  [Op.like]: `%${substring}%`
                }))
              }
            },
            { isDeleted: false }
          ]
        }
      });

      return suggestedUsers;
    }
  } catch (error) {
    throwDataBaseError(error);
  }
};
