import { Group, IGroup } from '@src/models/group.model';

export const findGroupById = async (id: IGroup['id']) => Group.findByPk(id);

export const createGroup = async (group: IGroup) => Group.create(group);

export const updateGroup = async ({
  permissions,
  name,
  id
}: Partial<IGroup>) => {
  const [resultOfOperation] = await Group.update(
    { permissions, name },
    { where: { id } }
  );

  return resultOfOperation;
};

export const deleteGroup = async (id: IGroup['id']) =>
  Group.destroy({
    where: {
      id
    }
  });

export const getAllGroups = async () => Group.findAll();
