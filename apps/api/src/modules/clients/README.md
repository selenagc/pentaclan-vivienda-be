# Clients Module

Placeholder module. Folder structure is reserved; full CRUD implementation
will follow the same Clean Architecture layout as the Projects module:

- `domain/entities/Client.ts`
- `domain/repositories/ClientRepository.ts`
- `application/clients/*UseCase.ts`
- `infrastructure/database/models/ClientModel.ts`
- `infrastructure/repositories/SequelizeClientRepository.ts`
- `interfaces/http/controllers/ClientsController.ts`
- `interfaces/http/routes/clients.routes.ts`
- `interfaces/http/validators/clients.validators.ts`

Currently the `/clients` route returns `501 Not Implemented`.
