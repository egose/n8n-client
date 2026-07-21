# v1.1.1 Spec vs n8n Handler Implementation Diff

> Generated 2026-07-20 against n8n source at `.n8n/packages/cli/src/public-api/v1/handlers/`
> and the upstream openapi.yml at `.n8n/packages/cli/src/public-api/v1/openapi.yml`.

---

## Table of Contents

1. [Structural / Routing Differences](#1-structural--routing-differences)
2. [Critical Interface Mismatches](#2-critical-interface-mismatches)
3. [Per-Endpoint Diff](#3-per-endpoint-diff)

---

## 1. Structural / Routing Differences

### 1.1 Paths missing from the client spec

The following endpoints exist in the upstream n8n `openapi.yml` but are **absent from the client's `v1.1.1.yml`**:

| Missing path                                     | Methods          | Category             |
| ------------------------------------------------ | ---------------- | -------------------- |
| `/settings/sso/saml`                             | GET, PUT         | SSO SAML settings    |
| `/workflows/{id}/test-runs/{runId}/cancel`       | POST             | Evaluation test runs |
| `/settings/log-streaming/event-types`            | GET              | Log streaming        |
| `/settings/log-streaming/destinations`           | GET, POST        | Log streaming        |
| `/settings/log-streaming/destinations/{id}/test` | POST             | Log streaming        |
| `/settings/log-streaming/destinations/{id}`      | GET, PUT, DELETE | Log streaming        |

### 1.2 GET /tags — dual registration

The spec maps `getTags` to `v1/handlers/tags/tags.handler`, but at runtime **`TagsPublicController`** (`@n8n/decorators` `@PublicApiController('/tags')`) wins because `PublicApiControllerRegistry` mounts before express-openapi-validator in the middleware chain (`index.ts:332-333`).

- The handler stub at `tags.handler.ts:81-88` returns 500 — it is never reached.
- `TagsPublicController.getTags` uses `@ApiKeyScope('tag:list')` which does **not** fall back to global user scopes, while the handler stub uses `apiKeyHasScopeWithGlobalScopeFallback` which does.
- **Behavioral difference**: If the API key lacks `tag:list` but the user has global scope, the controller returns 403 while the handler would allow it.

### 1.3 GET /discover — manual auth

`discover.handler.ts:29` does not use any standard scope middleware. It manually reads `x-n8n-api-key` from headers and queries `ApiKeyRepository`. All other endpoints go through `publicApiScope` or `apiKeyHasScopeWithGlobalScopeFallback`.

---

## 2. Critical Interface Mismatches

| #   | Endpoint                                        | Issue                                                                                                                                                                                                                             |
| --- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `PUT /settings/security-policy`                 | **Spec**: all fields optional (partial update). **Handler**: all three fields required (`personalSpacePublishing`, `personalSpaceSharing`, `redactionEnforcement`). Comment: "Clients must send the full writable configuration." |
| 2   | `PUT /workflows/{id}/transfer`                  | **Spec**: 200. **Handler**: 204 No Content.                                                                                                                                                                                       |
| 3   | `PUT /credentials/{id}/transfer`                | **Spec**: 200. **Handler**: 204 No Content.                                                                                                                                                                                       |
| 4   | `POST /users`                                   | **Spec**: 200. **Handler**: 201 Created.                                                                                                                                                                                          |
| 5   | `PATCH /users/{id}/role`                        | **Spec**: 200. **Handler**: 204 No Content.                                                                                                                                                                                       |
| 6   | `POST /workflows/{id}/test-runs/{runId}/cancel` | Present in upstream n8n openapi.yml but **missing from the client spec**.                                                                                                                                                         |
| 7   | `PUT /variables/{id}`                           | **Spec**: body reuses `variable.create` (all fields required). **Handler**: `UpdateVariableRequestDto` has all fields optional.                                                                                                   |
| 8   | `POST /projects`                                | **Spec**: 201 with no body. **Handler**: 201 with JSON body (returns created project). Spec also lists `id`/`type` as body fields; handler does not accept them.                                                                  |
| 9   | `PUT /projects/{projectId}`                     | **Spec**: body `{ name (required), id?, type? }`. **Handler**: `UpdateProjectWithRelationsDto` accepts `{ name?, icon?, description?, relations?, customTelemetryTags? }`. `name` is optional, `id`/`type` not accepted.          |
| 10  | `DELETE /projects/{projectId}`                  | Handler accepts undocumented `transferId` query param.                                                                                                                                                                            |
| 11  | `POST /n8n-packages/export`                     | Handler accepts `includeVariableValues` and `missingWorkflowDependencyPolicy` body fields not in the spec (which has `additionalProperties: false`).                                                                              |
| 12  | `POST /n8n-packages/import`                     | Handler accepts `dataTableMatchingMode`, `dataTableMissingMode`, `dataTableSchemaConflictPolicy` multipart fields not in the spec.                                                                                                |

---

## 3. Per-Endpoint Diff

### Audit

#### POST /audit

|                 | Spec                              | Handler                                                                |
| --------------- | --------------------------------- | ---------------------------------------------------------------------- |
| Scope           | `securityAudit:generate`          | `securityAudit:generate` (via `apiKeyHasScopeWithGlobalScopeFallback`) |
| Body validation | eov validates `additionalOptions` | No Zod re-validation; extra/invalid fields silently ignored            |

### Security Policy

#### GET /settings/security-policy

|                   | Spec                      | Handler                                                              |
| ----------------- | ------------------------- | -------------------------------------------------------------------- |
| Scope             | `securitySettings:manage` | `securitySettings:manage`                                            |
| Undocumented gate | —                         | `isLicensed('feat:personalSpacePolicy')` — returns 403 if unlicensed |
| Response          | `security-policy` schema  | `SecurityPolicyResponse` — matches                                   |

#### PUT /settings/security-policy

|                   | Spec                                           | Handler                                                                  |
| ----------------- | ---------------------------------------------- | ------------------------------------------------------------------------ |
| Body              | `security-policy.update` — all fields optional | `UpdateSecurityPolicyDto` — **all three fields required**                |
| Undocumented gate | —                                              | `isLicensed('feat:personalSpacePolicy')`                                 |
| 409 response      | Generic conflict                               | `ConflictError("These settings are managed via environment variables…")` |

### Source Control

#### POST /source-control/pull

|                          | Spec                 | Handler                                                                  |
| ------------------------ | -------------------- | ------------------------------------------------------------------------ |
| Scope                    | `sourceControl:pull` | `sourceControl:pull`                                                     |
| Undocumented 401         | —                    | Returns 401 when source control is not licensed (distinct from auth 401) |
| Undocumented 400         | —                    | Returns 400 when source control is not connected                         |
| Catch block error format | —                    | Returns bare string for body parse errors, not JSON                      |

---

### Credentials

#### GET /credentials

|                 | Spec                                                                                                         | Handler                                                               |
| --------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| Query params    | `limit`, `cursor`                                                                                            | `limit`, `cursor`, `offset` (internal)                                |
| Response fields | `id,name,type,isManaged,isGlobal,isResolvable,resolvableAllowFallback,resolverId,createdAt,updatedAt,shared` | Only `id,name,type,createdAt,updatedAt,shared` — **missing 5 fields** |

#### POST /credentials

|             | Spec                                      | Handler                                                       |
| ----------- | ----------------------------------------- | ------------------------------------------------------------- |
| Body fields | `name,type,data,isResolvable?,projectId?` | `type,name,data,projectId?` — **`isResolvable` not accepted** |

#### GET /credentials/{id}

|       | Spec              | Handler                                                                                       |
| ----- | ----------------- | --------------------------------------------------------------------------------------------- |
| Scope | `credential:read` | `credential:read` + `projectScope('credential:read','credential')` — undocumented extra check |

#### DELETE /credentials/{id}

|                 | Spec                                 | Handler                                                                                                        |
| --------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| Response schema | `credential` (with writeOnly `data`) | `sanitizeCredentials()` — strips `data` and `shared`, adds `isManaged`, `isGlobal`, etc. — **different shape** |

#### POST /credentials/{id}/test

|             | Spec                  | Handler                                        |
| ----------- | --------------------- | ---------------------------------------------- | --------------------------------------------------------------------------- |
| Response    | Typed `{ status: 'OK' | 'Error', message: string }`                    | Passthrough from `CredentialsService.testById()` — **no shape enforcement** |
| Extra scope | —                     | `projectScope('credential:read','credential')` |

#### PUT /credentials/{id}/transfer

|                | Spec | Handler                                        |
| -------------- | ---- | ---------------------------------------------- |
| Success status | 200  | **204 No Content**                             |
| Extra scope    | —    | `projectScope('credential:move','credential')` |

---

### Executions

#### GET /executions

|             | Spec                                                         | Handler                                          |
| ----------- | ------------------------------------------------------------ | ------------------------------------------------ |
| Pagination  | `limit` + `cursor` (generic)                                 | `lastId`-based cursor (id-based pagination)      |
| Status enum | `canceled,crashed,error,new,running,success,unknown,waiting` | Same, but `queued` is mapped to `new` internally |

#### GET /executions/{id}

|                           | Spec     | Handler                                                                           |
| ------------------------- | -------- | --------------------------------------------------------------------------------- |
| Path param type           | `number` | String (Express route)                                                            |
| Undocumented access check | —        | Requires `workflow:read` on the execution's workflow via `getSharedWorkflowIds()` |

#### DELETE /executions/{id}

|                  | Spec | Handler                                            |
| ---------------- | ---- | -------------------------------------------------- |
| Undocumented 400 | —    | Running executions cannot be deleted (returns 400) |
| Extra scope      | —    | Requires `workflow:delete` on execution's workflow |

#### POST /executions/{id}/retry

|             | Spec | Handler                                             |
| ----------- | ---- | --------------------------------------------------- |
| Extra scope | —    | Requires `workflow:execute` on execution's workflow |

#### POST /executions/{id}/stop

| | Spec | Handler |
|---||---|
| Extra scope | — | Requires `workflow:execute` on execution's workflow |

#### POST /executions/stop

|                | Spec             | Handler                                            |
| -------------- | ---------------- | -------------------------------------------------- |
| Status mapping | `queued` in spec | Mapped to `new` internally — transparent to caller |
| Extra scope    | —                | Requires `workflow:execute`                        |

#### PUT /executions/{id}/tags

|                  | Spec          | Handler                                                             |
| ---------------- | ------------- | ------------------------------------------------------------------- |
| Behavior         | "Update tags" | **Full replacement** (deletes existing, inserts new) — not additive |
| Undocumented 404 | —             | `QueryFailedError` for invalid tag IDs → 404 "Some tags not found"  |
| Extra scope      | —             | Requires `workflow:update` on execution's workflow                  |

---

### Tags

#### POST /tags

|                       | Spec       | Handler                           |
| --------------------- | ---------- | --------------------------------- |
| Body validation       | eov schema | No Zod re-validation (trims name) |
| Undocumented behavior | —          | Name is `.trim()`-ed before save  |

#### GET /tags

|                 | Spec                              | Handler                                                       |
| --------------- | --------------------------------- | ------------------------------------------------------------- |
| Handler mapping | `v1/handlers/tags/tags.handler`   | **`TagsPublicController`** wins at runtime (stub returns 500) |
| Scope           | `tag:list` (with global fallback) | `@ApiKeyScope('tag:list')` — **no global fallback**           |

#### PUT /tags/{id}

|                       | Spec | Handler                          |
| --------------------- | ---- | -------------------------------- |
| Undocumented behavior | —    | Name is `.trim()`-ed before save |

---

### Variables

#### POST /variables

|                   | Spec                 | Handler                                                            |
| ----------------- | -------------------- | ------------------------------------------------------------------ |
| Undocumented gate | —                    | `isLicensed('feat:variables')` — 403 if unlicensed                 |
| Response body     | 201, no body defined | 201 with empty body (client cannot read back the created variable) |
| Key validation    | Any string           | Regex `^[A-Za-z_][A-Za-z0-9_]*$` (no leading digits)               |

#### GET /variables

|                    | Spec               | Handler                                                                    |
| ------------------ | ------------------ | -------------------------------------------------------------------------- |
| Pagination         | Server-side cursor | **In-memory** (`paginateArray` slices fetched array) — O(n) for large sets |
| Undocumented query | —                  | `projectId === 'null'` string is treated as `null`                         |

#### PUT /variables/{id}

|             | Spec                                    | Handler                                                |
| ----------- | --------------------------------------- | ------------------------------------------------------ |
| Body schema | Reuses `variable.create` (all required) | `UpdateVariableRequestDto` — **all fields optional**   |
| Key regex   | Same as create                          | Different: allows leading digits (`/^[A-Za-z0-9_]+$/`) |

---

### Projects

#### POST /projects

|                   | Spec                              | Handler                                                                             |
| ----------------- | --------------------------------- | ----------------------------------------------------------------------------------- |
| Undocumented gate | —                                 | `isLicensed('feat:projectRole:admin')`                                              |
| Body fields       | `{ name (required), id?, type? }` | `{ name, icon?, uiContext? }` — different optional fields; `id`/`type` not accepted |
| Response          | 201, no body                      | 201 with JSON body (returns created project)                                        |

#### PUT /projects/{projectId}

|             | Spec                              | Handler                                                                                          |
| ----------- | --------------------------------- | ------------------------------------------------------------------------------------------------ |
| Body fields | `{ name (required), id?, type? }` | `{ name?, icon?, description?, relations?, customTelemetryTags? }` — name optional, extra fields |
| Response    | 204                               | 204 ✓                                                                                            |

#### DELETE /projects/{projectId}

|                    | Spec | Handler                                              |
| ------------------ | ---- | ---------------------------------------------------- |
| Undocumented query | —    | `transferId?: string` — transfer resources on delete |

#### PATCH /projects/{projectId}/users/{userId}

|                 | Spec       | Handler                                       |
| --------------- | ---------- | --------------------------------------------- |
| Role validation | Any string | `assignableProjectRoleSchema` — stricter enum |

#### POST /projects/{projectId}/users

|                  | Spec          | Handler                                                     |
| ---------------- | ------------- | ----------------------------------------------------------- |
| Min relations    | Not specified | `min(1)` — at least one relation required                   |
| Undocumented 403 | —             | Rejected when project roles are auto-managed (provisioning) |

---

### Folders

#### GET /projects/{projectId}/folders

|                   | Spec              | Handler                      |
| ----------------- | ----------------- | ---------------------------- |
| Response          | `{ count, data }` | Same ✓ (no `nextCursor`)     |
| Undocumented gate | —                 | `isLicensed('feat:folders')` |

#### All folder endpoints

|                    | Spec | Handler                                                             |
| ------------------ | ---- | ------------------------------------------------------------------- |
| Undocumented gate  | —    | All require `isLicensed('feat:folders')`                            |
| Undocumented scope | —    | All enforce `assertProjectScope(req.user, projectId, ['folder:*'])` |
| Undocumented alias | —    | `personal` accepted as `projectId` path param                       |

---

### Users

#### POST /users

|                | Spec | Handler         |
| -------------- | ---- | --------------- |
| Success status | 200  | **201 Created** |

#### PATCH /users/{id}/role

|                   | Spec | Handler                                  |
| ----------------- | ---- | ---------------------------------------- |
| Success status    | 200  | **204 No Content**                       |
| Undocumented gate | —    | `isLicensed('feat:advancedPermissions')` |

#### GET /users

|                        | Spec | Handler                                                       |
| ---------------------- | ---- | ------------------------------------------------------------- |
| Undocumented gate      | —    | Requires valid license with unlimited user quota              |
| Undocumented assertion | —    | `UserService.assertGetUsersAccess` — additional authorization |

---

### Data Tables

#### All data table endpoints

|                    | Spec | Handler                                                                                       |
| ------------------ | ---- | --------------------------------------------------------------------------------------------- |
| Undocumented scope | —    | All single-resource endpoints enforce `projectScope(...)` middleware not declared in the spec |

Specific extra scopes by operation:

| Endpoint                                            | Extra projectScope                                |
| --------------------------------------------------- | ------------------------------------------------- |
| GET/PATCH/DELETE `/data-tables/{id}`                | `dataTable:read/update/delete`                    |
| GET `/data-tables/{id}/rows`                        | `dataTable:readRow`                               |
| POST `/data-tables/{id}/rows`                       | `dataTable:writeRow`                              |
| PATCH/DELETE `/data-tables/{id}/rows/*`             | `dataTable:writeRow`                              |
| GET/POST/PATCH/DELETE `/data-tables/{id}/columns/*` | `dataTable:readColumn` or `dataTable:writeColumn` |

#### GET /data-tables (list)

|                    | Spec | Handler                                              |
| ------------------ | ---- | ---------------------------------------------------- |
| Undocumented scope | —    | Checks `dataTable:listProject` for project filtering |

---

### Community Packages

#### POST /community-packages

|                 | Spec          | Handler                                              |
| --------------- | ------------- | ---------------------------------------------------- |
| Body validation | eov validates | No Zod/DTO re-validation — reads `req.body` directly |

#### PATCH /community-packages/{name}

|                 | Spec          | Handler                                              |
| --------------- | ------------- | ---------------------------------------------------- |
| Body validation | eov validates | No Zod/DTO re-validation — reads `req.body` directly |

---

### Insights

#### GET /insights/summary

|                  | Spec | Handler                                                             |
| ---------------- | ---- | ------------------------------------------------------------------- |
| Undocumented 403 | —    | `InsightsService.validateDateFiltersLicense` — license-specific 403 |

---

### Workflows

#### POST /workflows

|                         | Spec | Handler                                                             |
| ----------------------- | ---- | ------------------------------------------------------------------- |
| Undocumented body field | —    | `parentFolderId` accepted but not in spec's `workflowCreate` schema |

#### GET /workflows

|                           | Spec                      | Handler                                               |
| ------------------------- | ------------------------- | ----------------------------------------------------- |
| `active` filter semantics | Filter on `active` column | Filters on `activeVersionId` — semantically different |

#### GET /workflows/{id}

|             | Spec | Handler                                                   |
| ----------- | ---- | --------------------------------------------------------- |
| Extra scope | —    | `projectScope('workflow:read','workflow')` — undocumented |

#### PUT /workflows/{id}

|                         | Spec | Handler                                                       |
| ----------------------- | ---- | ------------------------------------------------------------- |
| Undocumented body field | —    | `parentFolderId` accepted but not in spec's `workflow` schema |
| Undocumented behavior   | —    | `forceSave: true` skips version conflict check                |
| Extra scope             | —    | `projectScope('workflow:update','workflow')`                  |

#### POST /workflows/{id}/activate

|                | Spec                | Handler                                                                                    |
| -------------- | ------------------- | ------------------------------------------------------------------------------------------ |
| Scope mismatch | `workflow:activate` | Handler also enforces `projectScope('workflow:publish','workflow')` — different scope name |

#### POST /workflows/{id}/deactivate

|                | Spec                  | Handler                                                                                      |
| -------------- | --------------------- | -------------------------------------------------------------------------------------------- |
| Scope mismatch | `workflow:deactivate` | Handler also enforces `projectScope('workflow:unpublish','workflow')` — different scope name |

#### PUT /workflows/{id}/transfer

|                | Spec | Handler            |
| -------------- | ---- | ------------------ |
| Success status | 200  | **204 No Content** |

#### GET/PUT /workflows/{id}/tags

|                  | Spec | Handler                                                                                  |
| ---------------- | ---- | ---------------------------------------------------------------------------------------- |
| Undocumented 400 | —    | Throws 400 when tags are globally disabled (`GlobalConfig.tags.disabled`)                |
| PUT extra scope  | —    | `projectScope('workflow:update','workflow')` instead of documented `workflowTags:update` |

#### GET /workflows/{id}/test-runs

|             | Spec | Handler                                                   |
| ----------- | ---- | --------------------------------------------------------- |
| Extra scope | —    | `projectScope('workflow:read','workflow')` — undocumented |

#### GET /workflows/{id}/test-runs/{runId}

|             | Spec | Handler                                                   |
| ----------- | ---- | --------------------------------------------------------- |
| Extra scope | —    | `projectScope('workflow:read','workflow')` — undocumented |

#### GET /workflows/{id}/test-runs/{runId}/test-cases

|             | Spec | Handler                                                   |
| ----------- | ---- | --------------------------------------------------------- |
| Extra scope | —    | `projectScope('workflow:read','workflow')` — undocumented |

#### POST /workflows/{id}/test-runs/{runId}/cancel

|                              | Spec                                | Handler                            |
| ---------------------------- | ----------------------------------- | ---------------------------------- |
| **Missing from client spec** | Present in upstream n8n openapi.yml | Exists in `evaluations.handler.ts` |

---

## Cross-Cutting Summary

### Systemic issues affecting many endpoints

| Category                                   | Endpoints affected                                                                                                                                                                                                 | Notes                                                                                                                |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| **Undocumented `projectScope` middleware** | Most single-resource endpoints across all domains                                                                                                                                                                  | Enforces project-level permissions beyond the declared API key scope. Clients cannot know these exist from the spec. |
| **Undocumented license gates**             | Variables (`feat:variables`), Projects (`feat:projectRole:admin`), Folders (`feat:folders`), Users role (`feat:advancedPermissions`), Security Policy (`feat:personalSpacePolicy`), Insights (date filter license) | Returns 403 when feature is not licensed — spec shows generic 403 but not the license-specific reason.               |
| **Status code mismatches**                 | `PUT /workflows/{id}/transfer` (204 vs 200), `PUT /credentials/{id}/transfer` (204 vs 200), `POST /users` (201 vs 200), `PATCH /users/{id}/role` (204 vs 200)                                                      |                                                                                                                      |
| **Response schema mismatches**             | `GET /credentials` (missing 5 fields), `DELETE /credentials/{id}` (different shape)                                                                                                                                |                                                                                                                      |
| **Request body schema mismatches**         | `PUT /settings/security-policy`, `PUT /variables/{id}`, `POST /projects`, `PUT /projects/{projectId}`, `POST /n8n-packages/export`, `POST /n8n-packages/import`                                                    | Handler accepts fields not in spec, or requires fields spec marks optional.                                          |
| **Undocumented error responses**           | `PUT /settings/security-policy` (409), `DELETE /executions/{id}` (400 for running), `GET/PUT /workflows/{id}/tags` (400 when disabled)                                                                             |                                                                                                                      |
| **Extra path params / query params**       | `DELETE /projects/{projectId}` (`transferId`), `GET /variables` (`projectId === 'null'`)                                                                                                                           |                                                                                                                      |

### Paths present in client spec but absent from upstream n8n openapi.yml

None found — the client spec is a strict subset of the upstream spec (plus one tag ordering difference).

### Paths present in upstream n8n openapi.yml but absent from client spec

| Path                                             | Methods          |
| ------------------------------------------------ | ---------------- |
| `/settings/sso/saml`                             | GET, PUT         |
| `/workflows/{id}/test-runs/{runId}/cancel`       | POST             |
| `/settings/log-streaming/event-types`            | GET              |
| `/settings/log-streaming/destinations`           | GET, POST        |
| `/settings/log-streaming/destinations/{id}/test` | POST             |
| `/settings/log-streaming/destinations/{id}`      | GET, PUT, DELETE |
