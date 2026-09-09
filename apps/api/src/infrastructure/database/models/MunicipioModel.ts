import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional } from 'sequelize';
import { sequelize } from '../sequelize.js';

export class MunicipioModel extends Model<
  InferAttributes<MunicipioModel>,
  InferCreationAttributes<MunicipioModel>
> {
  declare id: CreationOptional<number>;
  declare nombre: string;
  declare provinciaId: number;
}

MunicipioModel.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_municipio',
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'nombre_municipio',
    },
    provinciaId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'id_provincia',
    },
  },
  {
    sequelize,
    tableName: 'municipios',
    modelName: 'Municipio',
    timestamps: false,
  },
);
