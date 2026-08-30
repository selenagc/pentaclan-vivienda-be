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
| `municipalityId`    | `Geography > GET .../municipalities`  | id del primer municipio                |
| `publicEntityId`      | `Public entities > GET /public-entities` | `1`                                |
| `projectId`     | `Projects > POST /projects`     | UUID                                   |
| `contractNo`    | `Projects > POST /projects`     | `AEV-2026-XXXX`                        |

### Se rellenan a mano

| Variable        | Valor                                                  |
| --------------- | ------------------------------------------------------ |
| `baseUrl`       | `http://localhost:3000` (ya viene puesto)              |
| `adminEmail`    | `admin@pentaclan.com` (ya viene puesto)                |
| `adminPassword` | **el `ADMIN_PASSWORD` de tu `.env`** — único obligatorio |

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

| Email                              | Rol                  | ¿Crea proyectos? |
| ---------------------------------- | -------------------- | ---------------- |
| `admin@pentaclan.com`              | `admin`              | ✅ Sí            |
| `technical_lead@pentaclan.com`     | `technical_lead`     | ✅ Sí            |
| `social_lead@pentaclan.com`        | `social_lead`        | ❌ 403           |
| `project_supervisor@pentaclan.com` | `project_supervisor` | ❌ 403           |

## Orden de ejecución

La colección está ordenada para correrse de arriba abajo con el Runner:

```text
Health → Auth → Users → Geography → Public entities → Proyectos
```

**Proyectos va al final a propósito**: necesita `publicEntityId` y `municipalityId`, que
los rellenan las carpetas de Entidades públicas y Geografía. Si ejecutas
Proyectos suelto sin haber pasado por ahí, el `POST` fallará porque
`{{publicEntityId}}` o `{{municipalityId}}` llegarán vacíos.

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

## Probar la restricción por rol

No hay peticiones dedicadas: se prueba cambiando de sesión.

1. Ejecutar `Auth > POST /auth/login` con:

   ```json
   { "email": "social_lead@pentaclan.com", "password": "Test1234!" }
   ```

2. Reejecutar la carpeta Projects. Debe dar:

   | Petición                | Código |
   | ----------------------- | ------ |
   | `POST /projects`       | 403    |
   | `PUT /projects/:id`    | 403    |
   | `GET /projects`        | 200    |
   | `GET /projects/:id`    | 200    |

3. Repetir con `project_supervisor@pentaclan.com` (mismo resultado) y con
   `technical_lead@pentaclan.com` (debe poder crear: 201).

4. Volver a entrar como admin antes de seguir con el resto de la colección.

## Problemas comunes

| Síntoma                                            | Causa                                                                 |
| -------------------------------------------------- | --------------------------------------------------------------------- |
| `404 Route not found: POST /projects`             | El servidor corre con código viejo. Mira el `uptime` de `GET /health`: si es grande, es un proceso zombi ocupando el 3000. |
| `401` en todo                                       | `accessToken` vacío: ejecuta primero `Auth > POST /auth/login`.       |
| `400` en `publicEntityId`                        | `{{publicEntityId}}` vacío: ejecuta antes `Public entities > GET /public-entities`. |
| `400` en `municipalityId`                             | `{{municipalityId}}` vacío: ejecuta antes `Geography > GET /provinces/:id/municipalities`. |
| `409` al reejecutar el POST                        | Falta `{{$randomInt}}` en el `contractNo`, o lo fijaste a un valor ya usado. |
| `403` con el admin                                  | Sesión iniciada con otro rol. Revisa `currentRole` en el environment. |
