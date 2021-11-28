import { RequestHandler } from 'express';
import { v4 as uuid, validate } from 'uuid';
import * as GroupsDataAccess from '@src/data-access/groups.data-access';
import { IGroup } from '@src/models/group.model';
import { CommonMessages } from '@controllers/common-messages';

export enum GroupMessages {
  NotFound = 'Group not found.',
  Deleted = 'Group was deleted.'
}

export const getAllGroups: RequestHandler = async (_req, res) => {
  try {
    const groups = await GroupsDataAccess.getAllGroups();
    res.json(groups);
  } catch (error) {
    res.status(500);
  }
};

export const createGroup: RequestHandler = async (req, res) => {
  try {
    const { name, permissions }: Omit<IGroup, 'id'> = req.body;
    const id = uuid();

    const group = await GroupsDataAccess.createGroup({
      name,
      permissions,
      id
    });

    res.status(201).json(group);
  } catch (error) {
    res.status(500);
  }
};

export const updateGroup: RequestHandler = async (req, res, next) => {
  try {
    const { name, permissions }: Omit<IGroup, 'id'> = req.body;
    const id = req.params.id;

    if (!validate(id)) {
      return res.status(400).json({ message: CommonMessages.IncorrectId });
    }

    const currentGroup = await GroupsDataAccess.findGroupById(id);

    if (!currentGroup) {
      return res.status(404).json({ message: GroupMessages.NotFound });
    } else {
      const resultOfOperation = await GroupsDataAccess.updateGroup({
        name,
        permissions,
        id
      });

      if (resultOfOperation) {
        return res.json({ id });
      }

      next(CommonMessages.Unexpected);
    }
  } catch (error) {
    res.status(500);
  }
};

export const getGroupById: RequestHandler = async (req, res) => {
  try {
    const id = req.params.id;

    if (!validate(id)) {
      return res.status(400).json({ message: CommonMessages.IncorrectId });
    }

    const currentGroup = await GroupsDataAccess.findGroupById(id);

    if (!currentGroup) {
      res.status(404).json({ message: GroupMessages.NotFound });
    } else {
      return res.json(currentGroup);
    }
  } catch (error) {
    res.status(500);
  }
};

export const deleteGroup: RequestHandler = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!validate(id)) {
      return res.status(400).json({ message: CommonMessages.IncorrectId });
    }

    const currentGroup = await GroupsDataAccess.findGroupById(id);

    if (!currentGroup) {
      return res.status(404).json({ message: GroupMessages.NotFound });
    } else {
      const resultOfOperation = await GroupsDataAccess.deleteGroup(id);
      if (resultOfOperation) {
        return res.json({ message: GroupMessages.Deleted });
      }

      next(CommonMessages.Unexpected);
    }
  } catch (error) {
    res.status(500);
  }
};
