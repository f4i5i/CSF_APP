/**
 * @file App.js
 * @description Main application component that defines the routing structure and global providers
 * for the CSF (Carolina Sports Foundation) frontend application.
 *
 * This file serves as the central routing hub for the entire application, organizing routes
 * into three main categories:
 * 1. Public routes (login, register, forgot password)
 * 2. Protected parent/coach routes (dashboard, classes, calendar, etc.)
 * 3. Admin-only routes (admin dashboard, class management, financial reports, etc.)
 *
 * Key Features:
 * - Role-based route protection using ProtectedRoute component
 * - Stripe Elements provider wrapping checkout flow
 * - Toast notification configuration
 * - Nested routing for admin section with AdminLayout
 * - Auth routes using shared AuthLayout shell
 *
 * @requires react
 * @requires react-router-dom
 * @requires react-hot-toast
 * @requires @stripe/react-stripe-js
 */

// ========================================
// IMPORTS - Core Libraries
// ========================================
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Elements } from '@stripe/react-stripe-js'

// ========================================
// IMPORTS - Configuration
// ========================================
import stripePromise from './config/stripe.config'

// ========================================
// IMPORTS - Layouts
// ========================================
import AuthLayout from './pages/Authlayout'
import AdminLayout from './layouts/AdminLayout'

// ========================================
// IMPORTS - Authentication Pages
// ========================================
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'

// ========================================
// IMPORTS - Parent Pages
// ========================================
import Dashboard from './pages/Dashboard'
import Calender from './pages/Calender'
import Gallery from './pages/Gallery'
import Attendence from './pages/Attendence'
import Settings from './pages/Settings'
import ContactForm from './pages/ContactForm'
import PaymentBilling from './pages/PaymentBilling'
import Badges from './pages/Badges'
import Classes from './pages/Classes'
import ClassDetail from './pages/AdminDashboard/ClassDetail'
import Waivers from './pages/Waivers'
import ProgramOverview from './pages/ProgramOverview'
import Checkout from './pages/CheckOut'
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentCancel from './pages/PaymentCancel'
import ClassList from './pages/AdminDashboard/ClassList'
import Resgister from './pages/AdminDashboard/Resgister'

// ========================================
// IMPORTS - Coach Pages
// ========================================
import DashboardCoach from './pages/CoachDashboard/DashboardCoach'
import CheckIn from './pages/CoachDashboard/CheckIn'
import CoachGallery from './pages/CoachDashboard/CoachGallery'

// ========================================
// IMPORTS - Admin Pages
// ========================================
import AdminDashboard from './pages/AdminDashboard/AdminDashboard'
import Financials from './pages/AdminDashboard/Financials'
import Clients from './pages/AdminDashboard/Clients'
import RegisterChild from './pages/AdminDashboard/RegisterChild'
import AdminClasses from './pages/AdminDashboard/Classes'
import AdminUsers from './pages/AdminDashboard/Users'
import AdminPrograms from './pages/AdminDashboard/Programs'
import AdminAreas from './pages/AdminDashboard/Areas'
import AdminSchools from './pages/AdminDashboard/Schools'
import Installments from './pages/AdminDashboard/Installments'
import Enrollments from './pages/AdminDashboard/Enrollments'
import Waitlist from './pages/AdminDashboard/Waitlist'
import Invoices from './pages/AdminDashboard/Invoices'
import RefundsManagement from './pages/AdminDashboard/RefundsManagement'
import CancellationRequests from './pages/AdminDashboard/CancellationRequests'
import EventsManagement from './pages/AdminDashboard/EventsManagement'
import BadgesManagement from './pages/AdminDashboard/BadgesManagement'
import PhotosManagement from './pages/AdminDashboard/PhotosManagement'
import WaiversManagement from './pages/admin/WaiversManagement'
import WaiverReports from './pages/admin/WaiverReports'

// ========================================
// IMPORTS - Shared Components
// ========================================
import ProtectedRoute from './components/ProtectedRoute'
import AddStudent from './components/AddStudent'

/**
 * App Component
 *
 * Main application component that defines the complete routing structure for the CSF application.
 * Handles three user roles (parent, coach, admin) with appropriate route protection and layouts.
 *
 * @component
 * @returns {JSX.Element} The root application component with all routes configured
 *
 * @example
 * // Used in index.js wrapped with providers
 * <BrowserRouter>
 *   <AuthProvider>
 *     <ApiProvider>
 *       <App />
 *     </ApiProvider>
 *   </AuthProvider>
 * </BrowserRouter>
 */
export default function App(){
return (
<>
{/* ========================================
    TOAST NOTIFICATIONS CONFIGURATION
    ========================================
    React Hot Toast provider for app-wide notifications
    - Position: top-right corner
    - Auto-dismiss after 3-4 seconds
    - Custom styling matching brand colors
    - Different icons for success/error states
*/}
<Toaster
  position="top-center"
  toastOptions={{
    duration: 4000,
    style: {
      background: '#363636',
      color: '#fff',
    },
    success: {
      duration: 3000,
      iconTheme: {
        primary: '#F3BC48', // Brand gold color
        secondary: '#fff',
      },
    },
    error: {
      duration: 4000,
      iconTheme: {
        primary: '#ef4444', // Red for errors
        secondary: '#fff',
      },
    },
  }}
/>

{/* ========================================
    ROUTING CONFIGURATION
    ========================================
    Complete routing structure organized by access level:
    1. Public routes (auth)
    2. Protected routes (parent/coach)
    3. Admin-only routes
*/}
<Routes>
{/* ========================================
    PUBLIC ROUTES
    ======================================== */}

{/* Public marketing/overview page - Currently disabled, uses / for registration */}
{/* <Route path="/" element={<ProgramOverview />} /> */}

{/*
  Auth routes share the AuthLayout shell
  AuthLayout provides consistent branding and layout for login/register/forgot-password pages
*/}
<Route element={<AuthLayout />}>
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route path="/forgot-password" element={<ForgotPassword />} />
</Route>

{/* ========================================
    PUBLIC CLASS BROWSING
    ========================================
    These routes allow public access to view classes before login
*/}
<Route path="/" element={<Resgister />} />
<Route path="/class-list" element={<ClassList />} />
<Route path="/class-detail" element={<ClassDetail />} />

{/* ========================================
    PROTECTED PARENT/COACH ROUTES
    ========================================
    Routes accessible to authenticated parents and coaches
    ProtectedRoute checks for valid JWT token and redirects to /login if not authenticated
*/}

{/* Program Overview - Landing page after login */}
<Route path="/overview" element={
  <ProtectedRoute>
    <ProgramOverview />
   </ProtectedRoute>
} />

{/* Parent Dashboard - Main dashboard showing enrollments, events, attendance */}
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
   </ProtectedRoute>
} />

{/* Coach Dashboard - Shows assigned classes and check-in functionality */}
<Route path="/coachdashboard" element={
  <ProtectedRoute>
    <DashboardCoach />
   </ProtectedRoute>
} />

{/* Calendar - View class schedules and events, RSVP to events */}
<Route path="/calendar" element={
  <ProtectedRoute>
    <Calender />
  </ProtectedRoute>
} />

{/* Photo Gallery - View class photos uploaded by coaches */}
<Route path="/photos" element={
  <ProtectedRoute>
    <Gallery />
  </ProtectedRoute>
} />

{/* Coach Photo Upload - Coaches can upload photos to class galleries */}
<Route path="/Gallery" element={
  <ProtectedRoute>
    <CoachGallery />
  </ProtectedRoute>
} />

{/* Attendance - View child attendance history and streaks */}
<Route path="/attendance" element={
  <ProtectedRoute>
    <Attendence />
  </ProtectedRoute>
} />

{/* Settings - Account settings, profile management */}
<Route path="/settings" element={
  <ProtectedRoute>
    <Settings />
  </ProtectedRoute>
} />

{/* Account Settings - Alias for settings */}
<Route path="/account" element={
  <ProtectedRoute>
    <Settings />
  </ProtectedRoute>
} />

{/* Password Settings - Settings page with password section pre-selected */}
<Route path="/settings/password" element={
  <ProtectedRoute>
    <Settings initialSection="password" />
  </ProtectedRoute>
} />

{/* Contact Form - Contact support */}
<Route path="/contactus" element={
  <ProtectedRoute>
    <ContactForm />
  </ProtectedRoute>
} />

{/* Payment & Billing - View invoices, payment methods, payment history */}
<Route path="/paymentbilling" element={
  <ProtectedRoute>
    <PaymentBilling initialSection="payment" />
  </ProtectedRoute>
} />

{/* Badges - View earned badges and achievement progress */}
<Route path="/badges" element={
  <ProtectedRoute>
    <Badges />
  </ProtectedRoute>
} />

{/* Coach Check-In - Quick student attendance check-in for coaches */}
<Route path="/checkin" element={
  <ProtectedRoute>
    <CheckIn />
  </ProtectedRoute>
} />

{/* Class Browsing - Browse and filter available classes */}
<Route path="/class" element={
  <ProtectedRoute>
    <Classes />
  </ProtectedRoute>
} />

{/* Class Detail - View detailed class information */}
<Route path="/class/:id" element={<ClassDetail />} />

{/* Add Child - Add new child profile */}
<Route path="/addchild" element={
  <ProtectedRoute>
    <AddStudent />
  </ProtectedRoute>
} />

{/* Waivers - Sign required waivers, view waiver history */}
<Route path="/waivers" element={
  <ProtectedRoute>
    <Waivers />
 </ProtectedRoute>
}
/>

{/*
  Checkout - Enrollment checkout with Stripe payment
  Wrapped in Stripe Elements provider for payment form integration
*/}
<Route path="/checkout" element={
  <ProtectedRoute>
    <Elements stripe={stripePromise}>
      <Checkout />
    </Elements>
  </ProtectedRoute>
} />

{/* Payment Result Pages - Show success/cancel messages after Stripe checkout */}
<Route path="/payment/success" element={<PaymentSuccess />} />
<Route path="/payment/cancel" element={<PaymentCancel />} />

{/* Register Child - Register new child (likely admin or parent) */}
<Route path="/registerchild" element={
  <ProtectedRoute>
    <RegisterChild />
 </ProtectedRoute>
}
/>

{/* ========================================
    ADMIN-ONLY ROUTES
    ========================================
    Routes accessible only to users with admin role
    Uses AdminLayout wrapper for consistent admin navigation and layout
    ProtectedRoute with requiredRole="admin" enforces role-based access control
*/}

{/*
  Admin Layout Wrapper - Nested routes share AdminLayout
  AdminLayout provides admin sidebar navigation and header
*/}
<Route element={
  <ProtectedRoute requiredRole="admin">
    <AdminLayout />
  </ProtectedRoute>
}>
  {/* Admin Dashboard - Overview of metrics, revenue, enrollments */}
  <Route path="/admin" element={<AdminDashboard />} />

  {/* Class Management - Create, edit, delete classes and programs */}
  <Route path="/admin/classes" element={<AdminClasses />} />

  {/* User Management - Create, edit, delete users */}
  <Route path="/admin/users" element={<AdminUsers />} />

  {/* Program Management - Create, edit, delete programs */}
  <Route path="/admin/programs" element={<AdminPrograms />} />

  {/* Area Management - Create, edit, delete areas */}
  <Route path="/admin/areas" element={<AdminAreas />} />

  {/* School Management - Create, edit, delete schools */}
  <Route path="/admin/schools" element={<AdminSchools />} />

  {/* Waiver Management - Create and edit waiver forms */}
  <Route path="/admin/waivers" element={<WaiversManagement />} />

  {/* Waiver Reports - View waiver completion reports */}
  <Route path="/admin/waiver-reports" element={<WaiverReports />} />

  {/* Client Management - Manage parent and child accounts */}
  <Route path="/clients" element={<Clients />} />

  {/* Financial Reports - Revenue reports by class, program, date range */}
  <Route path="/financials" element={<Financials />} />

  {/* Installment Management - View and manage payment plans */}
  <Route path="/admin/installments" element={<Installments />} />

  {/* Enrollment Management - View, transfer, cancel enrollments */}
  <Route path="/admin/enrollments" element={<Enrollments />} />

  {/* Waitlist Management - Manage class waitlists */}
  <Route path="/admin/waitlist" element={<Waitlist />} />

  {/* Invoice Management - View and manage invoices */}
  <Route path="/admin/invoices" element={<Invoices />} />

  {/* Refunds Management - Review and process refund requests */}
  <Route path="/admin/refunds" element={<RefundsManagement />} />

  {/* Cancellation Requests - Review enrollment cancellation requests */}
  <Route path="/admin/cancellations" element={<CancellationRequests />} />

  {/* Events Management - Create and manage events */}
  <Route path="/admin/events" element={<EventsManagement />} />

  {/* Badges Management - Create and award badges */}
  <Route path="/admin/badges" element={<BadgesManagement />} />

  {/* Photos Management - Upload and manage photos */}
  <Route path="/admin/photos" element={<PhotosManagement />} />
</Route>

</Routes>
</>
)
}
