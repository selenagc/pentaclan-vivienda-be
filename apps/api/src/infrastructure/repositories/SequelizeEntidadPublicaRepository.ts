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
    departamentoId: model.departamentoId,
  };
}

// Todas las entidades comparten nombre, asi que el orden util es por
// departamento y, dentro de el, por sigla.
const ORDEN: [string, string][] = [
  ['departamentoId', 'ASC'],
  ['sigla', 'ASC'],
];

export class SequelizeEntidadPublicaRepository implements EntidadPublicaRepository {
  async list(): Promise<EntidadPublica[]> {
    const rows = await EntidadPublicaModel.findAll({ order: ORDEN });
    return rows.map(toEntidadPublica);
  }

  async findById(id: number): Promise<EntidadPublica | null> {
    const row = await EntidadPublicaModel.findByPk(id);
    return row ? toEntidadPublica(row) : null;
  }

  async listByDepartamento(departamentoId: number): Promise<EntidadPublica[]> {
    const rows = await EntidadPublicaModel.findAll({
      where: { departamentoId },
      order: ORDEN,
    });
    return rows.map(toEntidadPublica);
  }
}
