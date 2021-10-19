import { RequestHandler } from 'express-serve-static-core';
import { UserData, users } from '../model/user';

const findUserByLogin = (login: string) =>
  users
    .filter((user) => user.login.startsWith(login))
    .sort((a, b) => {
      if (a.login < b.login) {
        return -1;
      }
      if (a.login > b.login) {
        return 1;
      }
      return 0;
    });

const findUsersByLogin = (loginSubstring: string[]) =>
  loginSubstring.reduce((users: UserData[], query: string) => {
    const _suggestUsers = findUserByLogin(query);
    return [...users, ..._suggestUsers];
  }, []);

export const getAutoSuggestUsers: RequestHandler = (
  { query: { loginSubstring } },
  res,
  next
) => {
  if (typeof loginSubstring === 'string') {
    const suggestUsers = findUserByLogin(loginSubstring);

    res.json(suggestUsers);
  } else if (Array.isArray(loginSubstring)) {
    const suggestUsers = findUsersByLogin(loginSubstring.map(String));

    res.json(suggestUsers);
  } else {
    next();
  }
};
