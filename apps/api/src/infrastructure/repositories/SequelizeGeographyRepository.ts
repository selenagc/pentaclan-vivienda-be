import { DepartmentModel } from '../database/models/DepartmentModel.js';
import { ProvinceModel } from '../database/models/ProvinceModel.js';
import { MunicipalityModel } from '../database/models/MunicipalityModel.js';
import type { Department } from '../../domain/entities/Department.js';
import type { Province } from '../../domain/entities/Province.js';
import type { Municipality } from '../../domain/entities/Municipality.js';
import type { GeographyRepository } from '../../domain/repositories/GeographyRepository.js';

function toDepartment(model: DepartmentModel): Department {
  return { id: model.id, name: model.name };
}

function toProvince(model: ProvinceModel): Province {
  return { id: model.id, name: model.name, departmentId: model.departmentId };
}

function toMunicipality(model: MunicipalityModel): Municipality {
  return { id: model.id, name: model.name, provinceId: model.provinceId };
}

export class SequelizeGeographyRepository implements GeographyRepository {
  async listDepartments(): Promise<Department[]> {
    const rows = await DepartmentModel.findAll({ order: [['name', 'ASC']] });
    return rows.map(toDepartment);
  }

  async departmentExists(id: number): Promise<boolean> {
    return (await DepartmentModel.count({ where: { id } })) > 0;
  }

  async listProvincesByDepartment(departmentId: number): Promise<Province[]> {
    const rows = await ProvinceModel.findAll({
      where: { departmentId },
      order: [['name', 'ASC']],
    });
    return rows.map(toProvince);
  }

  async provinceExists(id: number): Promise<boolean> {
    return (await ProvinceModel.count({ where: { id } })) > 0;
  }

  async listMunicipalitiesByProvince(provinceId: number): Promise<Municipality[]> {
    const rows = await MunicipalityModel.findAll({
      where: { provinceId },
      order: [['name', 'ASC']],
    });
    return rows.map(toMunicipality);
  }

  async municipalityExists(id: number): Promise<boolean> {
    return (await MunicipalityModel.count({ where: { id } })) > 0;
  }
}
