import { DataTypes, Model } from 'sequelize';
import sequelize from '@src/db';
import { v4 } from 'uuid';

export interface IUser {
  id: ReturnType<typeof v4>;
  login: string;
  password: string;
  age: number;
  isDeleted: boolean;
}

export interface UsersModel extends Model<IUser>, IUser {}
export const Users = sequelize.define<UsersModel>(
  'Users',
  {
    id: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
    login: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    age: { type: DataTypes.INTEGER, allowNull: false },
    isDeleted: { type: DataTypes.BOOLEAN, allowNull: false }
  },
  {
    timestamps: false
  }
);
