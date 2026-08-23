import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional } from 'sequelize';
import { sequelize } from '../sequelize.js';

export class EntidadPublicaModel extends Model<
  InferAttributes<EntidadPublicaModel>,
  InferCreationAttributes<EntidadPublicaModel>
> {
  declare id: CreationOptional<number>;
  // BIGINT: mysql2 lo devuelve como string en runtime, el mapper del
  // repositorio lo normaliza a number antes de salir del dominio.
  declare nit: number;
  declare nombre: string;
  declare sigla: string;
}

EntidadPublicaModel.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_entidad_publica',
    },
    nit: {
      type: DataTypes.BIGINT,
      allowNull: false,
      unique: true,
      field: 'nit',
    },
    nombre: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'nombre_entidad',
    },
    sigla: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'sigla',
    },
  },
  {
    sequelize,
    tableName: 'entidades_publicas',
    modelName: 'EntidadPublica',
    // Datos maestros: la tabla no lleva created_at / updated_at.
    timestamps: false,
  },
);
