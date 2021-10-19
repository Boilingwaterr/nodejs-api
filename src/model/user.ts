import { v4 as uuid, v4 } from 'uuid';

export interface UserData {
  id: ReturnType<typeof v4>;
  login: string;
  password: string;
  age: number;
  isDeleted: boolean;
}

export const users: UserData[] = [];

export const getAllUser = (): Promise<UserData[]> => Promise.resolve(users);

export const getUserById = (
  id: UserData['id']
): Promise<UserData | undefined> =>
  Promise.resolve(users.find((user) => user.id === id));

export const createUser = ({
  login,
  password,
  age
}: Pick<UserData, 'login' | 'password' | 'age'>): Promise<UserData> => {
  const id = uuid();
  const user = { login, password, age, id, isDeleted: false };
  users.push(user);

  return Promise.resolve(user);
};

export const updateUser = (
  currentUser: UserData,
  patch: Omit<UserData, 'id' | 'isDeleted'>
): Promise<UserData> => {
  currentUser.login = patch.login;
  currentUser.password = patch.password;
  currentUser.age = patch.age;

  return Promise.resolve(currentUser);
};

export const deleteUser = (currentUser: UserData): Promise<UserData> => {
  currentUser.isDeleted = true;

  return Promise.resolve(currentUser);
};
