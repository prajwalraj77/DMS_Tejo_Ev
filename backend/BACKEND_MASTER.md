# TEJO EV DMS — Backend Master Handoff

> **Purpose:** This file records the known backend architecture, work completed or discussed, and remaining tasks. Paste it into a future chat and say:  
> **“Continue the TEJO EV DMS backend from BACKEND_MASTER.md. Inspect my current code where needed, distinguish confirmed from unverified work, and proceed incrementally.”**
>
> **Last updated:** 24 October 2026  
> **Scope:** Backend only. Frontend progress is maintained separately in `MASTER.md` or a frontend-specific handoff.

---

## 1. Project overview

TEJO EV DMS is a dealer management system with a Node.js/Express backend, MongoDB Atlas/Mongoose, JWT authentication, role-based permissions, and vehicle/inventory/stock-inward workflows.

The backend must enforce security and business rules itself. Frontend visibility or route protection is not a substitute for API authorization.

## 2. Backend technology and roles

### Stack
- Node.js
- Express
- ESM modules
- MongoDB Atlas
- Mongoose
- JWT bearer authentication

### Known roles
- `ADMIN`
- `DEALER`
- `SUB_DEALER`
- `SALES_EXECUTIVE`
- `HR`

Confirm role constants and exact model names from the current source before changing code.

## 3. Authentication — known implementation

- Login endpoint: `POST /api/users/login`.
- Successful login returns `message`, `token`, and `user`.
- The frontend uses the `user.id` field; don't assume it is `_id`.
- Authentication middleware reads a JWT bearer token.
- It loads the user while excluding the password, assigns the user to `req.user`, and rejects deactivated accounts.
- A permission middleware checks the required permission against `req.user.permissions`.
- Admin is allowed to bypass the permission check.

### Security notes
- Never trust a user ID or ownership field supplied by the client when the server can derive it from `req.user`.
- Do not put real credentials, tokens, or database connection strings in this document.
- A token was shared in an earlier chat. Do not repeat it; obtain a fresh login token for testing if needed.

## 4. Permission catalog — known examples

The user/permission setup has included permission names such as:

- `vehicles.view`
- `vehicles.create`
- `vehicles.edit`
- `vehicles.delete`
- `inventory.view`
- `inventory.create`
- `inventory.edit`
- `inventory.delete`
- `stockInwards.view`
- `stockInwards.create`
- `stockInwards.edit`
- `stockInwards.delete`
- `stockInwards.approve`
- Employee and billing permissions

**Important:** This is a list of known examples, not a verified complete catalog. Inspect current permission constants/routes and assigned user permissions before relying on exact names.

## 5. Vehicles and inventory — known status

- Vehicle routes were secured with authentication and vehicle permission middleware.
- Inventory item routes were secured with authentication and inventory permission middleware.
- A SubDealer GET request was tested and returned inventory items including `E SCOOTER` and `E Loader`.

### Verify
- Every route has the correct permission.
- List, read, update, and delete operations enforce data ownership/tenant boundaries.
- Users cannot access another dealer's or sub-dealer's records by changing an ID in the request.
- Validation and business rules are enforced server-side.

## 6. Stock inward workflow — known status

Stock inward creation, pending list, and approval routes exist.

### Intended route security and behavior
- Create: authenticated user + `stockInwards.create`.
- Pending list: authenticated user + `stockInwards.view`.
- Approve: authenticated user + `stockInwards.approve`.
- The implementation has been described as retaining an explicit Admin-only approval rule. Verify this in the current route/controller before treating it as confirmed.
- The backend should set `submittedBy` from `req.user`, not from a frontend-supplied submitter ID.
- The backend should set `approvedBy` from `req.user`.
- Approval creates a Vehicle in a MongoDB transaction.
- Vehicle allocation details have included source stock owner, destination allocation type `DEALER`, destination ID, and status `ALLOCATED`.

### Verify and test
- Transaction/session setup and cleanup are correct.
- Duplicate chassis/motor/battery identifiers are handled safely.
- Approval cannot be repeated or race with another approval.
- The destination is valid and authorized for the acting user.
- Client-supplied IDs cannot change the submitter, approver, stock owner, or tenant.
- Error responses do not leak internal database or stack details.

## 7. Known test context

- A local SubDealer test account was previously used.
- Do not assume the old account or password is still valid.
- A SubDealer inventory GET test succeeded previously.
- Re-authenticate for new tests; do not reuse or share old JWT values.

## 8. Backend tasks still pending / requiring verification

This section is a work plan, not a claim that the items are already complete.

### A. Authorization and tenant isolation
1. Inspect all route files and middleware.
2. Create an endpoint/permission matrix: route, HTTP method, required auth, required permission, allowed role, tenant/ownership rule.
3. Ensure dealer and sub-dealer queries are scoped to the authenticated user's authorized organization/branch.
4. Test horizontal access control by attempting to access records belonging to another dealer/sub-dealer using different IDs.
5. Ensure Admin access is intentional and documented.

### B. Validation and business rules
6. Validate request bodies, params, and query values.
7. Enforce required fields and correct data types.
8. Prevent invalid status transitions.
9. Check duplicate vehicle identifiers and stock movements.
10. Ensure all trusted fields are assigned by backend logic.

### C. Data consistency
11. Review stock inward approval transactions.
12. Review stock counts and inventory updates for consistency.
13. Consider concurrent approvals and duplicate requests.
14. Confirm transaction behavior is supported by the MongoDB deployment configuration.

### D. API quality
15. Standardize success and error response shapes where practical.
16. Review pagination, filtering, and sorting for list endpoints.
17. Avoid returning passwords, tokens, or sensitive internal fields.
18. Add appropriate logging without logging secrets or sensitive data.

### E. Configuration and deployment
19. Keep secrets in environment variables and out of source control.
20. Verify production CORS origins.
21. Configure safe production error handling.
22. Review rate limiting and login abuse protections.
23. Verify HTTPS and deployment environment settings.
24. Add automated tests for auth, permissions, ownership, and core workflows.

## 9. Frontend/backend integration notes

The frontend's shared Axios client currently uses:
- Base URL: `http://localhost:5000/api`
- JWT header: `Authorization: Bearer <token>`
- Token key in browser Local Storage: `tejo_token`

Frontend integration tasks are documented separately. The backend should continue to enforce authentication, permissions, ownership, and validation regardless of frontend behavior.

## 10. How to resume backend work

Paste this file into a future chat and say:

> Continue the TEJO EV DMS backend from BACKEND_MASTER.md. First inspect or ask me for the relevant current backend files. Confirm which items are actually implemented versus only planned. Then start with a route-by-route authorization and tenant-scope review. Work in small steps, explain each change, and wait for me to test before moving on.
