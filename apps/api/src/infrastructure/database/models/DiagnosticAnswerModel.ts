import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional, type NonAttribute } from 'sequelize';
import { sequelize } from '../sequelize.js';
import type { EvaluationQuestionModel } from './EvaluationQuestionModel.js';

export class DiagnosticAnswerModel extends Model<
  InferAttributes<DiagnosticAnswerModel>,
  InferCreationAttributes<DiagnosticAnswerModel>
> {
  declare diagnosticRecordId: string;
  declare evaluationQuestionId: number;
  declare answerBoolean: CreationOptional<boolean | null>;
  declare score: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare question?: NonAttribute<EvaluationQuestionModel>;
}

DiagnosticAnswerModel.init(
  {
    diagnosticRecordId: {
      type: DataTypes.CHAR(36),
      primaryKey: true,
      field: 'id_diagnostic_record',
    },
    evaluationQuestionId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      field: 'id_evaluation_question',
    },
    answerBoolean: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'answer_boolean',
    },
    score: {
      type: DataTypes.STRING(10),
      allowNull: true,
      field: 'score',
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
    tableName: 'diagnostic_answers',
    modelName: 'DiagnosticAnswer',
  },
);
