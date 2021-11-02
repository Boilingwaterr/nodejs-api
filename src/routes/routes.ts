import express from 'express';
import { validateUser } from '../middlewares/validateUser';
import * as usersController from '../controllers/user.controller';

export const router = express.Router();

router.get('/users', usersController.getAllUsers);
router.post('/users', validateUser, usersController.createUser);
router.put('/users/:id', validateUser, usersController.updateUser);
router.get('/users/:id', usersController.getUserById);
router.delete('/users/:id', usersController.deleteUser);
