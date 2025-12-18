/**
 * @file index.js
 * @description Application entry point for the CSF frontend. This file bootstraps the React
 * application and wraps it with all necessary context providers in the correct hierarchical order.
 *
 * Provider Hierarchy (outermost to innermost):
 * 1. React.StrictMode - Development mode checks and warnings
 * 2. ApiProvider - React Query for server state management and caching
 * 3. AuthProvider - Authentication state and JWT token management
 * 4. BrowserRouter - Client-side routing
 * 5. StateProvider - Global application state (reducer pattern)
 * 6. App - Main application component with route definitions
 *
 * This layered architecture ensures:
 * - API calls have access to auth tokens (ApiProvider wraps AuthProvider)
 * - Routing has access to auth state (BrowserRouter inside AuthProvider)
 * - Components can access global state and auth context anywhere in the tree
 *
 * @requires react
 * @requires react-dom/client
 * @requires react-router-dom
 */

// ========================================
// IMPORTS - Core Libraries
// ========================================
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

// ========================================
// IMPORTS - Styles
// ========================================
import './index.css'; // Global styles including Tailwind imports

// ========================================
// IMPORTS - Main App Component
// ========================================
import App from './App';

// ========================================
// IMPORTS - Context Providers
// ========================================
import { ApiProvider } from './components/providers/ApiProvider'; // React Query provider
import { AuthProvider } from './context/auth'; // Authentication context
import { StateProvider } from './context/StateProvider'; // Global state (reducer pattern)
import { initialState } from './context/initialState'; // Initial state shape
import reducer from './context/reducer'; // State reducer functions

// ========================================
// IMPORTS - Performance Monitoring
// ========================================
import reportWebVitals from './reportWebVitals'; // Web vitals reporting

/**
 * Create React root element
 * Uses React 18's createRoot API for concurrent rendering features
 */
const root = ReactDOM.createRoot(document.getElementById('root'));

/**
 * Render the application
 *
 * Provider Hierarchy Explanation:
 *
 * 1. React.StrictMode (outermost)
 *    - Activates additional checks and warnings in development mode
 *    - Helps identify potential problems like unsafe lifecycle methods
 *    - Double-invokes component functions to detect side effects
 *    - Only runs in development, no impact on production builds
 *
 * 2. ApiProvider (React Query)
 *    - Provides QueryClient for server state management
 *    - Handles automatic caching, background refetching, and cache invalidation
 *    - Manages loading and error states for API calls
 *    - Provides React Query DevTools in development mode
 *    - MUST wrap AuthProvider so API calls can access authentication tokens
 *
 * 3. AuthProvider
 *    - Manages user authentication state (user object, JWT token, isAuthenticated)
 *    - Provides login(), logout(), register(), refreshToken() methods
 *    - Auto-restores user session from localStorage on mount
 *    - Handles token expiry and automatic logout
 *    - MUST wrap BrowserRouter so routing can access auth state for redirects
 *
 * 4. BrowserRouter
 *    - Enables client-side routing with React Router v6
 *    - Uses HTML5 History API for clean URLs (no hash fragments)
 *    - Provides routing context to all child components
 *    - MUST wrap StateProvider so global state can access routing
 *
 * 5. StateProvider (Global State)
 *    - Provides global application state using reducer pattern (Redux-like)
 *    - State management for user profile data and app settings
 *    - Less commonly used, mostly legacy code (prefer React Query for server state)
 *    - Actions: SET_USER, CLEAR_USER
 *
 * 6. Routes & App (innermost)
 *    - Catch-all route that renders App component for all paths
 *    - App component defines all specific route mappings
 *    - Single Route with path="/*" allows App to handle all routing internally
 */
root.render(
  <React.StrictMode>
    {/* API Provider - Server state management with React Query */}
    <ApiProvider>
      {/* Auth Provider - User authentication and JWT token management */}
      <AuthProvider>
        {/* Browser Router - Client-side routing */}
        <BrowserRouter>
          {/* State Provider - Global application state (reducer pattern) */}
          <StateProvider initialState={initialState} reducer={reducer}>
            {/*
              Catch-all route renders App component for all paths
              App component internally defines all specific route mappings
              loading prop enables loading state during initial app bootstrap
            */}
            <Routes>
              <Route path="/*" element={<App loading={true}/>} />
            </Routes>
          </StateProvider>
        </BrowserRouter>
      </AuthProvider>
    </ApiProvider>
  </React.StrictMode>
);

/**
 * Performance Monitoring
 *
 * Reports web vitals metrics (Core Web Vitals):
 * - CLS (Cumulative Layout Shift)
 * - FID (First Input Delay)
 * - FCP (First Contentful Paint)
 * - LCP (Largest Contentful Paint)
 * - TTFB (Time to First Byte)
 *
 * To enable logging, pass a function:
 * reportWebVitals(console.log)
 *
 * To send to analytics endpoint:
 * reportWebVitals((metric) => {
 *   // Send to analytics
 *   console.log(metric);
 * });
 *
 * Learn more: https://bit.ly/CRA-vitals
 */
reportWebVitals();
