import { DepartamentoModel } from '../database/models/DepartamentoModel.js';
import { ProvinciaModel } from '../database/models/ProvinciaModel.js';
import { MunicipioModel } from '../database/models/MunicipioModel.js';
import type { Departamento } from '../../domain/entities/Departamento.js';
import type { Provincia } from '../../domain/entities/Provincia.js';
import type { Municipio } from '../../domain/entities/Municipio.js';
import type { GeografiaRepository } from '../../domain/repositories/GeografiaRepository.js';

function toDepartamento(model: DepartamentoModel): Departamento {
  return { id: model.id, nombre: model.nombre };
}

function toProvincia(model: ProvinciaModel): Provincia {
  return { id: model.id, nombre: model.nombre, departamentoId: model.departamentoId };
}

function toMunicipio(model: MunicipioModel): Municipio {
  return { id: model.id, nombre: model.nombre, provinciaId: model.provinciaId };
}

export class SequelizeGeografiaRepository implements GeografiaRepository {
  async listDepartamentos(): Promise<Departamento[]> {
    const rows = await DepartamentoModel.findAll({ order: [['nombre', 'ASC']] });
    return rows.map(toDepartamento);
  }

  async departamentoExists(id: number): Promise<boolean> {
    return (await DepartamentoModel.count({ where: { id } })) > 0;
  }

  async listProvinciasByDepartamento(departamentoId: number): Promise<Provincia[]> {
    const rows = await ProvinciaModel.findAll({
      where: { departamentoId },
      order: [['nombre', 'ASC']],
    });
    return rows.map(toProvincia);
  }

  async provinciaExists(id: number): Promise<boolean> {
    return (await ProvinciaModel.count({ where: { id } })) > 0;
  }

  async listMunicipiosByProvincia(provinciaId: number): Promise<Municipio[]> {
    const rows = await MunicipioModel.findAll({
      where: { provinciaId },
      order: [['nombre', 'ASC']],
    });
    return rows.map(toMunicipio);
  }

  async municipioExists(id: number): Promise<boolean> {
    return (await MunicipioModel.count({ where: { id } })) > 0;
  }
}
