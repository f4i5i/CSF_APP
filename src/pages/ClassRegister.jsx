/**
 * ClassRegister Page
 * Handles custom URL registration links (e.g., /register/u10-soccer-fall-2024)
 * Looks up the class by slug and redirects to checkout
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import classesService from '../api/services/classes.service';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function ClassRegister() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classData, setClassData] = useState(null);

  useEffect(() => {
    const fetchClassBySlug = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch class by slug
        const response = await classesService.getBySlug(slug);

        if (response && response.id) {
          setClassData(response);
          // Redirect to checkout with the class ID
          navigate(`/checkout?classId=${response.id}`, { replace: true });
        } else {
          setError('Class not found');
        }
      } catch (err) {
        console.error('Failed to fetch class by slug:', err);

        // Handle 404 specifically
        if (err.response?.status === 404) {
          setError('This registration link is no longer valid or the class does not exist.');
        } else {
          setError('Unable to load class information. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchClassBySlug();
    } else {
      setError('Invalid registration link');
      setLoading(false);
    }
  }, [slug, navigate]);

  // Show loading state while fetching
  if (loading) {
    return (
      <div className="min-h-screen bg-page-gradient flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-btn-gold mx-auto mb-4" />
            <p className="text-lg text-gray-600 font-manrope">Loading registration...</p>
            <p className="text-sm text-gray-400 mt-2">Please wait while we prepare the class details</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-page-gradient flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 font-kollektif mb-2">
              Registration Link Error
            </h1>
            <p className="text-gray-600 font-manrope mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/class')}
                className="w-full px-6 py-3 bg-btn-gold text-heading-dark font-semibold rounded-lg hover:bg-btn-gold/90 transition-colors font-manrope"
              >
                Browse Available Classes
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors font-manrope"
              >
                Go to Homepage
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // If we have class data but haven't redirected yet, show it
  if (classData) {
    return (
      <div className="min-h-screen bg-page-gradient flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-btn-gold mx-auto mb-4" />
            <p className="text-lg text-gray-600 font-manrope">
              Redirecting to registration for {classData.name}...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return null;
}
