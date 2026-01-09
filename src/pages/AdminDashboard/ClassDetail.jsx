/**
 * ============================================================================
 * CLASS DETAIL PAGE
 * ============================================================================
 *
 * Purpose: Displays detailed information about a specific class including:
 * - Class name, description, and image
 * - Location with embedded Google Maps
 * - Schedule (days and times)
 * - Date range
 * - Age group
 * - Coordinator information
 * - Pricing and registration
 *
 * Features:
 * - User authentication check before registration
 * - Role-based access (only parents can register)
 * - Session storage for login redirect
 * - Responsive design for mobile and desktop
 *
 * Data Flow:
 * 1. Component mounts → fetch class data from API
 * 2. Display class information
 * 3. User clicks "Register Now" → check auth → navigate to checkout
 *
 * ============================================================================
 */

// ============================================================================
// IMPORTS
// ============================================================================

// React core and hooks
import React, { useState, useEffect } from "react";

// Routing
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";

// Icons
import { ArrowLeft, Clock, User, MapPin } from "lucide-react";

// Services and Context
import classesService from "../../api/services/classes.service";
import { useAuth } from "../../context/auth";

// Components
import DottedOverlay from "@/components/DottedOverlay";
import Footer from "@/components/Footer";

// UI Libraries
import toast from "react-hot-toast";

// ============================================================================
// CUSTOM ICON COMPONENTS
// ============================================================================

/**
 * Clock Icon Component
 * Used to display time information in the schedule section
 */
const IconClock = ({ className = "w-4 h-4 text-gray-400" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6v6l4 2M12 3a9 9 0 110 18 9 9 0 010-18z"
    />
  </svg>
);

/**
 * Calendar Icon Component
 * Used to display date information in the schedule section
 */
const IconCalendar = ({ className = "w-4 h-4 text-gray-400" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ClassDetail() {
  // --------------------------------------------------------------------------
  // HOOKS & STATE
  // --------------------------------------------------------------------------

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useAuth(); // Get current authenticated user

  // Extract class ID from URL query parameters
  const classId = searchParams.get('id');

  // Get area ID from location state (passed from ClassList)
  const areaId = location.state?.areaId;

  // Back button always goes to class list (with area if available)
  const backToClassListUrl = '/class-list';

  // Component state
  const [classData, setClassData] = useState(null); // Stores fetched class details
  const [loading, setLoading] = useState(true);     // Loading state for API call

  // --------------------------------------------------------------------------
  // LIFECYCLE - Load class data on mount
  // --------------------------------------------------------------------------

  useEffect(() => {
    if (classId) {
      loadClassDetails();
    } else {
      // No class ID in URL - redirect to class list
      toast.error('No class ID provided');
      navigate(backToClassListUrl);
    }
  }, [classId]);

  // --------------------------------------------------------------------------
  // API FUNCTIONS
  // --------------------------------------------------------------------------

  /**
   * Fetch class details from API
   * Handles backward compatibility for school data structure
   */
  const loadClassDetails = async () => {
    try {
      setLoading(true);
      const data = await classesService.getById(classId);

      // Backward compatibility: Construct school object from individual fields
      // if school object doesn't exist but school_name does
      if (data.school_name && !data.school) {
        data.school = {
          name: data.school_name,
          address: data.school_address || '',
          city: data.school_city || '',
          state: data.school_state || '',
          zip_code: data.school_zip_code || '',
        };
      }

      setClassData(data);
    } catch (error) {
      console.error('Failed to fetch class details:', error);
      toast.error('Failed to load class details');
      navigate(backToClassListUrl); // Redirect on error
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // EVENT HANDLERS
  // --------------------------------------------------------------------------

  /**
   * Handle registration button click
   * Flow:
   * 1. Check if user is logged in
   * 2. Check if user has parent role
   * 3. Navigate to checkout page
   */
  const handleRegister = () => {
    // Step 1: Authentication check
    if (!user) {
      // Save intended class for post-login redirect
      sessionStorage.setItem('intendedClass', classId);
      toast('Please log in to register for this class');
      navigate('/login');
      return;
    }

    // Step 2: Role authorization check
    const userRole = user?.role?.toUpperCase();
    if (userRole !== 'PARENT') {
      toast.error('Only parents can register for classes');
      return;
    }

    // Step 3: Proceed to checkout
    navigate(`/checkout?classId=${classId}`);
  };

  // --------------------------------------------------------------------------
  // UTILITY FUNCTIONS - Data Formatting
  // --------------------------------------------------------------------------

  /**
   * Format schedule for display
   * Backend sends: weekdays=["Monday", "Wednesday"], start_time="9:00 AM", end_time="10:00 AM"
   * Output: "Monday, Wednesday, 9:00 AM - 10:00 AM"
   *
   * @param {Object} cls - Class object containing weekdays, start_time, end_time
   * @returns {string} Formatted schedule string
   */
  const formatSchedule = (cls) => {
    if (!cls.weekdays || cls.weekdays.length === 0) {
      return 'Schedule TBD';
    }

    // Backend now sends full day names (Monday, Wednesday) - no processing needed
    const days = cls.weekdays.join(', ');

    // Backend sends times in 12-hour format (9:00 AM, 10:00 AM)
    const time = cls.start_time && cls.end_time
      ? `${cls.start_time} - ${cls.end_time}`
      : '';

    return `${days}${time ? ', ' + time : ''}`;
  };

  /**
   * Format date range for display
   * Input: start_date="2025-12-19", end_date="2026-01-02"
   * Output: "Dec 19, 2025 - Jan 2, 2026"
   *
   * @param {Object} cls - Class object containing start_date and end_date
   * @returns {string} Formatted date range string
   */
  const formatDates = (cls) => {
    if (!cls.start_date || !cls.end_date) {
      return 'Dates TBD';
    }

    const start = new Date(cls.start_date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
    const end = new Date(cls.end_date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });

    return `${start} - ${end}`;
  };

  // --------------------------------------------------------------------------
  // RENDER - Loading State
  // --------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-[#e3e5e6] via-[#b7c3d1] to-[#a4b4c8]">
        <div className="text-text-muted">Loading class details...</div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // RENDER - No Data State
  // --------------------------------------------------------------------------

  if (!classData) {
    return null;
  }

  // --------------------------------------------------------------------------
  // RENDER - Main Content
  // --------------------------------------------------------------------------

  return (
    <div className="h-full flex flex-col w-full items-center justify-center md:px-6 md:p-0 p-6 bg-gradient-to-br from-[#e3e5e6] via-[#b7c3d1] to-[#a4b4c8]">
      {/* Outer container for vertical centering */}
      <div className="flex flex-1 items-center justify-center sm:pt-6 p-0">

        {/* Background dotted overlay pattern */}
        <DottedOverlay className="inset-x-6 inset-y-10 sm:inset-x-0 sm:inset-y-0" />

        {/* Main content wrapper */}
        <div className="w-full flex items-center justify-center">

          {/* Content card - max width 900px with semi-transparent background */}
          <div className="w-full max-w-[900px] bg-[#FFFFFF80] rounded-2xl p-4 md:p-8 shadow-lg z-50">

            {/* ================================================================
                HEADER SECTION - Back button and logo
                ================================================================ */}
            <div className="flex items-center justify-between mb-6 bg-white px-4 rounded-xl">
              {/* Left side: Back button */}
              <div className="flex items-center gap-4">
                <Link
                  to={backToClassListUrl}
                  state={{ from: '/' }}
                  className="rounded-full p-2 hover:bg-white/60"
                >
                  <ArrowLeft className="text-[#00000099]" />
                </Link>
                <h1 className="text-xl font-semibold font-manrope text-text-primary">
                  Back to Available Classes
                </h1>
              </div>

              {/* Right side: Logo with custom styling */}
              <div className="isolation-auto">
                <img
                  src="/images/logo.png"
                  alt="logo"
                  className="size-[80px] object-contain"
                  style={{
                    filter: 'brightness(0.2) contrast(1.5)',
                    mixBlendMode: 'normal'
                  }}
                />
              </div>
            </div>

            {/* ================================================================
                CLASS INFORMATION SECTION
                ================================================================ */}
            <div className="col-span-2 rounded-lg py-6">

              {/* --------------------------------------------------------
                  CLASS HEADER - Image and description
                  -------------------------------------------------------- */}
              <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                {/* Class image */}
                <img
                  src={classData.image_url || "/images/detail_page.png"}
                  alt={classData.name}
                  className="w-full sm:max-w-[327px] h-56 object-cover rounded-lg"
                />

                {/* Class title and description */}
                <div className="w-full">
                  <h2 className="sm:text-[30px] text-[22px] mt-3 font-bold font-manrope text-text-primary">
                    {classData.name}
                  </h2>
                  <p className="mt-3 text-base leading-[28px] font-manrope text-text-muted">
                    {classData.description || 'No description available'}
                  </p>
                </div>
              </div>

              {/* --------------------------------------------------------
                  MAIN CONTENT - Split into left (details) and right (pricing)
                  -------------------------------------------------------- */}
              <div className="flex flex-col md:flex-row items-start gap-6 mt-6 w-full">

                {/* LEFT COLUMN - Class details (65% width) */}
                <div className="flex flex-1 flex-col items-start gap-2 sm:gap-4 w-full sm:max-w-[65%]">

                  {/* ============================================
                      LOCATION CARD - Map and address
                      ============================================ */}
                  <div className="w-full flex flex-col gap-4">
                    {classData.school && (
                      <div className="bg-[#FFFFFF80] rounded-[20px] w-full sm:min-h-[140px]">
                        <div className="flex items-center gap-4">
                          {/* Embedded Google Map
                              Note: iframe is 140% height to crop bottom controls
                              Container has overflow-hidden to hide the excess
                          */}
                          <div className="sm:w-[190px] w-[130px] sm:h-[140px] h-[100px] rounded-lg overflow-hidden flex-shrink-0 relative">
                            <iframe
                              title="location-map"
                              src={`https://www.google.com/maps?q=${encodeURIComponent(classData.school.address || '')}&output=embed`}
                              className="w-full h-[140%] border-0 absolute top-0 left-0"
                              loading="lazy"
                            />
                          </div>

                          {/* Location information */}
                          <div className="flex-1 p-2 ">
                            {/* Location icon and label */}
                            <div className="flex items-center gap-2 mt-4 sm:mt-0 ">
                              <div className="p-1 rounded-full bg-[#fff6e0] flex items-center justify-center">
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="text-[#f1b500]"
                                >
                                  <path
                                    d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"
                                    fill="#f1b500"
                                  />
                                </svg>
                              </div>
                              <h4 className="font-bold text-lg font-manrope text-text-primary">
                                Location
                              </h4>
                            </div>

                            {/* School name and address */}
                            <p className="sm:text-sm text-xs leading-[30px] max-w-60 font-manrope text-text-muted mt-2">
                              {classData.school.name}
                              {classData.school.address && (
                                <>
                                  <br />
                                 <span className="mt-2">{classData.school.address}</span> 
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ============================================
                      SCHEDULE CARD - Days, times, dates, age, coordinator
                      ============================================ */}
                  <div className="bg-[#FFFFFF80] rounded-[20px] w-full p-4 shadow-sm flex flex-col justify-evenly sm:flex-row  gap-4 sm:gap-8">

                    {/* Left section - Day & Time, Age Group */}
                    <div>
                      {/* Day & Time */}
                      <h3 className="font-semibold font-manrope text-text-primary">
                        Day & Time
                      </h3>
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="w-4 h-4 text-text-muted" />
                        <span className="text-text-muted text-[14px] font-manrope">
                          {formatSchedule(classData)}
                        </span>
                      </div>

                      {/* Age Group */}
                      <h5 className="font-semibold font-manrope text-text-primary mt-4">
                        Age Group
                      </h5>
                      <div className="flex items-center gap-2 mt-2">
                        <User className="w-4 h-4 text-text-muted" />
                        <span className="text-text-muted text-[14px] font-manrope">
                          {classData.min_age || 0} - {classData.max_age || 18} Years Old
                        </span>
                      </div>
                    </div>

                    {/* Right section - Dates, Coordinator */}
                    <div>
                      {/* Dates */}
                      <h3 className="font-semibold font-manrope text-text-primary">
                        Dates
                      </h3>
                      <div className="flex items-center gap-2 mt-2">
                        <IconCalendar className="text-text-muted w-4 h-4" />
                        <span className="text-text-muted text-[14px] font-manrope">
                          {formatDates(classData)}
                        </span>
                      </div>

                      {/* Coordinator - Only show if coach data exists */}
                      {classData.coach && (
                        <>
                          <h5 className="font-semibold font-manrope text-text-primary mt-4">
                            Coordinator
                          </h5>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-text-muted text-[14px] font-manrope">
                              {classData.coach.first_name || 'TBD'}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* ============================================
                    RIGHT COLUMN - Pricing and registration (35% width)
                    ============================================ */}
                <aside className="bg-[#FFFFFF80] flex-1 rounded-[20px] p-6 flex flex-col w-full sm:max-w-[35%]">
                  <div>
                    {/* Price display */}
                    <div className="flex justify-between items-center w-full">
                      <h4 className="font-bold text-lg font-manrope text-text-primary">
                        Total Price
                      </h4>
                      <div className="text-[32px] font-semibold font-manrope">
                        ${classData.price || '0'}
                      </div>
                    </div>

                    {/* Divider */}
                    <hr className="w-full border border-border-light my-2" />

                    {/* Pricing features list */}
                    <ul className="mt-6 space-y-4 font-manrope text-sm text-text-muted">
                      <li className="font-manrope flex items-center gap-2">
                        <img src="/images/price_info.png" alt="" />
                        <span>15 weeks of training</span>
                      </li>
                      <li className="font-manrope flex items-center gap-2">
                        <img src="/images/price_info.png" alt="" />
                        <span>Certified coaching staff</span>
                      </li>
                    </ul>

                    {/* Capacity display removed per requirements */}
                  </div>

                  {/* Registration button */}
                  <div className="mt-6">
                    <button
                      onClick={handleRegister}
                      className="block w-full text-center px-4 py-3 bg-[#f1b500] hover:bg-[#e0a400] rounded-[12px] font-manrope font-semibold mt-[21px]"
                    >
                      Register Now
                    </button>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Not fixed to bottom, part of content flow */}
      <Footer isFixed={false} />
    </div>
  );
}
