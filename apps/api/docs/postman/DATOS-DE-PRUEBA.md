# Datos de prueba para la colección Postman

Guía para rellenar y ejecutar la colección `pentaclan-vivienda.postman_collection.json`
contra el entorno local. Los IDs son los que producen los seeders sobre una
base recien creada (`npm run db:up && npm run db:migrate && npm run db:seed`).

## Puesta en marcha (3 pasos)

1. Levantar la API: `npm run dev --workspace=apps/api` (queda en `http://localhost:3000`).
2. En Postman, seleccionar el environment **"Pentaclan Vivienda - Local"**.
3. Rellenar **una sola variable a mano**: `adminPassword`, con el valor de
   `ADMIN_PASSWORD` de `apps/api/.env`.

Todo lo demás se rellena solo al ejecutar las peticiones en orden.

## Variables del environment

### Se rellenan solas

| Variable         | La rellena                        | Ejemplo del valor real                 |
| ---------------- | --------------------------------- | -------------------------------------- |
| `accessToken`    | `Auth > POST /auth/login`         | JWT                                    |
| `currentRole`    | `Auth > POST /auth/login`         | `admin`                                |
| `userId`         | `Auth > POST /auth/login`         | UUID (cambia en cada seed)             |
| `newUserId`      | `Users > POST /users`             | UUID                                   |
| `departmentId` | `Geography > GET /departments`  | `5`                                    |
| `provinceId`    | `Geography > GET .../provinces`  | id de la primera provincia             |
| `municipalityId`    | `Geography > GET .../municipalities`, y luego `Projects > POST /projects` | id del municipio del proyecto vigente |
| `publicEntityId`      | `Public entities > GET /public-entities` | `1`                                |
| `projectId`     | `Projects > POST /projects`     | UUID                                   |
| `contractNo`    | `Projects > POST /projects`     | `AEV-2026-XXXX`                        |
| `applicationId` | `Applications > POST /applications` | UUID                               |
| `applicantDocumentNo` | `Applications > POST /applications` | `CI-1756...` (generado)      |
| `propertyId`    | `Applications > POST /applications` | UUID de la vivienda creada         |
| `reusedApplicationId` | `Applications > POST /applications (propertyId…)` | UUID |

### Se rellenan a mano

| Variable        | Valor                                                  |
| --------------- | ------------------------------------------------------ |
| `baseUrl`       | `http://localhost:3000` (ya viene puesto)              |
| `adminEmail`    | `admin@pentaclan.com` (ya viene puesto)                |
| `adminPassword` | **el `ADMIN_PASSWORD` de tu `.env`** — único obligatorio |

Los correos y contraseñas de los otros roles (`techLeadEmail`, `supervisorEmail`
y sus contraseñas) ya vienen puestos: los usan las peticiones que comprueban los
403 sin obligarte a cerrar sesión.

> El token se hereda automáticamente: la colección tiene auth tipo *bearer* con
> `{{accessToken}}` a nivel raíz, así que ninguna petición necesita cabecera
> `Authorization` propia.

## Datos reales en la base

### Entidades públicas (`publicEntityId`)

El catalogo tiene un unico registro: el NIT es su clave natural y AEVivienda
es la unica entidad cargada. La cobertura departamental no se modela aqui.

| `id` | NIT         | Sigla      | Nombre                       |
| ---- | ----------- | ---------- | ---------------------------- |
| 1    | 192310023   | AEVIVIENDA | Agencia Estatal de Vivienda  |

### Usuarios de prueba

Contraseña de todos los no-admin: `Test1234!` (o el valor de `SEED_TEST_PASSWORD`).

| Email                              | Rol                  | ¿Crea proyectos? | ¿Registra solicitantes? | ¿Borra fichas? |
| ---------------------------------- | -------------------- | ---------------- | ----------------------- | -------------- |
| `admin@pentaclan.com`              | `admin`              | ✅ Sí            | ✅ Sí                   | ✅ Sí          |
| `technical_lead@pentaclan.com`     | `technical_lead`     | ❌ 403           | ✅ Sí                   | ❌ 403         |
| `social_lead@pentaclan.com`        | `social_lead`        | ❌ 403           | ✅ Sí                   | ❌ 403         |
| `project_supervisor@pentaclan.com` | `project_supervisor` | ❌ 403           | ❌ 403                  | ❌ 403         |

Los permisos no son los mismos en los dos módulos, y es a propósito. Crear un
**proyecto** es un acto administrativo: solo `admin`. Registrar un
**solicitante** es trabajo de campo, así que lo hacen también los dos líderes.
`project_supervisor` lee todo y no escribe nada.

Borrar es solo de `admin` en ambos módulos: un líder que se equivoca pide la
baja, no la ejecuta.

## Orden de ejecución

La colección está ordenada para correrse de arriba abajo con el Runner:

```text
Health → Auth → Users → Geography → Public entities → Projects → Applications → Properties
```

**Projects va después de Geography y Public entities a propósito**: necesita
`publicEntityId` y `municipalityId`, que los rellenan esas dos carpetas. Si
ejecutas Projects suelto sin haber pasado por ahí, el `POST` fallará porque
`{{publicEntityId}}` o `{{municipalityId}}` llegarán vacíos.

**Applications va después de Projects** por la misma razón, más una propia:
necesita `{{projectId}}`, y además la vivienda que registra tiene que estar en
el **mismo municipio** que el proyecto. Como `POST /projects` crea el proyecto
con `{{municipalityId}}`, correr en orden garantiza que coincidan. Si te saltas
Projects y usas un `projectId` viejo, lo más probable es un 409 por municipio.

**Properties va al final** porque solo lee: comprueba que la vivienda creada por
`POST /applications` aparece en el buscador.

## Peticiones de la carpeta Projects

### 1. `POST /projects` — caso feliz

```json
{
  "name": "Construccion de viviendas sociales - Fase I",
  "contractNo": "AEV-2026-{{$randomInt}}",
  "publicEntityId": {{publicEntityId}},
  "municipalityId": {{municipalityId}}
}
```

`{{$randomInt}}` es una variable dinámica de Postman: evita el 409 al reejecutar,
porque `contract_no` es único.

**Espera 201.** Verifica que `userName` corresponde al usuario de la sesión
(el creador nunca se envía en el body) y que `publicEntity.id` es el que
mandaste. La respuesta trae la entidad y la ubicación ya resueltas:

```json
"publicEntity": {
  "id": 2,
  "name": "Agencia Estatal de Vivienda"
},
"municipality": {
  "id": 143,
  "name": "Sacaba",
  "province": { "id": 40, "name": "Chapare" },
  "department": { "id": 3, "name": "Cochabamba" }
}
```

### 2. `POST /projects` (400: userId desde el cliente)

```json
{
  "name": "Suplantacion",
  "contractNo": "AEV-FAKE-001",
  "publicEntityId": {{publicEntityId}},
  "municipalityId": {{municipalityId}},
  "userId": "00000000-0000-4000-8000-000000000000"
}
```

**Espera 400.** El creador se toma del token; intentar fijarlo desde el cliente
se rechaza en vez de ignorarse en silencio.

### 3. `POST /projects` (404: entidad inexistente)

```json
{
  "name": "Sin financiador",
  "contractNo": "AEV-NOENT-001",
  "publicEntityId": 999999,
  "municipalityId": {{municipalityId}}
}
```

**Espera 404.**

### 4. `POST /projects` (404: municipio inexistente)

```json
{
  "name": "Sin ubicacion",
  "contractNo": "AEV-NOMUN-001",
  "publicEntityId": {{publicEntityId}},
  "municipalityId": 999999
}
```

**Espera 404**, con `Municipio 999999 not found` en el mensaje.

### 5. `POST /projects` (409: contrato duplicado)

```json
{
  "name": "Contrato repetido",
  "contractNo": "{{contractNo}}",
  "publicEntityId": {{publicEntityId}},
  "municipalityId": {{municipalityId}}
}
```

Reutiliza el `contractNo` que guardó la petición 1. **Espera 409.**

### 6. `POST /projects` (401: sin sesión)

Igual que la 1, pero con auth `noauth`. **Espera 401.**

### 7. `GET /projects`

`{{baseUrl}}/projects?page=1&limit=20`

Filtros disponibles:

| Query param        | Valores                              | Ejemplo                          |
| ------------------ | ------------------------------------ | -------------------------------- |
| `page`             | entero ≥ 1                           | `1`                              |
| `limit`            | 1–100                                | `20`                             |
| `sortBy`           | `name`, `contractNo`, `createdAt` | `createdAt`                      |
| `sortOrder`        | `asc`, `desc`                        | `desc`                           |
| `search`           | busca en nombre y nro de contrato    | `viviendas`                      |
| `publicEntityId` | id del catalogo                      | `1` (AEVivienda)                 |
| `municipalityId`      | id del catálogo geográfico           | `{{municipalityId}}`                |
| `userId`        | UUID                                 | `{{userId}}`                     |

**Espera 200** con envelope paginado (`meta.totalPages`).

### 8. `GET /projects?userId={{userId}}` — trazabilidad

Comprueba que todos los resultados pertenecen al creador pedido. **Espera 200.**

### 9. `GET /projects?municipalityId={{municipalityId}}` — ubicación

Comprueba que todos los resultados están en el municipio pedido. **Espera 200.**

### 10. `GET /projects/:id`

`{{baseUrl}}/projects/{{projectId}}`. **Espera 200.**
Con un UUID inexistente, 404. Con algo que no sea UUID (`abc`), 400.

### 11. `PUT /projects/:id`

```json
{
  "name": "Construccion de viviendas sociales - Fase II"
}
```

Campos editables: `name`, `contractNo`, `publicEntityId`, `municipalityId`.
**Espera 200**, y que `userId` siga siendo el mismo. Si mandas un
`municipalityId` inexistente, 404.

### 12. `PUT /projects/:id` (400: cambiar el creador)

```json
{ "userId": "00000000-0000-4000-8000-000000000000" }
```

**Espera 400.** El creador es dato de auditoría, no se edita.

### 13. `DELETE /projects/:id`

**Espera 404.** No existe endpoint de borrado (fuera de alcance en PV-21).

> **`POST /projects` deja `{{municipalityId}}` apuntando al municipio del
> proyecto que acaba de crear.** Si escribes el municipio a mano en el cuerpo
> en vez de usar `{{municipalityId}}`, esto evita que Applications falle
> después con un 409 por municipios distintos.

## Peticiones de la carpeta Applications

### Antes de nada: no busques la carpeta "Beneficiarios"

No existe, y no es un olvido. Un beneficiario **es** una postulación aprobada:
no hay dos listas ni dos tablas, hay una sola con una columna `status`.

| Lo que en la reunión se llama… | En la API es…                                    |
| ------------------------------ | ------------------------------------------------ |
| Solicitante                    | `GET /applications?status=pending`               |
| Beneficiario                   | `GET /applications?status=approved`              |

Aprobar no mueve nada de sitio: cambia esa columna. Por eso los rechazados
siguen en el padrón con su motivo, que es lo que permite auditar el programa
después. En PV-30 todas nacen en `pending`; la transición llega con PV-31.

### 1. `POST /applications` — caso feliz

```json
{
  "projectId": "{{projectId}}",
  "person": {
    "documentNo": "CI-{{$timestamp}}",
    "documentIssuedIn": "LP",
    "givenNames": "Rosa Maria",
    "paternalSurname": "Condori",
    "maternalSurname": "Apaza",
    "phone": "71234567",
    "occupation": "Agricultora",
    "birthDate": "1948-07-09",
    "sex": "F"
  },
  "spouse": {
    "documentNo": "CJ-{{$timestamp}}",
    "documentIssuedIn": "LP",
    "givenNames": "Pedro",
    "paternalSurname": "Huanca",
    "birthDate": "1945-02-18",
    "sex": "M"
  },
  "property": {
    "community": "Comunidad Alto Lima",
    "zone": "Zona Norte",
    "address": "Calle 5 s/n",
    "latitude": -16.5,
    "longitude": -68.16,
    "municipalityId": {{municipalityId}}
  }
}
```

Un solo formulario crea persona, cónyuge, vivienda y postulación, todo en una
transacción: o entra completo o no entra nada.

`{{$timestamp}}` cumple el mismo papel que `{{$randomInt}}` en proyectos: evita
el 409 al reejecutar, porque el CI es único. Los prefijos `CI-` y `CJ-` son
distintos a propósito, para que titular y cónyuge no salgan con el mismo
documento (eso da 400).

Para un solicitante **sin cónyuge**, quita el bloque `spouse` o ponlo en `null`.

**Espera 201.** Vale la pena mirar cuatro cosas de la respuesta:

```json
"status": "pending",
"person": {
  "birthDate": "1948-07-09",
  "spouse": { "givenNames": "Pedro", "birthDate": "1945-02-18" }
},
"property": {
  "latitude": -16.5,
  "municipality": {
    "id": 143, "name": "Sacaba",
    "province": { "id": 40, "name": "Chapare" },
    "department": { "id": 3, "name": "Cochabamba" }
  }
},
"userName": "Selena Gutierrez",
"decidedAt": null
```

- `status` nace en `pending`, nunca lo eliges tú.
- El cónyuge trae **su propia fecha de nacimiento**: hace falta para saber
  quiénes son adultos mayores, y por eso no son cuatro campos de texto.
- `latitude` es un **número**, no un string entre comillas.
- `birthDate` sale tal cual se envió, sin correrse un día.

### 2. `POST /applications` (propertyId: la vivienda sale del buscador)

```json
{
  "projectId": "{{projectId}}",
  "person": {
    "documentNo": "CR-{{$timestamp}}",
    "documentIssuedIn": "LP",
    "givenNames": "Martha",
    "paternalSurname": "Quispe",
    "maternalSurname": "Mamani",
    "phone": "70112233",
    "occupation": "Tejedora",
    "birthDate": "1966-04-30",
    "sex": "F"
  },
  "spouse": null,
  "propertyId": "{{propertyId}}"
}
```

La otra mitad del `xor`. La petición anterior levantó la vivienda en campo
con un bloque `property`; ésta la **elige del buscador** mandando solo su id,
que es el camino normal una vez que el padrón tiene datos.

**Espera 201.** La respuesta trae la vivienda entera aunque solo mandaste el
id, y el `property.id` es el mismo `{{propertyId}}` — no se creó un duplicado.

Dos fichas sobre la misma vivienda **conviven** mientras ninguna esté
aprobada: el índice único es parcial (`WHERE status = approved`). Es el caso
del matrimonio que postula la misma casa cada uno por su cuenta; al aprobar,
solo una puede quedar.

Guarda `{{reusedApplicationId}}`, que la última petición de la carpeta borra.

### 3. `POST /applications` (409: la persona ya postuló a este proyecto)

Mismo cuerpo, pero con `"documentNo": "{{applicantDocumentNo}}"` — el CI que
guardó la petición anterior.

**Espera 409.** Una persona no postula dos veces al mismo proyecto. Sí puede
postular a **otro** proyecto, y ahí se reutiliza su ficha en vez de duplicarla.

### 4. `POST /applications` (409: vivienda fuera del municipio del proyecto)

La petición trae un script previo que busca otro municipio de la misma
provincia y lo usa en `municipalityId`.

**Espera 409.** Es la regla del programa: solo se mejoran viviendas del
municipio donde se ejecuta el proyecto. El mensaje nombra el municipio correcto
(`must be located in Sacaba`) para que el operador sepa qué corregir.

### 5. `POST /applications` (400: propertyId y property a la vez)

La vivienda entra de dos formas y **solo una a la vez**:

| Caso                                        | Qué mandas                    |
| ------------------------------------------- | ----------------------------- |
| El operador la eligió del buscador          | `"propertyId": "uuid"`        |
| La levantó nueva en campo                   | `"property": { … }`           |

**Espera 400** al mandar las dos, y también al no mandar ninguna: sin vivienda
no hay postulación, porque la vivienda es lo que el programa mejora.

### 6. `POST /applications` (400: userId desde el cliente)

Igual que en proyectos: quien registra sale del token. Mandarlo en el cuerpo se
rechaza en vez de ignorarse en silencio.

### 7. `POST /applications` (400: status desde el cliente)

```json
{ "...": "...", "status": "approved" }
```

**Espera 400.** Nadie se autoaprueba desde el formulario de alta. Aprobar es
otra operación, con sus propias reglas y su propia auditoría (PV-31).

### 8. `POST /applications` (400: fecha de nacimiento futura)

`"birthDate": "2099-01-01"` da 400. Nacer en el futuro es error de captura, no
un caso límite. También se valida el expedido: solo `LP`, `CB`, `SC`, `OR`,
`PT`, `TJ`, `CH`, `BE`, `PD`.

### 9. `POST /applications` (403: rol sin permiso)

Trae un script previo que entra como `project_supervisor` y usa ese token, así
que no tienes que cerrar tu sesión de admin. **Espera 403.**

### 10. `GET /applications`

Filtros disponibles:

| Query param      | Para qué                                          |
| ---------------- | ------------------------------------------------- |
| `projectId`      | Fichas de un proyecto                             |
| `status`         | `approved` = beneficiarios del proyecto           |
| `search`         | Nombres, apellidos o número de documento          |
| `municipalityId` | Municipio **de la vivienda**, no de la persona    |
| `sortBy`         | `submittedAt`, `status`, `createdAt`, `applicantName` |

`applicantName` ordena por apellido paterno del titular, que es como se lee un
padrón en papel.

### 11. `GET /applications?status=approved` — los beneficiarios

**Espera 200 con `data` vacío** mientras estés en PV-30: todas las fichas nacen
en `pending` y todavía no existe el endpoint que las aprueba. Esta misma
petición es la que devolverá los beneficiarios cuando llegue PV-31, sin cambiar
una línea.

### 12. `PUT /applications/:id` — corrección anidada

```json
{
  "person": { "phone": "79999999" },
  "property": { "address": "Calle 5 nro 42" }
}
```

Corriges los datos de la persona y de la vivienda desde la misma ficha, sin
tener que editarlas por separado. En campo los errores de tipeo abundan.

`{"spouse": null}` desvincula al cónyuge **sin borrar a esa persona**: puede ser
titular de su propia ficha en otro proyecto.

**No se puede cambiar el estado por aquí**: `{"status": "approved"}` da 400.

### 13. `DELETE /applications/:id`

**Espera 204**, y solo con `admin`. Es **borrado lógico**: la ficha sale de los
listados pero la fila queda en la base con `deleted_at`, porque en un programa
con fondos públicos no puede desaparecer evidencia. La petición siguiente de la
colección comprueba justo eso pidiendo la ficha y esperando 404.

Borrar la postulación no borra a la persona ni a la vivienda: pueden estar
referenciadas por otras fichas.

Una postulación `approved` **no se borra** (409). Darla de baja es pasarla a
`withdrawn`, que deja rastro.

### 14. `DELETE /applications/:id` (limpia la ficha del buscador)

Housekeeping del Runner: borra `{{reusedApplicationId}}`, la ficha de la
petición 2. Sin esto cada corrida deja una postulación suelta colgada de la
misma vivienda. El inmueble no se toca: es de solo lectura y sigue
alimentando el buscador que prueba la carpeta Properties.

## Peticiones de la carpeta Properties

Solo lectura. No hay alta directa de viviendas: `POST /properties` devuelve 404
a propósito, y la colección lo comprueba. Un inmueble sin postulación no le
sirve a nadie y solo ensuciaría el buscador.

### `GET /properties?municipalityId={{municipalityId}}&search=Alto Lima`

Este listado es el buscador del formulario de registro. Importa más de lo que
parece: al no haber código catastral, que el operador **encuentre y elija** una
vivienda ya registrada es lo único que evita cargar dos veces la misma casa. Si
se duplica el registro, marido y esposa podrían recibir mejora para la misma
vivienda sin que la base pueda detectarlo.

Busca en comunidad, zona y dirección, sin distinguir mayúsculas.

## Probar la restricción por rol

No hay peticiones dedicadas: se prueba cambiando de sesión.

1. Ejecutar `Auth > POST /auth/login` con:

   ```json
   { "email": "social_lead@pentaclan.com", "password": "Test1234!" }
   ```

2. Reejecutar las carpetas Projects y Applications. Con `social_lead` debe dar:

   | Petición                     | Código | Por qué                          |
   | ---------------------------- | ------ | -------------------------------- |
   | `POST /projects`             | 403    | Crear proyectos es solo de admin |
   | `PUT /projects/:id`          | 403    | Ídem                             |
   | `GET /projects`              | 200    | La lectura es de todos           |
   | `POST /applications`         | **201** | Registrar es trabajo de campo   |
   | `PUT /applications/:id`      | **200** | Ídem                            |
   | `DELETE /applications/:id`   | 403    | Borrar es solo de admin          |
   | `GET /applications`          | 200    | La lectura es de todos           |

   La diferencia entre las dos primeras filas y las tres del medio es el punto:
   un líder social no crea proyectos, pero sí registra solicitantes.

3. Repetir con `technical_lead@pentaclan.com` (mismo resultado que social_lead)
   y con `project_supervisor@pentaclan.com`, que da **403 en toda escritura** de
   los dos módulos y 200 en toda lectura.

4. Volver a entrar como admin antes de seguir con el resto de la colección.

> Las peticiones `(403: rol sin permiso)` de las carpetas Projects y
> Applications ya hacen esto solas con un script previo: piden un token del rol
> que corresponde sin tocar tu sesión. La prueba manual de arriba sirve para
> revisar la matriz completa de una vez.

## Problemas comunes

| Síntoma                                            | Causa                                                                 |
| -------------------------------------------------- | --------------------------------------------------------------------- |
| `404 Route not found: POST /projects`             | El servidor corre con código viejo. Mira el `uptime` de `GET /health`: si es grande, es un proceso zombi ocupando el 3000. |
| `401` en todo                                       | `accessToken` vacío: ejecuta primero `Auth > POST /auth/login`.       |
| `400` en `publicEntityId`                        | `{{publicEntityId}}` vacío: ejecuta antes `Public entities > GET /public-entities`. |
| `400` en `municipalityId`                             | `{{municipalityId}}` vacío: ejecuta antes `Geography > GET /provinces/:id/municipalities`. |
| `409` al reejecutar el POST                        | Falta `{{$randomInt}}` en el `contractNo`, o lo fijaste a un valor ya usado. |
| `403` con el admin                                  | Sesión iniciada con otro rol. Revisa `currentRole` en el environment. |
| `409 must be located in …` en `POST /applications` | Tu `{{projectId}}` y tu `{{municipalityId}}` apuntan a municipios distintos. El mensaje nombra el municipio correcto (`must be located in Collana`): ponlo en el environment, o corre `Projects > POST /projects` de nuevo, que ahora deja los dos sincronizados. |
| `409 already applied` en `POST /applications`      | Falta `{{$timestamp}}` en el `documentNo`, o estás reusando un CI ya registrado en ese proyecto. |
| `400` diciendo `spouse` y `person` iguales         | Titular y cónyuge llevan el mismo documento. Los prefijos `CI-` y `CJ-` del cuerpo de ejemplo existen para evitarlo. |
| `400` en `birthDate`                                | El formato es `YYYY-MM-DD` a secas, no una fecha ISO con hora, y no puede ser futura. |
| No aparece la carpeta **Applications** en Postman   | Postman identifica las colecciones por `_postman_id` y no reemplaza la que ya tienes en caché. Borra la colección en el sidebar y vuelve a importarla; debe quedar con 8 carpetas. |
