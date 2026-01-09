# CSF Frontend - Complete File Documentation

## Table of Contents

1. [Configuration Files](#1-configuration-files)
2. [Entry Point & Main Application](#2-entry-point--main-application)
3. [API Layer](#3-api-layer)
   - [API Client](#api-client)
   - [API Configuration](#api-configuration)
   - [API Services](#api-services)
   - [React Query Hooks](#react-query-hooks)
   - [Type Definitions](#type-definitions)
4. [Context & State Management](#4-context--state-management)
5. [Components](#5-components)
6. [Pages](#6-pages)
7. [Custom Hooks](#7-custom-hooks)
8. [Utilities](#8-utilities)
9. [Assets & Styles](#9-assets--styles)

---

## 1. Configuration Files

### package.json
**Location:** `/package.json`

**Purpose:** Defines project dependencies, scripts, and metadata for the CSF Frontend application.

**Key Scripts:**
- `start` - Starts development server using CRACO
- `build` - Creates production build
- `test` - Runs test suite
- `eject` - Ejects from Create React App (irreversible)

**Main Dependencies:**
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.4.2",
  "@tanstack/react-query": "^5.90.11",
  "axios": "^1.13.2",
  "@stripe/react-stripe-js": "^5.4.1",
  "@stripe/stripe-js": "^8.5.3",
  "tailwindcss": "^3.2.1",
  "@mui/material": "^5.14.5",
  "formik": "^2.4.5",
  "firebase": "^10.5.0"
}
```

**What This File Does:**
- Manages all npm package dependencies
- Defines development and production scripts
- Configures build tools (CRACO for webpack customization)
- Sets browser compatibility targets

---

### tsconfig.json
**Location:** `/tsconfig.json`

**Purpose:** Configures TypeScript compiler options for the project.

**Key Configuration:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "moduleResolution": "node",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

**What This File Does:**
- Enables strict type checking for TypeScript files
- Allows path aliases (@/ for src/)
- Configures JSX transformation for React
- Sets modern JavaScript target (ES2020)
- Enables intellisense and type safety

---

### tailwind.config.js
**Location:** `/tailwind.config.js`

**Purpose:** Configures TailwindCSS utility classes, theme, and customizations.

**Key Features:**
- **Custom Breakpoints:** sm (0-767px), md (768-1023px), lg (1024-1279px), xl (1280-1439px), xl1 (1440-1919px), xxl (1920-2559px), xxl1 (2560px+)
- **Custom Fonts:** Kollektif, Manrope
- **Color Palette:** Brand colors (primary-blue, pink, orange, light-blue), status colors, neutral grays
- **Fluid Typography:** Uses CSS clamp() for responsive font sizes
- **Fluid Spacing:** Responsive padding/margin utilities

**What This File Does:**
- Defines design system tokens (colors, fonts, spacing)
- Creates responsive breakpoints for mobile/tablet/desktop
- Enables fluid typography that scales with viewport
- Provides utility classes for consistent styling
- Integrates with PostCSS for processing

---

### craco.config.js
**Location:** `/craco.config.js`

**Purpose:** Customizes Create React App webpack configuration without ejecting.

**Configuration:**
```javascript
module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
}
```

**What This File Does:**
- Adds webpack alias `@` pointing to `src/` directory
- Allows imports like `import { Component } from '@/components/Component'`
- Avoids deep relative imports (`../../../components`)
- Customizes CRA build without ejecting

---

### postcss.config.js
**Location:** `/postcss.config.js`

**Purpose:** Configures PostCSS plugins for CSS processing.

**Plugins:**
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
}
```

**What This File Does:**
- Processes Tailwind directives (@tailwind, @apply)
- Adds vendor prefixes for browser compatibility
- Optimizes CSS output for production builds

---

### .env
**Location:** `/.env`

**Purpose:** Stores environment-specific configuration variables.

**Variables:**
```bash
REACT_APP_API_BASE_URL=http://localhost:8000/api
REACT_APP_ENV=development
REACT_APP_ENABLE_MOCK_DATA=false
REACT_APP_GOOGLE_CLIENT_ID=[Google OAuth Client ID]
REACT_APP_STRIPE_PUBLISHABLE_KEY=[Stripe Publishable Key]
```

**What This File Does:**
- Provides API base URL for backend communication
- Stores Google OAuth credentials
- Stores Stripe payment gateway keys
- Enables/disables mock data for development
- Variables prefixed with `REACT_APP_` are accessible in code via `process.env`

---

## 2. Entry Point & Main Application

### src/index.js
**Location:** `/src/index.js`

**Purpose:** Application entry point that renders the React app into the DOM.

**What This File Does:**
1. Imports global styles (index.css with Tailwind)
2. Wraps app with provider hierarchy:
   - `ApiProvider` - React Query for server state
   - `AuthProvider` - Authentication context
   - `BrowserRouter` - Client-side routing
   - `StateProvider` - Global app state
3. Renders the root `<App />` component
4. Includes performance monitoring (`reportWebVitals`)

**Provider Hierarchy:**
```jsx
<ApiProvider>
  <AuthProvider>
    <BrowserRouter>
      <StateProvider>
        <App />
      </StateProvider>
    </BrowserRouter>
  </AuthProvider>
</ApiProvider>
```

**Key Imports:**
- `React`, `ReactDOM` - Core React libraries
- `App` - Main application component
- `ApiProvider` - React Query provider
- `AuthProvider` - Authentication context
- `StateProvider` - Global state provider
- `reportWebVitals` - Performance monitoring

---

### src/App.js
**Location:** `/src/App.js`

**Purpose:** Main application component that defines routing and layout.

**What This File Does:**
1. Defines all application routes using React Router v6
2. Implements role-based route protection with `<ProtectedRoute>`
3. Manages global layout components (Header, Sidebar, Footer)
4. Handles authentication flows (Login, Register)
5. Routes to different dashboards based on user role

**Route Structure:**
```jsx
<Routes>
  {/* Public Routes */}
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />

  {/* Protected Parent Routes */}
  <Route path="/" element={<ProtectedRoute allowedRoles={['parent']} />}>
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="classes" element={<Classes />} />
    <Route path="checkout/:classId" element={<CheckOut />} />
    {/* ... more parent routes */}
  </Route>

  {/* Protected Admin Routes */}
  <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']} />}>
    <Route path="dashboard" element={<AdminDashboard />} />
    <Route path="clients" element={<Clients />} />
    {/* ... more admin routes */}
  </Route>

  {/* Protected Coach Routes */}
  <Route path="/coach" element={<ProtectedRoute allowedRoles={['coach']} />}>
    <Route path="dashboard" element={<DashboardCoach />} />
    {/* ... more coach routes */}
  </Route>
</Routes>
```

**Key Features:**
- Nested routing with protected routes
- Role-based access control
- Dynamic class details routes
- Separate admin and coach dashboards

---

## 3. API Layer

### API Client

#### src/api/client/axios-client.ts
**Location:** `/src/api/client/axios-client.ts`

**Purpose:** Configured Axios instance with interceptors for authentication and error handling.

**What This File Does:**
1. Creates Axios instance with base URL from environment
2. Adds request interceptor to attach JWT tokens
3. Adds response interceptor for:
   - Automatic token refresh on 401 errors
   - Global error handling
   - Request queuing during token refresh
4. Exports configured client for use in services

**Key Features:**
```typescript
// Request Interceptor
- Adds Authorization header with JWT token
- Reads token from localStorage

// Response Interceptor
- Handles 401 Unauthorized errors
- Queues requests during token refresh
- Retries failed requests with new token
- Handles refresh token failure with logout
```

**Token Refresh Flow:**
```
1. API request returns 401
2. Queue pending requests
3. Call /auth/refresh-token endpoint
4. Update stored tokens
5. Retry queued requests with new token
6. If refresh fails, logout user
```

**Exports:**
- `axiosClient` - Configured Axios instance

---

#### src/api/client/query-client.ts
**Location:** `/src/api/client/query-client.ts`

**Purpose:** Configures React Query client for server state management.

**What This File Does:**
1. Creates QueryClient instance with default options
2. Configures query defaults:
   - Cache time: 5 minutes
   - Stale time: 1 minute
   - Retry: 1 attempt on failure
   - Refetch on window focus: enabled
3. Configures mutation defaults:
   - Retry: 0 attempts

**Configuration:**
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      cacheTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: true
    },
    mutations: {
      retry: 0
    }
  }
})
```

**Exports:**
- `queryClient` - Configured QueryClient instance

---

### API Configuration

#### src/api/config/api.config.ts
**Location:** `/src/api/config/api.config.ts`

**Purpose:** Centralized API configuration constants.

**What This File Does:**
- Exports API base URL from environment
- Defines request timeout (30 seconds)
- Defines token storage keys
- Provides environment flag

**Configuration:**
```typescript
export const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api',
  timeout: 30000, // 30 seconds
  tokenKey: 'auth_token',
  refreshTokenKey: 'refresh_token',
  isDevelopment: process.env.REACT_APP_ENV === 'development'
}
```

**Exports:**
- `API_CONFIG` - Configuration object

---

#### src/api/config/endpoints.ts
**Location:** `/src/api/config/endpoints.ts`

**Purpose:** Defines all API endpoint URLs in one place.

**What This File Does:**
- Centralizes API endpoint definitions
- Provides type-safe endpoint constants
- Groups endpoints by domain (auth, users, classes, etc.)

**Endpoint Groups:**
```typescript
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh-token',
    FORGOT_PASSWORD: '/auth/forgot-password'
  },
  USERS: {
    ME: '/users/me',
    UPDATE: '/users/update',
    LIST: '/users'
  },
  CHILDREN: {
    LIST: '/children',
    CREATE: '/children',
    UPDATE: (id) => `/children/${id}`,
    DELETE: (id) => `/children/${id}`,
    GET: (id) => `/children/${id}`
  },
  CLASSES: {
    LIST: '/classes',
    GET: (id) => `/classes/${id}`,
    PROGRAMS: '/programs',
    AREAS: '/areas'
  },
  // ... more endpoints
}
```

**Exports:**
- `ENDPOINTS` - Object with all API endpoints

---

#### src/api/config/query.config.ts
**Location:** `/src/api/config/query.config.ts`

**Purpose:** Defines React Query configuration options.

**What This File Does:**
- Exports query and mutation default options
- Centralizes React Query behavior settings

**Configuration:**
```typescript
export const QUERY_CONFIG = {
  defaultOptions: {
    queries: {
      staleTime: 60000, // 1 minute
      cacheTime: 300000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true
    },
    mutations: {
      retry: 0
    }
  }
}
```

**Exports:**
- `QUERY_CONFIG` - Query configuration object

---

### API Services

All service files follow this pattern:
1. Import `axiosClient` from `axios-client.ts`
2. Define API functions that make HTTP requests
3. Handle request/response data transformation
4. Export service functions

#### src/api/services/auth.service.ts
**Location:** `/src/api/services/auth.service.ts`

**Purpose:** Authentication API service.

**What This File Does:**
- Handles user login, registration, logout
- Manages JWT token refresh
- Handles password reset flows

**Functions:**
```typescript
// Login user with email and password
login(credentials: LoginCredentials): Promise<AuthResponse>

// Register new user
register(userData: RegisterData): Promise<AuthResponse>

// Logout current user
logout(): Promise<void>

// Refresh JWT token
refreshToken(): Promise<TokenResponse>

// Request password reset
forgotPassword(email: string): Promise<void>

// Reset password with token
resetPassword(token: string, newPassword: string): Promise<void>

// Login with Google OAuth
googleLogin(idToken: string): Promise<AuthResponse>
```

**Request/Response Types:**
```typescript
interface LoginCredentials {
  email: string
  password: string
}

interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
}

interface AuthResponse {
  user: User
  token: string
  refreshToken: string
}
```

**Exports:**
- `authService` - Object with all auth functions

---

#### src/api/services/user.service.ts
**Location:** `/src/api/services/user.service.ts`

**Purpose:** User profile management API service.

**What This File Does:**
- Fetches current user profile
- Updates user information
- Manages user settings

**Functions:**
```typescript
// Get current user profile
getMe(): Promise<User>

// Update user profile
updateUser(userId: string, data: Partial<User>): Promise<User>

// Update user settings
updateSettings(settings: UserSettings): Promise<UserSettings>

// Change password
changePassword(oldPassword: string, newPassword: string): Promise<void>
```

**Data Types:**
```typescript
interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  role: 'parent' | 'coach' | 'admin'
  createdAt: string
  updatedAt: string
}

interface UserSettings {
  notifications: boolean
  emailUpdates: boolean
  theme: 'light' | 'dark'
}
```

**Exports:**
- `userService` - Object with user functions

---

#### src/api/services/child.service.ts
**Location:** `/src/api/services/child.service.ts`

**Purpose:** Child/student management API service.

**What This File Does:**
- Manages child profiles for parents
- Handles CRUD operations for children
- Fetches child-specific data

**Functions:**
```typescript
// Get all children for current user
getChildren(): Promise<Child[]>

// Get single child by ID
getChild(childId: string): Promise<Child>

// Create new child profile
createChild(data: CreateChildData): Promise<Child>

// Update child information
updateChild(childId: string, data: Partial<Child>): Promise<Child>

// Delete child profile
deleteChild(childId: string): Promise<void>

// Get child's enrollments
getChildEnrollments(childId: string): Promise<Enrollment[]>
```

**Data Types:**
```typescript
interface Child {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: 'male' | 'female' | 'other'
  parentId: string
  medicalNotes?: string
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
  createdAt: string
  updatedAt: string
}

interface CreateChildData {
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  medicalNotes?: string
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
}
```

**Exports:**
- `childService` - Object with child functions

---

#### src/api/services/class.service.ts
**Location:** `/src/api/services/class.service.ts`

**Purpose:** Class/course management API service.

**What This File Does:**
- Fetches available classes
- Gets class details and schedules
- Manages programs and areas
- Handles class search and filtering

**Functions:**
```typescript
// Get all classes with optional filters
getClasses(filters?: ClassFilters): Promise<Class[]>

// Get single class details
getClass(classId: string): Promise<Class>

// Get all programs
getPrograms(): Promise<Program[]>

// Get all areas
getAreas(): Promise<Area[]>

// Get class schedule
getClassSchedule(classId: string): Promise<Schedule[]>

// Check class availability
checkAvailability(classId: string): Promise<AvailabilityResponse>
```

**Data Types:**
```typescript
interface Class {
  id: string
  name: string
  description: string
  program: Program
  area: Area
  ageRange: { min: number; max: number }
  capacity: number
  enrolled: number
  waitlist: number
  price: number
  schedule: Schedule[]
  coach: Coach
  startDate: string
  endDate: string
  status: 'active' | 'full' | 'cancelled'
}

interface ClassFilters {
  programId?: string
  areaId?: string
  ageMin?: number
  ageMax?: number
  startDate?: string
  status?: string
}

interface Program {
  id: string
  name: string
  description: string
  color: string
}

interface Area {
  id: string
  name: string
  description: string
}
```

**Exports:**
- `classService` - Object with class functions

---

#### src/api/services/enrollment.service.ts
**Location:** `/src/api/services/enrollment.service.ts`

**Purpose:** Enrollment management API service.

**What This File Does:**
- Handles class enrollments
- Manages enrollment status
- Supports enrollment transfers and cancellations

**Functions:**
```typescript
// Get all enrollments for current user
getEnrollments(): Promise<Enrollment[]>

// Get single enrollment details
getEnrollment(enrollmentId: string): Promise<Enrollment>

// Create new enrollment
createEnrollment(data: CreateEnrollmentData): Promise<Enrollment>

// Cancel enrollment
cancelEnrollment(enrollmentId: string, reason?: string): Promise<void>

// Transfer enrollment to different class
transferEnrollment(enrollmentId: string, newClassId: string): Promise<Enrollment>

// Get enrollment by child
getEnrollmentsByChild(childId: string): Promise<Enrollment[]>
```

**Data Types:**
```typescript
interface Enrollment {
  id: string
  child: Child
  class: Class
  status: 'active' | 'cancelled' | 'completed' | 'waitlist'
  enrolledAt: string
  startDate: string
  endDate: string
  order: Order
  payments: Payment[]
}

interface CreateEnrollmentData {
  childId: string
  classId: string
  paymentPlanId?: string
}
```

**Exports:**
- `enrollmentService` - Object with enrollment functions

---

#### src/api/services/order.service.ts
**Location:** `/src/api/services/order.service.ts`

**Purpose:** Order and checkout API service.

**What This File Does:**
- Manages order creation and checkout
- Handles payment processing
- Applies discount codes
- Calculates order totals

**Functions:**
```typescript
// Get all orders for current user
getOrders(): Promise<Order[]>

// Get single order details
getOrder(orderId: string): Promise<Order>

// Create new order
createOrder(data: CreateOrderData): Promise<Order>

// Process checkout
checkout(orderId: string, paymentData: PaymentData): Promise<CheckoutResponse>

// Apply discount code
applyDiscount(orderId: string, code: string): Promise<Order>

// Calculate order total
calculateTotal(items: OrderItem[]): Promise<TotalCalculation>
```

**Data Types:**
```typescript
interface Order {
  id: string
  user: User
  items: OrderItem[]
  subtotal: number
  tax: number
  discount: number
  total: number
  status: 'pending' | 'paid' | 'cancelled' | 'refunded'
  createdAt: string
  updatedAt: string
}

interface OrderItem {
  id: string
  classId: string
  childId: string
  price: number
  quantity: number
}

interface CreateOrderData {
  items: Omit<OrderItem, 'id'>[]
  discountCode?: string
}

interface CheckoutResponse {
  orderId: string
  paymentIntent?: string
  status: string
  redirectUrl?: string
}
```

**Exports:**
- `orderService` - Object with order functions

---

#### src/api/services/payment.service.ts
**Location:** `/src/api/services/payment.service.ts`

**Purpose:** Payment processing API service.

**What This File Does:**
- Handles payment transactions
- Manages installment plans
- Generates invoices
- Stores payment methods

**Functions:**
```typescript
// Get all payments for current user
getPayments(): Promise<Payment[]>

// Get single payment details
getPayment(paymentId: string): Promise<Payment>

// Create payment intent for Stripe
createPaymentIntent(amount: number): Promise<PaymentIntentResponse>

// Confirm payment
confirmPayment(paymentId: string): Promise<Payment>

// Get installment plans
getInstallments(enrollmentId: string): Promise<Installment[]>

// Get invoice
getInvoice(invoiceId: string): Promise<Invoice>

// Save payment method
savePaymentMethod(methodData: PaymentMethodData): Promise<PaymentMethod>

// Get saved payment methods
getPaymentMethods(): Promise<PaymentMethod[]>
```

**Data Types:**
```typescript
interface Payment {
  id: string
  orderId: string
  amount: number
  status: 'pending' | 'succeeded' | 'failed' | 'refunded'
  method: 'card' | 'ach' | 'cash'
  stripePaymentIntentId?: string
  createdAt: string
}

interface Installment {
  id: string
  enrollmentId: string
  amount: number
  dueDate: string
  status: 'pending' | 'paid' | 'overdue'
  paidAt?: string
}

interface Invoice {
  id: string
  orderId: string
  items: InvoiceItem[]
  subtotal: number
  tax: number
  total: number
  dueDate: string
  paidAt?: string
  pdfUrl: string
}
```

**Exports:**
- `paymentService` - Object with payment functions

---

#### src/api/services/attendance.service.ts
**Location:** `/src/api/services/attendance.service.ts`

**Purpose:** Attendance tracking API service.

**What This File Does:**
- Records attendance for classes
- Tracks check-in/check-out
- Calculates attendance streaks
- Generates attendance reports

**Functions:**
```typescript
// Get attendance records
getAttendance(filters?: AttendanceFilters): Promise<Attendance[]>

// Check in student
checkIn(data: CheckInData): Promise<Attendance>

// Mark attendance (coach/admin)
markAttendance(data: MarkAttendanceData): Promise<Attendance>

// Get attendance streak for child
getAttendanceStreak(childId: string): Promise<StreakData>

// Get attendance report
getAttendanceReport(classId: string, dateRange: DateRange): Promise<AttendanceReport>
```

**Data Types:**
```typescript
interface Attendance {
  id: string
  child: Child
  class: Class
  date: string
  status: 'present' | 'absent' | 'excused'
  checkedInAt?: string
  checkedOutAt?: string
  notes?: string
}

interface CheckInData {
  childId: string
  classId: string
  sessionDate: string
}

interface StreakData {
  currentStreak: number
  longestStreak: number
  totalSessions: number
  attendanceRate: number
}
```

**Exports:**
- `attendanceService` - Object with attendance functions

---

#### src/api/services/badge.service.ts
**Location:** `/src/api/services/badge.service.ts`

**Purpose:** Badge and achievement system API service.

**What This File Does:**
- Manages badge definitions
- Tracks badge progress
- Awards badges to children
- Fetches earned badges

**Functions:**
```typescript
// Get all available badges
getBadges(): Promise<Badge[]>

// Get badges earned by child
getChildBadges(childId: string): Promise<EarnedBadge[]>

// Get badge progress for child
getBadgeProgress(childId: string, badgeId: string): Promise<BadgeProgress>

// Award badge to child (admin/coach)
awardBadge(childId: string, badgeId: string): Promise<EarnedBadge>
```

**Data Types:**
```typescript
interface Badge {
  id: string
  name: string
  description: string
  icon: string
  category: 'attendance' | 'achievement' | 'skill' | 'special'
  criteria: BadgeCriteria
}

interface EarnedBadge {
  id: string
  badge: Badge
  child: Child
  earnedAt: string
  awardedBy?: Coach
}

interface BadgeProgress {
  badge: Badge
  progress: number
  target: number
  percentComplete: number
}
```

**Exports:**
- `badgeService` - Object with badge functions

---

#### src/api/services/event.service.ts
**Location:** `/src/api/services/event.service.ts`

**Purpose:** Events and announcements API service.

**What This File Does:**
- Manages event creation and listing
- Handles RSVP functionality
- Sends event notifications

**Functions:**
```typescript
// Get all events
getEvents(filters?: EventFilters): Promise<Event[]>

// Get single event details
getEvent(eventId: string): Promise<Event>

// Create new event (admin/coach)
createEvent(data: CreateEventData): Promise<Event>

// RSVP to event
rsvp(eventId: string, status: 'attending' | 'not_attending'): Promise<RSVP>

// Get event attendees
getEventAttendees(eventId: string): Promise<RSVP[]>
```

**Data Types:**
```typescript
interface Event {
  id: string
  title: string
  description: string
  date: string
  location: string
  type: 'game' | 'practice' | 'social' | 'tournament'
  class?: Class
  createdBy: User
  attendees: number
  capacity?: number
}

interface RSVP {
  id: string
  event: Event
  user: User
  child?: Child
  status: 'attending' | 'not_attending' | 'maybe'
  createdAt: string
}
```

**Exports:**
- `eventService` - Object with event functions

---

#### src/api/services/announcement.service.ts
**Location:** `/src/api/services/announcement.service.ts`

**Purpose:** Announcements API service.

**What This File Does:**
- Fetches announcements
- Creates new announcements (admin/coach)
- Manages announcement visibility

**Functions:**
```typescript
// Get all announcements
getAnnouncements(filters?: AnnouncementFilters): Promise<Announcement[]>

// Get single announcement
getAnnouncement(id: string): Promise<Announcement>

// Create announcement (admin/coach)
createAnnouncement(data: CreateAnnouncementData): Promise<Announcement>

// Mark announcement as read
markAsRead(id: string): Promise<void>
```

**Data Types:**
```typescript
interface Announcement {
  id: string
  title: string
  content: string
  author: User
  targetAudience: 'all' | 'parents' | 'coaches' | 'class'
  classId?: string
  priority: 'low' | 'normal' | 'high'
  attachments: Attachment[]
  createdAt: string
  expiresAt?: string
}

interface CreateAnnouncementData {
  title: string
  content: string
  targetAudience: string
  classId?: string
  priority: string
  attachments?: File[]
}
```

**Exports:**
- `announcementService` - Object with announcement functions

---

#### src/api/services/photo.service.ts
**Location:** `/src/api/services/photo.service.ts`

**Purpose:** Photo gallery API service.

**What This File Does:**
- Manages photo albums
- Handles photo uploads
- Fetches photos by class/event

**Functions:**
```typescript
// Get all albums
getAlbums(): Promise<Album[]>

// Get album photos
getPhotos(albumId: string): Promise<Photo[]>

// Upload photos to album (admin/coach)
uploadPhoto(albumId: string, file: File, metadata?: PhotoMetadata): Promise<Photo>

// Delete photo (admin/coach)
deletePhoto(photoId: string): Promise<void>

// Get photos by class
getClassPhotos(classId: string): Promise<Photo[]>
```

**Data Types:**
```typescript
interface Album {
  id: string
  name: string
  description: string
  coverPhoto?: Photo
  photoCount: number
  class?: Class
  event?: Event
  createdAt: string
}

interface Photo {
  id: string
  url: string
  thumbnailUrl: string
  caption?: string
  uploadedBy: User
  takenAt?: string
  createdAt: string
}
```

**Exports:**
- `photoService` - Object with photo functions

---

#### src/api/services/admin.service.ts
**Location:** `/src/api/services/admin.service.ts`

**Purpose:** Admin dashboard and reporting API service.

**What This File Does:**
- Provides admin analytics
- Generates reports
- Manages system-wide settings
- Handles refunds

**Functions:**
```typescript
// Get dashboard metrics
getDashboardMetrics(): Promise<DashboardMetrics>

// Get all clients (parents)
getClients(filters?: ClientFilters): Promise<Client[]>

// Get revenue report
getRevenueReport(dateRange: DateRange): Promise<RevenueReport>

// Process refund
processRefund(paymentId: string, amount: number, reason: string): Promise<Refund>

// Get system statistics
getSystemStats(): Promise<SystemStats>
```

**Data Types:**
```typescript
interface DashboardMetrics {
  totalRevenue: number
  totalEnrollments: number
  activeClasses: number
  totalParents: number
  revenueGrowth: number
  enrollmentGrowth: number
}

interface Client {
  id: string
  name: string
  email: string
  phone: string
  children: Child[]
  enrollments: Enrollment[]
  totalSpent: number
  joinedAt: string
}

interface RevenueReport {
  totalRevenue: number
  revenueByProgram: Record<string, number>
  revenueByMonth: Record<string, number>
  outstandingPayments: number
}
```

**Exports:**
- `adminService` - Object with admin functions

---

### React Query Hooks

All hooks follow this pattern:
1. Import service function and query/mutation from React Query
2. Define custom hook with TypeScript types
3. Return query/mutation result with standardized interface
4. Export hook for use in components

#### Authentication Hooks

##### src/api/hooks/auth/useLogin.ts
**Location:** `/src/api/hooks/auth/useLogin.ts`

**Purpose:** React Query hook for user login.

**What This Hook Does:**
- Provides mutation for login
- Handles loading, error, and success states
- Stores authentication token on success

**Usage:**
```typescript
import { useLogin } from '@/api/hooks'

function LoginForm() {
  const { mutate: login, isPending, error } = useLogin()

  const handleSubmit = (credentials) => {
    login(credentials, {
      onSuccess: (data) => {
        // Navigate to dashboard
      }
    })
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

**Returns:**
```typescript
{
  mutate: (credentials: LoginCredentials) => void
  isPending: boolean
  error: Error | null
  data: AuthResponse | undefined
  isSuccess: boolean
}
```

**Exports:**
- `useLogin` - Login mutation hook

---

##### src/api/hooks/auth/useRegister.ts
**Location:** `/src/api/hooks/auth/useRegister.ts`

**Purpose:** React Query hook for user registration.

**What This Hook Does:**
- Provides mutation for registration
- Validates registration data
- Automatically logs in user on successful registration

**Usage:**
```typescript
import { useRegister } from '@/api/hooks'

function RegisterForm() {
  const { mutate: register, isPending } = useRegister()

  const handleSubmit = (userData) => {
    register(userData, {
      onSuccess: () => {
        // Navigate to dashboard
      }
    })
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

**Returns:**
```typescript
{
  mutate: (userData: RegisterData) => void
  isPending: boolean
  error: Error | null
  data: AuthResponse | undefined
}
```

**Exports:**
- `useRegister` - Registration mutation hook

---

##### src/api/hooks/auth/useLogout.ts
**Location:** `/src/api/hooks/auth/useLogout.ts`

**Purpose:** React Query hook for user logout.

**What This Hook Does:**
- Provides mutation for logout
- Clears authentication tokens
- Invalidates all cached queries
- Redirects to login page

**Usage:**
```typescript
import { useLogout } from '@/api/hooks'

function Header() {
  const { mutate: logout } = useLogout()

  return (
    <button onClick={() => logout()}>
      Logout
    </button>
  )
}
```

**Exports:**
- `useLogout` - Logout mutation hook

---

#### User Hooks

##### src/api/hooks/users/useUser.ts
**Location:** `/src/api/hooks/users/useUser.ts`

**Purpose:** React Query hook to fetch current user profile.

**What This Hook Does:**
- Fetches current user data
- Caches user profile
- Automatically refetches on window focus
- Provides loading and error states

**Usage:**
```typescript
import { useUser } from '@/api/hooks'

function ProfilePage() {
  const { data: user, isLoading, error } = useUser()

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />

  return <UserProfile user={user} />
}
```

**Returns:**
```typescript
{
  data: User | undefined
  isLoading: boolean
  error: Error | null
  refetch: () => void
}
```

**Exports:**
- `useUser` - User query hook

---

##### src/api/hooks/users/useUpdateUser.ts
**Location:** `/src/api/hooks/users/useUpdateUser.ts`

**Purpose:** React Query hook to update user profile.

**What This Hook Does:**
- Provides mutation for updating user
- Invalidates user cache on success
- Handles optimistic updates

**Usage:**
```typescript
import { useUpdateUser } from '@/api/hooks'

function EditProfile() {
  const { mutate: updateUser, isPending } = useUpdateUser()

  const handleSave = (updates) => {
    updateUser(updates, {
      onSuccess: () => {
        toast.success('Profile updated!')
      }
    })
  }

  return <ProfileForm onSave={handleSave} />
}
```

**Exports:**
- `useUpdateUser` - Update user mutation hook

---

#### Children Hooks

##### src/api/hooks/children/useChildren.ts
**Location:** `/src/api/hooks/children/useChildren.ts`

**Purpose:** React Query hook to fetch all children for current user.

**What This Hook Does:**
- Fetches list of children
- Caches children data
- Auto-refetches when needed

**Usage:**
```typescript
import { useChildren } from '@/api/hooks'

function ChildrenList() {
  const { data: children, isLoading } = useChildren()

  return (
    <div>
      {children?.map(child => (
        <ChildCard key={child.id} child={child} />
      ))}
    </div>
  )
}
```

**Exports:**
- `useChildren` - Children query hook

---

##### src/api/hooks/children/useChild.ts
**Location:** `/src/api/hooks/children/useChild.ts`

**Purpose:** React Query hook to fetch single child by ID.

**Usage:**
```typescript
import { useChild } from '@/api/hooks'

function ChildDetails({ childId }) {
  const { data: child, isLoading } = useChild(childId)

  return <ChildProfile child={child} />
}
```

**Exports:**
- `useChild` - Child query hook

---

##### src/api/hooks/children/useCreateChild.ts
**Location:** `/src/api/hooks/children/useCreateChild.ts`

**Purpose:** React Query hook to create new child profile.

**Usage:**
```typescript
import { useCreateChild } from '@/api/hooks'

function AddChildForm() {
  const { mutate: createChild } = useCreateChild()

  const handleSubmit = (childData) => {
    createChild(childData, {
      onSuccess: () => {
        toast.success('Child added!')
      }
    })
  }

  return <ChildForm onSubmit={handleSubmit} />
}
```

**Exports:**
- `useCreateChild` - Create child mutation hook

---

##### src/api/hooks/children/useUpdateChild.ts
**Location:** `/src/api/hooks/children/useUpdateChild.ts`

**Purpose:** React Query hook to update child information.

**Exports:**
- `useUpdateChild` - Update child mutation hook

---

##### src/api/hooks/children/useDeleteChild.ts
**Location:** `/src/api/hooks/children/useDeleteChild.ts`

**Purpose:** React Query hook to delete child profile.

**Exports:**
- `useDeleteChild` - Delete child mutation hook

---

#### Class Hooks

##### src/api/hooks/classes/useClasses.ts
**Location:** `/src/api/hooks/classes/useClasses.ts`

**Purpose:** React Query hook to fetch all available classes.

**Usage:**
```typescript
import { useClasses } from '@/api/hooks'

function ClassesPage() {
  const { data: classes, isLoading } = useClasses({
    programId: 'soccer',
    ageMin: 6
  })

  return <ClassGrid classes={classes} />
}
```

**Exports:**
- `useClasses` - Classes query hook

---

##### src/api/hooks/classes/useClass.ts
**Location:** `/src/api/hooks/classes/useClass.ts`

**Purpose:** React Query hook to fetch single class details.

**Exports:**
- `useClass` - Class query hook

---

##### src/api/hooks/classes/usePrograms.ts
**Location:** `/src/api/hooks/classes/usePrograms.ts`

**Purpose:** React Query hook to fetch all programs.

**Exports:**
- `usePrograms` - Programs query hook

---

##### src/api/hooks/classes/useAreas.ts
**Location:** `/src/api/hooks/classes/useAreas.ts`

**Purpose:** React Query hook to fetch all areas/locations.

**Exports:**
- `useAreas` - Areas query hook

---

#### Enrollment Hooks

##### src/api/hooks/enrollments/useEnrollments.ts
**Location:** `/src/api/hooks/enrollments/useEnrollments.ts`

**Purpose:** React Query hook to fetch user enrollments.

**Usage:**
```typescript
import { useEnrollments } from '@/api/hooks'

function MyEnrollments() {
  const { data: enrollments } = useEnrollments()

  return <EnrollmentList enrollments={enrollments} />
}
```

**Exports:**
- `useEnrollments` - Enrollments query hook

---

##### src/api/hooks/enrollments/useCreateEnrollment.ts
**Location:** `/src/api/hooks/enrollments/useCreateEnrollment.ts`

**Purpose:** React Query hook to create new enrollment.

**Exports:**
- `useCreateEnrollment` - Create enrollment mutation hook

---

##### src/api/hooks/enrollments/useCancelEnrollment.ts
**Location:** `/src/api/hooks/enrollments/useCancelEnrollment.ts`

**Purpose:** React Query hook to cancel enrollment.

**Exports:**
- `useCancelEnrollment` - Cancel enrollment mutation hook

---

##### src/api/hooks/enrollments/useTransferEnrollment.ts
**Location:** `/src/api/hooks/enrollments/useTransferEnrollment.ts`

**Purpose:** React Query hook to transfer enrollment to different class.

**Exports:**
- `useTransferEnrollment` - Transfer enrollment mutation hook

---

#### Order Hooks

##### src/api/hooks/orders/useOrders.ts
**Location:** `/src/api/hooks/orders/useOrders.ts`

**Purpose:** React Query hook to fetch user orders.

**Exports:**
- `useOrders` - Orders query hook

---

##### src/api/hooks/orders/useOrder.ts
**Location:** `/src/api/hooks/orders/useOrder.ts`

**Purpose:** React Query hook to fetch single order.

**Exports:**
- `useOrder` - Order query hook

---

##### src/api/hooks/orders/useCreateOrder.ts
**Location:** `/src/api/hooks/orders/useCreateOrder.ts`

**Purpose:** React Query hook to create new order.

**Exports:**
- `useCreateOrder` - Create order mutation hook

---

##### src/api/hooks/orders/useCheckout.ts
**Location:** `/src/api/hooks/orders/useCheckout.ts`

**Purpose:** React Query hook to process checkout.

**Usage:**
```typescript
import { useCheckout } from '@/api/hooks'

function CheckoutPage({ orderId }) {
  const { mutate: checkout, isPending } = useCheckout()

  const handlePayment = (paymentData) => {
    checkout({ orderId, paymentData }, {
      onSuccess: () => {
        navigate('/payment-success')
      }
    })
  }

  return <CheckoutForm onSubmit={handlePayment} />
}
```

**Exports:**
- `useCheckout` - Checkout mutation hook

---

#### Payment Hooks

##### src/api/hooks/payments/usePayments.ts
**Location:** `/src/api/hooks/payments/usePayments.ts`

**Purpose:** React Query hook to fetch payment history.

**Exports:**
- `usePayments` - Payments query hook

---

##### src/api/hooks/payments/usePayment.ts
**Location:** `/src/api/hooks/payments/usePayment.ts`

**Purpose:** React Query hook to fetch single payment.

**Exports:**
- `usePayment` - Payment query hook

---

##### src/api/hooks/payments/useInstallments.ts
**Location:** `/src/api/hooks/payments/useInstallments.ts`

**Purpose:** React Query hook to fetch installment plans.

**Exports:**
- `useInstallments` - Installments query hook

---

##### src/api/hooks/payments/useInvoice.ts
**Location:** `/src/api/hooks/payments/useInvoice.ts`

**Purpose:** React Query hook to fetch invoice.

**Exports:**
- `useInvoice` - Invoice query hook

---

##### src/api/hooks/payments/usePaymentMethods.ts
**Location:** `/src/api/hooks/payments/usePaymentMethods.ts`

**Purpose:** React Query hook to fetch saved payment methods.

**Exports:**
- `usePaymentMethods` - Payment methods query hook

---

#### Attendance Hooks

##### src/api/hooks/attendance/useAttendance.ts
**Location:** `/src/api/hooks/attendance/useAttendance.ts`

**Purpose:** React Query hook to fetch attendance records.

**Exports:**
- `useAttendance` - Attendance query hook

---

##### src/api/hooks/attendance/useCheckIn.ts
**Location:** `/src/api/hooks/attendance/useCheckIn.ts`

**Purpose:** React Query hook to check in student.

**Usage:**
```typescript
import { useCheckIn } from '@/api/hooks'

function CheckInPage() {
  const { mutate: checkIn } = useCheckIn()

  const handleCheckIn = (childId, classId) => {
    checkIn({ childId, classId, sessionDate: new Date() })
  }

  return <CheckInInterface onCheckIn={handleCheckIn} />
}
```

**Exports:**
- `useCheckIn` - Check in mutation hook

---

##### src/api/hooks/attendance/useMarkAttendance.ts
**Location:** `/src/api/hooks/attendance/useMarkAttendance.ts`

**Purpose:** React Query hook to mark attendance (coach/admin).

**Exports:**
- `useMarkAttendance` - Mark attendance mutation hook

---

##### src/api/hooks/attendance/useAttendanceStreak.ts
**Location:** `/src/api/hooks/attendance/useAttendanceStreak.ts`

**Purpose:** React Query hook to fetch attendance streak.

**Exports:**
- `useAttendanceStreak` - Attendance streak query hook

---

#### Badge Hooks

##### src/api/hooks/badges/useBadges.ts
**Location:** `/src/api/hooks/badges/useBadges.ts`

**Purpose:** React Query hook to fetch all badges.

**Exports:**
- `useBadges` - Badges query hook

---

##### src/api/hooks/badges/useAwardBadge.ts
**Location:** `/src/api/hooks/badges/useAwardBadge.ts`

**Purpose:** React Query hook to award badge to child.

**Exports:**
- `useAwardBadge` - Award badge mutation hook

---

##### src/api/hooks/badges/useBadgeProgress.ts
**Location:** `/src/api/hooks/badges/useBadgeProgress.ts`

**Purpose:** React Query hook to fetch badge progress.

**Exports:**
- `useBadgeProgress` - Badge progress query hook

---

#### Announcement Hooks

##### src/api/hooks/announcements/useAnnouncements.ts
**Location:** `/src/api/hooks/announcements/useAnnouncements.ts`

**Purpose:** React Query hook to fetch announcements.

**Exports:**
- `useAnnouncements` - Announcements query hook

---

##### src/api/hooks/announcements/useCreateAnnouncement.ts
**Location:** `/src/api/hooks/announcements/useCreateAnnouncement.ts`

**Purpose:** React Query hook to create announcement.

**Exports:**
- `useCreateAnnouncement` - Create announcement mutation hook

---

#### Event Hooks

##### src/api/hooks/events/useEvents.ts
**Location:** `/src/api/hooks/events/useEvents.ts`

**Purpose:** React Query hook to fetch events.

**Exports:**
- `useEvents` - Events query hook

---

##### src/api/hooks/events/useCreateEvent.ts
**Location:** `/src/api/hooks/events/useCreateEvent.ts`

**Purpose:** React Query hook to create event.

**Exports:**
- `useCreateEvent` - Create event mutation hook

---

##### src/api/hooks/events/useRsvp.ts
**Location:** `/src/api/hooks/events/useRsvp.ts`

**Purpose:** React Query hook to RSVP to event.

**Exports:**
- `useRsvp` - RSVP mutation hook

---

#### Photo Hooks

##### src/api/hooks/photos/usePhotos.ts
**Location:** `/src/api/hooks/photos/usePhotos.ts`

**Purpose:** React Query hook to fetch photos.

**Exports:**
- `usePhotos` - Photos query hook

---

##### src/api/hooks/photos/useAlbums.ts
**Location:** `/src/api/hooks/photos/useAlbums.ts`

**Purpose:** React Query hook to fetch albums.

**Exports:**
- `useAlbums` - Albums query hook

---

##### src/api/hooks/photos/useUploadPhoto.ts
**Location:** `/src/api/hooks/photos/useUploadPhoto.ts`

**Purpose:** React Query hook to upload photo.

**Exports:**
- `useUploadPhoto` - Upload photo mutation hook

---

#### Admin Hooks

##### src/api/hooks/admin/useClients.ts
**Location:** `/src/api/hooks/admin/useClients.ts`

**Purpose:** React Query hook to fetch client list (admin).

**Exports:**
- `useClients` - Clients query hook

---

##### src/api/hooks/admin/useDashboardMetrics.ts
**Location:** `/src/api/hooks/admin/useDashboardMetrics.ts`

**Purpose:** React Query hook to fetch dashboard metrics.

**Exports:**
- `useDashboardMetrics` - Dashboard metrics query hook

---

##### src/api/hooks/admin/useRefunds.ts
**Location:** `/src/api/hooks/admin/useRefunds.ts`

**Purpose:** React Query hook to process refunds.

**Exports:**
- `useRefunds` - Refunds mutation hook

---

##### src/api/hooks/admin/useRevenueReport.ts
**Location:** `/src/api/hooks/admin/useRevenueReport.ts`

**Purpose:** React Query hook to fetch revenue report.

**Exports:**
- `useRevenueReport` - Revenue report query hook

---

### Type Definitions

All type files follow this pattern:
1. Define interfaces for data models
2. Define request/response types
3. Export all types for use throughout app

#### src/api/types/auth.types.ts
**Location:** `/src/api/types/auth.types.ts`

**Purpose:** TypeScript types for authentication.

**Type Definitions:**
```typescript
export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  role?: 'parent' | 'coach'
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken: string
}

export interface TokenResponse {
  token: string
  refreshToken: string
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetConfirm {
  token: string
  newPassword: string
}
```

**Exports:**
- Authentication-related TypeScript interfaces

---

#### src/api/types/user.types.ts
**Location:** `/src/api/types/user.types.ts`

**Purpose:** TypeScript types for users.

**Type Definitions:**
```typescript
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  role: 'parent' | 'coach' | 'admin'
  profilePicture?: string
  createdAt: string
  updatedAt: string
}

export interface UpdateUserData {
  firstName?: string
  lastName?: string
  phone?: string
  profilePicture?: string
}

export interface UserSettings {
  notifications: boolean
  emailUpdates: boolean
  smsUpdates: boolean
  theme: 'light' | 'dark' | 'auto'
}
```

**Exports:**
- User-related TypeScript interfaces

---

#### src/api/types/child.types.ts
**Location:** `/src/api/types/child.types.ts`

**Purpose:** TypeScript types for children/students.

**Type Definitions:**
```typescript
export interface Child {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  parentId: string
  medicalNotes?: string
  allergies?: string[]
  emergencyContact: EmergencyContact
  profilePicture?: string
  createdAt: string
  updatedAt: string
}

export interface EmergencyContact {
  name: string
  phone: string
  relationship: string
  email?: string
}

export interface CreateChildData {
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  medicalNotes?: string
  allergies?: string[]
  emergencyContact: EmergencyContact
}
```

**Exports:**
- Child-related TypeScript interfaces

---

#### src/api/types/class.types.ts
**Location:** `/src/api/types/class.types.ts`

**Purpose:** TypeScript types for classes.

**Type Definitions:**
```typescript
export interface Class {
  id: string
  name: string
  description: string
  program: Program
  area: Area
  ageRange: AgeRange
  capacity: number
  enrolled: number
  waitlist: number
  price: number
  schedule: Schedule[]
  coach: Coach
  startDate: string
  endDate: string
  status: 'active' | 'full' | 'cancelled' | 'completed'
  imageUrl?: string
}

export interface Program {
  id: string
  name: string
  description: string
  color: string
  icon?: string
}

export interface Area {
  id: string
  name: string
  address: string
  city: string
  state: string
  zipCode: string
}

export interface AgeRange {
  min: number
  max: number
}

export interface Schedule {
  dayOfWeek: number
  startTime: string
  endTime: string
}

export interface Coach {
  id: string
  firstName: string
  lastName: string
  email: string
  bio?: string
  profilePicture?: string
}
```

**Exports:**
- Class-related TypeScript interfaces

---

#### src/api/types/enrollment.types.ts
**Location:** `/src/api/types/enrollment.types.ts`

**Purpose:** TypeScript types for enrollments.

**Type Definitions:**
```typescript
export interface Enrollment {
  id: string
  child: Child
  class: Class
  status: 'active' | 'cancelled' | 'completed' | 'waitlist' | 'pending'
  enrolledAt: string
  startDate: string
  endDate: string
  order: Order
  payments: Payment[]
  cancellationReason?: string
  cancelledAt?: string
}

export interface CreateEnrollmentData {
  childId: string
  classId: string
  paymentPlanId?: string
}

export interface TransferEnrollmentData {
  enrollmentId: string
  newClassId: string
  reason?: string
}
```

**Exports:**
- Enrollment-related TypeScript interfaces

---

#### src/api/types/order.types.ts
**Location:** `/src/api/types/order.types.ts`

**Purpose:** TypeScript types for orders.

**Type Definitions:**
```typescript
export interface Order {
  id: string
  userId: string
  items: OrderItem[]
  subtotal: number
  tax: number
  discount: number
  total: number
  status: 'pending' | 'paid' | 'cancelled' | 'refunded' | 'partially_refunded'
  discountCode?: string
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  classId: string
  childId: string
  price: number
  quantity: number
  discount: number
}

export interface CreateOrderData {
  items: Omit<OrderItem, 'id'>[]
  discountCode?: string
}

export interface CheckoutData {
  orderId: string
  paymentMethodId?: string
  savePaymentMethod?: boolean
}
```

**Exports:**
- Order-related TypeScript interfaces

---

#### src/api/types/payment.types.ts
**Location:** `/src/api/types/payment.types.ts`

**Purpose:** TypeScript types for payments.

**Type Definitions:**
```typescript
export interface Payment {
  id: string
  orderId: string
  amount: number
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded' | 'cancelled'
  method: 'card' | 'ach' | 'cash' | 'check'
  stripePaymentIntentId?: string
  last4?: string
  createdAt: string
  processedAt?: string
}

export interface PaymentMethod {
  id: string
  type: 'card' | 'bank_account'
  last4: string
  brand?: string
  expiryMonth?: number
  expiryYear?: number
  isDefault: boolean
}

export interface Installment {
  id: string
  enrollmentId: string
  amount: number
  dueDate: string
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  paidAt?: string
  paymentId?: string
}

export interface Invoice {
  id: string
  orderId: string
  invoiceNumber: string
  items: InvoiceItem[]
  subtotal: number
  tax: number
  total: number
  dueDate: string
  paidAt?: string
  pdfUrl: string
}

export interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  amount: number
}
```

**Exports:**
- Payment-related TypeScript interfaces

---

#### src/api/types/attendance.types.ts
**Location:** `/src/api/types/attendance.types.ts`

**Purpose:** TypeScript types for attendance.

**Type Definitions:**
```typescript
export interface Attendance {
  id: string
  childId: string
  classId: string
  sessionDate: string
  status: 'present' | 'absent' | 'excused' | 'late'
  checkedInAt?: string
  checkedOutAt?: string
  notes?: string
  markedBy: string
  createdAt: string
}

export interface CheckInData {
  childId: string
  classId: string
  sessionDate: string
}

export interface MarkAttendanceData {
  childId: string
  classId: string
  sessionDate: string
  status: 'present' | 'absent' | 'excused'
  notes?: string
}

export interface AttendanceStreak {
  childId: string
  currentStreak: number
  longestStreak: number
  totalSessions: number
  attendedSessions: number
  attendanceRate: number
}
```

**Exports:**
- Attendance-related TypeScript interfaces

---

#### src/api/types/badge.types.ts
**Location:** `/src/api/types/badge.types.ts`

**Purpose:** TypeScript types for badges.

**Type Definitions:**
```typescript
export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  category: 'attendance' | 'achievement' | 'skill' | 'special' | 'milestone'
  criteria: BadgeCriteria
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
}

export interface BadgeCriteria {
  type: 'attendance' | 'skill' | 'milestone'
  target: number
  description: string
}

export interface EarnedBadge {
  id: string
  badgeId: string
  badge: Badge
  childId: string
  earnedAt: string
  awardedBy?: string
}

export interface BadgeProgress {
  badgeId: string
  badge: Badge
  childId: string
  progress: number
  target: number
  percentComplete: number
  isEarned: boolean
}
```

**Exports:**
- Badge-related TypeScript interfaces

---

#### src/api/types/event.types.ts
**Location:** `/src/api/types/event.types.ts`

**Purpose:** TypeScript types for events.

**Type Definitions:**
```typescript
export interface Event {
  id: string
  title: string
  description: string
  date: string
  startTime: string
  endTime: string
  location: string
  type: 'game' | 'practice' | 'social' | 'tournament' | 'meeting' | 'other'
  classId?: string
  createdBy: string
  attendeeCount: number
  capacity?: number
  imageUrl?: string
  createdAt: string
}

export interface CreateEventData {
  title: string
  description: string
  date: string
  startTime: string
  endTime: string
  location: string
  type: string
  classId?: string
  capacity?: number
}

export interface RSVP {
  id: string
  eventId: string
  userId: string
  childId?: string
  status: 'attending' | 'not_attending' | 'maybe'
  guests: number
  createdAt: string
  updatedAt: string
}
```

**Exports:**
- Event-related TypeScript interfaces

---

#### src/api/types/announcement.types.ts
**Location:** `/src/api/types/announcement.types.ts`

**Purpose:** TypeScript types for announcements.

**Type Definitions:**
```typescript
export interface Announcement {
  id: string
  title: string
  content: string
  authorId: string
  author: User
  targetAudience: 'all' | 'parents' | 'coaches' | 'admins' | 'class'
  classId?: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  attachments: Attachment[]
  createdAt: string
  updatedAt: string
  expiresAt?: string
  isRead?: boolean
}

export interface Attachment {
  id: string
  filename: string
  url: string
  mimeType: string
  size: number
}

export interface CreateAnnouncementData {
  title: string
  content: string
  targetAudience: string
  classId?: string
  priority: string
  attachments?: File[]
  expiresAt?: string
}
```

**Exports:**
- Announcement-related TypeScript interfaces

---

#### src/api/types/photo.types.ts
**Location:** `/src/api/types/photo.types.ts`

**Purpose:** TypeScript types for photos.

**Type Definitions:**
```typescript
export interface Album {
  id: string
  name: string
  description: string
  coverPhotoId?: string
  coverPhoto?: Photo
  photoCount: number
  classId?: string
  eventId?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface Photo {
  id: string
  albumId: string
  url: string
  thumbnailUrl: string
  caption?: string
  uploadedBy: string
  takenAt?: string
  createdAt: string
}

export interface UploadPhotoData {
  albumId: string
  file: File
  caption?: string
  takenAt?: string
}
```

**Exports:**
- Photo-related TypeScript interfaces

---

#### src/api/types/admin.types.ts
**Location:** `/src/api/types/admin.types.ts`

**Purpose:** TypeScript types for admin features.

**Type Definitions:**
```typescript
export interface DashboardMetrics {
  totalRevenue: number
  revenueGrowth: number
  totalEnrollments: number
  enrollmentGrowth: number
  activeClasses: number
  totalParents: number
  parentGrowth: number
  upcomingEvents: number
}

export interface Client {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  childrenCount: number
  enrollmentsCount: number
  totalSpent: number
  outstandingBalance: number
  joinedAt: string
  lastActivityAt: string
}

export interface RevenueReport {
  totalRevenue: number
  revenueByProgram: Record<string, number>
  revenueByMonth: Record<string, number>
  revenueByArea: Record<string, number>
  outstandingPayments: number
  refundedAmount: number
  averageOrderValue: number
}

export interface Refund {
  id: string
  paymentId: string
  amount: number
  reason: string
  status: 'pending' | 'processed' | 'failed'
  processedBy: string
  processedAt?: string
  createdAt: string
}

export interface SystemStats {
  totalUsers: number
  totalChildren: number
  totalClasses: number
  totalEnrollments: number
  totalRevenue: number
  activeSubscriptions: number
}
```

**Exports:**
- Admin-related TypeScript interfaces

---

#### src/api/types/common.types.ts
**Location:** `/src/api/types/common.types.ts`

**Purpose:** Common/shared TypeScript types.

**Type Definitions:**
```typescript
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ApiError {
  message: string
  code: string
  status: number
  errors?: Record<string, string[]>
}

export interface DateRange {
  startDate: string
  endDate: string
}

export interface FilterOptions {
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  pageSize?: number
}
```

**Exports:**
- Common/shared TypeScript interfaces

---

## 4. Context & State Management

### src/context/auth.js
**Location:** `/src/context/auth.js`

**Purpose:** Authentication context provider for managing user authentication state.

**What This File Does:**
1. Creates AuthContext for sharing auth state
2. Manages user login/logout
3. Stores JWT tokens in localStorage
4. Provides authentication methods to entire app
5. Handles token persistence across sessions

**Context Value:**
```javascript
{
  user: User | null,
  token: string | null,
  isAuthenticated: boolean,
  isLoading: boolean,
  login: (email, password) => Promise<void>,
  logout: () => void,
  googleLogin: (idToken) => Promise<void>,
  updateUser: (userData) => void
}
```

**Key Functions:**
```javascript
// Login with email/password
login(email, password)
  - Calls auth API
  - Stores token in localStorage
  - Updates user state

// Logout
logout()
  - Clears localStorage
  - Resets user state
  - Redirects to login

// Google OAuth login
googleLogin(idToken)
  - Verifies Google token
  - Creates/logs in user
  - Stores auth token
```

**Usage:**
```javascript
import { useAuth } from '@/context/auth'

function LoginPage() {
  const { login, isLoading } = useAuth()

  const handleLogin = async (email, password) => {
    await login(email, password)
  }

  return <LoginForm onSubmit={handleLogin} />
}
```

**Exports:**
- `AuthProvider` - Context provider component
- `useAuth` - Hook to access auth context

---

### src/context/AuthContext.tsx
**Location:** `/src/context/AuthContext.tsx`

**Purpose:** Modern TypeScript authentication context (newer implementation).

**What This File Does:**
- Type-safe authentication context
- Similar functionality to auth.js but with TypeScript
- Provides better intellisense and type checking

**Exports:**
- `AuthProvider` - TS auth provider
- `useAuth` - TS auth hook

---

### src/context/StateProvider.js
**Location:** `/src/context/StateProvider.js`

**Purpose:** Global application state provider using reducer pattern.

**What This File Does:**
1. Creates global state context
2. Uses reducer for state updates
3. Provides state and dispatch to entire app
4. Manages UI state and temporary data

**Context Value:**
```javascript
{
  state: {
    // Global state object
  },
  dispatch: (action) => void
}
```

**Usage:**
```javascript
import { useStateValue } from '@/context/StateProvider'

function Component() {
  const [state, dispatch] = useStateValue()

  const updateSomething = () => {
    dispatch({
      type: 'UPDATE_SOMETHING',
      payload: data
    })
  }

  return <div>{state.something}</div>
}
```

**Exports:**
- `StateProvider` - State provider component
- `useStateValue` - Hook to access state

---

### src/context/initialState.js
**Location:** `/src/context/initialState.js`

**Purpose:** Defines initial state shape for StateProvider.

**State Shape:**
```javascript
export const initialState = {
  cart: [],
  selectedChild: null,
  selectedClass: null,
  checkoutStep: 0,
  // ... more state
}
```

**Exports:**
- `initialState` - Initial state object

---

### src/context/reducer.js
**Location:** `/src/context/reducer.js`

**Purpose:** Reducer function for handling state updates.

**What This File Does:**
- Defines action types
- Handles state transitions
- Returns new state based on actions

**Action Types:**
```javascript
'SET_CART'
'ADD_TO_CART'
'REMOVE_FROM_CART'
'SELECT_CHILD'
'SELECT_CLASS'
'SET_CHECKOUT_STEP'
'CLEAR_STATE'
// ... more actions
```

**Example Actions:**
```javascript
case 'SET_CART':
  return {
    ...state,
    cart: action.payload
  }

case 'SELECT_CHILD':
  return {
    ...state,
    selectedChild: action.payload
  }
```

**Exports:**
- `reducer` - Reducer function

---

### src/context/StepperContext.js
**Location:** `/src/context/StepperContext.js`

**Purpose:** Context for multi-step forms (checkout, registration).

**What This File Does:**
- Manages current step in multi-step flows
- Handles step navigation (next, previous)
- Validates step before proceeding

**Context Value:**
```javascript
{
  currentStep: number,
  steps: Step[],
  nextStep: () => void,
  previousStep: () => void,
  goToStep: (stepNumber) => void,
  isFirstStep: boolean,
  isLastStep: boolean
}
```

**Exports:**
- `StepperProvider` - Stepper provider
- `useStepper` - Stepper hook

---

## 5. Components

### Component Organization

Components are organized by feature/domain:
- `admin/` - Admin-specific components
- `AdminDashboard/` - Admin dashboard widgets
- `announcements/` - Announcement components
- `attendence/` - Attendance components
- `auth/` - Authentication components
- `Calendar/` - Calendar components
- `checkIn/` - Check-in components
- `checkout/` - Checkout flow components
- `Clients/` - Client management components
- `dashboard/` - Dashboard widgets
- `errors/` - Error handling components
- `Financial/` - Financial reporting components
- `payment/` - Payment display components
- `providers/` - Context providers

### Top-Level Components

#### src/components/Header.jsx
**Location:** `/src/components/Header.jsx`

**Purpose:** Main navigation header for the application.

**What This Component Does:**
1. Displays site logo and navigation links
2. Shows user profile menu
3. Handles navigation based on user role
4. Displays notifications badge
5. Provides logout functionality

**Props:**
```typescript
interface HeaderProps {
  // Usually no props, reads from auth context
}
```

**Features:**
- Responsive mobile menu
- Role-based navigation items
- User dropdown menu
- Notification indicator
- Logo with link to dashboard

**Usage:**
```jsx
import Header from '@/components/Header'

function Layout() {
  return (
    <>
      <Header />
      <main>{children}</main>
    </>
  )
}
```

**Exports:**
- `Header` - Header component

---

#### src/components/Sidebar.jsx
**Location:** `/src/components/Sidebar.jsx`

**Purpose:** Navigation sidebar for parent/user dashboard.

**What This Component Does:**
1. Displays vertical navigation menu
2. Shows active route highlighting
3. Provides quick links to main sections
4. Displays user info and children

**Navigation Items:**
- Dashboard
- Classes
- My Enrollments
- Payment & Billing
- Calendar
- Gallery
- Attendance
- Badges
- Settings

**Features:**
- Active link highlighting
- Icon-based navigation
- Collapsible mobile sidebar
- User profile summary

**Exports:**
- `Sidebar` - Sidebar component

---

#### src/components/Footer.jsx
**Location:** `/src/components/Footer.jsx`

**Purpose:** Application footer with links and information.

**What This Component Does:**
- Displays copyright information
- Shows footer navigation links
- Displays social media links
- Contact information

**Exports:**
- `Footer` - Footer component

---

#### src/components/ProtectedRoute.jsx
**Location:** `/src/components/ProtectedRoute.jsx`

**Purpose:** Route wrapper for role-based access control.

**What This Component Does:**
1. Checks if user is authenticated
2. Verifies user has required role
3. Redirects to login if not authenticated
4. Redirects to home if wrong role
5. Renders children if authorized

**Props:**
```typescript
interface ProtectedRouteProps {
  allowedRoles: string[]  // e.g., ['parent', 'admin']
  redirectTo?: string     // Custom redirect path
  children: ReactNode
}
```

**Usage:**
```jsx
import ProtectedRoute from '@/components/ProtectedRoute'

<Route path="/admin" element={
  <ProtectedRoute allowedRoles={['admin']}>
    <AdminDashboard />
  </ProtectedRoute>
} />
```

**Logic Flow:**
```
1. Check if user is authenticated
   - No: Redirect to /login
2. Check if user.role in allowedRoles
   - No: Redirect to home
3. Render children
```

**Exports:**
- `ProtectedRoute` - Protected route component

---

### Admin Components

#### src/components/admin/DataTable.jsx
**Location:** `/src/components/admin/DataTable.jsx`

**Purpose:** Reusable data table for admin pages.

**What This Component Does:**
- Displays data in table format
- Supports sorting and pagination
- Allows row selection
- Provides action buttons per row

**Props:**
```typescript
interface DataTableProps {
  columns: Column[]
  data: any[]
  onRowClick?: (row) => void
  selectable?: boolean
  actions?: Action[]
  loading?: boolean
  pagination?: PaginationConfig
}
```

**Features:**
- Column sorting (ascending/descending)
- Pagination controls
- Row selection checkboxes
- Action menu per row
- Loading skeleton
- Empty state

**Exports:**
- `DataTable` - Data table component

---

#### src/components/admin/FilterBar.jsx
**Location:** `/src/components/admin/FilterBar.jsx`

**Purpose:** Filter controls for admin data views.

**What This Component Does:**
- Provides search input
- Date range picker
- Status filter dropdown
- Program/area filters
- Clear filters button

**Props:**
```typescript
interface FilterBarProps {
  filters: FilterConfig[]
  onFilterChange: (filters) => void
  onClear: () => void
}
```

**Exports:**
- `FilterBar` - Filter bar component

---

#### src/components/admin/StatusBadge.jsx
**Location:** `/src/components/admin/StatusBadge.jsx`

**Purpose:** Status indicator badge.

**What This Component Does:**
- Displays status with color coding
- Shows icons for different statuses
- Supports custom status types

**Props:**
```typescript
interface StatusBadgeProps {
  status: 'active' | 'pending' | 'cancelled' | 'completed'
  size?: 'sm' | 'md' | 'lg'
}
```

**Status Colors:**
- `active`: Green
- `pending`: Yellow
- `cancelled`: Red
- `completed`: Blue

**Exports:**
- `StatusBadge` - Status badge component

---

#### src/components/admin/ActionMenu.jsx
**Location:** `/src/components/admin/ActionMenu.jsx`

**Purpose:** Dropdown action menu for table rows.

**What This Component Does:**
- Displays three-dot menu button
- Shows dropdown with actions
- Handles action clicks

**Props:**
```typescript
interface ActionMenuProps {
  actions: Action[]
  onAction: (actionId, item) => void
  item: any
}

interface Action {
  id: string
  label: string
  icon?: ReactNode
  variant?: 'default' | 'danger'
  condition?: (item) => boolean
}
```

**Exports:**
- `ActionMenu` - Action menu component

---

#### src/components/admin/ConfirmDialog.jsx
**Location:** `/src/components/admin/ConfirmDialog.jsx`

**Purpose:** Confirmation modal for destructive actions.

**What This Component Does:**
- Shows confirmation message
- Provides confirm/cancel buttons
- Supports custom content
- Handles loading states

**Props:**
```typescript
interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'danger'
  onConfirm: () => void | Promise<void>
  onCancel: () => void
  loading?: boolean
}
```

**Exports:**
- `ConfirmDialog` - Confirmation dialog

---

### Checkout Components

#### src/components/checkout/CheckoutFlow.jsx
**Location:** `/src/components/checkout/CheckoutFlow.jsx` (inferred)

**Purpose:** Main checkout flow orchestrator.

**What This Component Does:**
- Manages multi-step checkout process
- Handles state between steps
- Validates each step before proceeding
- Processes final payment

**Checkout Steps:**
1. Select child
2. Review class details
3. Choose installment plan
4. Select payment method
5. Enter payment information
6. Confirm and pay

**Exports:**
- Checkout flow wrapper

---

#### src/components/checkout/ChildSelector.jsx
**Location:** `/src/components/checkout/ChildSelector.jsx`

**Purpose:** Child selection step in checkout.

**What This Component Does:**
- Displays list of user's children
- Allows selecting child for enrollment
- Shows add new child option
- Validates age requirements

**Props:**
```typescript
interface ChildSelectorProps {
  children: Child[]
  selectedChild?: Child
  onSelect: (child: Child) => void
  classAgeRange: AgeRange
}
```

**Exports:**
- `ChildSelector` - Child selector component

---

#### src/components/checkout/ClassDetailsSummary.jsx
**Location:** `/src/components/checkout/ClassDetailsSummary.jsx`

**Purpose:** Class information summary in checkout.

**What This Component Does:**
- Displays class details
- Shows schedule
- Displays price
- Shows coach information

**Exports:**
- `ClassDetailsSummary` - Class summary component

---

#### src/components/checkout/InstallmentPlanSelector.jsx
**Location:** `/src/components/checkout/InstallmentPlanSelector.jsx`

**Purpose:** Installment plan selection.

**What This Component Does:**
- Displays available payment plans
- Shows pay-in-full option
- Shows installment breakdown
- Calculates total cost

**Props:**
```typescript
interface InstallmentPlanSelectorProps {
  plans: InstallmentPlan[]
  onSelect: (plan: InstallmentPlan | null) => void
  selectedPlan?: InstallmentPlan
}
```

**Exports:**
- `InstallmentPlanSelector` - Plan selector

---

#### src/components/checkout/PaymentMethodSelector.jsx
**Location:** `/src/components/checkout/PaymentMethodSelector.jsx`

**Purpose:** Payment method selection.

**What This Component Does:**
- Shows saved payment methods
- Allows selecting saved card
- Provides option to use new card
- Shows card brand icons

**Exports:**
- `PaymentMethodSelector` - Payment method selector

---

#### src/components/checkout/StripePaymentForm.jsx
**Location:** `/src/components/checkout/StripePaymentForm.jsx`

**Purpose:** Stripe payment form integration.

**What This Component Does:**
1. Integrates Stripe Elements
2. Collects payment information
3. Validates card details
4. Creates payment intent
5. Handles 3D Secure authentication

**Features:**
- Stripe Elements card input
- Real-time validation
- Error handling
- Save card option
- Billing address collection

**Usage:**
```jsx
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import StripePaymentForm from '@/components/checkout/StripePaymentForm'

const stripePromise = loadStripe(STRIPE_KEY)

function Checkout() {
  return (
    <Elements stripe={stripePromise}>
      <StripePaymentForm onSuccess={handleSuccess} />
    </Elements>
  )
}
```

**Exports:**
- `StripePaymentForm` - Stripe form component

---

#### src/components/checkout/OrderSummary.jsx
**Location:** `/src/components/checkout/OrderSummary.jsx`

**Purpose:** Order summary sidebar in checkout.

**What This Component Does:**
- Displays order items
- Shows price breakdown
- Calculates taxes
- Displays discounts
- Shows total amount

**Price Breakdown:**
- Subtotal
- Sibling discount (if applicable)
- Promo code discount
- Tax
- **Total**

**Exports:**
- `OrderSummary` - Order summary component

---

#### src/components/checkout/DiscountCodeInput.jsx
**Location:** `/src/components/checkout/DiscountCodeInput.jsx`

**Purpose:** Discount/promo code input.

**What This Component Does:**
- Provides input for discount code
- Validates code on submit
- Shows discount applied message
- Allows removing applied code

**Exports:**
- `DiscountCodeInput` - Discount input component

---

#### src/components/checkout/OrderConfirmation.jsx
**Location:** `/src/components/checkout/OrderConfirmation.jsx`

**Purpose:** Post-checkout confirmation screen.

**What This Component Does:**
- Shows success message
- Displays order number
- Shows enrollment details
- Provides next steps
- Offers action buttons (view enrollments, download receipt)

**Exports:**
- `OrderConfirmation` - Confirmation component

---

#### src/components/checkout/WaiverCheckModal.jsx
**Location:** `/src/components/checkout/WaiverCheckModal.jsx`

**Purpose:** Waiver requirement check before checkout.

**What This Component Does:**
- Checks if user has signed required waivers
- Displays missing waivers
- Provides waiver signing interface
- Blocks checkout until signed

**Exports:**
- `WaiverCheckModal` - Waiver modal

---

### Calendar Components

#### src/components/Calendar/FullCalender.jsx
**Location:** `/src/components/Calendar/FullCalender.jsx`

**Purpose:** Full-size calendar view.

**What This Component Does:**
- Displays full month calendar
- Shows events and classes
- Supports day/week/month views
- Handles event clicks

**Features:**
- Month/week/day view toggle
- Event rendering
- Custom event styles by type
- Navigation controls

**Exports:**
- `FullCalender` - Full calendar component

---

#### src/components/Calendar/CalenderMini.jsx
**Location:** `/src/components/Calendar/CalenderMini.jsx`

**Purpose:** Mini calendar widget for sidebar.

**What This Component Does:**
- Displays small monthly calendar
- Highlights event dates
- Allows date selection
- Shows selected date events

**Exports:**
- `CalenderMini` - Mini calendar component

---

### Dashboard Components

#### src/components/dashboard/StatCard.jsx
**Location:** `/src/components/dashboard/StatCard.jsx`

**Purpose:** Statistic card for dashboard.

**What This Component Does:**
- Displays a metric/statistic
- Shows trend indicator (up/down)
- Supports icon
- Displays percentage change

**Props:**
```typescript
interface StatCardProps {
  title: string
  value: string | number
  change?: number
  icon?: ReactNode
  trend?: 'up' | 'down'
  color?: string
}
```

**Example:**
```jsx
<StatCard
  title="Total Enrollments"
  value={42}
  change={12}
  trend="up"
  icon={<UsersIcon />}
/>
```

**Exports:**
- `StatCard` - Stat card component

---

#### src/components/dashboard/ProgramPhotoCard.jsx
**Location:** `/src/components/dashboard/ProgramPhotoCard.jsx`

**Purpose:** Program card with photo.

**What This Component Does:**
- Displays program image
- Shows program name
- Displays class count
- Links to program classes

**Exports:**
- `ProgramPhotoCard` - Program card

---

### Shared Components

#### src/components/ClassCard.jsx
**Location:** `/src/components/ClassCard.jsx`

**Purpose:** Class preview card.

**What This Component Does:**
- Displays class thumbnail
- Shows class name, time, location
- Displays price
- Shows enrollment status
- Links to class details

**Props:**
```typescript
interface ClassCardProps {
  class: Class
  onClick?: () => void
  showEnrollButton?: boolean
}
```

**Card Sections:**
- Image
- Program badge
- Class name
- Schedule info
- Age range
- Price
- Enrollment status
- Action button

**Exports:**
- `ClassCard` - Class card component

---

#### src/components/EnrollmentCard.jsx
**Location:** `/src/components/EnrollmentCard.jsx`

**Purpose:** Enrollment display card.

**What This Component Does:**
- Shows enrolled class info
- Displays child name
- Shows enrollment status
- Displays payment status
- Provides action buttons (transfer, cancel)

**Exports:**
- `EnrollmentCard` - Enrollment card

---

#### src/components/BadgeCard.jsx
**Location:** `/src/components/BadgeCard.jsx`

**Purpose:** Achievement badge display.

**What This Component Does:**
- Displays badge icon
- Shows badge name
- Shows earned/unearned state
- Displays progress bar
- Shows earned date

**Props:**
```typescript
interface BadgeCardProps {
  badge: Badge
  earned?: boolean
  progress?: number
  earnedDate?: string
}
```

**Exports:**
- `BadgeCard` - Badge card component

---

#### src/components/GenericButton.jsx
**Location:** `/src/components/GenericButton.jsx`

**Purpose:** Reusable button component.

**What This Component Does:**
- Provides consistent button styling
- Supports multiple variants
- Handles loading states
- Supports icons

**Props:**
```typescript
interface GenericButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  icon?: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}
```

**Variants:**
- `primary` - Blue background
- `secondary` - Gray background
- `outline` - Transparent with border
- `danger` - Red background

**Exports:**
- `GenericButton` - Button component

---

#### src/components/InputField.jsx
**Location:** `/src/components/InputField.jsx`

**Purpose:** Reusable form input component.

**What This Component Does:**
- Provides consistent input styling
- Shows validation errors
- Supports different input types
- Handles Formik integration

**Props:**
```typescript
interface InputFieldProps {
  name: string
  label: string
  type?: string
  placeholder?: string
  error?: string
  touched?: boolean
  required?: boolean
  disabled?: boolean
  icon?: ReactNode
}
```

**Exports:**
- `InputField` - Input field component

---

#### src/components/AddStudent.jsx
**Location:** `/src/components/AddStudent.jsx`

**Purpose:** Add new student/child form modal.

**What This Component Does:**
- Displays add child form
- Validates input
- Creates new child profile
- Handles emergency contact info

**Form Fields:**
- First name
- Last name
- Date of birth
- Gender
- Medical notes
- Allergies
- Emergency contact (name, phone, relationship)

**Exports:**
- `AddStudent` - Add student component

---

#### src/components/PaymentStatusCard.jsx
**Location:** `/src/components/PaymentStatusCard.jsx`

**Purpose:** Payment status indicator.

**What This Component Does:**
- Shows payment status
- Displays amount
- Shows due date
- Provides pay button

**Exports:**
- `PaymentStatusCard` - Payment status card

---

#### src/components/InstallmentTracker.jsx
**Location:** `/src/components/InstallmentTracker.jsx`

**Purpose:** Installment payment tracker.

**What This Component Does:**
- Shows all installments
- Displays paid/upcoming status
- Shows payment dates
- Calculates remaining balance

**Exports:**
- `InstallmentTracker` - Installment tracker

---

#### src/components/Gallery.jsx
**Location:** `/src/components/Gallery.jsx`

**Purpose:** Photo gallery grid layout.

**What This Component Does:**
- Displays photos in grid
- Supports lightbox view
- Allows photo upload (coach/admin)
- Shows photo captions

**Exports:**
- `Gallery` - Gallery component

---

#### src/components/PhotoCard.jsx
**Location:** `/src/components/PhotoCard.jsx`

**Purpose:** Individual photo card in gallery.

**What This Component Does:**
- Displays photo thumbnail
- Shows caption
- Opens lightbox on click
- Shows upload date

**Exports:**
- `PhotoCard` - Photo card component

---

#### src/components/UploadPhotosModal.jsx
**Location:** `/src/components/UploadPhotosModal.jsx`

**Purpose:** Photo upload modal for coaches/admins.

**What This Component Does:**
- Provides file upload interface
- Supports multiple files
- Shows upload progress
- Adds photos to album

**Exports:**
- `UploadPhotosModal` - Upload modal

---

#### src/components/WaiversAlert.jsx
**Location:** `/src/components/WaiversAlert.jsx`

**Purpose:** Alert for pending waivers.

**What This Component Does:**
- Checks for unsigned waivers
- Displays alert banner
- Links to waiver signing
- Dismissible notification

**Exports:**
- `WaiversAlert` - Waivers alert

---

### Error Components

#### src/components/errors/ErrorBoundary.tsx
**Location:** `/src/components/errors/ErrorBoundary.tsx`

**Purpose:** React error boundary for catching errors.

**What This Component Does:**
1. Catches JavaScript errors in child components
2. Displays fallback UI
3. Logs errors for debugging
4. Prevents entire app crash

**Features:**
- Error logging
- Fallback UI
- Reset button
- Development mode details

**Usage:**
```jsx
import { ErrorBoundary } from '@/components/errors'

<ErrorBoundary>
  <App />
</ErrorBoundary>
```

**Exports:**
- `ErrorBoundary` - Error boundary component

---

## 6. Pages

### Parent Pages

#### src/pages/Dashboard.jsx
**Location:** `/src/pages/Dashboard.jsx`

**Purpose:** Main parent dashboard.

**What This Page Does:**
- Shows upcoming classes
- Displays next events
- Shows recent announcements
- Displays enrolled children
- Quick stats (enrollments, payments)

**Sections:**
1. Welcome message with user name
2. Enrolled classes cards
3. Upcoming events
4. Recent announcements
5. Quick actions (enroll, view calendar)

**Exports:**
- `Dashboard` - Dashboard page

---

#### src/pages/Classes.jsx
**Location:** `/src/pages/Classes.jsx`

**Purpose:** Browse and search available classes.

**What This Page Does:**
- Lists all available classes
- Provides filtering by program, age, area
- Shows search functionality
- Links to class details
- Displays enrollment status

**Filters:**
- Program (Soccer, Basketball, etc.)
- Age range
- Area/Location
- Day of week
- Time of day

**Exports:**
- `Classes` - Classes list page

---

#### src/pages/ClassDetails.jsx
**Location:** `/src/pages/ClassDetails.jsx`

**Purpose:** Detailed view of a single class.

**What This Page Does:**
- Shows full class information
- Displays coach bio
- Shows schedule and location
- Displays pricing and installments
- Provides enroll button
- Shows similar classes

**Sections:**
1. Class header (name, program, image)
2. Description
3. Details (age, schedule, location)
4. Coach information
5. Pricing
6. Enroll button
7. Reviews/testimonials (if available)

**Exports:**
- `ClassDetails` - Class details page

---

#### src/pages/CheckOut.jsx
**Location:** `/src/pages/CheckOut.jsx`

**Purpose:** Checkout and enrollment page.

**What This Page Does:**
- Orchestrates checkout flow
- Manages multi-step process
- Processes payment
- Creates enrollment
- Shows confirmation

**Flow:**
1. Select child
2. Review class
3. Choose payment plan
4. Enter payment info
5. Confirm and pay
6. Show confirmation

**Exports:**
- `CheckOut` - Checkout page

---

#### src/pages/Calender.jsx
**Location:** `/src/pages/Calender.jsx`

**Purpose:** Calendar view of classes and events.

**What This Page Does:**
- Displays full calendar
- Shows enrolled classes
- Shows upcoming events
- Allows filtering by child
- Supports month/week view

**Exports:**
- `Calendar` - Calendar page

---

#### src/pages/Attendence.jsx
**Location:** `/src/pages/Attendence.jsx`

**Purpose:** Attendance history and tracking.

**What This Page Does:**
- Shows attendance records by child
- Displays attendance rate
- Shows streaks
- Lists upcoming classes
- Displays badges earned from attendance

**Metrics:**
- Total sessions
- Sessions attended
- Attendance rate
- Current streak
- Longest streak

**Exports:**
- `Attendance` - Attendance page

---

#### src/pages/Badges.jsx
**Location:** `/src/pages/Badges.jsx`

**Purpose:** Achievements and badges page.

**What This Page Does:**
- Shows earned badges
- Displays progress on unearned badges
- Shows badge categories
- Allows filtering by child
- Displays badge details

**Badge Categories:**
- Attendance
- Skill achievements
- Milestones
- Special events

**Exports:**
- `Badges` - Badges page

---

#### src/pages/Gallery.jsx
**Location:** `/src/pages/Gallery.jsx`

**Purpose:** Photo gallery page.

**What This Page Does:**
- Shows photo albums
- Displays photos by class/event
- Allows viewing photos
- Shows recent uploads

**Exports:**
- `Gallery` - Gallery page

---

#### src/pages/PaymentBilling.jsx
**Location:** `/src/pages/PaymentBilling.jsx`

**Purpose:** Payment history and billing.

**What This Page Does:**
- Shows payment history
- Displays upcoming payments
- Shows invoices
- Manages payment methods
- Displays receipts

**Sections:**
1. Payment methods
2. Payment history
3. Upcoming installments
4. Invoices
5. Transaction receipts

**Exports:**
- `PaymentBilling` - Payment billing page

---

#### src/pages/Settings.jsx
**Location:** `/src/pages/Settings.jsx`

**Purpose:** User settings and profile management.

**What This Page Does:**
- Edit profile information
- Update password
- Manage notification preferences
- Update emergency contacts
- Manage children profiles

**Settings Sections:**
1. Profile Information
2. Password Change
3. Notification Settings
4. Children Management
5. Account Settings

**Exports:**
- `Settings` - Settings page

---

#### src/pages/Waivers.jsx
**Location:** `/src/pages/Waivers.jsx`

**Purpose:** Waiver management page.

**What This Page Does:**
- Lists required waivers
- Shows signed waivers
- Provides waiver signing
- Displays waiver documents

**Exports:**
- `Waivers` - Waivers page

---

#### src/pages/ProgramOverview.jsx
**Location:** `/src/pages/ProgramOverview.jsx`

**Purpose:** Program information page.

**What This Page Does:**
- Shows program details
- Lists program classes
- Displays program benefits
- Shows program coaches

**Exports:**
- `ProgramOverview` - Program overview page

---

### Authentication Pages

#### src/pages/Login.jsx
**Location:** `/src/pages/Login.jsx`

**Purpose:** User login page.

**What This Page Does:**
- Provides email/password login
- Google OAuth button
- Forgot password link
- Registration link
- Handles authentication

**Form Fields:**
- Email
- Password

**Features:**
- Form validation
- Error messages
- Loading states
- Remember me option
- Social login

**Exports:**
- `Login` - Login page

---

#### src/pages/Register.jsx
**Location:** `/src/pages/Register.jsx`

**Purpose:** User registration page.

**What This Page Does:**
- New user registration
- Email verification
- Account creation
- Auto-login after registration

**Form Fields:**
- First name
- Last name
- Email
- Phone
- Password
- Confirm password

**Exports:**
- `Register` - Registration page

---

#### src/pages/ForgotPassword.jsx
**Location:** `/src/pages/ForgotPassword.jsx`

**Purpose:** Password reset request page.

**What This Page Does:**
- Sends password reset email
- Validates email
- Shows confirmation message

**Exports:**
- `ForgotPassword` - Forgot password page

---

### Admin Pages

#### src/pages/AdminDashboard/AdminDashboard.jsx
**Location:** `/src/pages/AdminDashboard/AdminDashboard.jsx`

**Purpose:** Admin dashboard overview.

**What This Page Does:**
- Shows key metrics (revenue, enrollments, users)
- Displays revenue charts
- Shows recent activity
- Lists today's classes
- Shows pending actions

**Metrics:**
- Total revenue (with growth %)
- Total enrollments (with growth %)
- Active classes
- Total parents
- Outstanding payments

**Charts:**
- Revenue by month
- Enrollments by program
- Members growth

**Exports:**
- `AdminDashboard` - Admin dashboard page

---

#### src/pages/AdminDashboard/Classes.jsx
**Location:** `/src/pages/AdminDashboard/Classes.jsx`

**Purpose:** Class management for admins.

**What This Page Does:**
- Lists all classes
- Allows creating new classes
- Editing class details
- Cancelling classes
- Viewing enrollment roster

**Actions:**
- Create Class
- Edit Class
- View Roster
- Cancel Class
- Duplicate Class

**Exports:**
- `Classes` - Admin classes page

---

#### src/pages/AdminDashboard/ClassList.jsx
**Location:** `/src/pages/AdminDashboard/ClassList.jsx`

**Purpose:** List view of all classes (admin).

**Exports:**
- `ClassList` - Class list component

---

#### src/pages/AdminDashboard/ClassDetail.jsx
**Location:** `/src/pages/AdminDashboard/ClassDetail.jsx`

**Purpose:** Detailed class management page.

**What This Page Does:**
- Shows class information
- Displays enrollment roster
- Shows attendance records
- Allows editing class
- Shows revenue from class

**Sections:**
1. Class Info
2. Roster (enrolled students)
3. Waitlist
4. Attendance
5. Revenue
6. Class Actions

**Exports:**
- `ClassDetail` - Class detail page

---

#### src/pages/AdminDashboard/Clients.jsx
**Location:** `/src/pages/AdminDashboard/Clients.jsx`

**Purpose:** Client (parent) management.

**What This Page Does:**
- Lists all parents/clients
- Shows client details
- Displays enrollment history
- Shows payment history
- Allows exporting data

**Client Info:**
- Name, email, phone
- Children count
- Total enrollments
- Total spent
- Outstanding balance
- Join date

**Actions:**
- View Details
- View Enrollments
- View Payments
- Send Message
- Export Data

**Exports:**
- `Clients` - Clients page

---

#### src/pages/AdminDashboard/Enrollments.jsx
**Location:** `/src/pages/AdminDashboard/Enrollments.jsx`

**Purpose:** Enrollment management.

**What This Page Does:**
- Lists all enrollments
- Filters by status, program, date
- Allows manual enrollment
- Transfer enrollments
- Cancel enrollments

**Enrollment Statuses:**
- Active
- Pending
- Waitlist
- Cancelled
- Completed

**Exports:**
- `Enrollments` - Enrollments page

---

#### src/pages/AdminDashboard/Waitlist.jsx
**Location:** `/src/pages/AdminDashboard/Waitlist.jsx`

**Purpose:** Waitlist management.

**What This Page Does:**
- Shows waitlisted enrollments
- Allows promoting from waitlist
- Sends notifications when spot opens
- Manages waitlist priority

**Exports:**
- `Waitlist` - Waitlist page

---

#### src/pages/AdminDashboard/Financials.jsx
**Location:** `/src/pages/AdminDashboard/Financials.jsx`

**Purpose:** Financial reporting and analytics.

**What This Page Does:**
- Shows revenue reports
- Displays revenue by program
- Revenue by area
- Outstanding payments
- Refund tracking

**Reports:**
- Revenue by Program
- Revenue by Month
- Revenue by Area
- Average Order Value
- Outstanding Payments
- Refunds

**Exports:**
- `Financials` - Financials page

---

#### src/pages/AdminDashboard/Installments.jsx
**Location:** `/src/pages/AdminDashboard/Installments.jsx`

**Purpose:** Installment payment tracking.

**What This Page Does:**
- Lists all installment payments
- Shows overdue installments
- Allows manual payment recording
- Sends payment reminders

**Exports:**
- `Installments` - Installments page

---

#### src/pages/AdminDashboard/Invoices.jsx
**Location:** `/src/pages/AdminDashboard/Invoices.jsx`

**Purpose:** Invoice management.

**What This Page Does:**
- Lists all invoices
- Generates invoices
- Downloads PDF invoices
- Sends invoice emails

**Exports:**
- `Invoices` - Invoices page

---

#### src/pages/AdminDashboard/RegisterChild.jsx
**Location:** `/src/pages/AdminDashboard/RegisterChild.jsx`

**Purpose:** Manual child registration (admin).

**What This Page Does:**
- Allows admin to register child for parent
- Creates child profile
- Enrolls in class
- Processes payment

**Exports:**
- `RegisterChild` - Register child page

---

#### src/pages/admin/WaiversManagement.jsx
**Location:** `/src/pages/admin/WaiversManagement.jsx`

**Purpose:** Waiver template management.

**What This Page Does:**
- Manages waiver templates
- Creates new waivers
- Edits waiver content
- Tracks waiver versions

**Exports:**
- `WaiversManagement` - Waiver management page

---

#### src/pages/admin/WaiverReports.jsx
**Location:** `/src/pages/admin/WaiverReports.jsx`

**Purpose:** Waiver signing reports.

**What This Page Does:**
- Shows waiver completion status
- Lists unsigned waivers by parent
- Exports waiver reports
- Sends waiver reminders

**Exports:**
- `WaiverReports` - Waiver reports page

---

### Coach Pages

#### src/pages/CoachDashboard/DashboardCoach.jsx
**Location:** `/src/pages/CoachDashboard/DashboardCoach.jsx`

**Purpose:** Coach dashboard.

**What This Page Does:**
- Shows assigned classes
- Displays today's schedule
- Shows roster for classes
- Quick attendance marking
- Announcements

**Sections:**
1. Today's Schedule
2. My Classes
3. Recent Attendance
4. Quick Actions

**Exports:**
- `DashboardCoach` - Coach dashboard

---

#### src/pages/CoachDashboard/CheckIn.jsx
**Location:** `/src/pages/CoachDashboard/CheckIn.jsx`

**Purpose:** Student check-in interface.

**What This Page Does:**
- Lists students for class
- Allows quick check-in
- Shows student details
- Marks attendance
- Awards badges

**Features:**
- Student search
- Barcode/QR scanning
- Manual check-in
- Attendance notes
- Emergency contact access

**Exports:**
- `CheckIn` - Check-in page

---

#### src/pages/CoachDashboard/CoachGallery.jsx
**Location:** `/src/pages/CoachDashboard/CoachGallery.jsx`

**Purpose:** Coach photo upload and gallery.

**What This Page Does:**
- Upload class photos
- Manage photo albums
- Tag students in photos
- Delete inappropriate photos

**Exports:**
- `CoachGallery` - Coach gallery page

---

### Other Pages

#### src/pages/PaymentSuccess.jsx
**Location:** `/src/pages/PaymentSuccess.jsx`

**Purpose:** Payment success confirmation.

**What This Page Does:**
- Shows success message
- Displays order details
- Provides next steps
- Downloads receipt

**Exports:**
- `PaymentSuccess` - Success page

---

#### src/pages/PaymentCancel.jsx
**Location:** `/src/pages/PaymentCancel.jsx`

**Purpose:** Payment cancellation page.

**What This Page Does:**
- Shows cancellation message
- Explains what happened
- Provides retry option
- Links back to checkout

**Exports:**
- `PaymentCancel` - Cancel page

---

#### src/pages/ContactForm.jsx
**Location:** `/src/pages/ContactForm.jsx`

**Purpose:** Contact form page.

**What This Page Does:**
- Provides contact form
- Sends message to admin
- Shows contact information
- Displays office hours

**Exports:**
- `ContactForm` - Contact page

---

## 7. Custom Hooks

### src/hooks/useApi.js
**Location:** `/src/hooks/useApi.js`

**Purpose:** Generic API call wrapper hook.

**What This Hook Does:**
- Wraps API calls with loading/error states
- Provides consistent interface
- Handles errors
- Returns standardized response

**Usage:**
```javascript
import { useApi } from '@/hooks'

function Component() {
  const { data, loading, error, execute } = useApi(apiFunction)

  useEffect(() => {
    execute()
  }, [])

  return <div>{data}</div>
}
```

**Returns:**
```javascript
{
  data: any,
  loading: boolean,
  error: Error | null,
  execute: (...args) => Promise<void>
}
```

**Exports:**
- `useApi` - API hook

---

### src/hooks/useCheckoutFlow.js
**Location:** `/src/hooks/useCheckoutFlow.js`

**Purpose:** Manages checkout flow state and logic.

**What This Hook Does:**
- Manages checkout steps
- Validates each step
- Stores checkout data
- Handles navigation

**Returns:**
```javascript
{
  currentStep: number,
  checkoutData: object,
  updateCheckoutData: (data) => void,
  nextStep: () => void,
  previousStep: () => void,
  canProceed: boolean
}
```

**Exports:**
- `useCheckoutFlow` - Checkout flow hook

---

### src/hooks/useChildren.js
**Location:** `/src/hooks/useChildren.js`

**Purpose:** Child data management hook.

**What This Hook Does:**
- Fetches children data
- Provides CRUD operations
- Caches children
- Handles loading states

**Exports:**
- `useChildren` - Children hook

---

### src/hooks/useClassForm.js
**Location:** `/src/hooks/useClassForm.js`

**Purpose:** Class form logic (admin).

**What This Hook Does:**
- Manages class form state
- Validates class data
- Handles form submission
- Manages schedule inputs

**Exports:**
- `useClassForm` - Class form hook

---

### src/hooks/useEnrollments.js
**Location:** `/src/hooks/useEnrollments.js`

**Purpose:** Enrollment data management.

**What This Hook Does:**
- Fetches enrollments
- Filters enrollments
- Provides enrollment operations

**Exports:**
- `useEnrollments` - Enrollments hook

---

### src/hooks/useMutation.js
**Location:** `/src/hooks/useMutation.js`

**Purpose:** Generic mutation wrapper.

**What This Hook Does:**
- Wraps mutation operations
- Handles loading/error states
- Provides success callbacks
- Handles optimistic updates

**Exports:**
- `useMutation` - Mutation hook

---

### src/hooks/useToast.js
**Location:** `/src/hooks/useToast.js`

**Purpose:** Toast notification helper.

**What This Hook Does:**
- Provides toast notification functions
- Handles success/error/info toasts
- Manages toast queue

**Usage:**
```javascript
import { useToast } from '@/hooks'

function Component() {
  const { toast } = useToast()

  const handleSuccess = () => {
    toast.success('Operation successful!')
  }

  const handleError = () => {
    toast.error('Something went wrong')
  }

  return <button onClick={handleSuccess}>Save</button>
}
```

**Toast Methods:**
```javascript
{
  success: (message, options?) => void,
  error: (message, options?) => void,
  info: (message, options?) => void,
  warning: (message, options?) => void
}
```

**Exports:**
- `useToast` - Toast hook

---

## 8. Utilities

### src/utils/classHelpers.ts
**Location:** `/src/utils/classHelpers.ts`

**Purpose:** Helper functions for class operations.

**Functions:**
```typescript
// Check if child meets age requirements
isAgeEligible(child: Child, ageRange: AgeRange): boolean

// Calculate age from birthdate
calculateAge(birthdate: string): number

// Format schedule display
formatSchedule(schedule: Schedule[]): string

// Check if class is full
isClassFull(class: Class): boolean

// Get enrollment status
getEnrollmentStatus(enrolled: number, capacity: number, waitlist: number): string
```

**Exports:**
- Helper functions for classes

---

### src/utils/formatters.ts
**Location:** `/src/utils/formatters.ts`

**Purpose:** Data formatting utilities.

**Functions:**
```typescript
// Format currency
formatCurrency(amount: number): string
// Example: 1234.56 → "$1,234.56"

// Format date
formatDate(date: string, format?: string): string
// Example: "2024-01-15" → "January 15, 2024"

// Format phone number
formatPhone(phone: string): string
// Example: "1234567890" → "(123) 456-7890"

// Format time
formatTime(time: string): string
// Example: "14:30" → "2:30 PM"

// Format name
formatName(firstName: string, lastName: string): string
// Example: "john", "doe" → "John Doe"
```

**Exports:**
- Formatting functions

---

### src/utils/format.js
**Location:** `/src/utils/format.js`

**Purpose:** Additional formatting utilities (JS).

**Exports:**
- String formatting functions

---

### src/utils/cssStyles.js
**Location:** `/src/utils/cssStyles.js`

**Purpose:** CSS utility functions.

**Functions:**
```javascript
// Conditionally join classNames
cn(...classes): string

// Get status color
getStatusColor(status: string): string

// Get program color
getProgramColor(program: string): string
```

**Exports:**
- CSS helper functions

---

### src/utils/fetchLocalStorageData.js
**Location:** `/src/utils/fetchLocalStorageData.js`

**Purpose:** LocalStorage operations.

**Functions:**
```javascript
// Get data from localStorage
getLocalStorage(key: string): any

// Set data to localStorage
setLocalStorage(key: string, value: any): void

// Remove from localStorage
removeLocalStorage(key: string): void

// Clear all localStorage
clearLocalStorage(): void
```

**Exports:**
- LocalStorage utilities

---

### src/api/utils/error-handler.ts
**Location:** `/src/api/utils/error-handler.ts`

**Purpose:** API error handling utilities.

**What This File Does:**
- Converts API errors to user-friendly messages
- Handles different error types
- Provides error logging

**Functions:**
```typescript
// Handle API errors
handleApiError(error: any): string

// Check if error is network error
isNetworkError(error: any): boolean

// Check if error is auth error
isAuthError(error: any): boolean

// Log error for debugging
logError(error: any, context?: string): void
```

**Error Messages:**
- 400: "Invalid request"
- 401: "Please log in again"
- 403: "You don't have permission"
- 404: "Resource not found"
- 500: "Server error, please try again"
- Network: "Network error, check connection"

**Exports:**
- Error handling functions

---

### src/api/utils/retry-config.ts
**Location:** `/src/api/utils/retry-config.ts`

**Purpose:** Retry logic configuration.

**What This File Does:**
- Defines retry strategies
- Handles exponential backoff
- Determines if request should retry

**Configuration:**
```typescript
export const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
  shouldRetry: (error) => boolean
}
```

**Exports:**
- Retry configuration

---

### src/api/utils/cache-utils.ts
**Location:** `/src/api/utils/cache-utils.ts`

**Purpose:** React Query cache utilities.

**What This File Does:**
- Provides cache invalidation helpers
- Manages query refetching
- Handles optimistic updates

**Functions:**
```typescript
// Invalidate specific queries
invalidateQueries(queryKeys: string[]): void

// Invalidate all queries
invalidateAllQueries(): void

// Update cached query data
updateQueryData(queryKey: string, updater: (old) => new): void

// Prefetch query
prefetchQuery(queryKey: string, queryFn: () => Promise<any>): Promise<void>
```

**Exports:**
- Cache utilities

---

## 9. Assets & Styles

### src/index.css
**Location:** `/src/index.css`

**Purpose:** Global styles and Tailwind directives.

**What This File Does:**
1. Imports Tailwind base, components, utilities
2. Defines global CSS variables
3. Sets default font family
4. Defines custom utility classes
5. Sets global resets

**Content:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --color-primary: #0066FF;
    --color-secondary: #FF6B6B;
    /* ... more variables */
  }

  body {
    font-family: 'Manrope', sans-serif;
  }
}

@layer components {
  .btn {
    @apply px-4 py-2 rounded-lg font-medium;
  }

  .card {
    @apply bg-white rounded-lg shadow-md p-6;
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
```

**Exports:**
- Global styles

---

### src/App.css
**Location:** `/src/App.css`

**Purpose:** App-specific styles.

**What This File Does:**
- Defines app-level styles
- Contains custom component styles
- Overrides library styles

**Exports:**
- App styles

---

### src/assets/
**Location:** `/src/assets/`

**Purpose:** Static assets directory.

**Contains:**
- `fonts/` - Custom fonts (Kollektif, Manrope)
- `logo.svg` - Application logo
- Images and icons

---

## 10. Additional Documentation

### Application Flow

**New User Registration:**
1. User visits `/register`
2. Fills registration form
3. Creates account
4. Auto-logged in
5. Redirected to `/dashboard`

**Class Enrollment:**
1. Parent browses classes at `/classes`
2. Clicks class to view details
3. Clicks "Enroll" button
4. Redirected to `/checkout/:classId`
5. Selects child
6. Reviews class details
7. Chooses payment plan
8. Enters payment info
9. Confirms and pays
10. Sees confirmation
11. Enrollment created

**Coach Check-In:**
1. Coach logs in
2. Goes to `/coach/check-in`
3. Selects class session
4. Sees roster of students
5. Marks attendance for each student
6. Awards badges if earned
7. Saves attendance

**Admin Reports:**
1. Admin logs in
2. Goes to `/admin/financials`
3. Selects date range
4. Views revenue reports
5. Exports data

---

### Key Integrations

**Stripe Payment Processing:**
1. User enters checkout
2. Frontend creates payment intent via API
3. Stripe Elements collects card info
4. Frontend confirms payment
5. Stripe processes payment
6. Backend creates enrollment
7. Frontend shows confirmation

**Google OAuth:**
1. User clicks "Sign in with Google"
2. Google OAuth popup opens
3. User grants permission
4. Google returns ID token
5. Frontend sends token to backend
6. Backend verifies and creates/logs in user
7. Frontend stores auth token

**File Upload (Photos):**
1. Coach selects photos
2. Frontend creates FormData
3. POST to `/api/photos/upload`
4. Backend stores in cloud storage
5. Backend saves photo metadata
6. Frontend displays uploaded photos

---

## Summary

This documentation covers all major files in the CSF Frontend application:

- **Configuration:** 6 files (package.json, tsconfig, tailwind, etc.)
- **Entry Point:** 2 files (index.js, App.js)
- **API Layer:** 100+ files (services, hooks, types)
- **Context:** 5 files (auth, state, stepper)
- **Components:** 87+ files (organized by feature)
- **Pages:** 36+ files (parent, admin, coach, auth)
- **Hooks:** 7 custom hooks
- **Utilities:** 10+ utility files
- **Styles:** Global and component styles

The application follows modern React best practices with:
- TypeScript for type safety
- React Query for server state
- Context API for global state
- Service-Hook-Component pattern
- Role-based access control
- Comprehensive error handling

All files work together to create a complete youth sports program management system with separate interfaces for parents, coaches, and administrators.
