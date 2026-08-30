import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional } from 'sequelize';
import { sequelize } from '../sequelize.js';

export class PublicEntityModel extends Model<
  InferAttributes<PublicEntityModel>,
  InferCreationAttributes<PublicEntityModel>
> {
  declare id: CreationOptional<number>;
  // BIGINT: el driver pg lo devuelve como string en runtime, el mapper del
  // repositorio lo normaliza a number antes de salir del dominio.
  declare taxId: number;
  declare name: string;
  declare acronym: string;
}

PublicEntityModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_public_entity',
    },
    taxId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      unique: true,
      field: 'tax_id',
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'entity_name',
    },
    acronym: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'acronym',
    },
  },
  {
    sequelize,
    tableName: 'public_entities',
    modelName: 'PublicEntity',
    // Datos maestros: la tabla no lleva created_at / updated_at.
    timestamps: false,
  },
);
