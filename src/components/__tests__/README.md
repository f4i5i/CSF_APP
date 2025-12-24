# ProtectedRoute Tests

Comprehensive test suite for the protected route component with role-based access control (RBAC).

## Test Coverage

### 1. Loading State Tests
- ✅ Shows loading spinner while auth is initializing
- ✅ Hides loading spinner after auth initialization completes

### 2. Unauthenticated Access Tests
- ✅ Redirects to `/login` when user is not authenticated
- ✅ Passes return URL in location state for post-login redirect
- ✅ Does not render protected content when unauthenticated

### 3. Authenticated Access (No Role Requirement)
Tests that any authenticated user can access routes without role requirements:
- ✅ Parent users can access
- ✅ Coach users can access
- ✅ Admin users can access
- ✅ Owner users can access

### 4. Role-Based Access Control (RBAC)

#### Admin Role Tests
- ✅ Admin can access admin-only routes
- ✅ Parent redirected to `/dashboard` when accessing admin routes
- ✅ Coach redirected to `/coachdashboard` when accessing admin routes
- ✅ Owner redirected to default dashboard (different role)

#### Coach Role Tests
- ✅ Coach can access coach-only routes
- ✅ Parent redirected to `/dashboard` when accessing coach routes
- ✅ Admin redirected to `/admin` when accessing coach routes

#### Parent Role Tests
- ✅ Parent can access parent-only routes
- ✅ Coach redirected to `/coachdashboard` when accessing parent routes
- ✅ Admin redirected to `/admin` when accessing parent routes

### 5. Role-Based Redirect Tests
Tests automatic redirect to appropriate dashboard for unauthorized access:
- ✅ Parent → `/dashboard`
- ✅ Coach → `/coachdashboard`
- ✅ Admin → `/admin`

### 6. Case Sensitivity Tests
- ✅ Role comparison is case-insensitive (PARENT vs parent)
- ✅ Role comparison is case-insensitive (ADMIN vs admin)
- ✅ Role comparison is case-insensitive (COACH vs coach)

### 7. Edge Cases Tests
- ✅ Handles missing user role gracefully
- ✅ Handles expired token during route access
- ✅ Does not show loading spinner indefinitely on auth error

### 8. Integration Tests
- ✅ Complete flow: unauthenticated → login redirect → authenticated → access granted
- ✅ Role change requiring different access levels

## Running the Tests

```bash
# Run all ProtectedRoute tests
npm test -- ProtectedRoute.test.tsx

# Run with coverage
npm test -- --coverage ProtectedRoute.test.tsx

# Run in watch mode
npm test -- --watch ProtectedRoute.test.tsx
```

## Test Structure

### createTestRouter Helper

Custom test router that sets up complete routing environment:

```typescript
createTestRouter({
  initialRoute: '/protected',
  requiredRole: 'admin',  // optional
  userRole: 'parent'      // null for unauthenticated
})
```

### Route Configuration

Tests use the following routes:
- `/login` - Login page with location display
- `/dashboard` - Parent dashboard
- `/coachdashboard` - Coach dashboard
- `/admin` - Admin dashboard
- `/protected` - Generic protected route (no role required)
- `/admin-only` - Admin-only route
- `/coach-only` - Coach-only route
- `/parent-only` - Parent-only route

## Role Hierarchy

```
┌─────────────────────────────────────┐
│  Role        │  Redirect Dashboard  │
├──────────────┼─────────────────────│
│  parent      │  /dashboard          │
│  coach       │  /coachdashboard     │
│  admin       │  /admin              │
│  owner       │  /dashboard (default)│
└─────────────────────────────────────┘
```

## Authentication Flow

```
1. User accesses protected route
        ↓
2. Check loading state
        ↓
3. If loading: Show spinner
        ↓
4. If no user: Redirect to /login
        ↓
5. If requiredRole specified:
   Check if user.role matches
        ↓
6. If role mismatch:
   Redirect to role-appropriate dashboard
        ↓
7. If authorized: Render children
```

## Key Testing Patterns

### 1. Wait for Auth Resolution
```typescript
await waitFor(() => {
  expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
});
```

### 2. Check Redirects
```typescript
await waitFor(() => {
  expect(screen.getByTestId('pathname')).toHaveTextContent('/login');
});
```

### 3. Verify Return URL State
```typescript
await waitFor(() => {
  expect(screen.getByTestId('from')).toHaveTextContent('/protected');
});
```

### 4. Test Role Access
```typescript
render(
  createTestRouter({
    initialRoute: '/admin-only',
    userRole: 'admin', // has access
  })
);

await waitFor(() => {
  expect(screen.getByText('Admin Only Content')).toBeInTheDocument();
});
```

### 5. Test Role Denial
```typescript
render(
  createTestRouter({
    initialRoute: '/admin-only',
    userRole: 'parent', // no access
  })
);

await waitFor(() => {
  expect(screen.getByText('Parent Dashboard')).toBeInTheDocument();
});
```

## Mock Users

Tests use consistent mock user data:

```typescript
{
  parent: { id: 'user-parent-1', role: 'PARENT', ... },
  coach: { id: 'user-coach-1', role: 'COACH', ... },
  admin: { id: 'user-admin-1', role: 'ADMIN', ... },
  owner: { id: 'user-owner-1', role: 'OWNER', ... }
}
```

## Security Considerations

These tests verify:
1. ✅ Unauthenticated users cannot access protected content
2. ✅ Users cannot access routes requiring higher privileges
3. ✅ Role checks are enforced before rendering protected content
4. ✅ Expired/invalid tokens trigger re-authentication
5. ✅ Loading states prevent premature access decisions

## Related Files

- **Implementation**: `/src/components/ProtectedRoute.jsx`
- **Auth Context**: `/src/context/auth.js`
- **Test Utils**: `/src/__tests__/utils/test-utils.tsx`
- **MSW Handlers**: `/src/mocks/handlers.ts`

## Common Issues

### Test fails with "Loading..." timeout
- Ensure MSW server is running in setupTests.js
- Check that `/users/me` endpoint is mocked correctly
- Verify localStorage tokens are set before rendering

### Redirect not working
- Make sure MemoryRouter is configured with correct routes
- Check that location state is being passed correctly
- Verify role comparison logic (case-insensitive)

### Role mismatch errors
- Ensure mock users have roles in UPPERCASE (PARENT, COACH, ADMIN)
- ProtectedRoute normalizes to lowercase for comparison
- Check that requiredRole prop uses lowercase
