import { Group, IGroup } from '@src/models/group.model';
import { Transaction } from 'sequelize/types';

export const findGroupById = async (id: IGroup['id']) =>
  await Group.findByPk(id);

export const createGroup = async (
  group: IGroup,
  options?: { transaction: Transaction }
) => await Group.create(group, options);

export const updateGroup = async (
  { permissions, name, id }: Partial<IGroup>,
  options?: { transaction: Transaction }
) => {
  const [resultOfOperation] = await Group.update(
    { permissions, name },
    { where: { id }, transaction: options?.transaction }
  );

  return resultOfOperation;
};

export const deleteGroup = async (id: IGroup['id']) =>
  await Group.destroy({
    where: {
      id
    }
  });

export const getAllGroups = async () => await Group.findAll();
