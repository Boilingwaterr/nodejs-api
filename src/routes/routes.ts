import express from 'express';
import { validateUser } from '@middlewares/validate-user.middleware';
import * as usersController from '@controllers/user.controller';
import * as groupsController from '@controllers/groups.controller';
import { validateGroup } from '@src/middlewares/validate-group.middleware';

export const router = express.Router();

// users
router.get('/users', usersController.getAllUsers);
router.post('/users', validateUser, usersController.createUser);
router.put('/users/:id', validateUser, usersController.updateUser);
router.get('/users/:id', usersController.getUserById);
router.delete('/users/:id', usersController.deleteUser);

// groups
router.get('/groups', groupsController.getAllGroups);
router.get('/groups/:id', groupsController.getGroupById);
router.post('/groups', validateGroup, groupsController.createGroup);
router.put('/groups/:id', validateGroup, groupsController.updateGroup);
router.delete('/groups/:id', groupsController.deleteGroup);
