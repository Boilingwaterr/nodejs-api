import express from 'express';
import {
  createUser,
  deleteUser,
  getUserById,
  getAllUser,
  UserData,
  updateUser
} from '../model/user';
import { getAutoSuggestUsers } from '../middlewares/get-auto-suggest-users';
import { validateUser } from '../middlewares/validateUser';

export const router = express.Router();

export enum Messages {
  NotFound = 'User not found.',
  Deleted = 'User was deleted.'
}

router.get('/users', getAutoSuggestUsers, async (_, res) => {
  try {
    const users = await getAllUser();
    res.json(users);
  } catch (error) {
    res.status(500);
  }
});

router.get('/users/:id', async (req, res) => {
  try {
    const currentUser = await getUserById(req.params.id);

    if (!currentUser || currentUser.isDeleted) {
      res.status(404).json({ message: Messages.NotFound });
    } else {
      res.json(currentUser);
    }
  } catch (error) {
    res.status(500);
  }
});

router.post('/users', validateUser, async (req, res) => {
  const { login, password, age }: Omit<UserData, 'id'> = req.body;
  try {
    const user = await createUser({ login, password, age });

    res.status(201).json({ id: user.id });
  } catch (error) {
    res.status(500);
  }
});

router.put('/users/:id', validateUser, async (req, res) => {
  try {
    const { login, password, age }: Omit<UserData, 'id'> = req.body;

    const currentUser = await getUserById(req.params.id);

    if (!currentUser || currentUser.isDeleted) {
      res.status(404).json({ message: Messages.NotFound });
    } else {
      const result = await updateUser(currentUser, { login, password, age });

      res.json(result);
    }
  } catch (error) {
    res.status(500);
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const currentUser = await getUserById(req.params.id);

    if (!currentUser || currentUser.isDeleted) {
      res.status(404).json({ message: Messages.NotFound });
    } else {
      await deleteUser(currentUser);

      res.json({ message: Messages.Deleted });
    }
  } catch (error) {
    res.status(500);
  }
});
