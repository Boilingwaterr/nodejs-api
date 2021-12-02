import { DataTypes, Model } from 'sequelize';
import sequelize from '@src/db';
import { v4 } from 'uuid';

export enum Permissions {
  READ = 'READ',
  WRITE = 'WRITE',
  DELETE = 'DELETE',
  SHARE = 'SHARE',
  UPLOAD_FILES = 'UPLOAD_FILES'
}

export interface IGroup {
  id: ReturnType<typeof v4>;
  name: string;
  permissions: Permissions[];
}

export interface GroupModel extends Model<IGroup>, IGroup {}
export const Group = sequelize.define<GroupModel>(
  'Group',
  {
    id: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    permissions: {
      type: DataTypes.ARRAY(DataTypes.STRING()),
      // type: DataTypes.ENUM(
      //   Permissions.READ,
      //   Permissions.WRITE,
      //   Permissions.DELETE,
      //   Permissions.SHARE,
      //   Permissions.UPLOAD_FILES
      // ),
      allowNull: false
    }
  },
  {
    timestamps: false,
    tableName: 'Group'
  }
);
