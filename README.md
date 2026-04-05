# zorvyn


## Finance Data Processing & Access Control Backend

### Tech stack
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- bcrypt password hashing
- Custom auto-increment ID counters via `src/model/counter.model.js`
- Role-based access control guards in `src/middleware/authorize.middleware.js`

### Setup
- Install dependencies:

```bash
npm install
```

- Configure `config.env`:
  - `MONGO_URI`
  - `JWT_SECRET`
  - `JWT_EXPIRES_IN` (optional, defaults to `24h`)

- Run:

```bash
npm start
```

### Postman collection
A Postman collection file is included in the project root as `Postman_collection`.
- Import it into Postman
- Set environment variables:
  - `zorvyn` — base URL, e.g. `http://localhost:3000`
  - `auth` — JWT bearer token from login
- Collection includes Auth, Users, Roles, Finance, Categories, and Dashboard requests

### Role-based access control
The app uses role IDs and permission guards:
- `role_id = 1` → Viewer → only `View`
- `role_id = 2` → Analyst → only `View`
- `role_id = 3` → Admin → `View`, `Create`, `Update`, `Delete`, `Edit`

If a user has explicit `permissions` set, those override the default role permissions.

Public signup will lazily create the Viewer role if it does not yet exist.

No automatic database seed runs at startup.

### APIs

#### Auth
- `POST /api/auth/register` — public sign-up; assigns Viewer role automatically
- `POST /api/auth/login` — login and receive JWT
- `POST /api/auth/forgetpassword` — reset password by username; returns hashed password

#### Users
- `POST /api/users/create` — create a new user (requires auth + Create permission)
- `GET /api/users/getall` — list users (requires auth + View permission)
- `GET /api/users/getbyid/:id` — fetch user by ID (requires auth + View permission)
- `GET /api/users/getbyauth` — fetch the current authenticated user (requires auth)
- `PUT /api/users/update` — update the current authenticated user (requires auth)
- `PUT /api/users/permissions/:id` — set user permissions (requires auth + Update permission)
- `DELETE /api/users/delete` — delete the current authenticated user (requires auth)
- `DELETE /api/users/delete/:id` — delete another user (requires auth + Delete permission or self-delete fallback)

#### Roles
- `POST /api/roles/create` — create a new role (requires auth + Create permission)
- `PUT /api/roles/update/:id` — update role (requires auth + Update permission)
- `DELETE /api/roles/delete/:id` — delete role (requires auth + Delete permission)
- `GET /api/roles/getbyid/:id` — fetch role by ID (requires auth + View permission)
- `GET /api/roles/getall` — list all roles (public)

#### Finance records
- `POST /api/finance/create` — create a finance record (requires auth + Create permission)
- `PUT /api/finance/update/:id` — update finance record (requires auth + Update permission)
- `DELETE /api/finance/delete/:id` — delete finance record (requires auth + Delete permission)
- `GET /api/finance/getbyid/:id` — fetch finance record by ID (requires auth + View permission)
- `GET /api/finance/getall` — list finance records (requires auth + View permission)
- `GET /api/finance/filterFinanceRecords` — filter finance records (requires auth + View permission)

Filtering query parameters:
- `type=income|expense`
- `category=<string>`
- `financial_records_category_id=<number>`
- `from=<date>`
- `to=<date>`

#### Financial records categories
- `POST /api/financial_records_category/create` — create category (requires auth + Create permission)
- `PUT /api/financial_records_category/update/:id` — update category (requires auth + Update permission)
- `DELETE /api/financial_records_category/delete/:id` — delete category (requires auth + Delete permission)
- `GET /api/financial_records_category/getbyid/:id` — fetch category by ID (requires auth + View permission)
- `GET /api/financial_records_category/getall` — list categories (public)

#### Dashboard
- `GET /api/dashboard/summary` — dashboard summary (requires auth + View permission)

### Auth header
For protected endpoints send:
- `Authorization: Bearer <token>`

### Notes
- Passwords are hashed with `bcrypt`; stored values are not reversible.
- Auto-increment fields are managed by the internal `Counter` model, not by `mongoose-sequence`.
- Soft delete is implemented across models using `status`, `DeletedBy`, and `DeletedAt`.
- User-specific permissions can override the default role permission set.

