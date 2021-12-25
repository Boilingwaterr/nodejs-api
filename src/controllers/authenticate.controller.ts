import { findUserByLogin } from '@src/data-access/users.data-access';
import { IUser } from '@src/models/user.model';
import { UnauthorizedError } from '@src/utils/error.utils';
import { RequestHandler } from 'express';
import { sign } from 'jsonwebtoken';

export enum AuthenticateMessages {
  NotFound = 'This combination of password and login is not registered in the system.',
  Failed = 'Enter login and password.'
}

declare const process: {
  env: {
    SECRET: string;
  };
};

export const authenticate: RequestHandler = async (req, res, next) => {
  try {
    const { login, password }: Omit<IUser, 'id'> = req.body;

    if (login && password) {
      const currentUser = await findUserByLogin(login);

      if (
        !currentUser ||
        currentUser.isDeleted ||
        currentUser.password !== password
      ) {
        next(new UnauthorizedError(AuthenticateMessages.NotFound));
        return;
      }

      const token = sign(
        { login: currentUser.login, id: currentUser.id },
        process.env.SECRET,
        {
          expiresIn: '5m'
        }
      );

      res.json({ token });
      next();
      return;
    }

    next(new UnauthorizedError(AuthenticateMessages.Failed));
  } catch (error) {
    next(error);
  }
};
