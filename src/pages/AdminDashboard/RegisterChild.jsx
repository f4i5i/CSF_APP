import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useClasses } from "../../api/hooks/classes/useClasses";
import childrenService from "../../api/services/children.service";
import Logo from "../../components/Logo";

export default function RegisterChild() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    grade: "",
    classroom: "",
    jersey: "",
    medical: "",
    afterschool: "no",
    emergencyName: "",
    emergencyPhone: "",
    emergencyRelation: "",
    insurance: "",
    hearAbout: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [calculatedAge, setCalculatedAge] = useState(null);

  // Fetch classes for classroom dropdown
  const { data: classes = [], isLoading: loadingClasses } = useClasses({
    filters: { is_active: true },
  });

  // Calculate age from DOB
  useEffect(() => {
    if (form.dob) {
      const today = new Date();
      const birthDate = new Date(form.dob);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      // Adjust age if birthday hasn't occurred this year
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      setCalculatedAge(age);
    } else {
      setCalculatedAge(null);
    }
  }, [form.dob]);

  // Validate fields
  const validate = () => {
    let newErrors = {};

    if (!form.firstName.trim()) newErrors.firstName = "First name is required.";
    if (!form.lastName.trim()) newErrors.lastName = "Last name is required.";
    if (!form.dob) newErrors.dob = "Date of birth is required.";
    if (!form.grade.trim()) newErrors.grade = "Grade is required.";
    if (!form.jersey) newErrors.jersey = "Select a jersey size.";
    if (!form.emergencyName.trim())
      newErrors.emergencyName = "Emergency contact name is required.";
    if (!form.emergencyPhone.trim())
      newErrors.emergencyPhone = "Emergency contact phone is required.";
    if (!form.emergencyRelation.trim())
      newErrors.emergencyRelation = "Emergency contact relation is required.";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });

    // Remove error as user types
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      // Prepare child data according to API format
      const childData = {
        first_name: form.firstName,
        last_name: form.lastName,
        date_of_birth: form.dob,
        grade: form.grade,
        jersey_size: form.jersey.toLowerCase(), // API expects lowercase
        medical_conditions: form.medical || null,
        has_no_medical_conditions: !form.medical,
        after_school_attendance: form.afterschool === "yes",
        after_school_program: form.afterschool === "yes" ? "Default Program" : null,
        health_insurance_number: form.insurance || null,
        how_heard_about_us: form.hearAbout || null,
        emergency_contacts: form.emergencyName ? [
          {
            name: form.emergencyName,
            relation: form.emergencyRelation, // Changed from 'relationship' to 'relation'
            phone: form.emergencyPhone,
            is_primary: true
          }
        ] : [],
      };

      // Create child via API
      const response = await childrenService.create(childData);

      toast.success("Child registered successfully!");

      // Navigate to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to register child:", error);

      // Handle validation errors from API
      if (error.response?.data?.detail && Array.isArray(error.response.data.detail)) {
        const validationErrors = {};
        const errorMessages = [];

        error.response.data.detail.forEach((err) => {
          const field = err.loc[err.loc.length - 1];
          const message = err.msg;

          // Map API field names to form field names
          const fieldMap = {
            'first_name': 'firstName',
            'last_name': 'lastName',
            'date_of_birth': 'dob',
            'jersey_size': 'jersey',
            'name': 'emergencyName',
            'phone': 'emergencyPhone',
            'relation': 'emergencyRelation'
          };

          const formField = fieldMap[field] || field;
          validationErrors[formField] = message;
          errorMessages.push(`${field.replace(/_/g, ' ')}: ${message}`);
        });

        setErrors(validationErrors);
        const errorSummary = errorMessages.join('. ');
        toast.error(`Validation failed: ${errorSummary}`);
        setSubmitError(`Please fix the following errors: ${errorSummary}`);
      } else {
        const errorMessage = error.response?.data?.message ||
                            error.response?.data?.error ||
                            "Failed to register child. Please try again.";
        toast.error(errorMessage);
        setSubmitError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = (field) =>
    `w-full mt-1 p-2 border rounded-xl focus:ring-2 focus:ring-[#173151] bg-gray-50
     ${errors[field] ? "border-red-500" : "border-gray-300"}`;

  return (
    <div className="h-screen w-full flex flex-col justify-center items-center overflow-hidden relative">

      {/* Dotted Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#a1acc7_1px,transparent_1px)] [background-size:18px_18px] opacity-70"></div>

      {/* CSF School Academy - Top Center */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10">
        <h1 className="text-[62px] font-bold text-[#173151] font-kollektif drop-shadow-lg">CSF School Academy</h1>
      </div>

      <div className='relative justify-center items-center w-full max-w-4xl px-4 mt-32'>
        {/* FORM CARD */}
        <div className="bg-white shadow-2xl rounded-3xl px-8 py-6 w-full">
          {/* Logo and Title Section */}
          <div className="relative flex items-center mb-4">
            {/* Logo - Left Side */}
            <div className="flex w-[128px] h-[124px] items-center max-sm:flex max-sm:justify-center max-sm:items-center">
              <Logo />
            </div>

            {/* Title - Centered */}
            <div className="absolute left-1/2 -translate-x-1/2 text-center">
              <h2 className="text-2xl font-semibold text-[#0f172a]">Register a Child</h2>
              <p className="text-gray-500 mt-1">Add a child to your account</p>
            </div>
          </div>

        {/* Error Message */}
        {submitError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{submitError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* First Name */}
          <div>
            <label className="font-medium text-gray-700">First Name</label>
            <input
              type="text"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              className={inputStyle("firstName")}
            />
            {errors.firstName && (
              <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="font-medium text-gray-700">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              className={inputStyle("lastName")}
            />
            {errors.lastName && (
              <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
            )}
          </div>

          {/* DOB */}
          <div>
            <label className="font-medium text-gray-700">Date of Birth</label>
            <input
              type="date"
              name="dob"
              value={form.dob}
              onChange={handleChange}
              className={inputStyle("dob")}
            />
            {errors.dob && (
              <p className="text-red-500 text-xs mt-1">{errors.dob}</p>
            )}
            {calculatedAge !== null && (
              <p className="text-[#173151] text-sm mt-1 font-medium">
                Age: {calculatedAge} {calculatedAge === 1 ? 'year' : 'years'} old
              </p>
            )}
          </div>

          {/* Grade */}
          <div>
            <label className="font-medium text-gray-700">Grade</label>
            <input
              type="text"
              name="grade"
              value={form.grade}
              onChange={handleChange}
              className={inputStyle("grade")}
            />
            {errors.grade && (
              <p className="text-red-500 text-xs mt-1">{errors.grade}</p>
            )}
          </div>

          {/* Classroom - Now connected to Classes API */}
          <div>
            <label className="font-medium text-gray-700">
              Classroom (optional)
            </label>
            <select
              name="classroom"
              value={form.classroom}
              onChange={handleChange}
              className={inputStyle("classroom")}
              disabled={loadingClasses}
            >
              <option value="">Select classroom</option>
              {loadingClasses ? (
                <option value="">Loading classes...</option>
              ) : (
                classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Jersey */}
          <div>
            <label className="font-medium text-gray-700">Jersey Size</label>
            <select
              name="jersey"
              value={form.jersey}
              onChange={handleChange}
              className={inputStyle("jersey")}
            >
              <option value="">Select size</option>
              <option value="xs">XS</option>
              <option value="s">S</option>
              <option value="m">M</option>
              <option value="l">L</option>
              <option value="xl">XL</option>
              <option value="xxl">XXL</option>
            </select>
            {errors.jersey && (
              <p className="text-red-500 text-xs mt-1">{errors.jersey}</p>
            )}
          </div>

          {/* Medical */}
          <div className="md:col-span-2">
            <label className="font-medium text-gray-700">
              Medical Conditions
            </label>
            <textarea
              name="medical"
              value={form.medical}
              onChange={handleChange}
              className={inputStyle("medical")}
              rows={3}
            ></textarea>
          </div>

          {/* Afterschool */}
          <div>
            <label className="font-medium text-gray-700">
              Attends Afterschool?
            </label>
            <select
              name="afterschool"
              value={form.afterschool}
              onChange={handleChange}
              className={inputStyle("afterschool")}
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          {/* Emergency Contact Name */}
          <div>
            <label className="font-medium text-gray-700">Emergency Contact Name</label>
            <input
              type="text"
              name="emergencyName"
              value={form.emergencyName}
              onChange={handleChange}
              className={inputStyle("emergencyName")}
              placeholder="Full name"
            />
            {errors.emergencyName && (
              <p className="text-red-500 text-xs mt-1">{errors.emergencyName}</p>
            )}
          </div>

          {/* Emergency Contact Phone */}
          <div>
            <label className="font-medium text-gray-700">Emergency Contact Phone</label>
            <input
              type="tel"
              name="emergencyPhone"
              value={form.emergencyPhone}
              onChange={handleChange}
              className={inputStyle("emergencyPhone")}
              placeholder="+1234567890"
            />
            {errors.emergencyPhone && (
              <p className="text-red-500 text-xs mt-1">{errors.emergencyPhone}</p>
            )}
          </div>

          {/* Emergency Contact Relation */}
          <div>
            <label className="font-medium text-gray-700">Emergency Contact Relation</label>
            <select
              name="emergencyRelation"
              value={form.emergencyRelation}
              onChange={handleChange}
              className={inputStyle("emergencyRelation")}
            >
              <option value="">Select relation</option>
              <option value="Parent">Parent</option>
              <option value="Guardian">Guardian</option>
              <option value="Grandparent">Grandparent</option>
              <option value="Sibling">Sibling</option>
              <option value="Other">Other</option>
            </select>
            {errors.emergencyRelation && (
              <p className="text-red-500 text-xs mt-1">{errors.emergencyRelation}</p>
            )}
          </div>

          {/* Insurance */}
          <div>
            <label className="font-medium text-gray-700">
              Health Insurance # (optional)
            </label>
            <input
              type="text"
              name="insurance"
              value={form.insurance}
              onChange={handleChange}
              className={inputStyle("insurance")}
            />
          </div>

          {/* Hear About Us */}
          <div>
            <label className="font-medium text-gray-700">
              How did you hear about us?
            </label>
            <input
              type="text"
              name="hearAbout"
              value={form.hearAbout}
              onChange={handleChange}
              className={inputStyle("hearAbout")}
            />
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="mt-4 flex gap-4 justify-end">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-200 text-gray-700 px-5 py-2 rounded-xl font-semibold shadow-md hover:bg-gray-300"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-[#173151] text-white px-5 py-2 rounded-xl font-semibold shadow-md hover:bg-[#1f3d67] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Child"}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
