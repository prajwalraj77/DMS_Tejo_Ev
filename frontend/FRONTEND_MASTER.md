# TEJO EV DMS — Frontend Master Handoff

> **Purpose:** This file records the known frontend architecture, confirmed progress, integration notes, and pending UI work. Paste it into a future chat and say:  
> **“Continue the TEJO EV DMS frontend from FRONTEND_MASTER.md. Preserve my current design, verify current files before editing, and proceed step by step.”**
>
> **Last updated:** 24 October 2026  
> **Scope:** React frontend. Backend-specific work is tracked separately in `BACKEND_MASTER.md`.

---

## 1. Project overview

We are building the frontend for the **TEJO EV Dealer Management System (DMS)**.

The frontend should be the actual DMS interface connected to the existing backend APIs—not a separate API testing dashboard.

Known frontend technologies:
- React
- React Router
- Tailwind CSS
- Axios
- Lucide icons

The existing interface has a premium dashboard style. Preserve the established design and avoid replacing entire pages without a clear reason.

## 2. How to work with the user

- Explain concepts in beginner-friendly language.
- Make changes in small, understandable steps.
- Prefer one file or a small group of related files at a time.
- Explain what each change does and why.
- Ask the user to test after each step before moving to the next.
- Do not assume a change is complete unless the user confirms it.
- Avoid dumping the entire application at once.
- Inspect the current file content before making changes, especially if a file has already been edited.
- For React/programming questions, focus on conceptual understanding and debugging, not unnecessary rewrites.

## 3. Approximate frontend structure

Known files from previous work:

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

This is an approximate known structure. Inspect the actual project because more files and folders may exist.

## 4. Shared API client — created

File: `frontend/src/services/api.js`

```js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("tejo_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
```

### Behavior
- Uses `http://localhost:5000/api` as the current backend base URL.
- Reads the token from Local Storage key `tejo_token`.
- Adds `Authorization: Bearer <token>` to requests when a token exists.

### Future considerations
- Use environment configuration for the API URL rather than hardcoding it for deployment.
- Review token storage before production. Local Storage can be exposed by XSS; choose a secure auth/session strategy appropriate for the app.

## 5. AuthContext — created

File: `frontend/src/context/AuthContext.jsx`

Known behavior:
- Initializes user from Local Storage key `tejo_user`.
- Initializes token from Local Storage key `tejo_token`.
- Provides `login(email, password)`.
- Login calls `POST /users/login` through the shared API client.
- Saves the returned token and user.
- Provides `logout()` that removes the stored token and user and clears React state.
- Provides `user`, `token`, and `isAuthenticated`.

The login response is destructured using:
```js
const { token: newToken, user: loggedInUser } = response.data;
```

Backend login user object uses `user.id`; do not assume `_id` is present.

### Future considerations
- Consider safe parsing of saved Local Storage JSON.
- Ensure state and browser storage remain synchronized.
- Review auth persistence and token expiration behavior.

## 6. AuthProvider — added

`main.jsx` wraps `<App />` in `<AuthProvider>`.

The known intended structure is:

```jsx
<StrictMode>
  <AuthProvider>
    <App />
  </AuthProvider>
</StrictMode>
```

Verify the actual `main.jsx` before editing.

## 7. Login page — created and tested

File: `frontend/src/pages/Login.jsx`

Known behavior:
- Email and password fields.
- Uses `useAuth()` from AuthContext.
- Calls the context `login` function.
- Displays an error message if login fails.
- Redirects already-authenticated users to `/dashboard`.
- On successful login, navigates to `/dashboard`.

**User confirmed:** Login succeeds and redirects to the dashboard.

The login page uses a premium two-column visual design. Preserve it while making any later improvements.

## 8. ProtectedRoute — created and tested

File: `frontend/src/components/ProtectedRoute.jsx`

Known implementation:

```jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
```

**User confirmed:** Dashboard route protection works.

This is a frontend navigation guard only. Backend APIs must independently enforce authentication, permissions, and ownership.

## 9. App routing — protected

Known routes:
- Public: `/login`
- Protected root `/` redirects to `/dashboard`
- Protected dashboard layout: `/dashboard`
- Nested dashboard pages:
  - `/dashboard/stock/upload`
  - `/dashboard/stock/approvals`
  - `/dashboard/stock/inventory`
- Unknown routes redirect to `/dashboard`

The exact current `App.jsx` should be inspected before further modifications.

## 10. Existing dashboard shell

Known components:
- `DashboardLayout.jsx` uses Sidebar, Header, and React Router `Outlet`.
- `Sidebar.jsx` contains navigation for dashboard, Sales/Billing, Dealer & Users, and stock pages.
- `Header.jsx` includes a search field, notification bell, and profile section.
- The existing visual style is premium and should be preserved.

### Known incomplete behavior
- Header profile text was static (e.g., TEJO EV Admin / Head Office).
- Sidebar may show static Admin-related labels.
- Logout has not yet been wired into the Header.
- Some Sidebar destinations may not yet have corresponding React routes.

## 11. Current confirmed checkpoint

Confirmed by the user:
1. Shared API client created.
2. AuthContext created.
3. AuthProvider added to `main.jsx`.
4. Login page created.
5. Login works and redirects to dashboard.
6. ProtectedRoute created.
7. Protected dashboard routing works.

The user chose to keep a separate master document for frontend progress and a separate one for backend progress.

## 12. Next frontend task — Header user info and Logout

The next intended task is:
- Display the actual logged-in user's name in the Header.
- Display their role (e.g. `ADMIN`, `DEALER`, `SUB_DEALER`).
- Show a user initial/avatar based on the actual user data.
- Add a Logout action using `logout()` from AuthContext.
- Redirect to `/login` after logout.
- Preserve the current Header layout and styling.
- Test that after logout, direct navigation to `/dashboard` redirects to `/login`.

**Important:** The user was asked to paste the current full `Header.jsx` before changing it, to preserve the existing layout. At this point, the current Header source has not yet been provided in the known conversation context.

## 13. StockUpload integration — pending

Previously observed `StockUpload.jsx` details:
- Uses direct Axios calls and a hardcoded API URL.
- Has a hardcoded `SUBMITTED_BY` user ID.
- Fetches:
  - `/vehicle-models`
  - `/battery-variants`
  - `/inventory-items`
- Expects response keys:
  - `AllVehicleModel`
  - `allBatteryVariant`
  - `AllInventoryItem`
- Submits to `/stock-inwards`.
- Form fields include GST rate, inventory item, model, battery variant, colour, chassis number, motor number, battery number, controller number, and charger number.
- Required-field validation excludes controller number and charger number.

### Required follow-up
- Replace direct Axios usage with the shared `api` client.
- Remove the hardcoded API URL.
- Remove `SUBMITTED_BY`.
- Do not send `submittedBy` from frontend; backend should derive it from authenticated `req.user`.
- Confirm API response shapes against actual backend responses.
- Preserve the current form and design.
- Test dropdown data loading and stock inward submission with a permitted account.

Do not rewrite the whole page unless the user asks or the existing code makes it necessary.

## 14. Other frontend work pending

### Stock workflow
- Connect Transfer Approvals page to the backend pending stock inward and approval endpoints.
- Connect Stock Inventory page to actual inventory/vehicle APIs.
- Add loading, error, empty, and success states.
- Ensure actions are visible/enabled based on the current user's permissions.

### User and dealer management
- Build or finish dealer/sub-dealer management pages.
- Build or finish user management and permission assignment.
- Connect forms and tables to actual APIs.
- Handle form validation and server errors.

### Billing and other modules
- Build/finish Sales and Billing pages.
- Build/finish Employee/HR pages if required.
- Add React routes for Sidebar destinations.
- Ensure all private pages are protected.

### UI/UX and reliability
- Show logged-in user details in Header and Sidebar.
- Implement Logout.
- Add consistent API loading/error handling.
- Make pages responsive.
- Check accessibility basics (labels, focus states, keyboard interaction).
- Avoid exposing privileged actions to users without permissions; remember that backend authorization is still the security boundary.

## 15. Testing checklist

- [x] Login works and redirects to dashboard.
- [x] Protected dashboard route works.
- [ ] Logout clears auth state and redirects to login.
- [ ] Direct dashboard URL redirects after logout.
- [ ] Header displays actual user and role.
- [ ] Sidebar visibility reflects role/permissions.
- [ ] StockUpload dropdowns load from backend.
- [ ] Stock inward submission uses authenticated identity.
- [ ] Transfer approvals are connected and tested.
- [ ] Stock inventory is connected and tested.
- [ ] Dealer/user/billing/HR routes and pages are tested.
- [ ] Test multiple roles and permission combinations.
- [ ] Production build and deployment configuration are verified.

## 16. Resume prompt

Paste this file into a future chat and say:

> Continue the TEJO EV DMS frontend from FRONTEND_MASTER.md. Start with the next task: update Header to show the actual logged-in user's name and role and implement Logout. First ask me for my current `Header.jsx` code if it is not available. Preserve my existing premium UI, make one small change at a time, explain it, and wait for me to test.
