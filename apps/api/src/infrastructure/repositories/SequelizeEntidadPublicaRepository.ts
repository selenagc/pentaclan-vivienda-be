import { EntidadPublicaModel } from '../database/models/EntidadPublicaModel.js';
import type { EntidadPublica } from '../../domain/entities/EntidadPublica.js';
import type { EntidadPublicaRepository } from '../../domain/repositories/EntidadPublicaRepository.js';

function toEntidadPublica(model: EntidadPublicaModel): EntidadPublica {
  return {
    id: model.id,
    // mysql2 devuelve BIGINT como string; el NIT cabe de sobra en un number.
    nit: Number(model.nit),
    nombre: model.nombre,
    sigla: model.sigla,
  };
}

const ORDEN: [string, string][] = [['sigla', 'ASC']];

export class SequelizeEntidadPublicaRepository implements EntidadPublicaRepository {
  async list(): Promise<EntidadPublica[]> {
    const rows = await EntidadPublicaModel.findAll({ order: ORDEN });
    return rows.map(toEntidadPublica);
  }

  async findById(id: number): Promise<EntidadPublica | null> {
    const row = await EntidadPublicaModel.findByPk(id);
    return row ? toEntidadPublica(row) : null;
  }
}
