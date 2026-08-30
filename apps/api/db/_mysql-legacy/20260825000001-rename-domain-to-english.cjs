'use strict';

/**
 * Unificacion de nomenclatura a ingles (PV-16 / PV-19 / PV-21).
 *
 * Los modulos de geografia, entidades publicas y proyectos se crearon en
 * espanol; el resto del sistema (users, auth) esta en ingles. Esta migracion
 * lleva el esquema a un solo idioma. Los datos se conservan: son RENAME, no
 * DROP + CREATE.
 *
 * Las migraciones originales NO se editan: ya estan registradas en
 * sequelizemeta. El esquema ya aplicado se cambia con una migracion nueva.
 *
 * POR QUE ESTE ORDEN (importa, y depende del motor):
 * el entorno corre MariaDB 10.4, que no soporta `RENAME COLUMN` (llego en
 * 10.5.2) ni `RENAME INDEX`, y rechaza con errno 1832 cualquier CHANGE COLUMN
 * sobre una columna usada por una foreign key. Por eso:
 *   1) se sueltan las FK
 *   2) se renombran tablas
 *   3) se renombran columnas (ya sin FK que las bloquee)
 *   4) se reconstruyen los indices (drop + create, no hay rename)
 *   5) se rearman las FK, ahora con nombres explicitos en ingles
 *
 * Las FK originales creadas inline por `references` quedaron con nombres
 * autogenerados (proyectos_ibfk_1, etc.). Se aprovecha para nombrarlas.
 *
 * @type {import('sequelize-cli').Migration}
 */

/** [tabla_es, tabla_en] */
const TABLAS = [
  ['departamentos', 'departments'],
  ['provincias', 'provinces'],
  ['municipios', 'municipalities'],
  ['entidades_publicas', 'public_entities'],
  ['proyectos', 'projects'],
];

/** tabla_en -> [[columna_es, columna_en], ...] */
const COLUMNAS = {
  departments: [
    ['id_departamento', 'id_department'],
    ['nombre_departamento', 'department_name'],
  ],
  provinces: [
    ['id_provincia', 'id_province'],
    ['nombre_provincia', 'province_name'],
    ['id_departamento', 'id_department'],
  ],
  municipalities: [
    ['id_municipio', 'id_municipality'],
    ['nombre_municipio', 'municipality_name'],
    ['id_provincia', 'id_province'],
  ],
  public_entities: [
    ['id_entidad_publica', 'id_public_entity'],
    ['nombre_entidad', 'entity_name'],
    ['nit', 'tax_id'],
    ['sigla', 'acronym'],
  ],
  projects: [
    ['id_proyecto', 'id_project'],
    ['nombre_proyecto', 'project_name'],
    ['nro_contrato', 'contract_no'],
    ['id_entidad_publica', 'id_public_entity'],
    ['id_municipio', 'id_municipality'],
    ['id_usuario', 'id_user'],
  ],
};

/** Indices no-PK: [tabla_en, nombre_viejo, nombre_nuevo, [columnas_en], unique] */
const INDICES = [
  ['departments', 'nombre_departamento', 'departments_name_uq', ['department_name'], true],
  [
    'provinces',
    'provincias_departamento_nombre_uq',
    'provinces_department_name_uq',
    ['id_department', 'province_name'],
    true,
  ],
  [
    'municipalities',
    'municipios_provincia_nombre_uq',
    'municipalities_province_name_uq',
    ['id_province', 'municipality_name'],
    true,
  ],
  ['public_entities', 'entidades_publicas_nit_uq', 'public_entities_tax_id_uq', ['tax_id'], true],
  ['projects', 'nro_contrato', 'projects_contract_no_uq', ['contract_no'], true],
  ['projects', 'proyectos_entidad_publica_idx', 'projects_public_entity_idx', ['id_public_entity'], false],
  ['projects', 'proyectos_municipio_idx', 'projects_municipality_idx', ['id_municipality'], false],
  ['projects', 'proyectos_usuario_idx', 'projects_user_idx', ['id_user'], false],
  ['projects', 'proyectos_nombre_idx', 'projects_name_idx', ['project_name'], false],
];

/**
 * FK: [tabla_en, nombre_viejo, nombre_nuevo, campo_en, tabla_destino_en,
 *      campo_destino_en]
 */
const FKS = [
  ['provinces', 'provincias_ibfk_1', 'provinces_department_fk', 'id_department', 'departments', 'id_department'],
  ['municipalities', 'municipios_ibfk_1', 'municipalities_province_fk', 'id_province', 'provinces', 'id_province'],
  [
    'projects',
    'proyectos_ibfk_1',
    'projects_public_entity_fk',
    'id_public_entity',
    'public_entities',
    'id_public_entity',
  ],
  ['projects', 'proyectos_municipio_fk', 'projects_municipality_fk', 'id_municipality', 'municipalities', 'id_municipality'],
  ['projects', 'proyectos_ibfk_2', 'projects_user_fk', 'id_user', 'users', 'id'],
];

/** Nombre de la tabla en espanol, para el down(). */
const TABLA_ES = Object.fromEntries(TABLAS.map(([es, en]) => [en, es]));

/** Devuelve el nombre viejo de una columna. Si no se renombro, la deja igual. */
function aEspanol(tablaEn, columnaEn) {
  const par = COLUMNAS[tablaEn]?.find(([, en]) => en === columnaEn);
  return par ? par[0] : columnaEn;
}

module.exports = {
  async up(queryInterface) {
    // 1) Soltar las FK: mientras existan, MariaDB 10.4 no deja tocar columnas.
    //    Se usa el nombre viejo y la tabla todavia en espanol.
    for (const [tablaEn, fkVieja] of FKS) {
      await queryInterface.removeConstraint(TABLA_ES[tablaEn], fkVieja);
    }

    // 2) Tablas.
    for (const [es, en] of TABLAS) {
      await queryInterface.renameTable(es, en);
    }

    // 3) Columnas (las tablas ya se llaman en ingles).
    for (const [tabla, columnas] of Object.entries(COLUMNAS)) {
      for (const [es, en] of columnas) {
        await queryInterface.renameColumn(tabla, es, en);
      }
    }

    // 4) Indices: drop + create, porque 10.4 no tiene RENAME INDEX.
    for (const [tabla, viejo, nuevo, columnas, unique] of INDICES) {
      await queryInterface.removeIndex(tabla, viejo);
      await queryInterface.addIndex(tabla, columnas, { name: nuevo, unique });
    }

    // 5) Rearmar las FK con nombres explicitos.
    for (const [tabla, , fkNueva, campo, destino, campoDestino] of FKS) {
      await queryInterface.addConstraint(tabla, {
        fields: [campo],
        type: 'foreign key',
        name: fkNueva,
        references: { table: destino, field: campoDestino },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      });
    }
  },

  async down(queryInterface) {
    // Inverso exacto del up(), en orden inverso: FK -> indices -> columnas ->
    // tablas -> indices viejos -> FK viejas.
    for (const [tabla, , fkNueva] of FKS) {
      await queryInterface.removeConstraint(tabla, fkNueva);
    }

    for (const [tabla, , nuevo] of INDICES) {
      await queryInterface.removeIndex(tabla, nuevo);
    }

    for (const [tabla, columnas] of Object.entries(COLUMNAS)) {
      for (const [es, en] of columnas) {
        await queryInterface.renameColumn(tabla, en, es);
      }
    }

    for (const [es, en] of TABLAS) {
      await queryInterface.renameTable(en, es);
    }

    for (const [tablaEn, viejo, , columnas, unique] of INDICES) {
      await queryInterface.addIndex(TABLA_ES[tablaEn], columnas.map((col) => aEspanol(tablaEn, col)), {
        name: viejo,
        unique,
      });
    }

    for (const [tablaEn, fkVieja, , campo, destino, campoDestino] of FKS) {
      await queryInterface.addConstraint(TABLA_ES[tablaEn], {
        fields: [aEspanol(tablaEn, campo)],
        type: 'foreign key',
        name: fkVieja,
        references: { table: TABLA_ES[destino] ?? destino, field: aEspanol(destino, campoDestino) },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      });
    }
  },
};
