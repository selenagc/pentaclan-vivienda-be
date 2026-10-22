import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional } from 'sequelize';
import { sequelize } from '../sequelize.js';

export class EvaluationQuestionModel extends Model<
  InferAttributes<EvaluationQuestionModel>,
  InferCreationAttributes<EvaluationQuestionModel>
> {
  declare id: CreationOptional<number>;
  declare questionText: string;
  declare category: CreationOptional<string | null>;
  declare active: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

EvaluationQuestionModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_evaluation_question',
    },
    questionText: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'question_text',
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'category',
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'active',
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
  },
  {
    sequelize,
    tableName: 'evaluation_questions',
    modelName: 'EvaluationQuestion',
  },
);
