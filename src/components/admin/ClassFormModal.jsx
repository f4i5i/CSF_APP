import React, { useState, useRef, useEffect, useCallback } from "react";
import { X, ChevronDown, Plus, Link, Copy, CheckCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import useClassForm from "../../hooks/useClassForm";
import programsService from "../../api/services/programs.service";
import areasService from "../../api/services/areas.service";
import schoolsService from "../../api/services/schools.service";
import adminService from "../../api/services/admin.service";
import toast from "react-hot-toast";
import TimePicker12Hour from "../ui/TimePicker12Hour";
import MultiCoachSelector from "./MultiCoachSelector";
import GooglePlacesAutocomplete from "../ui/GooglePlacesAutocomplete";

const DAYS = [
  { id: "monday", name: "Monday" },
  { id: "tuesday", name: "Tuesday" },
  { id: "wednesday", name: "Wednesday" },
  { id: "thursday", name: "Thursday" },
  { id: "friday", name: "Friday" },
  { id: "saturday", name: "Saturday" },
  { id: "sunday", name: "Sunday" },
];

const CLASS_TYPES = [
  { id: "one-time", name: "One-time Session" },
  { id: "membership", name: "Membership" },
];

const RECURRENCE_PATTERNS = [
  { id: "weekly", name: "Weekly" },
  { id: "monthly", name: "Monthly" },
  { id: "one-time", name: "One-time Event" },
];

const REPEAT_EVERY_WEEKS = [
  { id: "1", name: "1" },
  { id: "2", name: "2" },
  { id: "3", name: "3" },
  { id: "4", name: "4" },
  { id: "6", name: "6" },
  { id: "8", name: "8" },
  { id: "12", name: "12" },
];

// Custom Dropdown Component
function CustomDropdown({ value, onChange, options, placeholder, error, renderOption }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.id === value);
  const displayText = selectedOption ? selectedOption.name : placeholder;

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 border rounded-[12px] font-manrope focus:outline-none focus:ring-2 focus:ring-btn-gold flex items-center justify-between bg-white transition-colors ${
          error ? "border-btn-gold" : "border-border-light"
        }`}
        style={{ boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.05)" }}
      >
        <span className={`text-xs sm:text-base ${selectedOption ? "text-gray-900 font-manrope" : "text-gray-400 font-manrope"}`}>
          {displayText}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-gray-500" />
        </motion.div>
      </button>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{
          opacity: isOpen ? 1 : 0,
          y: isOpen ? 0 : -10,
          pointerEvents: isOpen ? "auto" : "none",
        }}
        transition={{ duration: 0.2 }}
        className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10"
      >
        <div className="max-h-48 overflow-y-auto custom-scrollbar">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                onChange(option.id);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left hover:bg-btn-gold hover:text-heading-dark transition-colors ${
                value === option.id
                  ? "bg-btn-gold text-text-primary"
                  : "text-heading-dark"
              }`}
            >
              {renderOption ? renderOption(option) : option.name}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default function ClassFormModal({
  isOpen,
  onClose,
  mode = "create",
  initialData = null,
  onSuccess,
}) {
  const {
    formData,
    errors,
    isSubmitting,
    updateField,
    updateSchedule,
    addSchedule,
    removeSchedule,
    updatePaymentOption,
    addCustomFee,
    updateCustomFee,
    removeCustomFee,
    handleSubmit,
  } = useClassForm(initialData, mode);

  // State for dynamic data from API
  const [programs, setPrograms] = useState([]);
  const [areas, setAreas] = useState([]);
  const [schools, setSchools] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [dropdownsLoading, setDropdownsLoading] = useState(true);

  // Inline Site Creation state
  const [showInlineSiteForm, setShowInlineSiteForm] = useState(false);
  const [newSiteName, setNewSiteName] = useState("");
  const [newSiteCode, setNewSiteCode] = useState("");
  const [newSiteAddress, setNewSiteAddress] = useState("");
  const [newSiteCity, setNewSiteCity] = useState("");
  const [newSiteState, setNewSiteState] = useState("");
  const [newSiteZipCode, setNewSiteZipCode] = useState("");
  const [creatingSite, setCreatingSite] = useState(false);

  // US States for dropdown
  const US_STATES = [
    { id: "AL", name: "Alabama" }, { id: "AK", name: "Alaska" }, { id: "AZ", name: "Arizona" },
    { id: "AR", name: "Arkansas" }, { id: "CA", name: "California" }, { id: "CO", name: "Colorado" },
    { id: "CT", name: "Connecticut" }, { id: "DE", name: "Delaware" }, { id: "FL", name: "Florida" },
    { id: "GA", name: "Georgia" }, { id: "HI", name: "Hawaii" }, { id: "ID", name: "Idaho" },
    { id: "IL", name: "Illinois" }, { id: "IN", name: "Indiana" }, { id: "IA", name: "Iowa" },
    { id: "KS", name: "Kansas" }, { id: "KY", name: "Kentucky" }, { id: "LA", name: "Louisiana" },
    { id: "ME", name: "Maine" }, { id: "MD", name: "Maryland" }, { id: "MA", name: "Massachusetts" },
    { id: "MI", name: "Michigan" }, { id: "MN", name: "Minnesota" }, { id: "MS", name: "Mississippi" },
    { id: "MO", name: "Missouri" }, { id: "MT", name: "Montana" }, { id: "NE", name: "Nebraska" },
    { id: "NV", name: "Nevada" }, { id: "NH", name: "New Hampshire" }, { id: "NJ", name: "New Jersey" },
    { id: "NM", name: "New Mexico" }, { id: "NY", name: "New York" }, { id: "NC", name: "North Carolina" },
    { id: "ND", name: "North Dakota" }, { id: "OH", name: "Ohio" }, { id: "OK", name: "Oklahoma" },
    { id: "OR", name: "Oregon" }, { id: "PA", name: "Pennsylvania" }, { id: "RI", name: "Rhode Island" },
    { id: "SC", name: "South Carolina" }, { id: "SD", name: "South Dakota" }, { id: "TN", name: "Tennessee" },
    { id: "TX", name: "Texas" }, { id: "UT", name: "Utah" }, { id: "VT", name: "Vermont" },
    { id: "VA", name: "Virginia" }, { id: "WA", name: "Washington" }, { id: "WV", name: "West Virginia" },
    { id: "WI", name: "Wisconsin" }, { id: "WY", name: "Wyoming" }, { id: "DC", name: "Washington DC" },
  ];

  // Registration link state
  const [registrationLinkCopied, setRegistrationLinkCopied] = useState(false);

  // Generate registration link preview
  const getRegistrationLink = () => {
    if (initialData?.id) {
      // Use slug if available, otherwise use class ID
      if (initialData?.slug || formData?.slug) {
        const slug = formData?.slug || initialData?.slug;
        return `${window.location.origin}/register/${slug}`;
      }
      return `${window.location.origin}/checkout?classId=${initialData.id}`;
    }
    return null;
  };

  // Generate slug from class name
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 50);
  };

  // Auto-generate slug when name changes (only if slug is empty)
  const handleNameChange = (value) => {
    updateField("name", value);
    if (!formData.slug && value) {
      updateField("slug", generateSlug(value));
    }
  };

  const copyRegistrationLink = async () => {
    const link = getRegistrationLink();
    if (link) {
      try {
        await navigator.clipboard.writeText(link);
        setRegistrationLinkCopied(true);
        toast.success("Registration link copied!");
        setTimeout(() => setRegistrationLinkCopied(false), 3000);
      } catch (error) {
        toast.error("Failed to copy link");
      }
    }
  };

  // Handle Google Places selection for new site
  const handlePlaceSelect = useCallback((placeData) => {
    // Auto-populate the address fields from the selected place
    if (placeData.address) {
      setNewSiteAddress(placeData.address);
    }
    if (placeData.city) {
      setNewSiteCity(placeData.city);
    }
    if (placeData.state) {
      setNewSiteState(placeData.state);
    }
    if (placeData.zipCode) {
      setNewSiteZipCode(placeData.zipCode);
    }
    // If the place has a name and it's different from the address, use it
    if (placeData.name && placeData.name !== placeData.address) {
      setNewSiteName(placeData.name);
    }
  }, []);

  // Handle inline site creation
  const handleCreateSite = async () => {
    // Validate required fields
    if (!newSiteName.trim()) {
      toast.error("Site name is required");
      return;
    }
    if (!newSiteCity.trim()) {
      toast.error("City is required");
      return;
    }
    if (!newSiteState) {
      toast.error("State is required");
      return;
    }
    if (!newSiteZipCode.trim()) {
      toast.error("Zip code is required");
      return;
    }
    if (!formData.area_id) {
      toast.error("Please select an Area/Location first before creating a site");
      return;
    }

    setCreatingSite(true);
    try {
      const newSite = await schoolsService.create({
        name: newSiteName.trim(),
        code: newSiteCode.trim() || undefined,
        address: newSiteAddress.trim() || undefined,
        city: newSiteCity.trim(),
        state: newSiteState,
        zip_code: newSiteZipCode.trim(),
        area_id: formData.area_id,
      });

      // Add to schools list and select it
      setSchools(prev => [...prev, newSite]);
      updateField("school_id", newSite.id);
      updateField("school_code", newSite.code || "");

      // Reset form
      setNewSiteName("");
      setNewSiteCode("");
      setNewSiteAddress("");
      setNewSiteCity("");
      setNewSiteState("");
      setNewSiteZipCode("");
      setShowInlineSiteForm(false);

      toast.success("Site created successfully!");
    } catch (error) {
      console.error("Failed to create site:", error);
      const errorMsg = error.response?.data?.detail;
      if (Array.isArray(errorMsg)) {
        toast.error(errorMsg.map(e => e.msg || e.message).join(", ") || "Failed to create site");
      } else {
        toast.error(errorMsg || "Failed to create site");
      }
    } finally {
      setCreatingSite(false);
    }
  };

  // Fetch programs, areas, schools, and coaches on mount
  useEffect(() => {
    const fetchDropdownData = async () => {
      setDropdownsLoading(true);
      try {
        const [programsData, areasData, schoolsData, coachesData] = await Promise.all([
          programsService.getAll(),
          areasService.getAll(),
          schoolsService.getAll(),
          adminService.getCoaches().catch((err) => {
            console.error('Failed to fetch coaches:', err);
            return { items: [] };
          }),
        ]);

        // Handle different response structures
        const programsList = Array.isArray(programsData)
          ? programsData
          : (programsData.items || programsData.data || []);

        const areasList = Array.isArray(areasData)
          ? areasData
          : (areasData.items || areasData.data || []);

        const schoolsList = Array.isArray(schoolsData)
          ? schoolsData
          : (schoolsData.items || schoolsData.data || []);

        const coachesList = coachesData.items || [];

        setPrograms(programsList);
        setAreas(areasList);
        setSchools(schoolsList);
        setCoaches(coachesList);
      } catch (error) {
        console.error('Failed to fetch dropdown data:', error);
        toast.error('Failed to load dropdown data');
        setPrograms([]);
        setAreas([]);
        setSchools([]);
        setCoaches([]);
      } finally {
        setDropdownsLoading(false);
      }
    };

    if (isOpen) {
      fetchDropdownData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    await handleSubmit(() => {
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50 p-4 ">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-light">
          <h2 className="text-2xl font-bold text-text-primary font-manrope">
            {mode === "create" ? "Create New Class" : "Edit Class"}
          </h2>
          <button
            onClick={onClose}
            className="text-btn-gold  transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body - Scrollable */}
        <form
          onSubmit={handleFormSubmit}
          className="flex-1 overflow-y-auto custom-scrollbar"
        >
          <div className="p-6 space-y-8">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-text-primary font-manrope border-b border-border-light pb-2">
                Basic Information
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Class Name */}
                <div className="col-span-2">
                  <label className="block sm:text-[16px] text-[12px] font-medium font-manrope text-heading-dark mb-1">
                    Class Name <span className="text-btn-gold">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className={`w-full px-3 py-2 border font-manrope rounded-[12px] focus:outline-none focus:ring-2 focus:ring-btn-gold ${
                      errors.name ? "border-btn-gold" : "border-border-light"
                    }`}
                    style={{ boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.05)" }}
                    placeholder="e.g., U10 After School Soccer"
                  />
                  {errors.name && (
                    <p className="text-error-darker font-manrope text-xs mt-1">
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Custom URL Slug */}
                <div className="col-span-2">
                  <label className="block sm:text-[16px] text-[12px] font-medium font-manrope text-heading-dark mb-1">
                    Custom URL Slug
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 font-mono whitespace-nowrap">
                      {window.location.origin}/register/
                    </span>
                    <input
                      type="text"
                      value={formData.slug || ''}
                      onChange={(e) => updateField("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      className="flex-1 px-3 py-2 border font-manrope rounded-[12px] focus:outline-none focus:ring-2 focus:ring-btn-gold border-border-light font-mono text-sm"
                      style={{ boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.05)" }}
                      placeholder="u10-soccer-fall-2024"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Short, memorable URL for sharing. Only lowercase letters, numbers, and hyphens.
                  </p>
                </div>

                {/* Description */}
                <div className="col-span-2">
                  <label className="block sm:text-[16px] text-[12px] font-medium font-manrope text-heading-dark mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border font-manrope rounded-[12px] focus:outline-none focus:ring-2 focus:ring-btn-gold border-border-light"
                    style={{ boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.05)" }}
                    placeholder="Brief description of the class..."
                  />
                </div>
              </div>

              {/* Registration Period Section */}
              <div className="space-y-4 mt-8">
                <h3 className="text-xl font-semibold text-text-primary font-manrope border-b border-border-light pb-2">
                  Registration Period
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block sm:text-base text-sm font-medium font-manrope text-heading-dark mb-1">
                      Registration Start Date <span className="text-btn-gold">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.registration_start_date}
                      onChange={(e) => updateField("registration_start_date", e.target.value)}
                      className={`w-full px-3 py-2 border font-manrope rounded-[12px] focus:outline-none focus:ring-2 focus:ring-btn-gold ${
                        errors.registration_start_date ? "border-btn-gold" : "border-border-light"
                      }`}
                      style={{ boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.05)" }}
                    />
                    {errors.registration_start_date && (
                      <p className="text-error-darker font-manrope text-xs mt-1">
                        {errors.registration_start_date}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block sm:text-base text-sm font-medium font-manrope text-heading-dark mb-1">
                      Registration End Date <span className="text-btn-gold">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.registration_end_date}
                      onChange={(e) => updateField("registration_end_date", e.target.value)}
                      className={`w-full px-3 py-2 border font-manrope rounded-[12px] focus:outline-none focus:ring-2 focus:ring-btn-gold ${
                        errors.registration_end_date ? "border-btn-gold" : "border-border-light"
                      }`}
                      style={{ boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.05)" }}
                    />
                    {errors.registration_end_date && (
                      <p className="text-error-darker font-manrope text-xs mt-1">
                        {errors.registration_end_date}
                      </p>
                    )}
                  </div>
                </div>

                <p className="text-xs text-gray-600">
                  Registration period must end before the class start date
                </p>
              </div>

              {/* Basic Information Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Program */}
                <div>
                  <label className="block sm:text-[16px] text-[12px] font-medium font-manrope text-heading-dark mb-1">
                    Program <span className="text-btn-gold">*</span>
                  </label>
                  <CustomDropdown
                    value={formData.program_id}
                    onChange={(value) => updateField("program_id", value)}
                    options={programs}
                    placeholder={dropdownsLoading ? "Loading programs..." : "Select Program"}
                    error={errors.program_id}
                  />
                  {errors.program_id && (
                    <p className="text-error-darker font-manrope text-xs mt-1">
                      {errors.program_id}
                    </p>
                  )}
                </div>

                {/* Area */}
                <div>
                  <label className="block sm:text-[16px] text-[12px] font-medium font-manrope text-heading-dark mb-1">
                    Area/Location <span className="text-btn-gold">*</span>
                  </label>
                  <CustomDropdown
                    value={formData.area_id}
                    onChange={(value) => updateField("area_id", value)}
                    options={areas}
                    placeholder={dropdownsLoading ? "Loading areas..." : "Select Area"}
                    error={errors.area_id}
                  />
                  {errors.area_id && (
                    <p className="text-error-darker font-manrope text-xs mt-1">
                      {errors.area_id}
                    </p>
                  )}
                </div>

                {/* School/Site with Code */}
                <div>
                  <label className="block sm:text-base text-sm font-medium font-manrope text-heading-dark mb-1">
                   Site / Ledger Code <span className="text-btn-gold">*</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <CustomDropdown
                        value={formData.school_id}
                        onChange={(value) => {
                          const school = schools.find(s => s.id === value);
                          updateField("school_id", value);
                          updateField("school_code", school?.code || "");
                        }}
                        options={schools}
                        placeholder="Select Site"
                        error={errors.school_id}
                        renderOption={(option) => (
                          <div>
                            <div className="font-semibold">{option.name}</div>
                            <div className="text-xs text-gray-500">{option.code}</div>
                          </div>
                        )}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowInlineSiteForm(!showInlineSiteForm)}
                      className="px-3 py-2 border border-border-light rounded-[12px] hover:bg-gray-50 transition-colors flex items-center gap-1 text-sm font-medium text-heading-dark"
                      title="Add new site"
                    >
                      <Plus size={16} />
                      <span className="hidden sm:inline">New</span>
                    </button>
                  </div>
                  {formData.school_code && (
                    <p className="text-xs text-gray-600 mt-1">Code: {formData.school_code}</p>
                  )}
                  {errors.school_id && (
                    <p className="text-error-darker font-manrope text-xs mt-1">
                      {errors.school_id}
                    </p>
                  )}

                  {/* Inline Site Creation Form */}
                  {showInlineSiteForm && (
                    <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm text-heading-dark">Add New Site</h4>
                        <button
                          type="button"
                          onClick={() => setShowInlineSiteForm(false)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      {!formData.area_id && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-xs text-yellow-800">
                          Please select an Area/Location above first to create a new site.
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        {/* Site Name with Google Places Autocomplete */}
                        <div className="col-span-2">
                          <GooglePlacesAutocomplete
                            value={newSiteName}
                            onChange={setNewSiteName}
                            onPlaceSelect={handlePlaceSelect}
                            placeholder="Search for a school, park, or address..."
                            label="Site Name"
                            required
                          />
                        </div>

                        {/* Ledger Code */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Ledger Code</label>
                          <input
                            type="text"
                            value={newSiteCode}
                            onChange={(e) => setNewSiteCode(e.target.value)}
                            placeholder="Optional"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-btn-gold focus:border-btn-gold"
                          />
                        </div>

                        {/* Street Address */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Street Address</label>
                          <input
                            type="text"
                            value={newSiteAddress}
                            onChange={(e) => setNewSiteAddress(e.target.value)}
                            placeholder="123 Main St"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-btn-gold focus:border-btn-gold"
                          />
                        </div>

                        {/* City */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">City *</label>
                          <input
                            type="text"
                            value={newSiteCity}
                            onChange={(e) => setNewSiteCity(e.target.value)}
                            placeholder="City"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-btn-gold focus:border-btn-gold"
                          />
                        </div>

                        {/* State Dropdown */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">State *</label>
                          <select
                            value={newSiteState}
                            onChange={(e) => setNewSiteState(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-btn-gold focus:border-btn-gold bg-white"
                          >
                            <option value="">Select State</option>
                            {US_STATES.map((state) => (
                              <option key={state.id} value={state.id}>
                                {state.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Zip Code */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Zip Code *</label>
                          <input
                            type="text"
                            value={newSiteZipCode}
                            onChange={(e) => setNewSiteZipCode(e.target.value)}
                            placeholder="12345"
                            maxLength={10}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-btn-gold focus:border-btn-gold"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleCreateSite}
                        disabled={creatingSite || !newSiteName.trim() || !newSiteCity.trim() || !newSiteState || !newSiteZipCode.trim() || !formData.area_id}
                        className="w-full px-4 py-2 bg-btn-gold hover:bg-[#e5ad35] text-heading-dark font-semibold rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {creatingSite ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Plus size={16} />
                            Create Site
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Coach Assignment - Multiple Coaches */}
                <div className="col-span-2">
                  <MultiCoachSelector
                    coaches={coaches}
                    selectedIds={formData.coach_ids || (formData.coach_id ? [formData.coach_id] : [])}
                    onChange={(ids) => {
                      updateField("coach_ids", ids);
                      // Also set legacy coach_id to first selected coach for backwards compatibility
                      updateField("coach_id", ids.length > 0 ? ids[0] : null);
                    }}
                    disabled={dropdownsLoading}
                    label="Assign Coaches"
                    maxHeight="150px"
                  />
                </div>

                {/* Capacity */}
                <div>
                  <label className="block sm:text-[16px] text-[12px] font-medium font-manrope text-heading-dark mb-1">
                    Capacity <span className="text-btn-gold">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => updateField("capacity", e.target.value)}
                    className={`w-full px-3 py-2 border font-manrope rounded-[12px] focus:outline-none focus:ring-2 focus:ring-btn-gold ${
                      errors.capacity
                        ? "border-btn-gold"
                        : "border-border-light"
                    }`}
                    style={{ boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.05)" }}
                    placeholder="20"
                  />
                  {errors.capacity && (
                    <p className="text-error-darker font-manrope text-xs mt-1">
                      {errors.capacity}
                    </p>
                  )}
                </div>

                {/* Age Range */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block sm:text-[16px] text-[12px] font-medium font-manrope text-heading-dark mb-1">
                      Min Age <span className="text-btn-gold">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.min_age}
                      onChange={(e) => updateField("min_age", e.target.value)}
                      className={`w-full px-3 py-2 border font-manrope rounded-[12px] focus:outline-none focus:ring-2 focus:ring-btn-gold ${
                        errors.min_age
                          ? "border-btn-gold"
                          : "border-border-light"
                      }`}
                      style={{ boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.05)" }}
                      placeholder="8"
                    />
                    {errors.min_age && (
                      <p className="text-error-darker font-manrope text-xs mt-1">
                        {errors.min_age}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block sm:text-[16px] text-[12px] font-medium font-manrope text-heading-dark mb-1">
                      Max Age <span className="text-btn-gold">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.max_age}
                      onChange={(e) => updateField("max_age", e.target.value)}
                      className={`w-full px-3 py-2 border font-manrope rounded-[12px] focus:outline-none focus:ring-2 focus:ring-btn-gold ${
                        errors.max_age
                          ? "border-btn-gold"
                          : "border-border-light"
                      }`}
                      style={{ boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.05)" }}
                      placeholder="10"
                    />
                    {errors.max_age && (
                      <p className="text-error-darker font-manrope text-xs mt-1">
                        {errors.max_age}
                      </p>
                    )}
                  </div>
                </div>

                {/* Date Range */}
                <div>
                  <label className="block sm:text-[16px] text-[12px] font-medium font-manrope text-heading-dark mb-1">
                    Start Date <span className="text-btn-gold">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => updateField("start_date", e.target.value)}
                    className={`w-full px-3 py-2 border font-manrope rounded-[12px] focus:outline-none focus:ring-2 focus:ring-btn-gold ${
                      errors.start_date
                        ? "border-btn-gold"
                        : "border-border-light"
                    }`}
                    style={{ boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.05)" }}
                  />
                  {errors.start_date && (
                    <p className="text-error-darker font-manrope text-xs mt-1">
                      {errors.start_date}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block sm:text-[16px] text-[12px] font-medium font-manrope text-heading-dark mb-1">
                    End Date <span className="text-btn-gold">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => updateField("end_date", e.target.value)}
                    className={`w-full px-3 py-2 border font-manrope rounded-[12px] focus:outline-none focus:ring-2 focus:ring-btn-gold ${
                      errors.end_date
                        ? "border-btn-gold"
                        : "border-border-light"
                    }`}
                    style={{ boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.05)" }}
                  />
                  {errors.end_date && (
                    <p className="text-error-darker font-manrope text-xs mt-1">
                      {errors.end_date}
                    </p>
                  )}
                </div>

                {/* Active Status */}
                <div className="col-span-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) =>
                        updateField("is_active", e.target.checked)
                      }
                      className="w-4 h-4 text-[#F3BC48] border-border-light rounded focus:ring-btn-gold"
                    />
                    <span className="text-sm font-medium text-heading-dark">
                      Active (visible to users)
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Schedule Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-xl font-semibold text-text-primary font-manrope border-border-light">
                  Schedule
                </h3>
                <button
                  type="button"
                  onClick={addSchedule}
                  className="text-sm text-btn-secondary hover:text-[#e5ad35] font-semibold"
                >
                  + Add Schedule
                </button>
              </div>

              {formData.schedule.map((sched, index) => (
                <div
                  key={index}
                  className="flex gap-3 items-start p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1 grid sm:grid-cols-3 grid-cols-1 gap-3">
                    <div>
                        <label className="block sm:text-[16px] text-[12px] font-medium font-manrope text-heading-dark mb-1">
                          Day of Week
                        </label>
                        <CustomDropdown
                          value={sched.day_of_week}
                          onChange={(val) => updateSchedule(index, "day_of_week", val)}
                          options={DAYS}
                          placeholder="Select Day"
                          error={null}
                        />
                    </div>
                    <div>
                      <label className="block sm:text-[16px] text-[12px] font-medium font-manrope text-heading-dark mb-1">
                        Start Time
                      </label>
                      <TimePicker12Hour
                        value={sched.start_time}
                        onChange={(value) =>
                          updateSchedule(index, "start_time", value)
                        }
                        placeholder="Select start time"
                      />
                    </div>
                    <div>
                      <label className="block sm:text-[16px] text-[12px] font-medium font-manrope text-heading-dark mb-1">
                        End Time
                      </label>
                      <TimePicker12Hour
                        value={sched.end_time}
                        onChange={(value) =>
                          updateSchedule(index, "end_time", value)
                        }
                        placeholder="Select end time"
                      />
                    </div>
                  </div>
                  {formData.schedule.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSchedule(index)}
                      className="text-btn-gold hover:text-red-700 mt-6"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              {errors.schedule && (
                <p className="text-btn-gold text-sm">{errors.schedule}</p>
              )}
            </div>

            {/* Recurrence Pattern Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-text-primary font-manrope border-b border-border-light pb-2">
                Recurrence
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block sm:text-base text-sm font-medium font-manrope text-heading-dark mb-1">
                    Schedule Pattern <span className="text-btn-gold">*</span>
                  </label>
                  <CustomDropdown
                    value={formData.recurrence_pattern}
                    onChange={(value) => updateField("recurrence_pattern", value)}
                    options={RECURRENCE_PATTERNS}
                    placeholder="Select Pattern"
                    error={errors.recurrence_pattern}
                  />
                  {errors.recurrence_pattern && (
                    <p className="text-error-darker font-manrope text-xs mt-1">
                      {errors.recurrence_pattern}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block sm:text-base text-sm font-medium font-manrope text-heading-dark mb-1">
                    Repeat Every <span className="text-btn-gold">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <CustomDropdown
                        value={formData.repeat_every_weeks}
                        onChange={(value) => updateField("repeat_every_weeks", value)}
                        options={REPEAT_EVERY_WEEKS}
                        placeholder="Select"
                        error={errors.repeat_every_weeks}
                      />
                    </div>
                    <span className="text-sm font-manrope text-heading-dark">
                      {formData.recurrence_pattern === 'monthly' ? 'months' : 'weeks'}
                    </span>
                  </div>
                  {errors.repeat_every_weeks && (
                    <p className="text-error-darker font-manrope text-xs mt-1">
                      {errors.repeat_every_weeks}
                    </p>
                  )}
                </div>
              </div>

              <p className="text-xs text-gray-600">
                {formData.recurrence_pattern === 'weekly' && `Class repeats every ${formData.repeat_every_weeks} ${parseInt(formData.repeat_every_weeks) === 1 ? 'week' : 'weeks'} on the selected days`}
                {formData.recurrence_pattern === 'monthly' && 'Class repeats monthly on the same dates'}
                {formData.recurrence_pattern === 'one-time' && 'Class occurs only once'}
              </p>
            </div>

            {/* Class Type Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-text-primary font-manrope border-b border-border-light pb-2">
                Class Type
              </h3>

              <div>
                <label className="block sm:text-base text-sm font-medium font-manrope text-heading-dark mb-1">
                  Type <span className="text-btn-gold">*</span>
                </label>
                <CustomDropdown
                  value={formData.class_type}
                  onChange={(value) => updateField("class_type", value)}
                  options={CLASS_TYPES}
                  placeholder="Select Class Type"
                  error={errors.class_type}
                />
                {errors.class_type && (
                  <p className="text-error-darker font-manrope text-xs mt-1">
                    {errors.class_type}
                  </p>
                )}
              </div>
            </div>

            {/* Payment Options Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-text-primary font-manrope border-b border-border-light pb-2">
                Payment Options (Stripe)
              </h3>

              {errors.payment_options && (
                <div className="bg-red-50 border border-border-light text-error-dark px-4 py-3 rounded">
                  {errors.payment_options}
                </div>
              )}

              <p className="text-sm text-gray-600">
                Select ONE payment option for this class. You can customize the display name shown to parents.
              </p>

              <div className="space-y-3">
                {/* Pay in Full */}
                <div className="border border-border-light rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <label className="flex items-center space-x-2 w-36 pt-2">
                      <input
                        type="radio"
                        name="payment_option"
                        checked={formData.payment_options[0].enabled}
                        onChange={() => {
                          // Disable all other options
                          [1, 2, 3, 4, 5].forEach((i) => {
                            updatePaymentOption(i, "enabled", false);
                          });
                          // Enable this option
                          updatePaymentOption(0, "enabled", true);
                        }}
                        className="w-4 h-4 text-[#F3BC48] border-border-light focus:ring-btn-gold"
                      />
                      <span className="font-semibold text-heading-dark font-manrope text-sm">
                        One-time
                      </span>
                    </label>
                    {formData.payment_options[0].enabled && (
                      <div className="flex-1 space-y-2">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Display Name</label>
                            <input
                              type="text"
                              value={formData.payment_options[0].custom_name}
                              onChange={(e) =>
                                updatePaymentOption(0, "custom_name", e.target.value)
                              }
                              className="w-full px-3 py-2 border font-manrope rounded-[12px] focus:outline-none focus:ring-2 focus:ring-btn-gold border-border-light text-sm"
                              placeholder="Pay in Full"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Price ($)</label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={formData.payment_options[0].price}
                              onChange={(e) =>
                                updatePaymentOption(0, "price", e.target.value)
                              }
                              className="w-full px-3 py-2 border font-manrope rounded-[12px] focus:outline-none focus:ring-2 focus:ring-btn-gold border-border-light"
                              placeholder="299.00"
                            />
                          </div>
                        </div>
                        {errors.payment_full_payment && (
                          <p className="text-error-darkest text-xs mt-1">
                            {errors.payment_full_payment}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Monthly Subscription */}
                <div className="border border-border-light rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <label className="flex items-center space-x-2 w-36 pt-2">
                      <input
                        type="radio"
                        name="payment_option"
                        checked={formData.payment_options[1].enabled}
                        onChange={() => {
                          // Disable all other options
                          [0, 2, 3, 4, 5].forEach((i) => {
                            updatePaymentOption(i, "enabled", false);
                          });
                          // Enable this option
                          updatePaymentOption(1, "enabled", true);
                        }}
                        className="w-4 h-4 text-[#F3BC48] border-border-light focus:ring-btn-gold"
                      />
                      <span className="font-semibold text-heading-dark font-manrope text-sm">
                        Subscription
                      </span>
                    </label>
                    {formData.payment_options[1].enabled && (
                      <div className="flex-1 space-y-2">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Display Name</label>
                            <input
                              type="text"
                              value={formData.payment_options[1].custom_name}
                              onChange={(e) =>
                                updatePaymentOption(1, "custom_name", e.target.value)
                              }
                              className="w-full px-3 py-2 border font-manrope rounded-[12px] focus:outline-none focus:ring-2 focus:ring-btn-gold border-border-light text-sm"
                              placeholder="Monthly Subscription"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Monthly Price ($)</label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={formData.payment_options[1].price}
                              onChange={(e) =>
                                updatePaymentOption(1, "price", e.target.value)
                              }
                              className="w-full px-3 py-2 border font-manrope rounded-[12px] focus:outline-none focus:ring-2 focus:ring-btn-gold border-border-light"
                              placeholder="69.00"
                            />
                          </div>
                        </div>
                        {errors.payment_monthly_subscription && (
                          <p className="text-error-darkest text-xs mt-1">
                            {errors.payment_monthly_subscription}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Installment Plans */}
                <div className="border border-border-light rounded-lg p-4">
                  <h4 className="font-semibold text-heading-dark font-manrope mb-3">
                    Installment Plans
                  </h4>
                  <div className="space-y-4">
                    {[
                      { index: 2, label: "2 Months", type: "installment_2", defaultName: "2 Month Installment" },
                      { index: 3, label: "3 Months", type: "installment_3", defaultName: "3 Month Installment" },
                      { index: 4, label: "4 Months", type: "installment_4", defaultName: "4 Month Installment" },
                      { index: 5, label: "6 Months", type: "installment_6", defaultName: "6 Month Installment" },
                    ].map(({ index, label, type, defaultName }) => (
                      <div key={index} className="flex items-start gap-4">
                        <label className="flex items-center space-x-2 w-36 pt-2">
                          <input
                            type="radio"
                            name="payment_option"
                            checked={formData.payment_options[index].enabled}
                            onChange={() => {
                              // Disable all other options (including Pay in Full and Monthly)
                              [0, 1, 2, 3, 4, 5].forEach((i) => {
                                if (i !== index) {
                                  updatePaymentOption(i, "enabled", false);
                                }
                              });
                              // Enable the selected one
                              updatePaymentOption(index, "enabled", true);
                            }}
                            className="w-4 h-4 text-[#F3BC48] border-border-light focus:ring-btn-gold"
                          />
                          <span className="text-sm font-medium font-manrope text-heading-dark">
                            {label}
                          </span>
                        </label>
                        {formData.payment_options[index].enabled && (
                          <div className="flex-1 space-y-2">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Display Name</label>
                                <input
                                  type="text"
                                  value={formData.payment_options[index].custom_name}
                                  onChange={(e) =>
                                    updatePaymentOption(index, "custom_name", e.target.value)
                                  }
                                  className="w-full px-3 py-2 border font-manrope rounded-[12px] focus:outline-none focus:ring-2 focus:ring-btn-gold border-border-light text-sm"
                                  placeholder={defaultName}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Monthly Payment ($)</label>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={formData.payment_options[index].price}
                                  onChange={(e) =>
                                    updatePaymentOption(
                                      index,
                                      "price",
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-3 py-2 border font-manrope rounded-[12px] focus:outline-none focus:ring-2 focus:ring-btn-gold border-border-light"
                                  placeholder="Monthly payment"
                                />
                              </div>
                            </div>
                            {errors[`payment_${type}`] && (
                              <p className="text-error-darkest text-xs mt-1">
                                {errors[`payment_${type}`]}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Fees Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border-light pb-2">
                <h3 className="text-xl font-semibold text-text-primary font-manrope">
                  Custom Fees (Optional)
                </h3>
                <button
                  type="button"
                  onClick={addCustomFee}
                  className="text-sm text-btn-secondary hover:text-[#e5ad35] font-semibold flex items-center gap-1"
                >
                  <Plus size={16} />
                  Add Fee
                </button>
              </div>

              <p className="text-sm text-gray-600">
                Add optional fees like Jersey Fee, Equipment Fee, etc. Parents can choose whether to include these during checkout.
              </p>

              {formData.custom_fees.length === 0 ? (
                <div className="text-center py-4 text-gray-500 border border-dashed border-gray-300 rounded-lg">
                  <p className="text-sm font-manrope">No custom fees added</p>
                  <button
                    type="button"
                    onClick={addCustomFee}
                    className="mt-2 text-sm text-btn-secondary hover:text-[#e5ad35] font-semibold"
                  >
                    + Add your first custom fee
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.custom_fees.map((fee, index) => (
                    <div
                      key={index}
                      className="flex gap-3 items-start p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Fee Name <span className="text-btn-gold">*</span>
                          </label>
                          <input
                            type="text"
                            value={fee.name}
                            onChange={(e) => updateCustomFee(index, "name", e.target.value)}
                            className="w-full px-3 py-2 border font-manrope rounded-[12px] focus:outline-none focus:ring-2 focus:ring-btn-gold border-border-light text-sm"
                            placeholder="e.g., Jersey Fee"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Amount ($)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={fee.amount}
                            onChange={(e) => updateCustomFee(index, "amount", e.target.value)}
                            className="w-full px-3 py-2 border font-manrope rounded-[12px] focus:outline-none focus:ring-2 focus:ring-btn-gold border-border-light text-sm"
                            placeholder="25.00"
                          />
                        </div>
                        <div className="flex items-end pb-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={fee.is_optional}
                              onChange={(e) => updateCustomFee(index, "is_optional", e.target.checked)}
                              className="w-4 h-4 text-btn-gold border-gray-300 rounded focus:ring-btn-gold"
                            />
                            <span className="text-sm font-manrope text-gray-700">Optional</span>
                          </label>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCustomFee(index)}
                        className="text-btn-gold hover:text-red-700 mt-6"
                        title="Remove fee"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Class Image/Logo Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-text-primary font-manrope border-b border-border-light pb-2">
                Class Image/Logo
              </h3>

              <div>
                <label className="block sm:text-base text-sm font-medium font-manrope text-heading-dark mb-1">
                  Upload Image
                </label>
                <div className="mt-1 flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        updateField("class_image", file);
                      }
                    }}
                    className="block w-full text-sm text-gray-900 border border-border-light rounded-[12px] cursor-pointer bg-gray-50 focus:outline-none px-3 py-2"
                  />
                </div>

                {formData.class_image && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-16 w-16 rounded-lg border border-border-light overflow-hidden">
                      {typeof formData.class_image === 'string' ? (
                        <img src={formData.class_image} alt="Class" className="h-full w-full object-cover" />
                      ) : (
                        <img src={URL.createObjectURL(formData.class_image)} alt="Class preview" className="h-full w-full object-cover" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => updateField("class_image", null)}
                      className="text-sm text-btn-gold hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                )}

                <p className="text-xs text-gray-600 mt-1">
                  Recommended: Square image, min 400x400px
                </p>
              </div>
            </div>

            {/* Website Link Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-text-primary font-manrope border-b border-border-light pb-2">
                Additional Information
              </h3>

              <div>
                <label className="block sm:text-base text-sm font-medium font-manrope text-heading-dark mb-1">
                  Class Website/Info Link
                </label>
                <input
                  type="url"
                  value={formData.website_link}
                  onChange={(e) => updateField("website_link", e.target.value)}
                  className={`w-full px-3 py-2 border font-manrope rounded-[12px] focus:outline-none focus:ring-2 focus:ring-btn-gold ${
                    errors.website_link ? "border-btn-gold" : "border-border-light"
                  }`}
                  style={{ boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.05)" }}
                  placeholder="https://example.com/class-info"
                />
                {errors.website_link && (
                  <p className="text-error-darker font-manrope text-xs mt-1">
                    {errors.website_link}
                  </p>
                )}

                {formData.website_link && !errors.website_link && (
                  <a
                    href={formData.website_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-btn-secondary hover:underline mt-1 inline-block"
                  >
                    Preview link →
                  </a>
                )}
              </div>
            </div>

            {/* Registration Link Section - Only in Edit Mode */}
            {mode === "edit" && initialData?.id && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-text-primary font-manrope border-b border-border-light pb-2">
                  Registration Link
                </h3>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Link className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-800 text-sm">
                      Share this link for parents to register
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={getRegistrationLink() || ""}
                      className="flex-1 px-3 py-2 bg-white border border-green-300 rounded-lg text-sm text-gray-700 font-mono"
                    />
                    <button
                      type="button"
                      onClick={copyRegistrationLink}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center gap-2 ${
                        registrationLinkCopied
                          ? "bg-green-600 text-white"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      {registrationLinkCopied ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  {(formData?.slug || initialData?.slug) ? (
                    <p className="text-xs text-green-700 mt-2">
                      Using custom URL: <span className="font-mono font-semibold">/register/{formData?.slug || initialData?.slug}</span>
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-2">
                      Tip: Add a custom URL slug above for a shorter, memorable registration link.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-border-light bg-gray-50">
            <div>
              {mode === "create" && (
                <button
                  type="button"
                  onClick={async (e) => {
                    e.preventDefault();
                    // Pass is_active: false as override to save as draft
                    await handleSubmit(() => {
                      toast.success("Class saved as draft!");
                      if (onSuccess) onSuccess();
                      onClose();
                    }, { is_active: false });
                  }}
                  disabled={isSubmitting}
                  className="px-6 py-2 border border-gray-400 rounded-lg text-gray-600 font-manrope font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save as Draft"
                  )}
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-6 py-2 border border-gray-300 rounded-lg text-text-primary font-manrope font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-btn-gold hover:bg-[#e5ad35] text-text-primary font-manrope rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? "Saving..."
                  : mode === "create"
                  ? "Create Class"
                  : "Update Class"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
