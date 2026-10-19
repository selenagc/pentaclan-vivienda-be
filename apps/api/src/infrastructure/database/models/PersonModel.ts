import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional, type NonAttribute } from 'sequelize';
import { sequelize } from '../sequelize.js';
import type { DocumentIssuedIn } from '../../../domain/types/DocumentIssuedIn.js';
import type { Sex } from '../../../domain/types/Sex.js';

export class PersonModel extends Model<
  InferAttributes<PersonModel>,
  InferCreationAttributes<PersonModel>
> {
  declare id: CreationOptional<string>;
  declare documentNo: string;
  declare documentIssuedIn: DocumentIssuedIn;
  declare givenNames: string;
  declare paternalSurname: string;
  declare maternalSurname: string | null;
  declare phone: string | null;
  declare occupation: string | null;
  /** DATEONLY: Sequelize lo entrega como 'YYYY-MM-DD', no como Date. */
  declare birthDate: string;
  declare sex: Sex;
  declare spouseId: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date | null>;
  declare spouse?: NonAttribute<PersonModel>;
}

PersonModel.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      field: 'id_person',
    },
    // La unicidad la aporta el indice parcial people_document_uq.
    documentNo: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'document_no',
    },
    documentIssuedIn: {
      type: DataTypes.CHAR(2),
      allowNull: false,
      field: 'document_issued_in',
    },
    givenNames: {
      type: DataTypes.STRING(150),
      allowNull: false,
      field: 'given_names',
    },
    paternalSurname: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'paternal_surname',
    },
    maternalSurname: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'maternal_surname',
    },
    phone: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    occupation: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },
    birthDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'birth_date',
    },
    sex: {
      type: DataTypes.CHAR(1),
      allowNull: false,
    },
    // Auto-referencia: el conyuge es otra fila de esta misma tabla.
    spouseId: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      field: 'id_spouse',
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
    tableName: 'people',
    modelName: 'Person',
    paranoid: true,
  },
);
