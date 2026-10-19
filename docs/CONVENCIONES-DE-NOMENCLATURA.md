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
| Persona | `Person` | `people` | Plural irregular: **no** `persons` |
| Postulación | `Application` | `applications` | Ruta: `/applications` |
| Inmueble / Vivienda | `Property` | `properties` | Ruta: `/properties` |
| Cónyuge | `spouse` | `id_spouse` | FK a `people`, auto-referencia |
| Carnet / CI | `documentNo` | `document_no` | |
| Expedido | `documentIssuedIn` | `document_issued_in` | `LP`, `CB`, `SC`, … |
| Nombres | `givenNames` | `given_names` | |
| Apellido paterno | `paternalSurname` | `paternal_surname` | |
| Apellido materno | `maternalSurname` | `maternal_surname` | Opcional |
| Fecha de nacimiento | `birthDate` | `birth_date` | `DATEONLY`, nunca la edad |
| Sexo | `sex` | `sex` | |
| Comunidad / Zona | `community` / `zone` | igual | |

### Solicitante y beneficiario no son tablas

No existe `applicants` ni `beneficiaries`, y no conviene crearlas. Son **dos
estados de una misma postulación**:

| Español | En el modelo |
| --- | --- |
| Solicitante | `Application` con `status = 'pending'` |
| Beneficiario | La misma `Application` con `status = 'approved'` |

Aprobar no mueve nada de tabla: cambia una columna. Por eso los rechazados
siguen en el padrón con su motivo, que es requisito de auditoría del programa,
y por eso la lista de beneficiarios de un proyecto es
`GET /applications?projectId=…&status=approved` y no un endpoint aparte.

La regla general que dejó este ticket: **si el estado nuevo no trae datos
propios, es una columna, no una tabla**. Cuando aparezcan datos que sólo
existen después de aprobar (fecha de obra, monto, contratista), ahí sí va una
tabla que cuelga de la postulación aprobada.

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

## Trampas verificadas en el esquema

Cosas que ya rompieron una vez. Vale releerlas antes de tocar el esquema.

**1. El `field:` del modelo no se renombra solo.**
`PublicEntityModel` quedó con `field: 'taxId'` apuntando a una columna que se
llama `tax_id`. Compila, pasa el typecheck, pasa los tests unitarios (que usan
dobles en memoria) y revienta con 500 recién contra la base real. Después de
renombrar columnas, hay que verificar cada `field:` contra el esquema.

El mismo error se repitió en `20260814000001-public-entities.cjs`, donde el
renombre dejó `WHERE taxId = :taxId` y una clave `taxId` en el `bulkInsert`.
Ahí no falló al momento porque nadie volvió a correr `db:seed` después del
renombre: el bug quedó latente hasta que la base se recreó desde cero en
PostgreSQL, varios commits después. El typecheck no lo ve (es SQL en un
string) y los tests tampoco (usan dobles en memoria). **Después de un renombre
masivo hay que recrear la base vacía y correr `db:migrate && db:seed` de punta
a punta**, que es lo único que ejercita esos strings.

**2. En PostgreSQL `LIKE` distingue mayúsculas de minúsculas.**
En MySQL la collation por defecto las ignoraba, así que las búsquedas de
`/users` y `/projects` funcionaban con `Op.like` por accidente. En Postgres el
operador case-insensitive es `Op.iLike`. No falla ni tira error: simplemente
devuelve menos resultados de los que debería, que es peor.

**3. Postgres no tiene `INTEGER UNSIGNED` y trata el `ENUM` como tipo aparte.**
Las PK de catálogo son `INTEGER` a secas (el rango positivo sobra igual). El
`ENUM` de `role` vive en el esquema como `enum_users_role`, no dentro de la
columna: un `dropTable` no se lo lleva, hay que hacer `DROP TYPE` explícito o
el `up()` siguiente falla con *type already exists*.

**4. Toda constraint e índice se nombra a mano.**
Las FK creadas inline por `references` quedan con nombre autogenerado, y ese
nombre depende del motor: `proyectos_ibfk_1` en MySQL, `proyectos_..._fkey` en
Postgres. Cuando hubo que soltarlas, el nombre autogenerado obligó a reescribir
una migración entera. En `20260830000001-initial-schema.cjs` se crean las
tablas sin `references` inline y las FK se agregan después con
`addConstraint({ name })`.

**5. Las migraciones ya aplicadas no se editan.**
Están registradas en `sequelizemeta`. Editarlas hace que en tu máquina no
vuelvan a correr y en la de otro sí. El esquema ya aplicado se cambia con una
migración nueva.

La excepción fue el cambio de motor (PV-23): al pasar a PostgreSQL no había
esquema previo que preservar, así que las 12 migraciones de MySQL se
consolidaron en un solo baseline y quedaron archivadas en `db/_mysql-legacy/`
como referencia. Fuera de un cambio de motor, la regla se mantiene.

**6. `data` es una global reservada del sandbox de Postman.**
`const data = ...` en un script de test tira
`SyntaxError: Identifier 'data' has already been declared` bajo newman (en la
app de Postman pasa desapercibido). Usar otro nombre.

**7. `DECIMAL` vuelve de Postgres como `string`, no como `number`.**
El driver `pg` serializa `numeric` a string para no perder precisión, aunque el
modelo lo declare `number`. Sin un `Number()` explícito en el mapper, la API
devuelve `"latitude": "-16.900000"` entre comillas y el front tiene que
parsearlo. El typecheck no lo ve: TypeScript cree el `declare` del modelo. Se
detectó en PV-30 con las coordenadas de `properties`.

**8. `DATEONLY` no debe convertirse a `Date`.**
Sequelize entrega `DATEONLY` como `'YYYY-MM-DD'` y así hay que dejarlo. Pasarlo
por `new Date()` lo ancla a un huso horario: una fecha de nacimiento boliviana
serializada a UTC se corre un día hacia atrás. Por eso `Person.birthDate` es
`string` en la entidad, y el validator la comprueba con un patrón en vez de
`Joi.date()`.

**9. Con borrado lógico, los índices únicos van parciales.**
En una tabla `paranoid`, un `UNIQUE` común sigue contando las filas borradas: un
registro dado de baja seguiría reservando el CI de la persona y el cupo del
inmueble, y no se podría volver a registrar. Los únicos de PV-30 llevan
`WHERE deleted_at IS NULL`. Postgres soporta índices parciales; MySQL no los
tenía, así que es un patrón nuevo desde PV-23.

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
