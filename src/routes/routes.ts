import express from 'express';
import { validateUser } from '@src/middlewares/validate/validate-user.middleware';
import * as usersController from '@controllers/user.controller';
import * as groupsController from '@controllers/groups.controller';
import * as authenticateController from '@src/controllers/authenticate.controller';
import { validateGroup } from '@src/middlewares/validate/validate-group.middleware';
import { withLogger } from '@src/utils/logger.utils';

export const router = express.Router();

// users
router.get('/users', withLogger(usersController.getAllUsers));
router.post('/users', validateUser, withLogger(usersController.createUser));
router.put('/users/:id', validateUser, withLogger(usersController.updateUser));
router.get('/users/:id', withLogger(usersController.getUserById));
router.delete('/users/:id', withLogger(usersController.deleteUser));

// groups
router.get('/groups', withLogger(groupsController.getAllGroups));
router.get('/groups/:id', withLogger(groupsController.getGroupById));
router.post('/groups', validateGroup, withLogger(groupsController.createGroup));
router.put(
  '/groups/:id',
  validateGroup,
  withLogger(groupsController.updateGroup)
);
router.delete('/groups/:id', withLogger(groupsController.deleteGroup));

// authenticate
router.post('/authenticate', withLogger(authenticateController.authenticate));
