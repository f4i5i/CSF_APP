// src/App.jsx
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Elements } from '@stripe/react-stripe-js'
import stripePromise from './config/stripe.config'
import AuthLayout from './pages/Authlayout'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import Calender from './pages/Calender'
import Gallery from './pages/Gallery'
import Attendence from './pages/Attendence'
import Settings from './pages/Settings'
import ContactForm from './pages/ContactForm'
import PaymentBilling from './pages/PaymentBilling'
import Badges from './pages/Badges'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardCoach from './pages/CoachDashboard/DashboardCoach'
import CheckIn from './pages/CoachDashboard/CheckIn'
import CoachGallery from './pages/CoachDashboard/CoachGallery'
import Classes from './pages/Classes'
import ClassDetail from './pages/ClassDetails'
import AddStudent from './components/AddStudent'
import Waivers from './pages/Waivers'
import ProgramOverview from './pages/ProgramOverview'
import Checkout from './pages/CheckOut'
import AdminDashboard from './pages/AdminDashboard/AdminDashboard'
import Financials from './pages/AdminDashboard/Financials'
import Clients from './pages/AdminDashboard/Clients'
import AdminLayout from './layouts/AdminLayout'
import RegisterChild from './pages/AdminDashboard/RegisterChild'
import AdminClasses from './pages/AdminDashboard/Classes'
import Installments from './pages/AdminDashboard/Installments'
import Enrollments from './pages/AdminDashboard/Enrollments'
import Waitlist from './pages/AdminDashboard/Waitlist'
import Invoices from './pages/AdminDashboard/Invoices'

export default function App(){
return (
<>
{/* Toast notifications */}
<Toaster
  position="top-right"
  toastOptions={{
    duration: 4000,
    style: {
      background: '#363636',
      color: '#fff',
    },
    success: {
      duration: 3000,
      iconTheme: {
        primary: '#F3BC48',
        secondary: '#fff',
      },
    },
    error: {
      duration: 4000,
      iconTheme: {
        primary: '#ef4444',
        secondary: '#fff',
      },
    },
  }}
/>

<Routes>
{/* Public marketing/overview page */}
<Route path="/" element={<ProgramOverview />} />

{/* Public auth routes share the AuthLayout shell */}
<Route element={<AuthLayout />}>
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route path="/forgot-password" element={<ForgotPassword />} />
</Route>

{/* Protected routes - require authentication */}
<Route path="/overview" element={
  <ProtectedRoute>
    <ProgramOverview />
   </ProtectedRoute>
} />

<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
   </ProtectedRoute>
} />

<Route path="/coachdashboard" element={
  <ProtectedRoute>
    <DashboardCoach />
   </ProtectedRoute>
} />

      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/classes" element={<AdminClasses />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/calendar" element={<Calender />} />
        <Route path="/financials" element={<Financials />} />
      </Route>

<Route path="/photos" element={
  <ProtectedRoute>
    <Gallery />
  </ProtectedRoute>
} />

<Route path="/Gallery" element={
  <ProtectedRoute>
    <CoachGallery />
  </ProtectedRoute>
} />

<Route path="/attendance" element={
  <ProtectedRoute>
    <Attendence />
  </ProtectedRoute>
} />

<Route path="/settings" element={
  <ProtectedRoute>
    <Settings />
  </ProtectedRoute>
} />
<Route path="/account" element={
  <ProtectedRoute>
    <Settings />
  </ProtectedRoute>
} />

<Route path="/settings/password" element={
  <ProtectedRoute>
    <Settings initialSection="password" />
  </ProtectedRoute>
} />

<Route path="/contactus" element={
  <ProtectedRoute>
    <ContactForm />
  </ProtectedRoute>
} />

<Route path="/paymentbilling" element={
  <ProtectedRoute>
    <PaymentBilling initialSection="payment" />
  </ProtectedRoute>
} />

<Route path="/badges" element={
  <ProtectedRoute>
    <Badges />
  </ProtectedRoute>
} />


<Route path="/checkIn" element={
  <ProtectedRoute>
    <CheckIn />
  </ProtectedRoute>
} />

<Route path="/class" element={
  <ProtectedRoute>
    <Classes />
  </ProtectedRoute>
} />

 <Route path="/class/:id" element={<ClassDetail />} />

   <Route path="/addchild" element={
  <ProtectedRoute>
    <AddStudent />
  </ProtectedRoute>
} /> 

 <Route path="/waivers" element={
  <ProtectedRoute>
    <Waivers />
 </ProtectedRoute> 
} 
/> 

<Route path="/checkout" element={
  <Elements stripe={stripePromise}>
    <Checkout />
  </Elements>
} /> 


<Route path="/registerchild" element={
  <ProtectedRoute>
    <RegisterChild />
 </ProtectedRoute>
}
/>

{/* Admin CRUD Routes */}
 

<Route path="/admin/installments" element={
  <ProtectedRoute>
    <Installments />
  </ProtectedRoute>
} />

<Route path="/admin/enrollments" element={
  <ProtectedRoute>
    <Enrollments />
  </ProtectedRoute>
} />

<Route path="/admin/waitlist" element={
  <ProtectedRoute>
    <Waitlist />
  </ProtectedRoute>
} />

<Route path="/admin/invoices" element={
  <ProtectedRoute>
    <Invoices />
  </ProtectedRoute>
} />

</Routes>
</>
)
}
