# CSF Frontend - Quick Reference Guide

## File Location Quick Reference

### Need to find a specific file? Use this guide.

---

## Configuration Files (Root Level)

| What you need | File location |
|--------------|---------------|
| NPM dependencies | `/package.json` |
| TypeScript config | `/tsconfig.json` |
| Tailwind config | `/tailwind.config.js` |
| Webpack customization | `/craco.config.js` |
| PostCSS config | `/postcss.config.js` |
| Environment variables | `/.env` |

---

## Core Application Files

| What you need | File location |
|--------------|---------------|
| App entry point | `/src/index.js` |
| Main routing | `/src/App.js` |
| Global styles | `/src/index.css` |

---

## API Layer

### API Configuration
| What you need | File location |
|--------------|---------------|
| Axios client | `/src/api/client/axios-client.ts` |
| Query client | `/src/api/client/query-client.ts` |
| API config | `/src/api/config/api.config.ts` |
| Endpoints | `/src/api/config/endpoints.ts` |

### API Services
| What you need | File location |
|--------------|---------------|
| Authentication | `/src/api/services/auth.service.ts` |
| User management | `/src/api/services/user.service.ts` |
| Child management | `/src/api/services/child.service.ts` |
| Classes | `/src/api/services/class.service.ts` |
| Enrollments | `/src/api/services/enrollment.service.ts` |
| Orders | `/src/api/services/order.service.ts` |
| Payments | `/src/api/services/payment.service.ts` |
| Attendance | `/src/api/services/attendance.service.ts` |
| Badges | `/src/api/services/badge.service.ts` |
| Events | `/src/api/services/event.service.ts` |
| Announcements | `/src/api/services/announcement.service.ts` |
| Photos | `/src/api/services/photo.service.ts` |
| Admin | `/src/api/services/admin.service.ts` |

### React Query Hooks

#### Authentication
- Login: `/src/api/hooks/auth/useLogin.ts`
- Register: `/src/api/hooks/auth/useRegister.ts`
- Logout: `/src/api/hooks/auth/useLogout.ts`

#### Users
- Get user: `/src/api/hooks/users/useUser.ts`
- Update user: `/src/api/hooks/users/useUpdateUser.ts`

#### Children
- List children: `/src/api/hooks/children/useChildren.ts`
- Get child: `/src/api/hooks/children/useChild.ts`
- Create child: `/src/api/hooks/children/useCreateChild.ts`
- Update child: `/src/api/hooks/children/useUpdateChild.ts`
- Delete child: `/src/api/hooks/children/useDeleteChild.ts`

#### Classes
- List classes: `/src/api/hooks/classes/useClasses.ts`
- Get class: `/src/api/hooks/classes/useClass.ts`
- Get programs: `/src/api/hooks/classes/usePrograms.ts`
- Get areas: `/src/api/hooks/classes/useAreas.ts`

#### Enrollments
- List enrollments: `/src/api/hooks/enrollments/useEnrollments.ts`
- Create enrollment: `/src/api/hooks/enrollments/useCreateEnrollment.ts`
- Cancel enrollment: `/src/api/hooks/enrollments/useCancelEnrollment.ts`
- Transfer enrollment: `/src/api/hooks/enrollments/useTransferEnrollment.ts`

#### Orders & Payments
- List orders: `/src/api/hooks/orders/useOrders.ts`
- Get order: `/src/api/hooks/orders/useOrder.ts`
- Create order: `/src/api/hooks/orders/useCreateOrder.ts`
- Checkout: `/src/api/hooks/orders/useCheckout.ts`
- List payments: `/src/api/hooks/payments/usePayments.ts`
- Get payment: `/src/api/hooks/payments/usePayment.ts`
- Get installments: `/src/api/hooks/payments/useInstallments.ts`
- Get invoice: `/src/api/hooks/payments/useInvoice.ts`
- Payment methods: `/src/api/hooks/payments/usePaymentMethods.ts`

#### Attendance & Badges
- Get attendance: `/src/api/hooks/attendance/useAttendance.ts`
- Check in: `/src/api/hooks/attendance/useCheckIn.ts`
- Mark attendance: `/src/api/hooks/attendance/useMarkAttendance.ts`
- Attendance streak: `/src/api/hooks/attendance/useAttendanceStreak.ts`
- List badges: `/src/api/hooks/badges/useBadges.ts`
- Award badge: `/src/api/hooks/badges/useAwardBadge.ts`
- Badge progress: `/src/api/hooks/badges/useBadgeProgress.ts`

#### Announcements & Events
- List announcements: `/src/api/hooks/announcements/useAnnouncements.ts`
- Create announcement: `/src/api/hooks/announcements/useCreateAnnouncement.ts`
- List events: `/src/api/hooks/events/useEvents.ts`
- Create event: `/src/api/hooks/events/useCreateEvent.ts`
- RSVP: `/src/api/hooks/events/useRsvp.ts`

#### Photos
- List photos: `/src/api/hooks/photos/usePhotos.ts`
- List albums: `/src/api/hooks/photos/useAlbums.ts`
- Upload photo: `/src/api/hooks/photos/useUploadPhoto.ts`

#### Admin
- Get clients: `/src/api/hooks/admin/useClients.ts`
- Dashboard metrics: `/src/api/hooks/admin/useDashboardMetrics.ts`
- Process refunds: `/src/api/hooks/admin/useRefunds.ts`
- Revenue report: `/src/api/hooks/admin/useRevenueReport.ts`

### Type Definitions
| What you need | File location |
|--------------|---------------|
| Auth types | `/src/api/types/auth.types.ts` |
| User types | `/src/api/types/user.types.ts` |
| Child types | `/src/api/types/child.types.ts` |
| Class types | `/src/api/types/class.types.ts` |
| Enrollment types | `/src/api/types/enrollment.types.ts` |
| Order types | `/src/api/types/order.types.ts` |
| Payment types | `/src/api/types/payment.types.ts` |
| Attendance types | `/src/api/types/attendance.types.ts` |
| Badge types | `/src/api/types/badge.types.ts` |
| Event types | `/src/api/types/event.types.ts` |
| Announcement types | `/src/api/types/announcement.types.ts` |
| Photo types | `/src/api/types/photo.types.ts` |
| Admin types | `/src/api/types/admin.types.ts` |
| Common types | `/src/api/types/common.types.ts` |

---

## Context & State

| What you need | File location |
|--------------|---------------|
| Auth context | `/src/context/auth.js` |
| Auth context (TS) | `/src/context/AuthContext.tsx` |
| Global state | `/src/context/StateProvider.js` |
| Initial state | `/src/context/initialState.js` |
| Reducer | `/src/context/reducer.js` |
| Stepper context | `/src/context/StepperContext.js` |

---

## Pages

### Parent/User Pages
| What you need | File location |
|--------------|---------------|
| Dashboard | `/src/pages/Dashboard.jsx` |
| Browse classes | `/src/pages/Classes.jsx` |
| Class details | `/src/pages/ClassDetails.jsx` |
| Checkout | `/src/pages/CheckOut.jsx` |
| Calendar | `/src/pages/Calender.jsx` |
| Attendance | `/src/pages/Attendence.jsx` |
| Badges | `/src/pages/Badges.jsx` |
| Gallery | `/src/pages/Gallery.jsx` |
| Payment & Billing | `/src/pages/PaymentBilling.jsx` |
| Settings | `/src/pages/Settings.jsx` |
| Waivers | `/src/pages/Waivers.jsx` |
| Program overview | `/src/pages/ProgramOverview.jsx` |

### Authentication Pages
| What you need | File location |
|--------------|---------------|
| Login | `/src/pages/Login.jsx` |
| Register | `/src/pages/Register.jsx` |
| Forgot password | `/src/pages/ForgotPassword.jsx` |

### Admin Pages
| What you need | File location |
|--------------|---------------|
| Admin dashboard | `/src/pages/AdminDashboard/AdminDashboard.jsx` |
| Manage classes | `/src/pages/AdminDashboard/Classes.jsx` |
| Class list | `/src/pages/AdminDashboard/ClassList.jsx` |
| Class details | `/src/pages/AdminDashboard/ClassDetail.jsx` |
| Manage clients | `/src/pages/AdminDashboard/Clients.jsx` |
| Enrollments | `/src/pages/AdminDashboard/Enrollments.jsx` |
| Waitlist | `/src/pages/AdminDashboard/Waitlist.jsx` |
| Financials | `/src/pages/AdminDashboard/Financials.jsx` |
| Installments | `/src/pages/AdminDashboard/Installments.jsx` |
| Invoices | `/src/pages/AdminDashboard/Invoices.jsx` |
| Register child | `/src/pages/AdminDashboard/RegisterChild.jsx` |
| Waiver management | `/src/pages/admin/WaiversManagement.jsx` |
| Waiver reports | `/src/pages/admin/WaiverReports.jsx` |

### Coach Pages
| What you need | File location |
|--------------|---------------|
| Coach dashboard | `/src/pages/CoachDashboard/DashboardCoach.jsx` |
| Check-in | `/src/pages/CoachDashboard/CheckIn.jsx` |
| Gallery | `/src/pages/CoachDashboard/CoachGallery.jsx` |

### Other Pages
| What you need | File location |
|--------------|---------------|
| Payment success | `/src/pages/PaymentSuccess.jsx` |
| Payment cancel | `/src/pages/PaymentCancel.jsx` |
| Contact form | `/src/pages/ContactForm.jsx` |

---

## Components

### Layout Components
| What you need | File location |
|--------------|---------------|
| Header | `/src/components/Header.jsx` |
| Sidebar | `/src/components/Sidebar.jsx` |
| Footer | `/src/components/Footer.jsx` |
| Admin layout | `/src/layouts/AdminLayout.jsx` |
| Protected route | `/src/components/ProtectedRoute.jsx` |

### Admin Components
| What you need | File location |
|--------------|---------------|
| Data table | `/src/components/admin/DataTable.jsx` |
| Filter bar | `/src/components/admin/FilterBar.jsx` |
| Status badge | `/src/components/admin/StatusBadge.jsx` |
| Action menu | `/src/components/admin/ActionMenu.jsx` |
| Confirm dialog | `/src/components/admin/ConfirmDialog.jsx` |
| Refund modal | `/src/components/admin/RefundModal.jsx` |
| Class form modal | `/src/components/admin/ClassFormModal.jsx` |
| Waiver form modal | `/src/components/admin/WaiverFormModal.jsx` |

### Checkout Components
| What you need | File location |
|--------------|---------------|
| Child selector | `/src/components/checkout/ChildSelector.jsx` |
| Class summary | `/src/components/checkout/ClassDetailsSummary.jsx` |
| Installment selector | `/src/components/checkout/InstallmentPlanSelector.jsx` |
| Payment method | `/src/components/checkout/PaymentMethodSelector.jsx` |
| Stripe form | `/src/components/checkout/StripePaymentForm.jsx` |
| Order summary | `/src/components/checkout/OrderSummary.jsx` |
| Discount input | `/src/components/checkout/DiscountCodeInput.jsx` |
| Confirmation | `/src/components/checkout/OrderConfirmation.jsx` |
| Waiver check | `/src/components/checkout/WaiverCheckModal.jsx` |

### Calendar Components
| What you need | File location |
|--------------|---------------|
| Full calendar | `/src/components/Calendar/FullCalender.jsx` |
| Mini calendar | `/src/components/Calendar/CalenderMini.jsx` |

### Dashboard Components
| What you need | File location |
|--------------|---------------|
| Stat card | `/src/components/dashboard/StatCard.jsx` |
| Program photo card | `/src/components/dashboard/ProgramPhotoCard.jsx` |
| Members chart | `/src/components/AdminDashboard/MembersBarChart.jsx` |
| Middle summary | `/src/components/AdminDashboard/MiddleSummary.jsx` |
| Stats sidebar | `/src/components/AdminDashboard/StatsSidebar.jsx` |
| Today's classes | `/src/components/AdminDashboard/TodayClasses.jsx` |

### Reusable Components
| What you need | File location |
|--------------|---------------|
| Class card | `/src/components/ClassCard.jsx` |
| Enrollment card | `/src/components/EnrollmentCard.jsx` |
| Badge card | `/src/components/BadgeCard.jsx` |
| Photo card | `/src/components/PhotoCard.jsx` |
| Payment status card | `/src/components/PaymentStatusCard.jsx` |
| Generic button | `/src/components/GenericButton.jsx` |
| Input field | `/src/components/InputField.jsx` |
| Add student | `/src/components/AddStudent.jsx` |
| Installment tracker | `/src/components/InstallmentTracker.jsx` |
| Gallery | `/src/components/Gallery.jsx` |
| Upload photos modal | `/src/components/UploadPhotosModal.jsx` |
| Waivers alert | `/src/components/WaiversAlert.jsx` |

### Error Handling
| What you need | File location |
|--------------|---------------|
| Error boundary | `/src/components/errors/ErrorBoundary.tsx` |

---

## Custom Hooks

| What you need | File location |
|--------------|---------------|
| API wrapper | `/src/hooks/useApi.js` |
| Checkout flow | `/src/hooks/useCheckoutFlow.js` |
| Children data | `/src/hooks/useChildren.js` |
| Class form | `/src/hooks/useClassForm.js` |
| Enrollments | `/src/hooks/useEnrollments.js` |
| Mutation wrapper | `/src/hooks/useMutation.js` |
| Toast notifications | `/src/hooks/useToast.js` |

---

## Utilities

| What you need | File location |
|--------------|---------------|
| Class helpers | `/src/utils/classHelpers.ts` |
| Formatters | `/src/utils/formatters.ts` |
| Format (JS) | `/src/utils/format.js` |
| CSS styles | `/src/utils/cssStyles.js` |
| LocalStorage | `/src/utils/fetchLocalStorageData.js` |
| Error handler | `/src/api/utils/error-handler.ts` |
| Retry config | `/src/api/utils/retry-config.ts` |
| Cache utils | `/src/api/utils/cache-utils.ts` |

---

## Common Tasks

### Adding a New API Service

1. Create service file: `/src/api/services/myservice.service.ts`
2. Define service functions using `axiosClient`
3. Create types: `/src/api/types/myservice.types.ts`
4. Create hooks: `/src/api/hooks/myservice/useMyService.ts`
5. Export from `/src/api/hooks/index.ts`

### Creating a New Page

1. Create page file: `/src/pages/MyPage.jsx`
2. Add route in `/src/App.js`
3. Add to navigation in `/src/components/Sidebar.jsx` or `/src/components/Header.jsx`
4. Add protection with `ProtectedRoute` if needed

### Adding a New Component

1. Create component: `/src/components/MyComponent.jsx`
2. Import and use in parent component
3. Add to Storybook if needed

### Modifying Styles

1. Global styles: `/src/index.css`
2. Tailwind config: `/tailwind.config.js`
3. Component styles: Use Tailwind utility classes

---

## Environment Variables

Add to `/.env`:

```bash
REACT_APP_API_BASE_URL=http://localhost:8000/api
REACT_APP_ENV=development
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_key
```

Remember: Restart dev server after changing `.env` file!

---

## Available Scripts

```bash
npm start        # Start development server
npm build        # Create production build
npm test         # Run tests
npm run lint     # Lint code
```

---

## Import Aliases

Use `@/` instead of relative paths:

```javascript
// Bad
import Component from '../../../components/Component'

// Good
import Component from '@/components/Component'
```

---

## Common Imports

```javascript
// React Query hooks
import { useLogin, useUser, useClasses } from '@/api/hooks'

// Auth context
import { useAuth } from '@/context/auth'

// State context
import { useStateValue } from '@/context/StateProvider'

// Utilities
import { formatCurrency, formatDate } from '@/utils/formatters'

// Components
import GenericButton from '@/components/GenericButton'
import InputField from '@/components/InputField'
```

---

## Route Paths

### Parent Routes
- `/dashboard` - Dashboard
- `/classes` - Browse classes
- `/classes/:classId` - Class details
- `/checkout/:classId` - Checkout
- `/calendar` - Calendar
- `/attendance` - Attendance
- `/badges` - Badges
- `/gallery` - Gallery
- `/payment-billing` - Payments
- `/settings` - Settings
- `/waivers` - Waivers

### Admin Routes
- `/admin/dashboard` - Admin dashboard
- `/admin/classes` - Manage classes
- `/admin/classes/:classId` - Class details
- `/admin/clients` - Manage clients
- `/admin/enrollments` - Enrollments
- `/admin/waitlist` - Waitlist
- `/admin/financials` - Financial reports
- `/admin/installments` - Installments
- `/admin/invoices` - Invoices
- `/admin/waivers` - Waiver management

### Coach Routes
- `/coach/dashboard` - Coach dashboard
- `/coach/check-in` - Check-in
- `/coach/gallery` - Gallery

### Auth Routes
- `/login` - Login
- `/register` - Register
- `/forgot-password` - Password reset

---

## Tech Stack Quick Reference

- **React**: 18.2.0
- **React Router**: 6.4.2
- **TypeScript**: 5.9.3
- **TailwindCSS**: 3.2.1
- **React Query**: 5.90.11
- **Axios**: 1.13.2
- **Stripe**: 8.5.3
- **Firebase**: 10.5.0 (Google Auth)
- **Material-UI**: 5.14.5
- **Formik**: 2.4.5
- **date-fns**: 4.1.0
- **Recharts**: 2.15.4

---

## Getting Help

1. Check `/DOCUMENTATION.md` for detailed file documentation
2. Check `/README.md` for project overview
3. Check this file for quick reference
4. Check inline code comments
5. Ask team members!
