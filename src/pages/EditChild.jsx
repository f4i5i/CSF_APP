import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Camera, X, Loader2 } from "lucide-react";
import childrenService from "../api/services/children.service";
import Logo from "../components/Logo";

export default function EditChild() {
  const navigate = useNavigate();
  const { childId } = useParams();
  const [loading, setLoading] = useState(true);
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

  // Profile image state
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const fileInputRef = useRef(null);

  // Fetch existing child data
  useEffect(() => {
    const fetchChild = async () => {
      try {
        setLoading(true);
        const child = await childrenService.getById(childId);

        // Map API fields to form fields
        const emergencyContact = child.emergency_contacts?.[0] || {};

        setForm({
          firstName: child.first_name || "",
          lastName: child.last_name || "",
          dob: child.date_of_birth ? child.date_of_birth.split("T")[0] : "",
          grade: child.grade || "",
          classroom: child.classroom || "",
          jersey: child.jersey_size || "",
          medical: child.medical_conditions || "",
          afterschool: child.after_school_attendance ? "yes" : "no",
          emergencyName: emergencyContact.name || "",
          emergencyPhone: emergencyContact.phone || "",
          emergencyRelation: emergencyContact.relation || emergencyContact.relationship || "",
          insurance: child.health_insurance_number || "",
          hearAbout: child.how_heard_about_us || "",
        });

        if (child.profile_image_url) {
          setExistingImageUrl(child.profile_image_url);
          setProfileImagePreview(child.profile_image_url);
        }
      } catch (error) {
        console.error("Failed to fetch child:", error);
        toast.error("Failed to load child data");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    if (childId) {
      fetchChild();
    }
  }, [childId, navigate]);

  // Calculate age from DOB
  useEffect(() => {
    if (form.dob) {
      const today = new Date();
      const birthDate = new Date(form.dob);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      setCalculatedAge(age);
    } else {
      setCalculatedAge(null);
    }
  }, [form.dob]);

  const validate = () => {
    let newErrors = {};
    if (!form.firstName.trim()) newErrors.firstName = "First name is required.";
    if (!form.lastName.trim()) newErrors.lastName = "Last name is required.";
    if (!form.dob) newErrors.dob = "Date of birth is required.";
    if (!form.grade) newErrors.grade = "Grade is required.";
    if (!form.jersey) newErrors.jersey = "Select a jersey size.";
    if (!form.emergencyName.trim()) newErrors.emergencyName = "Emergency contact name is required.";
    if (!form.emergencyPhone.trim()) newErrors.emergencyPhone = "Emergency contact phone is required.";
    if (!form.emergencyRelation.trim()) newErrors.emergencyRelation = "Emergency contact relation is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      if (file.size > 1 * 1024 * 1024) {
        toast.error("Image must be less than 1MB");
        return;
      }
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        if (img.width > 400 || img.height > 400) {
          toast.error(`Image must be max 400x400 pixels. Your image is ${img.width}x${img.height}`);
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }
        setProfileImage(file);
        setProfileImagePreview(URL.createObjectURL(file));
        setExistingImageUrl(null);
      };
      img.onerror = () => toast.error("Failed to load image");
      img.src = URL.createObjectURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    setProfileImagePreview(null);
    setExistingImageUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const childData = {
        first_name: form.firstName,
        last_name: form.lastName,
        date_of_birth: form.dob,
        grade: form.grade,
        jersey_size: form.jersey.toLowerCase(),
        medical_conditions: form.medical || null,
        has_no_medical_conditions: !form.medical,
        after_school_attendance: form.afterschool === "yes",
        after_school_program: form.afterschool === "yes" ? "Default Program" : null,
        health_insurance_number: form.insurance || null,
        how_heard_about_us: form.hearAbout || null,
        emergency_contacts: form.emergencyName
          ? [
              {
                name: form.emergencyName,
                relation: form.emergencyRelation,
                phone: form.emergencyPhone,
                is_primary: true,
              },
            ]
          : [],
      };

      await childrenService.update(childId, childData);

      // Upload new profile image if selected
      if (profileImage) {
        try {
          await childrenService.uploadProfileImage(childId, profileImage);
        } catch (imgError) {
          console.error("Failed to upload profile image:", imgError);
          toast.error("Child updated but profile image upload failed");
        }
      }

      toast.success("Child updated successfully!");
      navigate(-1);
    } catch (error) {
      console.error("Failed to update child:", error);

      if (error.response?.data?.detail && Array.isArray(error.response.data.detail)) {
        const validationErrors = {};
        const errorMessages = [];
        error.response.data.detail.forEach((err) => {
          const field = err.loc[err.loc.length - 1];
          const message = err.msg;
          const fieldMap = {
            first_name: "firstName",
            last_name: "lastName",
            date_of_birth: "dob",
            jersey_size: "jersey",
            name: "emergencyName",
            phone: "emergencyPhone",
            relation: "emergencyRelation",
            how_heard_about_us: "hearAbout",
          };
          const formField = fieldMap[field] || field;
          validationErrors[formField] = message;
          errorMessages.push(`${field.replace(/_/g, " ")}: ${message}`);
        });
        setErrors(validationErrors);
        const errorSummary = errorMessages.join(". ");
        toast.error(`Validation failed: ${errorSummary}`);
        setSubmitError(`Please fix the following errors: ${errorSummary}`);
      } else {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to update child. Please try again.";
        toast.error(errorMessage);
        setSubmitError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = (field) =>
    `w-full mt-1 p-2 sm:p-3 text-sm sm:text-base border rounded-xl focus:ring-2 focus:ring-[#173151] bg-gray-50
     ${errors[field] ? "border-red-500" : "border-gray-300"}`;

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#F3BC48]" />
          <span className="text-gray-600 font-manrope text-lg">Loading child data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col items-center relative">
      <div className="absolute inset-0 bg-[radial-gradient(#a1acc7_1px,transparent_1px)] [background-size:18px_18px] opacity-70 pointer-events-none"></div>

      <div className="w-full text-center mt-6 sm:mt-8 px-4 z-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[62px] font-bold text-[#173151] font-kollektif drop-shadow-lg">
          CSF School Academy
        </h1>
      </div>

      <div className="z-10 flex-1 w-full flex justify-center items-center px-4 sm:px-6 py-8">
        <div className="bg-white shadow-2xl rounded-2xl sm:rounded-3xl px-4 sm:px-6 md:px-8 py-4 sm:py-5 w-full max-w-md sm:max-w-2xl md:max-w-4xl">
          <div className="text-center mb-6 flex flex-col items-center gap-2">
            <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
              <Logo />
            </div>
            <h2 className="text-2xl font-semibold text-[#0f172a]">Edit Child</h2>
            <p className="text-gray-500 mt-1">Update your child's information</p>
          </div>

          {submitError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{submitError}</p>
            </div>
          )}

          {/* Profile Image Upload */}
          <div className="flex flex-col items-center mb-6">
            <span className="font-medium text-gray-700 mb-2">Profile Photo (Optional)</span>
            {profileImagePreview ? (
              <div className="relative">
                <img
                  src={profileImagePreview}
                  alt="Profile preview"
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-[#173151]"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-[#173151] transition-colors">
                <Camera size={24} className="text-gray-400 mb-1" />
                <span className="text-xs text-gray-500">Add Photo</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleImageSelect}
                  className="sr-only"
                />
              </label>
            )}
            <p className="text-xs text-gray-500 mt-2">Max 400x400 pixels, max 1MB</p>
          </div>

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
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
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
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
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
              {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob}</p>}
              {calculatedAge !== null && (
                <p className="text-[#173151] text-sm mt-1 font-medium">
                  Age: {calculatedAge} {calculatedAge === 1 ? "year" : "years"} old
                </p>
              )}
            </div>

            {/* Grade */}
            <div>
              <label className="font-medium text-gray-700">Grade</label>
              <select
                name="grade"
                value={form.grade}
                onChange={handleChange}
                className={inputStyle("grade")}
              >
                <option value="">Select grade</option>
                <option value="K">K</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
              {errors.grade && <p className="text-red-500 text-xs mt-1">{errors.grade}</p>}
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
              {errors.jersey && <p className="text-red-500 text-xs mt-1">{errors.jersey}</p>}
            </div>

            {/* Afterschool */}
            <div>
              <label className="font-medium text-gray-700">Attends Afterschool?</label>
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

            {/* Medical */}
            <div className="md:col-span-2">
              <label className="font-medium text-gray-700">Medical Conditions</label>
              <textarea
                name="medical"
                value={form.medical}
                onChange={handleChange}
                className={inputStyle("medical")}
                rows={3}
              ></textarea>
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
              {errors.emergencyName && <p className="text-red-500 text-xs mt-1">{errors.emergencyName}</p>}
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
              {errors.emergencyPhone && <p className="text-red-500 text-xs mt-1">{errors.emergencyPhone}</p>}
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
              {errors.emergencyRelation && <p className="text-red-500 text-xs mt-1">{errors.emergencyRelation}</p>}
            </div>

            {/* Insurance */}
            <div>
              <label className="font-medium text-gray-700">Health Insurance # (optional)</label>
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
              <label className="font-medium text-gray-700">How did you hear about us?</label>
              <select
                name="hearAbout"
                value={form.hearAbout}
                onChange={handleChange}
                className={inputStyle("hearAbout")}
              >
                <option value="">Select an option</option>
                <option value="friend">Friend/Word of Mouth</option>
                <option value="social_media">Social Media (Facebook, Instagram, etc.)</option>
                <option value="school">School</option>
                <option value="flyer">Flyer</option>
                <option value="google">Google Search</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4 items-center sm:justify-end">
            <button
              onClick={handleSubmit}
              className="bg-[#F3BC48] text-[#173151] px-4 sm:px-5 py-2 text-sm sm:text-base rounded-xl font-semibold shadow-md hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-200 text-gray-700 px-4 sm:px-5 py-2 text-sm sm:text-base rounded-xl font-semibold shadow-md hover:bg-gray-300 w-full sm:w-auto"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <footer className="z-10 w-full py-2 bg-transparent">
        <div className="w-full flex flex-row max-sm:flex max-sm:flex-col-reverse max-sm:gap-2 items-center justify-between px-4 sm:px-10 text-[#000] text-xs sm:text-sm">
          <p className="text-center text-[#000] sm:text-left font-['inter'] font-normal text-sm mb-2 sm:mb-0">
            &copy; 2025 Carolina Soccer Factory. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
