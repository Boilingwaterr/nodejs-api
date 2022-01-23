import { User } from '@src/models/user.model';
import { IUser } from '@src/models/user.model';
import { Op } from 'sequelize';

export const findUserById = async (id: IUser['id']) => await User.findByPk(id);

export const findUserByLogin = async (login: IUser['login']) =>
  await User.findOne({ where: { login } });

export const createUser = async (user: IUser) => await User.create(user);

export const updateUser = async ({
  login,
  password,
  age,
  id
}: Partial<IUser>) => {
  const [resultOfOperation] = await User.update(
    { login, password, age },
    { where: { id } }
  );

  return resultOfOperation;
};

export const deleteUser = async (id: IUser['id']) => {
  const [resultOfOperation] = await User.update(
    { isDeleted: true },
    {
      where: {
        id
      }
    }
  );
  return resultOfOperation;
};

export const getAllUsers = async (limit: number) =>
  await User.findAll({ limit, where: { isDeleted: false } });

export const getSuggestUsers = async (
  login: string | string[],
  limit: number
) => {
  if (typeof login === 'string') {
    const suggestedUser = await User.findAll({
      limit,
      where: {
        [Op.and]: [{ login: { [Op.like]: `%${login}%` } }, { isDeleted: false }]
      }
    });

    return suggestedUser;
  } else if (Array.isArray(login)) {
    const suggestedUsers = await User.findAll({
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
};
