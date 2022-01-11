import { DataTypes, Model } from 'sequelize';
import sequelize from '@src/db';
import { v4 } from 'uuid';
import { User } from '@src/models/user.model';
import { Group } from '@src/models/group.model';

export interface IUserGroup {
  userId: ReturnType<typeof v4>;
  groupId: ReturnType<typeof v4>;
}

export interface UserGroupModel extends Model<IUserGroup>, IUserGroup {}
export const UserGroup = sequelize.define<UserGroupModel>(
  'User_Group',
  {
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id'
      }
    },
    groupId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Group,
        key: 'id'
      }
    }
  },
  { tableName: 'User_Group', timestamps: false }
);

Group.belongsToMany(User, {
  through: UserGroup,
  foreignKey: 'groupId'
});
User.belongsToMany(Group, {
  through: UserGroup,
  foreignKey: 'userId'
});
