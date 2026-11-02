# TEJO EV DMS — Project Master Handoff

> Use this file to resume the TEJO EV DMS project in a future chat. Paste this document and say:  
> **“Continue the TEJO EV DMS project from MASTER.md. Use the recorded progress, verify current code where necessary, and continue incrementally.”**
>
> **Last updated:** 24 October 2026  
> **Current checkpoint:** Frontend login and protected dashboard routes are working, as confirmed by the user.

---

## 1. Project overview

TEJO EV DMS is a Dealer Management System being developed with:
- React frontend
- Node.js / Express backend
- MongoDB Atlas / Mongoose
- JWT authentication
- Role-based permissions
- Vehicle, inventory, and stock-inward workflows

The goal is to connect the actual DMS UI to backend APIs, not create a standalone API testing dashboard.

## 2. Working style

- Continue from the existing codebase; do not restart the project.
- Explain concepts in beginner-friendly language.
- Make small changes, preferably one file or a tightly related group at a time.
- Explain what each change does and why.
- Ask the user to test after each step before proceeding.
- Do not assume a task is complete unless the user confirms it.
- Preserve the existing premium UI and routes.
- Avoid unnecessary full-file rewrites.
- For React/programming help, guide understanding and debugging rather than rewriting everything.

## 3. Backend status

### Technology and roles
- Node.js / Express with ESM.
- MongoDB Atlas / Mongoose.
- JWT bearer authentication.
- Known roles: `ADMIN`, `DEALER`, `SUB_DEALER`, `SALES_EXECUTIVE`, `HR`.

### Authentication
- Login endpoint: `POST /api/users/login`.
- Successful login returns `message`, `token`, and `user`.
- Login response uses `user.id`; do not assume `_id` exists.
- Auth middleware reads the JWT bearer token, loads the user excluding password, assigns `req.user`, and rejects deactivated users.
- Permission middleware checks `req.user.permissions`.
- Admin bypasses permission checks.

### Known permission examples
- `vehicles.view/create/edit/delete`
- `inventory.view/create/edit/delete`
- `stockInwards.view/create/edit/delete`
- `stockInwards.approve`
- Employee and billing permissions

Verify exact permission names and assignments in current source before relying on them.

### Vehicle and inventory APIs
- Vehicle routes were secured with authentication and vehicle permissions.
- Inventory item routes were secured with authentication and inventory permissions.
- A SubDealer GET test returned inventory entries including `E SCOOTER` and `E Loader`.

### Stock inward workflow
- Stock inward create, pending-list, and approval routes exist.
- Intended permissions:
  - Create: `stockInwards.create`
  - Pending list: `stockInwards.view`
  - Approve: `stockInwards.approve`
- An explicit Admin-only approval rule was discussed; verify that it remains in the current route/controller.
- Backend should derive `submittedBy` and `approvedBy` from `req.user`, not trust frontend IDs.
- Approval creates a Vehicle using a MongoDB transaction.
- Vehicle allocation has included source stock owner, destination allocation type `DEALER`, destination ID, and status `ALLOCATED`.

### Backend work still needing verification
- Confirm auth and permissions on all sensitive routes.
- Verify dealer/sub-dealer ownership and tenant scoping. Role checks alone do not prevent cross-tenant access.
- Validate request bodies, route params, and query strings.
- Review transaction correctness, duplicate chassis/vehicle identifiers, and concurrent approvals.
- Ensure client cannot override trusted fields such as submitter, approver, stock owner, or tenant.
- Review error handling, logging, CORS, rate limiting, secrets, and deployment configuration.
- Do not claim security findings are fixed without evidence and testing.

---

## Continue in Part 2

Part 2 contains frontend status, confirmed checkpoint, and next steps.

# TEJO EV DMS — MASTER.md (Part 2)

## 4. Frontend status

### Approximate known structure
```text
frontend/src/
  components/
    Header.jsx
    Sidebar.jsx
    ProtectedRoute.jsx
  context/
    AuthContext.jsx
  layouts/
    DashboardLayout.jsx
  pages/
    Login.jsx
    StockInventory.jsx
    StockUpload.jsx
    TransferApprovals.jsx
  services/
    api.js
  App.jsx
  index.css
  main.jsx
```
This is approximate; inspect actual files before editing.

### Shared API client — created
File: `frontend/src/services/api.js`

- Axios base URL: `http://localhost:5000/api`
- Reads `tejo_token` from Local Storage.
- Adds `Authorization: Bearer <token>` to requests.

The current base URL is hardcoded; consider environment configuration for deployment. Local Storage token storage should be reviewed for production security and XSS risk.

### AuthContext — created
File: `frontend/src/context/AuthContext.jsx`

Known behavior:
- Reads `tejo_user` and `tejo_token` from Local Storage.
- Provides `login(email, password)`.
- Calls `POST /users/login` using the shared API client.
- Stores returned token and user.
- Provides `logout()` to clear stored auth data and React state.
- Exposes `user`, `token`, and `isAuthenticated`.

### AuthProvider
`main.jsx` wraps `<App />` in `<AuthProvider>`.

### Login page — created and confirmed working
File: `frontend/src/pages/Login.jsx`

- Email/password login form.
- Uses AuthContext.
- Shows login errors.
- Redirects authenticated users to `/dashboard`.
- User confirmed that login works and redirects to the dashboard.

### ProtectedRoute — created and confirmed working
File: `frontend/src/components/ProtectedRoute.jsx`

- Checks `isAuthenticated`.
- Redirects unauthenticated users to `/login`.
- Renders nested routes through `<Outlet />`.

The user confirmed dashboard route protection works. This is only a frontend guard; backend APIs must enforce authorization independently.

### App routes
Known routes:
- Public `/login`
- Protected `/` redirects to `/dashboard`
- Protected `/dashboard` layout
- `/dashboard/stock/upload`
- `/dashboard/stock/approvals`
- `/dashboard/stock/inventory`
- Unknown routes redirect to `/dashboard`

Verify current `App.jsx` before editing.

### Existing dashboard UI
- `DashboardLayout.jsx` uses Sidebar, Header, and Outlet.
- Sidebar contains dashboard, Sales/Billing, Dealer & Users, and stock navigation.
- Header includes search, notifications, and a profile section.
- The existing premium styling should be preserved.
- Header profile and sidebar labels were previously static (Admin / Head Office).
- Some sidebar links may not yet have matching routes.

## 5. StockUpload integration issue

Previously observed `StockUpload.jsx`:
- Uses direct Axios calls and a hardcoded API URL.
- Contains a hardcoded `SUBMITTED_BY` user ID.
- Fetches `/vehicle-models`, `/battery-variants`, and `/inventory-items`.
- Expects response keys `AllVehicleModel`, `allBatteryVariant`, and `AllInventoryItem`.
- Submits to `/stock-inwards`.
- Form includes GST rate, inventory item, model, battery variant, colour, chassis number, motor number, battery number, controller number, and charger number.
- Required-field validation excludes controller number and charger number.

### Required integration
- Use the shared `api` client.
- Remove hardcoded API URL and submitter ID.
- Do not send `submittedBy` from the frontend; backend derives it from `req.user`.
- Confirm actual API response structures.
- Preserve existing UI and fields.
- Test dropdowns and stock inward submission using a permitted user.

## 6. Confirmed checkpoint

User confirmed:
- Shared Axios API client created.
- AuthContext created.
- AuthProvider added.
- Login page created.
- Login succeeds and redirects to dashboard.
- ProtectedRoute created.
- Dashboard route protection works.

The user is maintaining separate handoff documents for overall project, backend, and frontend.

## 7. Frontend next steps

1. Update Header to display actual logged-in user's name and role.
2. Add Logout using AuthContext's `logout()` and redirect to `/login`.
3. Test that direct `/dashboard` access redirects after logout.
4. Update Sidebar labels/visibility based on actual user and permissions.
5. Refactor StockUpload to use the shared API client and authenticated identity.
6. Connect Transfer Approvals to backend pending/approve APIs.
7. Connect Stock Inventory to actual APIs.
8. Add consistent loading, empty, success, and error states.
9. Finish dealer/sub-dealer management, user/permission management, billing, and HR pages as required.
10. Add missing routes for Sidebar destinations.
11. Test multiple roles and permission combinations.
12. Verify production build and deployment configuration.

### Immediate next task
The user was asked to provide the current complete `frontend/src/components/Header.jsx` before changing it. The next task is to show logged-in user's name and role and implement Logout while preserving existing design. The Header source has not yet been provided in the known conversation context.

## 8. Testing checklist

- [x] Login works and redirects to dashboard.
- [x] Protected dashboard route works.
- [ ] Header displays actual user name and role.
- [ ] Logout clears auth state and redirects to login.
- [ ] Direct dashboard URL redirects after logout.
- [ ] Sidebar visibility reflects permissions.
- [ ] StockUpload dropdowns load from backend.
- [ ] Stock inward uses authenticated identity.
- [ ] Transfer Approvals connected and tested.
- [ ] Stock Inventory connected and tested.
- [ ] Dealer/user/billing/HR pages and routes completed as needed.
- [ ] Role-based access and backend enforcement tested.
- [ ] Production build and deployment verified.

## 9. Important cautions

- Never put real passwords, production JWTs, or database credentials in master files.
- A test account was used locally previously; do not assume its credentials remain valid.
- A JWT was shared in an earlier chat; do not repeat it. Log in again to obtain a fresh token when testing.
- The frontend port may be Vite's default `5173`; verify if needed.
- Backend API base URL currently configured in frontend is `http://localhost:5000/api`.
- Treat the tasks above as pending until verified; distinguish confirmed progress from plans.

---

## 10. Resume prompt

Paste this file into a future chat and say:

> Continue the TEJO EV DMS from MASTER.md. First confirm the known checkpoint. Then proceed with the next frontend task: ask me for my current `Header.jsx` if not present, and implement actual user name/role plus Logout. Preserve the existing premium design, make one small change at a time, explain it, and wait for me to test.
