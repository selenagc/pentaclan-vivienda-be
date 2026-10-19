import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional, type NonAttribute } from 'sequelize';
import { sequelize } from '../sequelize.js';
import type { MunicipalityModel } from './MunicipalityModel.js';

export class PropertyModel extends Model<
  InferAttributes<PropertyModel>,
  InferCreationAttributes<PropertyModel>
> {
  declare id: CreationOptional<string>;
  declare community: string | null;
  declare zone: string | null;
  declare address: string | null;
  /**
   * Declaradas como number porque es lo que se escribe, pero el driver de
   * Postgres devuelve DECIMAL como string para no perder precision. Quien lea
   * estos campos tiene que pasarlos por Number(); lo hace el mapper del
   * repositorio.
   */
  declare latitude: number;
  declare longitude: number;
  declare municipalityId: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date | null>;
  declare municipality?: NonAttribute<MunicipalityModel>;
}

PropertyModel.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      field: 'id_property',
    },
    community: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    zone: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING(250),
      allowNull: true,
    },
    latitude: {
      type: DataTypes.DECIMAL(9, 6),
      allowNull: false,
    },
    longitude: {
      type: DataTypes.DECIMAL(9, 6),
      allowNull: false,
    },
    municipalityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'id_municipality',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at',
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'deleted_at',
    },
  },
  {
    sequelize,
    tableName: 'properties',
    modelName: 'Property',
    paranoid: true,
  },
);
