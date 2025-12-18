# CSF Frontend - Architecture Overview

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Application Layers](#application-layers)
3. [Data Flow](#data-flow)
4. [Authentication Flow](#authentication-flow)
5. [State Management](#state-management)
6. [Component Hierarchy](#component-hierarchy)
7. [API Integration](#api-integration)
8. [Routing Architecture](#routing-architecture)
9. [Code Organization](#code-organization)
10. [Design Patterns](#design-patterns)

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              React Application (CSF Frontend)          │  │
│  │                                                         │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │  │
│  │  │   Parent     │  │    Coach     │  │    Admin    │ │  │
│  │  │  Interface   │  │  Interface   │  │  Interface  │ │  │
│  │  └──────────────┘  └──────────────┘  └─────────────┘ │  │
│  │                                                         │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │         Shared Components & Services            │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/HTTPS
                            │
┌─────────────────────────────────────────────────────────────┐
│                     Backend API                              │
│              (Django/FastAPI Backend)                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            │
┌─────────────────────────────────────────────────────────────┐
│                      Database                                │
│                    (PostgreSQL)                              │
└─────────────────────────────────────────────────────────────┘

External Services:
├── Stripe (Payment Processing)
├── Firebase (Google OAuth)
├── AWS S3 (File Storage - Photos)
└── Email Service (Notifications)
```

---

## Application Layers

### Layer Architecture

The application is structured in distinct layers, each with specific responsibilities:

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│  - Pages (Route-level components)                       │
│  - Components (Reusable UI components)                  │
│  - Layouts (Page structure templates)                   │
└─────────────────────────────────────────────────────────┘
                         ↕
┌─────────────────────────────────────────────────────────┐
│                   Business Logic Layer                   │
│  - Custom Hooks (useCheckoutFlow, useClassForm, etc.)  │
│  - Context Providers (Auth, State, Stepper)            │
│  - Utility Functions (Formatters, Helpers, etc.)       │
└─────────────────────────────────────────────────────────┘
                         ↕
┌─────────────────────────────────────────────────────────┐
│                   Data Access Layer                      │
│  - React Query Hooks (useLogin, useClasses, etc.)      │
│  - API Services (auth.service, class.service, etc.)    │
│  - Type Definitions (TypeScript interfaces)            │
└─────────────────────────────────────────────────────────┘
                         ↕
┌─────────────────────────────────────────────────────────┐
│                   Network Layer                          │
│  - Axios Client (HTTP requests)                         │
│  - Request/Response Interceptors                        │
│  - Error Handling                                       │
└─────────────────────────────────────────────────────────┘
                         ↕
                    Backend API
```

### Layer Responsibilities

#### 1. Presentation Layer
- **Responsibility:** User interface rendering
- **Contents:**
  - Pages (route-level components)
  - Reusable components
  - Layout templates
- **Rules:**
  - No direct API calls
  - Use hooks for data
  - Focus on UI logic only
  - Handle user interactions

#### 2. Business Logic Layer
- **Responsibility:** Application logic and state
- **Contents:**
  - Custom hooks for complex logic
  - Context providers
  - Utility functions
  - Form validation
- **Rules:**
  - Coordinate between presentation and data layers
  - Handle complex state transformations
  - Implement business rules

#### 3. Data Access Layer
- **Responsibility:** Server communication
- **Contents:**
  - React Query hooks
  - API service functions
  - TypeScript types
- **Rules:**
  - Abstract API details
  - Provide loading/error states
  - Handle caching and refetching
  - Type-safe API calls

#### 4. Network Layer
- **Responsibility:** HTTP communication
- **Contents:**
  - Axios client configuration
  - Interceptors
  - Error handling
- **Rules:**
  - Add auth tokens
  - Handle token refresh
  - Transform errors
  - Retry failed requests

---

## Data Flow

### Unidirectional Data Flow

```
User Action (Click, Submit, etc.)
          ↓
Component Event Handler
          ↓
React Query Hook (useMutation or Query)
          ↓
API Service Function
          ↓
Axios Client
          ↓
HTTP Request → Backend API
          ↓
HTTP Response ← Backend API
          ↓
Axios Client (Interceptors)
          ↓
React Query (Cache Update)
          ↓
Component Re-render
          ↓
Updated UI
```

### Example: User Login Flow

```
1. User enters email/password and clicks "Login"
   ↓
2. LoginForm calls login() from useLogin hook
   ↓
3. useLogin hook calls authService.login()
   ↓
4. authService.login() makes POST /auth/login via axiosClient
   ↓
5. Backend validates credentials, returns user + token
   ↓
6. Response interceptor validates response
   ↓
7. useLogin onSuccess callback:
   - Stores token in localStorage
   - Updates Auth context
   - Invalidates user queries
   ↓
8. Auth context update triggers:
   - App re-render
   - ProtectedRoute allows access
   - Redirect to dashboard
   ↓
9. Dashboard page renders
   - useUser hook fetches user data (with new token)
   - User data cached by React Query
   - Dashboard displays user info
```

### Example: Enrollment Flow

```
1. User clicks "Enroll" on class card
   ↓
2. Navigate to /checkout/:classId
   ↓
3. CheckOut page loads
   - useClass fetches class data
   - useChildren fetches user's children
   ↓
4. User completes checkout steps:
   Step 1: Select child (local state)
   Step 2: Review class (from cache)
   Step 3: Choose payment plan (local state)
   Step 4: Enter payment info (Stripe Elements)
   ↓
5. User clicks "Confirm & Pay"
   ↓
6. useCheckout mutation called with:
   - childId
   - classId
   - paymentMethodId
   - installmentPlanId
   ↓
7. API calls:
   - POST /orders (create order)
   - POST /payments/intents (Stripe payment intent)
   - POST /enrollments (create enrollment)
   ↓
8. Backend processes:
   - Creates order record
   - Charges card via Stripe
   - Creates enrollment
   - Updates class capacity
   - Sends confirmation email
   ↓
9. Response returns:
   - Order details
   - Enrollment details
   - Payment receipt
   ↓
10. React Query updates:
    - Invalidates enrollments cache
    - Invalidates orders cache
    - Invalidates class cache (capacity changed)
    ↓
11. Navigate to /payment-success
    - Display confirmation
    - Show enrollment details
    - Provide receipt download
```

---

## Authentication Flow

### Initial Authentication Check

```
App Loads
    ↓
index.js renders App with providers
    ↓
AuthProvider checks localStorage for token
    ↓
Token exists? ──No──→ Set isAuthenticated = false
    │                  User sees Login page
    │
   Yes
    ↓
Validate token (optional API call)
    ↓
Valid? ──No──→ Clear localStorage, show Login
    │
   Yes
    ↓
Fetch user data (GET /users/me)
    ↓
Set user in Auth context
    ↓
isAuthenticated = true
    ↓
User sees Dashboard
```

### Login Flow

```
User enters credentials
    ↓
useLogin mutation called
    ↓
POST /auth/login
    ↓
Backend validates
    ↓
Returns: { user, token, refreshToken }
    ↓
Store in localStorage:
  - auth_token
  - refresh_token
    ↓
Update Auth context:
  - user: User object
  - isAuthenticated: true
    ↓
React Query: Invalidate all queries
    ↓
Router: Redirect based on role
  - parent → /dashboard
  - coach → /coach/dashboard
  - admin → /admin/dashboard
```

### Token Refresh Flow

```
API Request
    ↓
Response: 401 Unauthorized
    ↓
Response Interceptor catches error
    ↓
Check if refresh already in progress?
  Yes → Queue request
  No → Start refresh
    ↓
POST /auth/refresh-token
  Body: { refreshToken }
    ↓
Backend validates refresh token
    ↓
Valid? ──No──→ Logout user
    │           Clear localStorage
    │           Redirect to /login
   Yes
    ↓
Returns: { token, refreshToken }
    ↓
Update localStorage with new tokens
    ↓
Retry all queued requests with new token
    ↓
Resume normal operation
```

### Logout Flow

```
User clicks "Logout"
    ↓
useLogout mutation called
    ↓
POST /auth/logout (optional, notify backend)
    ↓
Clear localStorage:
  - Remove auth_token
  - Remove refresh_token
    ↓
Clear React Query cache:
  - queryClient.clear()
    ↓
Reset Auth context:
  - user: null
  - isAuthenticated: false
    ↓
Redirect to /login
```

---

## State Management

### State Management Strategy

The app uses multiple state management approaches based on data type:

```
┌────────────────────────────────────────────────────────┐
│                  State Types                           │
├────────────────────────────────────────────────────────┤
│  1. Server State (React Query)                         │
│     - User data, classes, enrollments, etc.           │
│     - Cached, automatically refetched                 │
│                                                        │
│  2. Authentication State (Auth Context)                │
│     - Current user, auth token                        │
│     - isAuthenticated flag                            │
│                                                        │
│  3. Global UI State (StateProvider + Reducer)          │
│     - Selected child, cart items                      │
│     - UI preferences                                  │
│                                                        │
│  4. Form State (Formik)                                │
│     - Form values, validation, errors                 │
│     - Touched fields                                  │
│                                                        │
│  5. Local Component State (useState)                   │
│     - Modal open/closed                               │
│     - Dropdown expanded                               │
│     - Input values                                    │
└────────────────────────────────────────────────────────┘
```

### State Management Decision Tree

```
Need to manage state?
    ↓
Is it data from API?
│   Yes → Use React Query
│   No  ↓
│
Is it authentication data?
│   Yes → Use Auth Context
│   No  ↓
│
Used across multiple pages?
│   Yes → Use StateProvider (Global State)
│   No  ↓
│
Is it form data?
│   Yes → Use Formik
│   No  ↓
│
Use local useState
```

### React Query Cache Strategy

```
Query Configuration:
├── staleTime: 1 minute
│   (Data considered fresh for 1 minute)
├── cacheTime: 5 minutes
│   (Unused data removed after 5 minutes)
├── refetchOnWindowFocus: true
│   (Refetch when user returns to tab)
└── retry: 1
    (Retry failed requests once)

Cache Invalidation:
├── After mutations → Invalidate related queries
├── After logout → Clear all cache
└── Manual invalidation → For real-time updates
```

### Global State Structure

```javascript
// StateProvider state shape
{
  // Shopping cart
  cart: [
    { classId, childId, price }
  ],

  // Checkout flow
  selectedChild: Child | null,
  selectedClass: Class | null,
  checkoutStep: number,

  // UI preferences
  sidebarOpen: boolean,
  theme: 'light' | 'dark',

  // Notifications
  notifications: Notification[]
}
```

---

## Component Hierarchy

### Top-Level Component Tree

```
<React.StrictMode>
  <ErrorBoundary>
    <ApiProvider>                    (React Query)
      <AuthProvider>                 (Authentication)
        <BrowserRouter>              (Routing)
          <StateProvider>            (Global State)
            <App>
              <Routes>
                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Parent Routes */}
                <Route element={<ProtectedRoute roles={['parent']} />}>
                  <Route element={<ParentLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/classes" element={<Classes />} />
                    {/* ... more routes */}
                  </Route>
                </Route>

                {/* Admin Routes */}
                <Route element={<ProtectedRoute roles={['admin']} />}>
                  <Route element={<AdminLayout />}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    {/* ... more routes */}
                  </Route>
                </Route>

                {/* Coach Routes */}
                <Route element={<ProtectedRoute roles={['coach']} />}>
                  <Route path="/coach/dashboard" element={<DashboardCoach />} />
                  {/* ... more routes */}
                </Route>
              </Routes>
            </App>
          </StateProvider>
        </BrowserRouter>
      </AuthProvider>
    </ApiProvider>
  </ErrorBoundary>
</React.StrictMode>
```

### Page Component Structure

```
Page Component (e.g., Dashboard)
  ├── Layout Wrapper
  │   ├── Header
  │   ├── Sidebar
  │   └── Footer
  │
  └── Page Content
      ├── Section 1
      │   ├── StatCard
      │   ├── StatCard
      │   └── StatCard
      │
      ├── Section 2
      │   └── EnrollmentCard (repeated)
      │       ├── ClassCard
      │       └── PaymentStatusCard
      │
      └── Section 3
          └── UpcomingEvents
              └── EventCard (repeated)
```

---

## API Integration

### Service-Hook-Component Pattern

This pattern separates concerns and makes code testable and reusable:

```
┌─────────────────────────────────────────────────────────┐
│                   API Service Layer                      │
│  - Pure functions that call axios                       │
│  - No React dependencies                                │
│  - Example: auth.service.ts                             │
│                                                          │
│  export const authService = {                           │
│    login: (credentials) => axiosClient.post(...)        │
│  }                                                       │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│                React Query Hook Layer                    │
│  - Wraps services with React Query                      │
│  - Manages cache, loading, error states                 │
│  - Example: useLogin.ts                                 │
│                                                          │
│  export const useLogin = () => {                        │
│    return useMutation({                                 │
│      mutationFn: authService.login,                     │
│      onSuccess: (data) => { ... }                       │
│    })                                                    │
│  }                                                       │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│                   Component Layer                        │
│  - Uses hooks for data                                  │
│  - Focuses on UI                                        │
│  - Example: LoginForm.jsx                               │
│                                                          │
│  const LoginForm = () => {                              │
│    const { mutate: login } = useLogin()                 │
│    return <form onSubmit={handleSubmit}>...</form>      │
│  }                                                       │
└─────────────────────────────────────────────────────────┘
```

### API Request Lifecycle

```
1. Component renders
   ↓
2. useQuery/useMutation hook called
   ↓
3. React Query checks cache
   ↓
4. Cache hit? ──Yes──→ Return cached data
   │                   (Still refetch in background if stale)
   No
   ↓
5. Call API service function
   ↓
6. Service calls axiosClient
   ↓
7. Request interceptor adds:
   - Authorization header
   - Content-Type header
   ↓
8. HTTP request sent to backend
   ↓
9. Backend processes request
   ↓
10. HTTP response received
    ↓
11. Response interceptor:
    - Checks for errors
    - Handles 401 (token refresh)
    - Transforms data
    ↓
12. React Query:
    - Updates cache
    - Triggers re-render
    ↓
13. Component re-renders with new data
```

---

## Routing Architecture

### Route Organization

```
/ (Root)
├── /login                    (Public)
├── /register                 (Public)
├── /forgot-password          (Public)
│
├── / (Parent Protected)
│   ├── /dashboard
│   ├── /classes
│   ├── /classes/:classId
│   ├── /checkout/:classId
│   ├── /calendar
│   ├── /attendance
│   ├── /badges
│   ├── /gallery
│   ├── /payment-billing
│   ├── /settings
│   ├── /waivers
│   └── /program/:programId
│
├── /admin (Admin Protected)
│   ├── /admin/dashboard
│   ├── /admin/classes
│   ├── /admin/classes/:classId
│   ├── /admin/clients
│   ├── /admin/enrollments
│   ├── /admin/waitlist
│   ├── /admin/financials
│   ├── /admin/installments
│   ├── /admin/invoices
│   └── /admin/waivers
│
└── /coach (Coach Protected)
    ├── /coach/dashboard
    ├── /coach/check-in
    └── /coach/gallery
```

### Route Protection

```
Request for /admin/dashboard
    ↓
React Router matches route
    ↓
ProtectedRoute component checks:
    ↓
1. Is user authenticated?
   No → Redirect to /login
   Yes ↓
    ↓
2. Does user.role match allowedRoles?
   No → Redirect to home (based on role)
   Yes ↓
    ↓
3. Render protected component
```

---

## Code Organization

### Directory Structure Philosophy

```
Organized by Feature (Domain-Driven)
  ✅ /api/services/auth.service.ts
  ✅ /api/hooks/auth/useLogin.ts
  ✅ /api/types/auth.types.ts

  ✅ Groups related code together
  ✅ Easy to find everything about a feature
  ✅ Scales well as app grows

NOT Organized by Type
  ❌ /services/auth.service.ts
  ❌ /hooks/useLogin.ts
  ❌ /types/auth.ts

  ❌ Hard to find related code
  ❌ Doesn't scale well
```

### Import Strategy

```javascript
// Use path aliases
import Component from '@/components/Component'
// NOT: import Component from '../../../components/Component'

// Barrel exports for hooks
import { useLogin, useRegister } from '@/api/hooks'
// NOT: Multiple individual imports

// Named exports preferred
export const MyComponent = () => { ... }
// NOT: export default MyComponent
```

---

## Design Patterns

### 1. Container/Presentational Pattern

```javascript
// Container (Smart Component)
const UserDashboardContainer = () => {
  const { data: user } = useUser()
  const { data: enrollments } = useEnrollments()

  return (
    <UserDashboard
      user={user}
      enrollments={enrollments}
    />
  )
}

// Presentational (Dumb Component)
const UserDashboard = ({ user, enrollments }) => {
  return (
    <div>
      <h1>Welcome, {user.firstName}!</h1>
      {enrollments.map(e => <EnrollmentCard key={e.id} {...e} />)}
    </div>
  )
}
```

### 2. Render Props Pattern

```javascript
const DataFetcher = ({ children, queryKey, queryFn }) => {
  const { data, isLoading, error } = useQuery(queryKey, queryFn)

  return children({ data, isLoading, error })
}

// Usage
<DataFetcher queryKey="classes" queryFn={getClasses}>
  {({ data, isLoading }) => (
    isLoading ? <Spinner /> : <ClassList classes={data} />
  )}
</DataFetcher>
```

### 3. Higher-Order Components (HOC)

```javascript
const withAuth = (Component) => {
  return (props) => {
    const { isAuthenticated } = useAuth()

    if (!isAuthenticated) {
      return <Navigate to="/login" />
    }

    return <Component {...props} />
  }
}

// Usage
export default withAuth(Dashboard)
```

### 4. Custom Hooks Pattern

```javascript
// Encapsulate complex logic in custom hooks
const useCheckoutFlow = () => {
  const [step, setStep] = useState(0)
  const [data, setData] = useState({})

  const nextStep = () => setStep(s => s + 1)
  const previousStep = () => setStep(s => s - 1)
  const updateData = (newData) => setData(d => ({ ...d, ...newData }))

  return { step, data, nextStep, previousStep, updateData }
}
```

### 5. Compound Components Pattern

```javascript
const Checkout = ({ children }) => {
  const checkout = useCheckoutFlow()

  return (
    <CheckoutContext.Provider value={checkout}>
      {children}
    </CheckoutContext.Provider>
  )
}

Checkout.Step = ({ children, stepNumber }) => {
  const { step } = useCheckoutContext()
  return step === stepNumber ? children : null
}

// Usage
<Checkout>
  <Checkout.Step stepNumber={0}>
    <ChildSelector />
  </Checkout.Step>
  <Checkout.Step stepNumber={1}>
    <ClassDetails />
  </Checkout.Step>
</Checkout>
```

---

## Performance Optimizations

### 1. Code Splitting

```javascript
// Lazy load routes
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))

<Suspense fallback={<LoadingSpinner />}>
  <Route path="/admin/dashboard" element={<AdminDashboard />} />
</Suspense>
```

### 2. React Query Optimizations

```javascript
// Prefetch data before navigation
const prefetchClass = (classId) => {
  queryClient.prefetchQuery(
    ['class', classId],
    () => classService.getClass(classId)
  )
}

// Optimistic updates
const { mutate } = useUpdateUser({
  onMutate: async (newUser) => {
    await queryClient.cancelQueries(['user'])
    const previous = queryClient.getQueryData(['user'])
    queryClient.setQueryData(['user'], newUser)
    return { previous }
  },
  onError: (err, newUser, context) => {
    queryClient.setQueryData(['user'], context.previous)
  }
})
```

### 3. Memoization

```javascript
// Memoize expensive calculations
const sortedClasses = useMemo(
  () => classes.sort((a, b) => a.name.localeCompare(b.name)),
  [classes]
)

// Memoize callbacks
const handleClick = useCallback(
  () => doSomething(id),
  [id]
)
```

---

## Security Considerations

### 1. Token Storage
- Tokens stored in localStorage (acceptable for this app)
- Consider httpOnly cookies for higher security

### 2. XSS Protection
- React escapes output by default
- Avoid dangerouslySetInnerHTML
- Sanitize user input

### 3. CSRF Protection
- Backend handles CSRF tokens
- Frontend includes tokens in requests

### 4. Role-Based Access
- ProtectedRoute enforces role checks
- Backend validates permissions
- Never trust frontend-only security

---

## Error Handling Strategy

```
Error occurs
    ↓
Error type?
    ├── Network Error
    │   → Display "Check connection" message
    │   → Retry button
    │
    ├── Authentication Error (401)
    │   → Attempt token refresh
    │   → If fails, redirect to login
    │
    ├── Authorization Error (403)
    │   → Display "No permission" message
    │   → Redirect to home
    │
    ├── Validation Error (400)
    │   → Display field-level errors
    │   → Highlight invalid fields
    │
    ├── Not Found (404)
    │   → Display "Not found" message
    │   → Provide navigation links
    │
    └── Server Error (500)
        → Display "Try again" message
        → Log error for debugging
        → Retry mechanism
```

---

## Conclusion

This architecture provides:

1. ✅ **Separation of Concerns** - Each layer has a specific responsibility
2. ✅ **Scalability** - Easy to add new features without affecting existing code
3. ✅ **Maintainability** - Code is organized and follows patterns
4. ✅ **Testability** - Pure functions and hooks are easily testable
5. ✅ **Type Safety** - TypeScript provides compile-time checks
6. ✅ **Performance** - React Query caching and code splitting
7. ✅ **Security** - Authentication, authorization, and input validation
8. ✅ **Developer Experience** - Clear patterns and structure

The architecture follows React best practices and modern web development standards, making it easy for developers to understand and contribute to the codebase.
