# AuthContext Tests

Comprehensive test suite for the authentication context provider.

## Test Coverage

### 1. Initialization Tests
- ✅ Starts with loading state true and user null
- ✅ Sets loading to false after initialization when no token exists
- ✅ Restores session when valid token exists in localStorage
- ✅ Clears auth data when token is invalid or expired

### 2. Login Flow Tests
Tests login functionality for all user roles:
- ✅ **Parent Role**: Login as parent user
- ✅ **Coach Role**: Login as coach user
- ✅ **Admin Role**: Login as admin user
- ✅ **Owner Role**: Login as owner user

Error handling:
- ✅ Invalid credentials (401)
- ✅ Network errors
- ✅ Server errors (500)

### 3. Google OAuth Login Tests
- ✅ Successful Google authentication
- ✅ Invalid Google token error handling

### 4. Registration Tests
- ✅ Successful user registration
- ✅ Duplicate email error handling
- ✅ Automatic login after registration

### 5. Logout Tests
- ✅ Successful logout clears user state
- ✅ Successful logout removes tokens from localStorage
- ✅ User state cleared even if logout API fails (graceful degradation)

### 6. Session Restoration Tests
Tests automatic session restoration on app load:
- ✅ Restore parent session from localStorage
- ✅ Restore coach session from localStorage
- ✅ Restore admin session from localStorage
- ✅ Restore owner session from localStorage

### 7. Update User Tests
- ✅ Updates user data in context state
- ✅ Used after profile updates to sync context

### 8. Loading State Tests
- ✅ Loading state is true during session restoration
- ✅ Loading state is false after successful restoration
- ✅ Loading state is false after failed restoration

### 9. Error Handling Tests
- ✅ Network errors during login
- ✅ Server errors during authentication
- ✅ Malformed API responses
- ✅ Expired tokens

## Running the Tests

```bash
# Run all AuthContext tests
npm test -- AuthContext.test.tsx

# Run with coverage
npm test -- --coverage AuthContext.test.tsx

# Run in watch mode
npm test -- --watch AuthContext.test.tsx
```

## Test Structure

Each test follows the AAA pattern:
1. **Arrange**: Setup auth state and mocks
2. **Act**: Execute the authentication function
3. **Assert**: Verify expected behavior

## Mock Data

Tests use consistent mock user data for each role:

```typescript
{
  parent: { id: 'user-parent-1', role: 'PARENT', ... },
  coach: { id: 'user-coach-1', role: 'COACH', ... },
  admin: { id: 'user-admin-1', role: 'ADMIN', ... },
  owner: { id: 'user-owner-1', role: 'OWNER', ... }
}
```

## Key Testing Patterns

### 1. Async State Updates
```typescript
await waitFor(() => {
  expect(result.current.loading).toBe(false);
});
```

### 2. Act Wrapper for State Changes
```typescript
await act(async () => {
  await result.current.login(email, password);
});
```

### 3. MSW Request Overrides
```typescript
server.use(
  http.post(`${API_BASE}/auth/login`, () => {
    return HttpResponse.json({ message: 'Error' }, { status: 401 });
  })
);
```

## Related Files

- **Implementation**: `/src/context/auth.js`
- **Auth Service**: `/src/api/services/auth.service.js`
- **Users Service**: `/src/api/services/users.service.js`
- **Test Utils**: `/src/__tests__/utils/test-utils.tsx`
- **MSW Handlers**: `/src/mocks/handlers.ts`
