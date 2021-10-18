import { v4 as uuid, v4 } from 'uuid'

export interface IUser {
    id: ReturnType<typeof v4>;
    login: string;
    password: string;
    age: number;
    isDeleted: boolean;
}

export const users: IUser[] = []

export const createUser = ({ login, password, age }: Pick<IUser, 'login' | 'password' | 'age' >):IUser => {
  const id = uuid()
  const user = { login, password, age, id, isDeleted: false }
  users.push(user)
  return user
}

export const updateUser = (currentUser: IUser, patch:Omit<IUser, 'id'|'isDeleted'>):IUser => {
  currentUser.login = patch.login
  currentUser.password = patch.password
  currentUser.age = patch.age

  return currentUser
}

export const deleteUser = (currentUser: IUser):IUser => {
  currentUser.isDeleted = true

  return currentUser
}
