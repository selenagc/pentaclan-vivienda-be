# Datos de prueba para la colección Postman

Guía para rellenar y ejecutar la colección `pentaclan-vivienda.postman_collection.json`
contra el entorno local. Los IDs son los reales de la base de desarrollo a
14/08/2026.

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
| `userId`         | `Auth > POST /auth/login`         | `68649e6b-b56e-418f-bb4b-a97f8bda6bbf` |
| `newUserId`      | `Users > POST /users`             | UUID                                   |
| `departamentoId` | `Geografia > GET /departamentos`  | `5`                                    |
| `provinciaId`    | `Geografia > GET .../provincias`  | id de la primera provincia             |
| `municipioId`    | `Geografia > GET .../municipios`  | id del primer municipio                |
| `entidadId`      | `Entidades publicas > GET /entidades` | `1`                                |
| `proyectoId`     | `Proyectos > POST /proyectos`     | UUID                                   |
| `nroContrato`    | `Proyectos > POST /proyectos`     | `AEV-2026-XXXX`                        |

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

### Entidades públicas (`entidadPublicaId`)

Los 9 registros comparten el NIT `192310023`; lo que cambia es el departamento.

| `id` | Departamento | | `id` | Departamento |
| ---- | ------------ |-| ---- | ------------ |
| 1    | Chuquisaca   | | 6    | Tarija       |
| 2    | La Paz       | | 7    | Santa Cruz   |
| 3    | Cochabamba   | | 8    | Beni         |
| 4    | Oruro        | | 9    | Pando        |
| 5    | Potosí       | |      |              |

### Usuarios de prueba

Contraseña de todos los no-admin: `Test1234!` (o el valor de `SEED_TEST_PASSWORD`).

| Email                              | Rol                  | ¿Crea proyectos? |
| ---------------------------------- | -------------------- | ---------------- |
| `admin@pentaclan.com`              | `admin`              | ✅ Sí            |
| `technical_lead@pentaclan.com`     | `technical_lead`     | ✅ Sí            |
| `tech1@pentaclan.com`              | `technical_lead`     | ✅ Sí            |
| `social_lead@pentaclan.com`        | `social_lead`        | ❌ 403           |
| `project_supervisor@pentaclan.com` | `project_supervisor` | ❌ 403           |
| `supervisor1@pentaclan.com`        | `project_supervisor` | ❌ 403           |

## Orden de ejecución

La colección está ordenada para correrse de arriba abajo con el Runner:

```text
Health → Auth → Users → Geografia → Entidades publicas → Proyectos
```

**Proyectos va al final a propósito**: necesita `entidadId` y `municipioId`, que
los rellenan las carpetas de Entidades públicas y Geografía. Si ejecutas
Proyectos suelto sin haber pasado por ahí, el `POST` fallará porque
`{{entidadId}}` o `{{municipioId}}` llegarán vacíos.

## Peticiones de la carpeta Proyectos

### 1. `POST /proyectos` — caso feliz

```json
{
  "nombre": "Construccion de viviendas sociales - Fase I",
  "nroContrato": "AEV-2026-{{$randomInt}}",
  "entidadPublicaId": {{entidadId}},
  "municipioId": {{municipioId}}
}
```

`{{$randomInt}}` es una variable dinámica de Postman: evita el 409 al reejecutar,
porque `nro_contrato` es único.

**Espera 201.** Verifica que `usuarioId` coincide con el `userId` de la sesión
(nunca se envía en el body) y que `entidadPublica.id` es el que mandaste. La
respuesta trae la entidad y la ubicación ya resueltas:

```json
"entidadPublica": {
  "id": 2,
  "nombre": "Agencia Estatal de Vivienda"
},
"municipio": {
  "id": 100,
  "nombre": "Sacaba",
  "provincia": { "id": 20, "nombre": "Chapare" },
  "departamento": { "id": 2, "nombre": "Cochabamba" }
}
```

### 2. `POST /proyectos` (400: usuarioId desde el cliente)

```json
{
  "nombre": "Suplantacion",
  "nroContrato": "AEV-FAKE-001",
  "entidadPublicaId": {{entidadId}},
  "municipioId": {{municipioId}},
  "usuarioId": "00000000-0000-4000-8000-000000000000"
}
```

**Espera 400.** El creador se toma del token; intentar fijarlo desde el cliente
se rechaza en vez de ignorarse en silencio.

### 3. `POST /proyectos` (404: entidad inexistente)

```json
{
  "nombre": "Sin financiador",
  "nroContrato": "AEV-NOENT-001",
  "entidadPublicaId": 999999,
  "municipioId": {{municipioId}}
}
```

**Espera 404.**

### 4. `POST /proyectos` (404: municipio inexistente)

```json
{
  "nombre": "Sin ubicacion",
  "nroContrato": "AEV-NOMUN-001",
  "entidadPublicaId": {{entidadId}},
  "municipioId": 999999
}
```

**Espera 404**, con `Municipio 999999 not found` en el mensaje.

### 5. `POST /proyectos` (409: contrato duplicado)

```json
{
  "nombre": "Contrato repetido",
  "nroContrato": "{{nroContrato}}",
  "entidadPublicaId": {{entidadId}},
  "municipioId": {{municipioId}}
}
```

Reutiliza el `nroContrato` que guardó la petición 1. **Espera 409.**

### 6. `POST /proyectos` (401: sin sesión)

Igual que la 1, pero con auth `noauth`. **Espera 401.**

### 7. `GET /proyectos`

`{{baseUrl}}/proyectos?page=1&limit=20`

Filtros disponibles:

| Query param        | Valores                              | Ejemplo                          |
| ------------------ | ------------------------------------ | -------------------------------- |
| `page`             | entero ≥ 1                           | `1`                              |
| `limit`            | 1–100                                | `20`                             |
| `sortBy`           | `nombre`, `nroContrato`, `createdAt` | `createdAt`                      |
| `sortOrder`        | `asc`, `desc`                        | `desc`                           |
| `search`           | busca en nombre y nro de contrato    | `viviendas`                      |
| `entidadPublicaId` | 1–9                                  | `2` (La Paz)                     |
| `municipioId`      | id del catálogo geográfico           | `{{municipioId}}`                |
| `usuarioId`        | UUID                                 | `{{userId}}`                     |

**Espera 200** con envelope paginado (`meta.totalPages`).

### 8. `GET /proyectos?usuarioId={{userId}}` — trazabilidad

Comprueba que todos los resultados pertenecen al creador pedido. **Espera 200.**

### 9. `GET /proyectos?municipioId={{municipioId}}` — ubicación

Comprueba que todos los resultados están en el municipio pedido. **Espera 200.**

### 10. `GET /proyectos/:id`

`{{baseUrl}}/proyectos/{{proyectoId}}`. **Espera 200.**
Con un UUID inexistente, 404. Con algo que no sea UUID (`abc`), 400.

### 11. `PUT /proyectos/:id`

```json
{
  "nombre": "Construccion de viviendas sociales - Fase II"
}
```

Campos editables: `nombre`, `nroContrato`, `entidadPublicaId`, `municipioId`.
**Espera 200**, y que `usuarioId` siga siendo el mismo. Si mandas un
`municipioId` inexistente, 404.

### 12. `PUT /proyectos/:id` (400: cambiar el creador)

```json
{ "usuarioId": "00000000-0000-4000-8000-000000000000" }
```

**Espera 400.** El creador es dato de auditoría, no se edita.

### 13. `DELETE /proyectos/:id`

**Espera 404.** No existe endpoint de borrado (fuera de alcance en PV-21).

## Probar la restricción por rol

No hay peticiones dedicadas: se prueba cambiando de sesión.

1. Ejecutar `Auth > POST /auth/login` con:

   ```json
   { "email": "social_lead@pentaclan.com", "password": "Test1234!" }
   ```

2. Reejecutar la carpeta Proyectos. Debe dar:

   | Petición                | Código |
   | ----------------------- | ------ |
   | `POST /proyectos`       | 403    |
   | `PUT /proyectos/:id`    | 403    |
   | `GET /proyectos`        | 200    |
   | `GET /proyectos/:id`    | 200    |

3. Repetir con `project_supervisor@pentaclan.com` (mismo resultado) y con
   `technical_lead@pentaclan.com` (debe poder crear: 201).

4. Volver a entrar como admin antes de seguir con el resto de la colección.

## Problemas comunes

| Síntoma                                            | Causa                                                                 |
| -------------------------------------------------- | --------------------------------------------------------------------- |
| `404 Route not found: POST /proyectos`             | El servidor corre con código viejo. Mira el `uptime` de `GET /health`: si es grande, es un proceso zombi ocupando el 3000. |
| `401` en todo                                       | `accessToken` vacío: ejecuta primero `Auth > POST /auth/login`.       |
| `400` en `entidadPublicaId`                        | `{{entidadId}}` vacío: ejecuta antes `Entidades publicas > GET /entidades`. |
| `400` en `municipioId`                             | `{{municipioId}}` vacío: ejecuta antes `Geografia > GET /provincias/:id/municipios`. |
| `409` al reejecutar el POST                        | Falta `{{$randomInt}}` en el `nroContrato`, o lo fijaste a un valor ya usado. |
| `403` con el admin                                  | Sesión iniciada con otro rol. Revisa `currentRole` en el environment. |
