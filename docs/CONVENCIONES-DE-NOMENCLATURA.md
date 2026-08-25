# Convenciones de nomenclatura

> **Estado:** vigente desde 2026-08-25.
> **Alcance:** `pentaclan-vivienda-be` y `pentaclan-vivienda-fe`.
> **Aplicado en:** renombre de PV-16, PV-19 y PV-21 (migración
> `20260825000001-rename-domain-to-english`).

## La regla en una línea

**Todo lo que el código nombra va en inglés. Lo que se escribe para que un humano
lo lea va en español.**

| Va en **inglés** | Va en **español** |
| --- | --- |
| Variables, funciones, clases, tipos | Comentarios del código |
| Nombres de archivo y de carpeta | Documentación interna (`docs/`, `DATOS-DE-PRUEBA.md`) |
| Tablas, columnas, índices, constraints | Nombres de los `pm.test` de Postman |
| Rutas HTTP y campos JSON | Mensajes de commit |
| Mensajes de error de la API | |
| Nombres de los tests (`it`, `describe`) | |
| `summary` y `description` del `openapi.yaml` | |

El criterio: si un cliente HTTP, un `SELECT` o un `import` lo tiene que escribir,
va en inglés. Si es prosa para el equipo, va en español.

## Por qué

El sistema nació en inglés (`users`, `auth`, `shared`, `middlewares`). Entre
PV-16 y PV-21 los módulos nuevos se escribieron en español y quedó un esquema
partido: `users` convivía con `proyectos`, `UserModel` con `ProyectoModel`. Un
solo idioma en los identificadores elimina la traducción mental y el "¿cómo se
llamaba esta tabla?" en cada consulta.

Los comentarios quedan en español a propósito: son para el equipo que mantiene
el código, no forman parte de ninguna interfaz, y traducirlos solo agregaría
ruido sin beneficio.

## Glosario del dominio

Las traducciones que ya están fijadas. Si aparece uno de estos términos, se usa
esta forma y no otra:

| Español | Inglés | Tabla | Notas |
| --- | --- | --- | --- |
| Proyecto | `Project` | `projects` | |
| Entidad pública | `PublicEntity` | `public_entities` | Ruta: `/public-entities` |
| Departamento | `Department` | `departments` | División territorial de primer nivel |
| Provincia | `Province` | `provinces` | |
| Municipio | `Municipality` | `municipalities` | Plural irregular: **no** `municipalitys` |
| Geografía | `Geography` | — | Nombre del módulo, no de una tabla |
| Nro de contrato | `contractNo` | `contract_no` | |
| NIT | `taxId` | `tax_id` | |
| Sigla | `acronym` | `acronym` | |
| Nombre | `name` | `<entidad>_name` | `project_name`, `entity_name`, … |
| Usuario | `User` | `users` | Ya estaba en inglés |

## Reglas por capa

| Capa | Formato | Ejemplo |
| --- | --- | --- |
| Tablas | `snake_case` plural | `public_entities` |
| PK | `id_<entidad_singular>` | `id_public_entity` |
| FK | `id_<entidad_referenciada>` | `id_municipality` |
| Otras columnas | `snake_case` | `contract_no`, `department_name` |
| Índices | `<tabla>_<campo>_idx` / `_uq` si es único | `projects_public_entity_idx` |
| Constraints FK | `<tabla>_<referenciada>_fk` | `projects_municipality_fk` |
| Modelos Sequelize | `PascalCase` + `Model` | `PublicEntityModel` |
| Entidades de dominio | `PascalCase` | `PublicEntity` |
| Casos de uso | `<Verbo><Entidad>UseCase` | `CreatePublicEntityUseCase` |
| Repositorios | `<Entidad>Repository` / `Sequelize<Entidad>Repository` | `ProjectRepository` |
| Campos TypeScript y JSON | `camelCase` | `publicEntityId` |
| Rutas HTTP | `kebab-case` plural | `/public-entities` |
| Archivos de ruta/validador | `<recurso>.routes.ts` / `.validators.ts` | `public-entities.routes.ts` |
| Carpetas de módulo | `kebab-case` | `application/public-entities/` |

## Entrada con ids, salida con objetos

No es una inconsistencia, es deliberado y se mantiene:

- **Lo que entra** (body del POST/PUT, query params) usa **ids planos**:
  `publicEntityId`, `municipalityId`.
- **Lo que sale** (la entidad de dominio) usa **objetos anidados ya resueltos**:
  `publicEntity: { id, name }`, `municipality: { id, name, province, department }`.

Al crear mandás una referencia; al leer recibís el dato resuelto, para que el
front no tenga que consultar el catálogo por cada fila.

## Trampas verificadas durante el renombre

Cosas que ya rompieron una vez. Vale releerlas antes de tocar el esquema.

**1. El `field:` del modelo no se renombra solo.**
`PublicEntityModel` quedó con `field: 'taxId'` apuntando a una columna que se
llama `tax_id`. Compila, pasa el typecheck, pasa los tests unitarios (que usan
dobles en memoria) y revienta con 500 recién contra la base real. Después de
renombrar columnas, hay que verificar cada `field:` contra el esquema.

**2. MariaDB 10.4 no tiene `RENAME COLUMN` ni `RENAME INDEX`.**
Llegaron en 10.5.2. Además rechaza con errno 1832 cualquier `CHANGE COLUMN`
sobre una columna usada por una foreign key. El orden obligado es: soltar FK →
renombrar tablas → renombrar columnas → drop+create de índices → rearmar FK.
Está implementado así en `20260825000001-rename-domain-to-english.cjs`.

**3. Las migraciones ya aplicadas no se editan.**
Están registradas en `sequelizemeta`. Editarlas hace que en tu máquina no
vuelvan a correr y en la de otro sí. El esquema ya aplicado se cambia con una
migración nueva. Por eso las migraciones de PV-16/PV-19/PV-21 siguen creando
tablas en español y la de renombre las traduce después.

**4. `data` es una global reservada del sandbox de Postman.**
`const data = ...` en un script de test tira
`SyntaxError: Identifier 'data' has already been declared` bajo newman (en la
app de Postman pasa desapercibido). Usar otro nombre.

## Cómo decidir un caso que esta tabla no cubre

1. ¿Lo escribe una máquina (import, `SELECT`, request HTTP)? → inglés.
2. ¿Lo lee solo una persona del equipo? → español.
3. Si el término del negocio no tiene traducción obvia, elegir una, **agregarla
   al glosario de arriba en el mismo PR**, y usarla en todas las capas.

## Checklist para el próximo módulo

- [ ] ¿Todos los identificadores están en inglés, sin tildes ni ñ?
- [ ] ¿La tabla es plural y la PK es `id_<entidad_singular>`?
- [ ] ¿Las FK se llaman `id_<entidad_referenciada>` y las constraints `<tabla>_<ref>_fk`?
- [ ] ¿Cada `field:` del modelo coincide con la columna real? (verificar contra la base)
- [ ] ¿La ruta HTTP es `kebab-case` plural y coincide con la entidad?
- [ ] ¿El body usa ids planos y la respuesta objetos anidados?
- [ ] ¿Los mensajes y códigos de error están en inglés?
- [ ] ¿Los nombres de los tests están en inglés?
- [ ] ¿El `openapi.yaml` tiene `summary`/`description` en inglés?
- [ ] ¿El FE usa exactamente los mismos nombres que devuelve la API?
