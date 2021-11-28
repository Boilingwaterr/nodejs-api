import { RequestHandler } from 'express-serve-static-core';
import { UserData, users } from '../model/user';

const findUserByLogin = (login: string) =>
  users
    .filter((user) => user.login.includes(login))
    .sort((a, b) => {
      if (a.login < b.login) {
        return -1;
      }
      if (a.login > b.login) {
        return 1;
      }
      return 0;
    });

const findUserByCollectionLogins = (loginSubstring: string[]) =>
  loginSubstring.reduce((users: UserData[], query: string) => {
    const _suggestUsers = findUserByLogin(query);
    return [...users, ..._suggestUsers];
  }, []);

export const getSuggestUsers: (serverLimit: number) => RequestHandler =
  (serverLimit: number) =>
  ({ query: { loginSubstring, limit: clientLimit } }, res, next) => {
    let limit = serverLimit;

    if (
      typeof clientLimit === 'string' &&
      !isNaN(Number(clientLimit)) &&
      Number(clientLimit) <= serverLimit
    ) {
      limit = Number(clientLimit);
    }

    if (typeof loginSubstring === 'string') {
      const suggestUsers = findUserByLogin(loginSubstring).slice(0, limit);

      res.json(suggestUsers);
    } else if (Array.isArray(loginSubstring)) {
      const suggestUsers = findUserByCollectionLogins(
        loginSubstring.map(String)
      ).slice(0, limit);
      res.json(suggestUsers);
    } else {
      next();
    }
  };
