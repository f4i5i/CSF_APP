# CSF (Carolina Sports Foundation) - Frontend Application

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Documentation](#documentation)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Directory Structure](#directory-structure)
- [Getting Started](#getting-started)
- [User Roles & Features](#user-roles--features)
- [API Integration](#api-integration)
- [State Management](#state-management)
- [Routing](#routing)
- [Component Documentation](#component-documentation)
- [Styling](#styling)
- [Third-Party Integrations](#third-party-integrations)
- [Development Guidelines](#development-guidelines)
- [Environment Configuration](#environment-configuration)
- [Build & Deployment](#build--deployment)

---

## 🎯 Project Overview

CSF Frontend is a comprehensive React-based web application designed for managing youth sports programs. The platform serves three distinct user roles (Parents, Coaches, and Admins) with tailored dashboards and functionality for each.

### Key Capabilities

- **Parent Portal**: Class enrollment, payment management, attendance tracking, photo galleries
- **Coach Dashboard**: Student check-in, attendance tracking, photo uploads
- **Admin Panel**: Class management, financial reports, client management, enrollment oversight

### Project Metrics

- **Total Source Files**: ~276 JavaScript/TypeScript/JSX/TSX files
- **Components**: 87+ React components
- **Pages**: 35+ page-level components
- **API Services**: 32 service modules
- **React Query Hooks**: 60+ custom hooks
- **Type Definitions**: 15+ TypeScript type modules

---

## 📚 Documentation

This project includes comprehensive documentation to help you understand and work with the codebase:

### 📖 Complete Documentation Files

1. **[DOCUMENTATION.md](./DOCUMENTATION.md)** - Complete file-by-file documentation
   - Detailed documentation for every major file in the project
   - Organized by category (Configuration, API, Components, Pages, etc.)
   - Includes code examples, function signatures, and usage patterns
   - **Use this when**: You need detailed information about a specific file

2. **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Quick lookup guide
   - Fast file location finder
   - Organized by feature and task
   - Common tasks and recipes
   - **Use this when**: You need to quickly find where something is

3. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture overview
   - High-level system architecture diagrams
   - Data flow explanations
   - Authentication and authorization flows
   - State management strategy
   - Design patterns used
   - **Use this when**: You need to understand how everything fits together

4. **[README.md](./README.md)** (This file) - Project overview and setup
   - Getting started guide
   - Technology stack overview
   - Feature documentation by role
   - **Use this when**: Setting up the project for the first time

### 🎯 Which Documentation Should I Read?

```
Need to...                              → Read...
────────────────────────────────────────────────────────────────
Set up the project?                     → README.md
Understand the architecture?            → ARCHITECTURE.md
Find a specific file?                   → QUICK_REFERENCE.md
Learn what a file does?                 → DOCUMENTATION.md
Add a new feature?                      → ARCHITECTURE.md + QUICK_REFERENCE.md
Fix a bug?                              → DOCUMENTATION.md + QUICK_REFERENCE.md
Onboard new developer?                  → README.md → ARCHITECTURE.md → DOCUMENTATION.md
```

### 📑 Documentation Structure

```
csf_frontend/
├── README.md              # Project overview & setup guide (you are here)
├── ARCHITECTURE.md        # System architecture & design patterns
├── DOCUMENTATION.md       # Complete file documentation
└── QUICK_REFERENCE.md     # Quick lookup guide
```

---

## 🛠️ Technology Stack

### Core Technologies

- **React** 18.2.0 - UI library
- **TypeScript** 4.9.5 - Type safety (progressive migration)
- **React Router** 6.4.2 - Client-side routing
- **TailwindCSS** 3.x - Utility-first styling

### State Management

- **React Query** (@tanstack/react-query) 5.x - Server state management
- **React Context** - Global application state
- **Custom Hooks** - Encapsulated state logic

### API & Data

- **Axios** 1.6.x - HTTP client
- **React Query** - Caching, synchronization, auto-refetching

### Payment & Authentication

- **Stripe** (@stripe/stripe-js, @stripe/react-stripe-js) - Payment processing
- **Firebase** - Google OAuth integration

### UI Libraries

- **Material-UI** (@mui/material, @mui/icons-material) - Component library
- **Lucide React** - Icon library
- **React Hot Toast** - Toast notifications
- **Formik** - Form management

### Data Visualization

- **Recharts** - Charts for admin dashboard
- **Chart.js** + React ChartJS 2 - Alternative charting

### Calendar & Date

- **React Big Calendar** - Full calendar view
- **React Calendar** - Mini calendar widget
- **React Day Picker** - Date picker
- **date-fns** - Date utilities

### Animation

- **Framer Motion** - Component animations
- **GSAP** - Advanced animations

### Development Tools

- **CRACO** - Customize Create React App configuration
- **ESLint** - Code linting
- **Prettier** - Code formatting

---

## 🏗️ Architecture

### Design Patterns

#### 1. Service-Hook-Component Pattern

```
API Service Layer → React Query Hook → React Component
Example: auth.service.ts → useLogin() → Login.jsx
```

#### 2. Feature-Based Organization

API hooks and services are grouped by business domain (auth, users, classes, enrollments, payments, etc.)

#### 3. Role-Based Access Control (RBAC)

`ProtectedRoute` component enforces role-based access with `requiredRole` prop.

#### 4. Layered Context Providers

```javascript
<ApiProvider>              // React Query
  <AuthProvider>           // Authentication
    <BrowserRouter>        // Routing
      <StateProvider>      // Global state
        <App />
      </StateProvider>
    </BrowserRouter>
  </AuthProvider>
</ApiProvider>
```

#### 5. Centralized Error Handling

```
Axios Interceptors → handleApiError() → User-friendly messages
```

#### 6. Token Refresh Flow

```
401 Response → Queue Requests → Refresh Token → Retry Queued Requests
```

---

## 📁 Directory Structure

```
csf_frontend/
├── public/                          # Static assets
│   ├── images/                      # Public images
│   └── index.html                   # HTML template
│
├── src/
│   ├── api/                         # API layer (services, hooks, types)
│   │   ├── client/                  # HTTP clients
│   │   │   ├── axios-client.ts      # Configured Axios instance with interceptors
│   │   │   └── query-client.ts      # React Query client configuration
│   │   │
│   │   ├── config/                  # API configuration
│   │   │   ├── api.config.ts        # Base URL, timeout settings
│   │   │   ├── endpoints.ts         # API endpoint definitions
│   │   │   └── query.config.ts      # React Query defaults
│   │   │
│   │   ├── constants/               # API constants
│   │   │   ├── endpoints.ts         # Endpoint path constants
│   │   │   └── query-keys.ts        # Query key factories
│   │   │
│   │   ├── hooks/                   # React Query hooks (organized by domain)
│   │   │   ├── admin/               # Admin dashboard hooks
│   │   │   │   ├── useClients.ts
│   │   │   │   ├── useDashboardMetrics.ts
│   │   │   │   ├── useRefunds.ts
│   │   │   │   └── useRevenueReport.ts
│   │   │   ├── announcements/       # Announcement hooks
│   │   │   │   ├── useAnnouncements.ts
│   │   │   │   └── useCreateAnnouncement.ts
│   │   │   ├── attendance/          # Attendance & check-in hooks
│   │   │   │   ├── useAttendance.ts
│   │   │   │   ├── useAttendanceStreak.ts
│   │   │   │   ├── useCheckIn.ts
│   │   │   │   └── useMarkAttendance.ts
│   │   │   ├── auth/                # Authentication hooks
│   │   │   │   ├── useLogin.ts
│   │   │   │   ├── useLogout.ts
│   │   │   │   └── useRegister.ts
│   │   │   ├── badges/              # Badge & achievement hooks
│   │   │   │   ├── useAwardBadge.ts
│   │   │   │   ├── useBadgeProgress.ts
│   │   │   │   └── useBadges.ts
│   │   │   ├── children/            # Child management hooks
│   │   │   │   ├── useChild.ts
│   │   │   │   ├── useChildren.ts
│   │   │   │   ├── useCreateChild.ts
│   │   │   │   ├── useDeleteChild.ts
│   │   │   │   └── useUpdateChild.ts
│   │   │   ├── classes/             # Class & program hooks
│   │   │   │   ├── useAreas.ts
│   │   │   │   └── usePrograms.ts
│   │   │   ├── coach/               # Coach-specific hooks
│   │   │   ├── enrollments/         # Enrollment hooks
│   │   │   │   ├── useCancelEnrollment.ts
│   │   │   │   ├── useCreateEnrollment.ts
│   │   │   │   ├── useEnrollments.ts
│   │   │   │   └── useTransferEnrollment.ts
│   │   │   ├── events/              # Event & RSVP hooks
│   │   │   │   ├── useCreateEvent.ts
│   │   │   │   ├── useEvents.ts
│   │   │   │   └── useRsvp.ts
│   │   │   ├── orders/              # Order & checkout hooks
│   │   │   │   ├── useCheckout.ts
│   │   │   │   ├── useCreateOrder.ts
│   │   │   │   ├── useOrder.ts
│   │   │   │   └── useOrders.ts
│   │   │   ├── payments/            # Payment & invoice hooks
│   │   │   │   ├── useInstallments.ts
│   │   │   │   ├── useInvoice.ts
│   │   │   │   ├── usePaymentMethods.ts
│   │   │   │   └── usePayments.ts
│   │   │   ├── photos/              # Photo gallery hooks
│   │   │   │   ├── useAlbums.ts
│   │   │   │   ├── usePhotos.ts
│   │   │   │   └── useUploadPhoto.ts
│   │   │   └── users/               # User profile hooks
│   │   │       ├── useUpdateUser.ts
│   │   │       └── useUser.ts
│   │   │
│   │   ├── services/                # API service modules
│   │   │   ├── admin.service.ts     # Admin dashboard metrics
│   │   │   ├── announcement.service.ts
│   │   │   ├── attendance.service.ts
│   │   │   ├── auth.service.ts      # Authentication (login, register, logout, refresh)
│   │   │   ├── badge.service.ts
│   │   │   ├── child.service.ts     # Child CRUD operations
│   │   │   ├── class.service.ts     # Class, program, area services
│   │   │   ├── enrollment.service.ts
│   │   │   ├── event.service.ts
│   │   │   ├── order.service.ts     # Order creation & checkout
│   │   │   ├── payment.service.ts   # Payment processing, installments
│   │   │   ├── photo.service.ts
│   │   │   ├── user.service.ts
│   │   │   └── [legacy .js versions]
│   │   │
│   │   ├── types/                   # TypeScript type definitions
│   │   │   ├── admin.types.ts
│   │   │   ├── announcement.types.ts
│   │   │   ├── attendance.types.ts
│   │   │   ├── auth.types.ts        # LoginRequest, RegisterRequest, User, LoginResponse
│   │   │   ├── badge.types.ts
│   │   │   ├── child.types.ts
│   │   │   ├── class.types.ts       # Class, Program, Area types
│   │   │   ├── common.types.ts      # Shared types (pagination, filters)
│   │   │   ├── enrollment.types.ts
│   │   │   ├── event.types.ts
│   │   │   ├── order.types.ts
│   │   │   ├── payment.types.ts     # Payment, Invoice, Installment types
│   │   │   ├── photo.types.ts
│   │   │   └── user.types.ts
│   │   │
│   │   └── utils/                   # API utilities
│   │       ├── cache-utils.ts       # React Query cache management
│   │       ├── error-handler.ts     # Error transformation
│   │       └── retry-config.ts      # Retry logic configuration
│   │
│   ├── components/                  # Reusable React components
│   │   ├── admin/                   # Admin-specific components
│   │   │   ├── ActionMenu.jsx       # Dropdown menu for admin actions
│   │   │   ├── ClassFormModal.jsx   # Create/edit class modal
│   │   │   ├── ConfirmDialog.jsx    # Confirmation dialog
│   │   │   ├── DataTable.jsx        # Generic data table
│   │   │   ├── FilterBar.jsx        # Filtering controls
│   │   │   ├── RefundModal.jsx      # Refund processing modal
│   │   │   ├── StatusBadge.jsx      # Status indicator badge
│   │   │   ├── WaiverFormModal.jsx  # Waiver form editor
│   │   │   └── WaiverVersionModal.jsx
│   │   │
│   │   ├── AdminDashboard/          # Admin dashboard widgets
│   │   │   ├── MembersBarChart.jsx  # Member count visualization
│   │   │   ├── MiddleSummary.jsx    # Summary statistics
│   │   │   ├── StatsCard.jsx        # Metric card component
│   │   │   ├── StatsSidebar.jsx     # Sidebar statistics
│   │   │   └── TodayClasses.jsx     # Today's class schedule
│   │   │
│   │   ├── AdminSidebar/
│   │   │   └── AdminSidebar.jsx     # Admin navigation sidebar
│   │   │
│   │   ├── announcements/           # Announcement components
│   │   │   ├── AnnouncementCard.jsx
│   │   │   ├── AnnouncementItem.jsx
│   │   │   └── Attachment.jsx       # File attachment display
│   │   │
│   │   ├── attendence/              # Attendance components
│   │   │   ├── AttendenceRow.jsx    # Attendance record row
│   │   │   ├── BadgeCard.jsx        # Badge display card
│   │   │   └── BadgeCarousel.jsx    # Badge carousel
│   │   │
│   │   ├── auth/                    # Authentication components
│   │   │   └── GoogleSignInButton.tsx  # Google OAuth button
│   │   │
│   │   ├── Calendar/                # Calendar components
│   │   │   ├── CalenderMini.jsx     # Mini calendar widget
│   │   │   ├── CustomCaption.jsx    # Calendar header
│   │   │   ├── CustomNav.jsx        # Calendar navigation
│   │   │   ├── CustomToolbar.jsx    # Calendar toolbar
│   │   │   └── FullCalender.jsx     # Full calendar view
│   │   │
│   │   ├── checkIn/                 # Coach check-in components
│   │   │   ├── StudentCard.jsx      # Student info card
│   │   │   ├── StudentDetailsModal.jsx  # Student details modal
│   │   │   └── StudentList.jsx      # List of students
│   │   │
│   │   ├── checkout/                # Checkout flow components
│   │   │   ├── CheckoutError.jsx    # Error state display
│   │   │   ├── CheckoutLoading.jsx  # Loading state
│   │   │   ├── ChildSelector.jsx    # Select child for enrollment
│   │   │   ├── ClassDetailsSummary.jsx  # Class info summary
│   │   │   ├── DiscountCodeInput.jsx    # Discount code entry
│   │   │   ├── InstallmentPlanSelector.jsx  # Payment plan selection
│   │   │   ├── OrderConfirmation.jsx        # Order confirmation
│   │   │   ├── OrderSummary.jsx             # Order summary
│   │   │   ├── PaymentMethodSelector.jsx    # Payment method selection
│   │   │   ├── StripePaymentForm.jsx        # Stripe payment form
│   │   │   ├── WaitlistFlow.jsx             # Waitlist enrollment flow
│   │   │   └── WaiverCheckModal.jsx         # Waiver requirement check
│   │   │
│   │   ├── Clients/                 # Client management components
│   │   │   ├── AccountTable.jsx     # Account data table
│   │   │   ├── ClientsHeader.jsx    # Clients page header
│   │   │   ├── ClientsTabs.jsx      # Client view tabs
│   │   │   ├── ExportButton.jsx     # Data export button
│   │   │   ├── MembersTable.jsx     # Members data table
│   │   │   └── Pagination.jsx       # Pagination control
│   │   │
│   │   ├── dashboard/               # Dashboard widgets
│   │   │   ├── ProgramPhotoCard.jsx # Program photo card
│   │   │   └── StatCard.jsx         # Statistic card
│   │   │
│   │   ├── errors/                  # Error handling components
│   │   │   ├── ErrorBoundary.tsx    # React error boundary
│   │   │   └── index.ts
│   │   │
│   │   ├── Financial/               # Financial dashboard components
│   │   │   ├── RevenueAverage.jsx   # Average revenue display
│   │   │   ├── RevenueCards.jsx     # Revenue metric cards
│   │   │   ├── RevenueClassChart.jsx    # Class revenue chart
│   │   │   └── RevenuePrograms.jsx      # Program revenue breakdown
│   │   │
│   │   ├── payment/                 # Payment components
│   │   │   ├── BillingInfo.jsx      # Billing information display
│   │   │   ├── InvoiceTable.jsx     # Invoice data table
│   │   │   └── PaymentCard.jsx      # Payment method card
│   │   │
│   │   ├── providers/               # Context providers
│   │   │   ├── ApiProvider.tsx      # React Query provider
│   │   │   └── index.ts
│   │   │
│   │   └── [individual components]  # 20+ root-level components
│   │       ├── AddStudent.jsx
│   │       ├── BadgeCard.jsx
│   │       ├── ClassCard.jsx
│   │       ├── DottedOverlay.jsx
│   │       ├── EnrollmentCard.jsx
│   │       ├── Footer.jsx
│   │       ├── Header.jsx
│   │       ├── InputField.jsx
│   │       ├── Logo.jsx
│   │       ├── ProtectedRoute.jsx   # Route protection wrapper
│   │       ├── Sidebar.jsx
│   │       └── ...
│   │
│   ├── pages/                       # Page-level components
│   │   ├── AdminDashboard/          # Admin pages
│   │   │   ├── AdminDashboard.jsx   # Admin dashboard home
│   │   │   ├── ClassDetail.jsx      # Class detail management
│   │   │   ├── Classes.jsx          # Class management
│   │   │   ├── ClassList.jsx        # Class listing for enrollment
│   │   │   ├── Clients.jsx          # Client management
│   │   │   ├── Enrollments.jsx      # Enrollment management
│   │   │   ├── Financials.jsx       # Financial reports
│   │   │   ├── Installments.jsx     # Payment plan management
│   │   │   ├── Invoices.jsx         # Invoice management
│   │   │   ├── RegisterChild.jsx    # Register new child
│   │   │   ├── Resgister.jsx        # Registration page
│   │   │   └── Waitlist.jsx         # Waitlist management
│   │   │
│   │   ├── admin/                   # Additional admin pages
│   │   │   ├── WaiverReports.jsx    # Waiver completion reports
│   │   │   └── WaiversManagement.jsx    # Waiver form management
│   │   │
│   │   ├── CoachDashboard/          # Coach pages
│   │   │   ├── CheckIn.jsx          # Student check-in interface
│   │   │   ├── CoachGallery.jsx     # Photo upload/management
│   │   │   └── DashboardCoach.jsx   # Coach dashboard home
│   │   │
│   │   └── [individual pages]       # 20+ root-level pages
│   │       ├── Attendence.jsx       # Attendance tracking
│   │       ├── Authlayout.jsx       # Auth page layout
│   │       ├── Badges.jsx           # Badge showcase
│   │       ├── Calender.jsx         # Calendar view
│   │       ├── CheckOut.jsx         # Checkout page
│   │       ├── ClassDetails.jsx     # Class details view
│   │       ├── Classes.jsx          # Class browsing
│   │       ├── ContactForm.jsx      # Contact support
│   │       ├── Dashboard.jsx        # Parent dashboard
│   │       ├── ForgotPassword.jsx   # Password reset
│   │       ├── Gallery.jsx          # Photo gallery
│   │       ├── Login.jsx            # Login page
│   │       ├── PaymentBilling.jsx   # Payment & billing
│   │       ├── PaymentCancel.jsx    # Payment cancelled
│   │       ├── PaymentSuccess.jsx   # Payment success
│   │       ├── ProgramOverview.jsx  # Program overview
│   │       ├── Register.jsx         # User registration
│   │       ├── Settings.jsx         # User settings
│   │       └── Waivers.jsx          # Waiver management
│   │
│   ├── context/                     # State management contexts
│   │   ├── AuthContext.tsx          # Auth context (TypeScript - modern)
│   │   ├── auth.js                  # Auth context (JavaScript - legacy)
│   │   ├── StateProvider.js         # Global state provider (reducer pattern)
│   │   ├── reducer.js               # State reducer functions
│   │   ├── initialState.js          # Initial state shape
│   │   ├── StepperContext.js        # Multi-step form context
│   │   ├── serviceauth.js           # Auth service utilities
│   │   └── index.ts                 # Context exports
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── useApi.js                # Generic API calling hook
│   │   ├── useCheckoutFlow.js       # Checkout flow state management
│   │   ├── useChildren.js           # Children data hook
│   │   ├── useClassForm.js          # Class form state
│   │   ├── useEnrollments.js        # Enrollment management hook
│   │   ├── useMutation.js           # Generic mutation hook
│   │   ├── useToast.js              # Toast notification hook
│   │   └── index.js
│   │
│   ├── layouts/                     # Layout components
│   │   └── AdminLayout.jsx          # Admin page layout wrapper
│   │
│   ├── lib/                         # Libraries/utilities
│   │   ├── errorHandler.js          # Centralized error handling
│   │   └── errors/
│   │       ├── ApiError.ts          # API error class
│   │       └── index.ts
│   │
│   ├── utils/                       # Utility functions
│   │   ├── classHelpers.ts          # Class-related helper functions
│   │   ├── cssStyles.js             # CSS utility functions
│   │   ├── fetchLocalStorageData.js # LocalStorage helpers
│   │   ├── format.js                # Formatting utilities (dates, currency)
│   │   └── formatters.ts            # TypeScript formatters
│   │
│   ├── config/                      # Application configuration
│   │   └── stripe.config.js         # Stripe configuration
│   │
│   ├── constants/                   # Application constants
│   │   └── api.constants.js         # API-related constants
│   │
│   ├── styles/                      # Global styles
│   │   ├── calendar-styles.css      # Calendar-specific styles
│   │   └── fonts.css                # Font face definitions
│   │
│   ├── assets/                      # Static assets
│   │   ├── fonts/
│   │   │   ├── Kollektif/           # Kollektif font family
│   │   │   └── Manrope/             # Manrope font family
│   │   └── [images and icons]
│   │
│   ├── App.js                       # Main app component with routing
│   ├── App.css                      # App-specific styles
│   ├── index.js                     # Application entry point
│   ├── index.css                    # Global CSS with Tailwind imports
│   ├── reportWebVitals.js           # Performance monitoring
│   └── setupTests.js                # Test configuration
│
├── .env                             # Environment variables
├── .env.example                     # Environment variables template
├── .gitignore                       # Git ignore rules
├── package.json                     # Dependencies and scripts
├── package-lock.json                # Dependency lock file
├── tsconfig.json                    # TypeScript configuration
├── tailwind.config.js               # TailwindCSS theme configuration
├── postcss.config.js                # PostCSS configuration
├── craco.config.js                  # CRACO (Webpack) configuration
└── README.md                        # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 16.x or higher
- **npm** 8.x or higher
- **Backend API** running (default: `http://localhost:8000`)

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd csf_frontend
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

Copy `.env.example` to `.env` and configure:

```env
REACT_APP_API_BASE_URL=http://localhost:8000
REACT_APP_ENV=development
REACT_APP_ENABLE_MOCK_DATA=false
REACT_APP_GOOGLE_CLIENT_ID=<your-google-client-id>
REACT_APP_STRIPE_PUBLISHABLE_KEY=<your-stripe-publishable-key>
```

4. **Start development server**

```bash
npm start
```

Application will open at `http://localhost:3000`

### Available Scripts

#### `npm start`

Runs the app in development mode. Hot-reloading enabled.

#### `npm test`

Launches the test runner in interactive watch mode.

#### `npm run build`

Builds the app for production to the `build` folder. Optimized and minified.

#### `npm run eject`

**Note: One-way operation!** Ejects from Create React App to expose all configuration.

---

## 👥 User Roles & Features

### Parent Role

**Dashboard** (`/dashboard`)
- Overview of enrolled classes
- Upcoming events
- Attendance summary
- Badge achievements

**Class Management**
- Browse available classes (`/class`)
- View class details (`/class/:id`)
- Enroll children with Stripe checkout (`/checkout`)
- View enrollment history

**Calendar & Events** (`/calendar`)
- View class schedules
- See upcoming events
- RSVP to events

**Attendance Tracking** (`/attendance`)
- View child attendance history
- See attendance streaks
- View missed classes

**Badges & Achievements** (`/badges`)
- View earned badges
- Track badge progress
- View achievement history

**Payment & Billing** (`/paymentbilling`)
- View invoices
- Manage payment methods
- View payment history
- Track installment plans

**Photo Gallery** (`/photos`)
- Browse class photos
- View albums by class

**Waivers** (`/waivers`)
- Sign required waivers
- View waiver history

**Profile Management** (`/settings`)
- Update account information
- Manage children profiles
- Update contact information

### Coach Role

**Dashboard** (`/coachdashboard`)
- View assigned classes
- Today's schedule
- Quick stats

**Student Check-In** (`/checkIn`)
- Quick student attendance check-in
- View student details
- Mark attendance for classes

**Photo Management** (`/Gallery`)
- Upload class photos
- Organize photos by class
- Create photo albums

### Admin Role

**Dashboard** (`/admin`)
- Comprehensive metrics (revenue, enrollments, attendance)
- Revenue charts by class and program
- Today's class schedule
- Recent enrollments

**Class Management** (`/admin/classes`)
- Create, edit, delete classes
- Manage programs and areas
- Set pricing and payment plans
- Configure class schedules

**Client Management** (`/clients`)
- View and manage parent accounts
- View and manage child profiles
- Export client data
- Filter and search clients

**Enrollment Management** (`/admin/enrollments`)
- View all enrollments
- Transfer enrollments
- Cancel enrollments
- Filter by class, status, date

**Financial Reports** (`/financials`)
- Revenue reports by class, program, date range
- Average revenue metrics
- Revenue by program breakdown
- Export financial data

**Invoice Management** (`/admin/invoices`)
- View all invoices
- Filter invoices by status, date
- Mark invoices as paid
- Export invoice data

**Payment Plan Management** (`/admin/installments`)
- View installment plans
- Track payment schedules
- Mark payments as received
- Handle failed payments

**Waitlist Management** (`/admin/waitlist`)
- View waitlisted students
- Approve waitlist enrollments
- Manage waitlist priority

**Waiver Management** (`/admin/waivers`)
- Create waiver forms
- Edit waiver versions
- View waiver completion reports
- Export waiver data

**Refund Processing**
- Process refunds for enrollments
- Track refund history

---

## 🔌 API Integration

### API Architecture

#### Base Configuration

**File**: `src/api/config/api.config.ts`

```typescript
{
  baseURL: 'http://localhost:8000',
  apiPrefix: '/api/v1',
  timeout: 30000
}
```

#### Axios Client

**File**: `src/api/client/axios-client.ts`

Features:
- Automatic JWT token attachment
- Token refresh on 401 errors
- Request queuing during token refresh
- Error transformation to standard format
- `withCredentials: true` for httpOnly cookies

```typescript
// Request interceptor
config.headers.Authorization = `Bearer ${token}`;

// Response interceptor
if (error.response?.status === 401) {
  // Trigger token refresh and retry
}
```

#### Service Layer

Services provide raw API methods:

```typescript
// Example: auth.service.ts
export const authService = {
  login: (credentials) => axios.post('/auth/login', credentials),
  register: (data) => axios.post('/auth/register', data),
  logout: () => axios.post('/auth/logout'),
  refreshToken: () => axios.post('/auth/refresh')
};
```

#### React Query Hook Layer

Hooks provide React integration with caching and state:

```typescript
// Example: useLogin.ts
export const useLogin = () => {
  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      // Cache user data
      queryClient.setQueryData(['user'], data.user);
    }
  });
};
```

#### Usage in Components

```jsx
import { useLogin } from '@/api/hooks/auth/useLogin';

function Login() {
  const { mutate: login, isLoading, error } = useLogin();

  const handleSubmit = (credentials) => {
    login(credentials, {
      onSuccess: (data) => {
        // Handle success
        navigate('/dashboard');
      }
    });
  };
}
```

### API Domains

1. **Authentication** - Login, register, logout, token refresh
2. **Users** - Profile management, user CRUD
3. **Children** - Child profiles, add/edit/delete children
4. **Classes** - Browse classes, programs, areas
5. **Enrollments** - Create, cancel, transfer enrollments
6. **Orders** - Checkout, order creation
7. **Payments** - Payment processing, installments, invoices
8. **Attendance** - Attendance tracking, check-in
9. **Badges** - Badge awards, progress tracking
10. **Announcements** - Create, view announcements
11. **Events** - Event management, RSVPs
12. **Photos** - Photo uploads, albums
13. **Admin** - Dashboard metrics, revenue reports, refunds

---

## 🗄️ State Management

### Context Providers (Layered Architecture)

```jsx
<ApiProvider>                    // React Query (server state)
  <AuthProvider>                 // Authentication
    <BrowserRouter>              // Routing
      <StateProvider>            // Global state (reducer pattern)
        <App />
      </StateProvider>
    </BrowserRouter>
  </AuthProvider>
</ApiProvider>
```

### 1. ApiProvider (React Query)

**File**: `src/components/providers/ApiProvider.tsx`

- **Purpose**: Server state management, caching, automatic refetching
- **Library**: `@tanstack/react-query` v5
- **Features**:
  - QueryClient with custom configuration
  - DevTools in development mode
  - Automatic cache invalidation
  - Background refetching

### 2. AuthProvider

**Files**: `src/context/auth.js` (legacy), `src/context/AuthContext.tsx` (modern)

- **Purpose**: User authentication state
- **State**: `{ user, token, isAuthenticated, loading }`
- **Methods**: `login()`, `logout()`, `register()`, `refreshToken()`
- **Features**:
  - Auto-restore session from localStorage
  - Token expiry handling
  - Auto-redirect on auth failure

### 3. StateProvider (Global State)

**Files**: `src/context/StateProvider.js`, `src/context/reducer.js`

- **Pattern**: Reducer-based (Redux-like)
- **State**: User profile data, app settings
- **Actions**: `SET_USER`, `CLEAR_USER`
- **Usage**: Less common, mostly for legacy code

### 4. StepperContext

**File**: `src/context/StepperContext.js`

- **Purpose**: Multi-step form state management
- **Usage**: Registration flows, multi-step checkouts

### State Management Best Practices

- **Server State**: Use React Query hooks (`useQuery`, `useMutation`)
- **Auth State**: Use `useAuth()` hook from AuthProvider
- **Local State**: Use `useState` within components
- **Global State**: Avoid unless necessary; prefer context or React Query

---

## 🛣️ Routing

### Router: React Router v6

### Route Protection

**Component**: `src/components/ProtectedRoute.jsx`

```jsx
<ProtectedRoute requiredRole="parent">
  <Dashboard />
</ProtectedRoute>
```

Roles: `parent`, `coach`, `admin`

### Route Structure

#### Public Routes

```
/login               - User login
/register            - User registration
/forgot-password     - Password recovery
```

#### Parent Routes (Protected)

```
/dashboard           - Parent dashboard
/overview            - Program overview
/class               - Browse classes
/class/:id           - Class details
/calendar            - Event calendar
/photos              - Photo gallery
/attendance          - Attendance history
/badges              - Badge achievements
/settings            - Account settings
/account             - Account management
/paymentbilling      - Payment & billing
/checkout            - Enrollment checkout
/waivers             - Waiver management
/contactus           - Contact form
```

#### Coach Routes (Protected, role: coach)

```
/coachdashboard      - Coach dashboard
/checkIn             - Student check-in
/Gallery             - Upload photos
```

#### Admin Routes (Protected, role: admin)

```
/admin               - Admin dashboard
/admin/classes       - Class management
/admin/waivers       - Waiver management
/admin/waiver-reports - Waiver reports
/admin/enrollments   - Enrollment management
/admin/installments  - Payment plans
/admin/invoices      - Invoice management
/admin/waitlist      - Waitlist management
/clients             - Client management
/financials          - Financial reports
```

#### Payment Result Routes

```
/payment/success     - Payment success
/payment/cancel      - Payment cancelled
```

---

## 📦 Component Documentation

### Component Categories

#### 1. Layout Components

- **Header** - Global navigation header
- **Footer** - Global footer
- **Sidebar** - User role-based sidebar
- **AdminSidebar** - Admin navigation sidebar
- **AdminLayout** - Admin page wrapper layout

#### 2. Form Components

- **InputField** - Styled input field
- **GenericButton** - Reusable button component
- **ChildSelector** (checkout) - Select child for enrollment
- **PaymentMethodSelector** (checkout) - Select payment method
- **DiscountCodeInput** (checkout) - Apply discount codes

#### 3. Data Display Components

- **DataTable** (admin) - Generic data table with sorting, filtering
- **AccountTable** (clients) - Account data table
- **MembersTable** (clients) - Member data table
- **InvoiceTable** (payment) - Invoice display table
- **ClassCard** - Class information card
- **EnrollmentCard** - Enrollment summary card
- **StatCard** (dashboard) - Metric display card
- **StatsCard** (AdminDashboard) - Admin stat card

#### 4. Modal Components

- **ClassFormModal** (admin) - Create/edit class modal
- **WaiverFormModal** (admin) - Waiver editor modal
- **ConfirmDialog** (admin) - Confirmation dialog
- **RefundModal** (admin) - Refund processing modal
- **StudentDetailsModal** (checkIn) - Student details modal
- **WaiverCheckModal** (checkout) - Waiver requirement check
- **CreatePostModal** - Create announcement post

#### 5. Chart Components

- **MembersBarChart** (AdminDashboard) - Member count chart
- **RevenueClassChart** (Financial) - Class revenue chart
- **RevenueAverage** (Financial) - Average revenue display
- **RevenuePrograms** (Financial) - Program revenue breakdown

#### 6. Calendar Components

- **FullCalender** - Full calendar view (React Big Calendar)
- **CalenderMini** - Mini calendar widget
- **CustomToolbar** - Calendar toolbar
- **CustomNav** - Calendar navigation
- **CustomCaption** - Calendar header

#### 7. Media Components

- **PhotoCard** - Photo display card
- **Gallery** - Photo gallery grid
- **UploadPhotosModal** - Photo upload modal
- **BadgeCard** - Badge display card
- **BadgeCarousel** - Badge carousel

#### 8. Utility Components

- **ProtectedRoute** - Route guard with role checking
- **ErrorBoundary** - React error boundary
- **DottedOverlay** - Decorative background overlay
- **Logo** / **LogoLogin** - Logo components
- **Pagination** - Pagination control

---

## 🎨 Styling

### TailwindCSS Configuration

**File**: `tailwind.config.js`

#### Custom Theme

##### Fonts

```javascript
fontFamily: {
  kollektif: ['Kollektif', 'sans-serif'],
  manrope: ['Manrope', 'sans-serif']
}
```

##### Colors

```javascript
colors: {
  primary: '#F3BC48',           // Gold
  'heading-dark': '#1A202C',
  'text-body': '#4A5568',
  'text-muted': '#718096',
  success: { 50: '#F0FFF4', ... },
  error: { 50: '#FFF5F5', ... },
  warning: { 50: '#FFFBEB', ... },
  neutral: { 0: '#FFFFFF', ... 100: '#000000' }
}
```

##### Typography

Fluid typography with `clamp()`:

```javascript
fontSize: {
  'heading-1': ['clamp(2rem, 3vw, 3rem)', { lineHeight: '1.2' }],
  'heading-2': ['clamp(1.75rem, 2.5vw, 2.5rem)', { lineHeight: '1.3' }],
  // ...
}
```

##### Breakpoints

```javascript
screens: {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  xxl: '1536px',
  // Max-width breakpoints
  'max-sm': { max: '639px' },
  'max-md': { max: '767px' },
  'max-lg': { max: '1023px' }
}
```

##### Custom Utilities

- **Avatar Sizes**: `avatar-sm`, `avatar-md`, `avatar-lg`, `avatar-xl`
- **Icon Sizes**: `icon-xs`, `icon-sm`, `icon-md`, `icon-lg`, `icon-xl`
- **Card Heights**: `card-sm`, `card-md`, `card-lg`
- **Fluid Spacing**: Responsive padding/margin with `clamp()`

### Global Styles

**File**: `src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Global zoom reduction */
#root {
  zoom: 0.85;
}

/* Custom scrollbar */
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-thumb { background: #cbd5e0; }
```

### Font Files

- **Kollektif**: `src/assets/fonts/Kollektif/`
- **Manrope**: `src/assets/fonts/Manrope/`

Loaded via `src/styles/fonts.css`

---

## 🔗 Third-Party Integrations

### Payment Processing (Stripe)

**Libraries**:
- `@stripe/stripe-js`
- `@stripe/react-stripe-js`

**Configuration**: `src/config/stripe.config.js`

**Components**:
- `StripePaymentForm` (checkout) - Payment form with card element
- `InstallmentPlanSelector` (checkout) - Select installment plan

**Features**:
- Payment intents
- Installment plans
- Payment method management

### Authentication (Firebase)

**Library**: `firebase`

**Component**: `GoogleSignInButton` (auth)

**Features**:
- Google OAuth integration
- One-click social login

### UI & Icons

**Material-UI**:
- `@mui/material` - Component library
- `@mui/icons-material` - Icon library

**Lucide React**:
- Modern icon library
- Lightweight, customizable icons

### Data Visualization

**Recharts**:
- Bar charts, line charts, pie charts
- Used in admin dashboard and financial reports

**Chart.js + React ChartJS 2**:
- Alternative charting library
- Used for specific chart types

### Calendar & Date

**React Big Calendar**:
- Full calendar view
- Event scheduling

**React Calendar**:
- Mini calendar widget
- Date picker

**date-fns**:
- Date formatting
- Date manipulation utilities

### Animation

**Framer Motion**:
- Component animations
- Page transitions

**GSAP**:
- Advanced animations
- Timeline-based animations

### Form Management

**Formik**:
- Form state management
- Validation

### Notifications

**React Hot Toast**:
- Toast notifications
- Success, error, info toasts

---

## 📝 Development Guidelines

### Code Organization

1. **One component per file**
2. **Colocate related files** (component + styles + tests)
3. **Use index files** for cleaner imports
4. **Feature-based folders** for complex features

### Naming Conventions

- **Components**: PascalCase (`UserProfile.jsx`)
- **Hooks**: camelCase with `use` prefix (`useAuth.js`)
- **Services**: camelCase with `.service` suffix (`auth.service.ts`)
- **Types**: PascalCase (`UserType`, `LoginRequest`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)

### Component Structure

```jsx
// Imports
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth';

// Component
export default function ComponentName() {
  // 1. Hooks
  const navigate = useNavigate();
  const { user } = useAuth();
  const [state, setState] = useState();

  // 2. Effects
  useEffect(() => {
    // Side effects
  }, []);

  // 3. Event handlers
  const handleClick = () => {
    // Handler logic
  };

  // 4. Render helpers
  const renderItem = (item) => {
    // Render logic
  };

  // 5. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### TypeScript Migration

- **Prefer TypeScript** for new files
- **Migrate gradually** - both `.js` and `.ts` versions exist
- **Type everything** - avoid `any`
- **Use interfaces** for object shapes
- **Document types** with TSDoc

### Error Handling

```javascript
try {
  await apiCall();
} catch (error) {
  const userMessage = handleApiError(error);
  toast.error(userMessage);
}
```

### API Calls

**Always use React Query hooks**:

```jsx
// ❌ Don't do this
useEffect(() => {
  axios.get('/api/users').then(setUsers);
}, []);

// ✅ Do this
const { data: users, isLoading } = useUsers();
```

### State Management

**Decision tree**:

1. **Server state?** → Use React Query
2. **Auth state?** → Use AuthProvider
3. **Form state?** → Use local state (`useState`) or Formik
4. **Shared UI state?** → Use context or prop drilling
5. **Global app state?** → Avoid if possible; use context if necessary

---

## ⚙️ Environment Configuration

### Environment Variables

**File**: `.env`

```env
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:8000
REACT_APP_ENV=development
REACT_APP_ENABLE_MOCK_DATA=false

# Authentication
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id

# Payment
REACT_APP_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

### Configuration Files

#### TypeScript (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "jsx": "react-jsx",
    "strict": true,
    "baseUrl": "src",
    "paths": {
      "@/*": ["*"]
    }
  }
}
```

#### CRACO (`craco.config.js`)

```javascript
module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
};
```

**Usage**: Import with `@/` prefix

```javascript
import { useAuth } from '@/context/auth';
import Button from '@/components/GenericButton';
```

---

## 🚢 Build & Deployment

### Production Build

```bash
npm run build
```

Output: `build/` directory

### Build Optimization

- Code splitting (automatic)
- Tree shaking (automatic)
- Minification (automatic)
- Asset optimization (automatic)

### Deployment Checklist

1. **Environment variables** configured for production
2. **API base URL** pointing to production backend
3. **Stripe keys** using production keys
4. **Firebase config** using production project
5. **Build output** tested locally: `npx serve -s build`
6. **Error tracking** configured (e.g., Sentry)
7. **Analytics** configured (e.g., Google Analytics)

### Deployment Platforms

Compatible with:
- **Vercel** (recommended for Next.js-like features)
- **Netlify** (easy deployment, continuous deployment)
- **AWS S3 + CloudFront** (scalable, CDN)
- **GitHub Pages** (free, simple)
- **Docker** (containerized deployment)

---

## 🐛 Troubleshooting

### Common Issues

#### Build Fails

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### API Connection Issues

- Check `REACT_APP_API_BASE_URL` in `.env`
- Ensure backend is running
- Check CORS configuration in backend
- Verify network connectivity

#### Authentication Issues

- Clear browser localStorage
- Check token expiry
- Verify Google Client ID
- Check backend authentication endpoints

#### Stripe Integration Issues

- Verify Stripe publishable key
- Check Stripe webhook configuration
- Ensure Stripe products/prices are created
- Check browser console for Stripe errors

---

## 📚 Additional Resources

- **React Documentation**: https://react.dev
- **React Router**: https://reactrouter.com
- **React Query**: https://tanstack.com/query
- **TailwindCSS**: https://tailwindcss.com
- **TypeScript**: https://www.typescriptlang.org
- **Stripe Docs**: https://stripe.com/docs
- **Material-UI**: https://mui.com

---

## 📄 License

[Specify your license here]

---

## 👨‍💻 Development Team

[Add team information here]

---

**Last Updated**: 2025-12-18

**Frontend Version**: 1.0.0

**Backend API Version**: 1.0.0
