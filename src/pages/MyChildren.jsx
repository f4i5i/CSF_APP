import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  Camera,
  X,
  Loader2,
  AlertTriangle,
  User,
} from "lucide-react";
import toast from "react-hot-toast";
import Header from "../components/Header";
import Footer from "../components/Footer";
import childrenService from "../api/services/children.service";
import { formatGrade, GRADE_OPTIONS } from "../utils/format";

// Calculate age from DOB
function calculateAge(dob) {
  if (!dob) return "";
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

// Empty form state
const emptyForm = {
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
};

export default function MyChildren() {
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedChild, setExpandedChild] = useState(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingChildId, setEditingChildId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteCheckResult, setDeleteCheckResult] = useState(null);
  const [isCheckingDelete, setIsCheckingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch children
  const fetchChildren = async () => {
    try {
      setLoading(true);
      const data = await childrenService.getMy();
      setChildren(data || []);
    } catch (err) {
      console.error("Failed to fetch children:", err);
      toast.error("Failed to load children");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  // Open form for adding
  const handleAdd = () => {
    setForm(emptyForm);
    setEditingChildId(null);
    setProfileImage(null);
    setProfilePreview(null);
    setErrors({});
    setShowForm(true);
  };

  // Open form for editing
  const handleEdit = async (child) => {
    setEditingChildId(child.id);
    setErrors({});
    setProfileImage(null);
    setProfilePreview(child.profile_image_url || null);

    const emergency = child.emergency_contacts?.[0] || {};
    setForm({
      firstName: child.first_name || "",
      lastName: child.last_name || "",
      dob: child.date_of_birth || "",
      grade: child.grade || "",
      classroom: child.classroom || "",
      jersey: child.jersey_size || "",
      medical: child.medical_conditions || "",
      afterschool: child.after_school_attendance ? "yes" : "no",
      emergencyName: emergency.name || "",
      emergencyPhone: emergency.phone || "",
      emergencyRelation: emergency.relation || "",
      insurance: child.health_insurance_number || "",
      hearAbout: child.how_heard_about_us || "",
    });
    setShowForm(true);
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      toast.error("Image must be under 1MB");
      return;
    }
    setProfileImage(file);
    setProfilePreview(URL.createObjectURL(file));
  };

  // Validate form
  const validate = () => {
    const newErrors = {};
    if (!form.firstName.trim()) newErrors.firstName = "Required";
    if (!form.lastName.trim()) newErrors.lastName = "Required";
    if (!form.dob) newErrors.dob = "Required";
    if (!form.emergencyName.trim()) newErrors.emergencyName = "Required";
    if (!form.emergencyPhone.trim()) newErrors.emergencyPhone = "Required";
    if (!form.emergencyRelation) newErrors.emergencyRelation = "Required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form (create or update)
  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);

    const payload = {
      first_name: form.firstName.trim(),
      last_name: form.lastName.trim(),
      date_of_birth: form.dob,
      grade: form.grade || null,
      jersey_size: form.jersey ? form.jersey.toLowerCase() : null,
      medical_conditions: form.medical || null,
      has_no_medical_conditions: !form.medical,
      after_school_attendance: form.afterschool === "yes",
      health_insurance_number: form.insurance || null,
      how_heard_about_us: form.hearAbout || null,
      emergency_contacts: [
        {
          name: form.emergencyName.trim(),
          phone: form.emergencyPhone.trim(),
          relation: form.emergencyRelation || "Parent",
          is_primary: true,
        },
      ],
    };

    try {
      let childId;
      if (editingChildId) {
        await childrenService.update(editingChildId, payload);
        childId = editingChildId;
        toast.success("Child updated!");
      } else {
        const created = await childrenService.create(payload);
        childId = created.id;
        toast.success("Child added!");
      }

      // Upload image if selected
      if (profileImage && childId) {
        try {
          await childrenService.uploadProfileImage(childId, profileImage);
        } catch {
          toast.error("Child saved but image upload failed");
        }
      }

      setShowForm(false);
      setEditingChildId(null);
      fetchChildren();
    } catch (err) {
      console.error("Failed to save child:", err);
      toast.error(err?.response?.data?.detail || "Failed to save child");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pre-check delete
  const handleDeleteClick = async (childId) => {
    setIsCheckingDelete(true);
    setDeleteConfirm(childId);
    setDeleteCheckResult(null);
    try {
      const check = await childrenService.deleteCheck(childId);
      setDeleteCheckResult(check);
    } catch (err) {
      console.error("Failed to check delete:", err);
      // If check fails, still allow showing a basic confirm
      setDeleteCheckResult({ can_delete: true });
    } finally {
      setIsCheckingDelete(false);
    }
  };

  // Delete child
  const handleDelete = async (childId) => {
    setIsDeleting(true);
    try {
      await childrenService.delete(childId);
      toast.success("Child removed");
      setDeleteConfirm(null);
      setDeleteCheckResult(null);
      if (expandedChild === childId) setExpandedChild(null);
      fetchChildren();
    } catch (err) {
      console.error("Failed to delete child:", err);
      toast.error(err?.response?.data?.message || "Failed to remove child");
    } finally {
      setIsDeleting(false);
    }
  };

  const inputClass = (field) =>
    `w-full font-manrope px-3 py-2 text-sm rounded-lg border ${errors[field] ? "border-red-500" : "border-gray-300"} outline-none focus:ring-2 focus:ring-[#F3BC48]/50 focus:border-[#F3BC48]`;

  return (
    <div className="min-h-screen bg-page-gradient flex flex-col">
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 pb-24 sm:pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#173151] font-kollektif">
              My Children
            </h1>
            <p className="text-sm text-[#666D80] font-manrope mt-1">
              Manage your children's profiles
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-[#F3BC48] hover:bg-[#e5a920] text-[#173151] font-semibold font-manrope rounded-lg transition-colors shadow-sm text-sm"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Add Child</span>
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-[#F3BC48]" />
          </div>
        )}

        {/* Empty state */}
        {!loading && children.length === 0 && (
          <div className="text-center py-16 bg-white/60 rounded-2xl border border-gray-100">
            <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-[#173151] font-manrope mb-1">
              No children yet
            </h3>
            <p className="text-sm text-[#666D80] font-manrope mb-4">
              Add your first child to get started
            </p>
            <button
              onClick={handleAdd}
              className="px-6 py-2 bg-[#F3BC48] hover:bg-[#e5a920] text-[#173151] font-semibold font-manrope rounded-lg transition-colors text-sm"
            >
              Add Child
            </button>
          </div>
        )}

        {/* Children list */}
        {!loading && children.length > 0 && (
          <div className="space-y-3">
            {children.map((child) => {
              const isExpanded = expandedChild === child.id;
              const age = calculateAge(child.date_of_birth);
              const emergency = child.emergency_contacts?.[0];

              return (
                <div
                  key={child.id}
                  className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  {/* Child card header */}
                  <div
                    className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                    onClick={() =>
                      setExpandedChild(isExpanded ? null : child.id)
                    }
                  >
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-[#173151]/10 flex items-center justify-center overflow-hidden shrink-0">
                      {child.profile_image_url ? (
                        <img
                          src={child.profile_image_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-[#173151]/40" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[#173151] font-manrope truncate">
                        {child.first_name} {child.last_name}
                      </h3>
                      <p className="text-xs text-[#666D80] font-manrope">
                        {age ? `${age} years old` : ""}
                        {age && child.grade ? " · " : ""}
                        {child.grade ? `Grade ${formatGrade(child.grade)}` : ""}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(child);
                        }}
                        className="p-2 text-[#173151]/60 hover:text-[#173151] hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(child.id);
                        }}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                      {isExpanded ? (
                        <ChevronUp size={18} className="text-[#666D80] ml-1" />
                      ) : (
                        <ChevronDown
                          size={18}
                          className="text-[#666D80] ml-1"
                        />
                      )}
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                        <Detail
                          label="Date of Birth"
                          value={child.date_of_birth}
                        />
                        <Detail
                          label="Grade"
                          value={formatGrade(child.grade)}
                        />
                        <Detail
                          label="Jersey Size"
                          value={child.jersey_size?.toUpperCase()}
                        />
                        <Detail
                          label="After School"
                          value={child.after_school_attendance ? "Yes" : "No"}
                        />
                        <Detail
                          label="Insurance #"
                          value={child.health_insurance_number}
                        />
                        <Detail
                          label="Medical"
                          value={child.medical_conditions || "None"}
                        />
                      </div>
                      {emergency && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs font-semibold text-[#173151] font-manrope mb-1 uppercase tracking-wide">
                            Emergency Contact
                          </p>
                          <p className="text-sm text-[#666D80] font-manrope">
                            {emergency.name} ({emergency.relation}) ·{" "}
                            {emergency.phone}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Delete confirmation */}
                  {deleteConfirm === child.id && (
                    <div className="px-4 pb-4 border-t border-red-100 bg-red-50/50 pt-3">
                      {isCheckingDelete ? (
                        <div className="flex items-center gap-2">
                          <Loader2
                            size={16}
                            className="animate-spin text-gray-500"
                          />
                          <p className="text-sm text-gray-600 font-manrope">
                            Checking...
                          </p>
                        </div>
                      ) : deleteCheckResult && !deleteCheckResult.can_delete ? (
                        <>
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle
                              size={16}
                              className="text-amber-500"
                            />
                            <p className="text-sm text-amber-700 font-manrope font-medium">
                              Cannot remove {child.first_name}
                            </p>
                          </div>
                          <p className="text-xs text-gray-600 font-manrope mb-2">
                            This child has active enrollments that must be
                            cancelled first:
                          </p>
                          <ul className="text-xs text-gray-700 font-manrope mb-3 space-y-1">
                            {deleteCheckResult.active_enrollments?.map((e) => (
                              <li
                                key={e.enrollment_id}
                                className="flex items-center gap-2"
                              >
                                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                                {e.class_name} ({e.status})
                              </li>
                            ))}
                          </ul>
                          {deleteCheckResult.pending_cancellations > 0 && (
                            <p className="text-xs text-gray-600 font-manrope mb-3">
                              {deleteCheckResult.pending_cancellations} pending
                              cancellation request(s) in progress.
                            </p>
                          )}
                          <button
                            onClick={() => {
                              setDeleteConfirm(null);
                              setDeleteCheckResult(null);
                            }}
                            className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-manrope font-medium rounded-lg transition-colors"
                          >
                            OK
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 mb-3">
                            <AlertTriangle size={16} className="text-red-500" />
                            <p className="text-sm text-red-700 font-manrope font-medium">
                              Remove {child.first_name}? This cannot be undone.
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDelete(child.id)}
                              disabled={isDeleting}
                              className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-manrope font-medium rounded-lg disabled:opacity-50 transition-colors"
                            >
                              {isDeleting ? "Removing..." : "Yes, Remove"}
                            </button>
                            <button
                              onClick={() => {
                                setDeleteConfirm(null);
                                setDeleteCheckResult(null);
                              }}
                              className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-manrope font-medium rounded-lg transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-lg font-bold text-[#173151] font-kollektif">
                {editingChildId ? "Edit Child" : "Add Child"}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingChildId(null);
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Profile image */}
              <div className="flex justify-center">
                <div
                  className="relative w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden cursor-pointer border-2 border-dashed border-gray-300 hover:border-[#F3BC48] transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {profilePreview ? (
                    <img
                      src={profilePreview}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera size={24} className="text-gray-400" />
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>
              </div>

              {/* Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 font-manrope mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) =>
                      setForm({ ...form, firstName: e.target.value })
                    }
                    className={inputClass("firstName")}
                    placeholder="First name"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-xs mt-0.5">
                      {errors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 font-manrope mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) =>
                      setForm({ ...form, lastName: e.target.value })
                    }
                    className={inputClass("lastName")}
                    placeholder="Last name"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-xs mt-0.5">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* DOB, Grade, Jersey */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 font-manrope mb-1">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.dob}
                    onChange={(e) => setForm({ ...form, dob: e.target.value })}
                    className={inputClass("dob")}
                  />
                  {errors.dob && (
                    <p className="text-red-500 text-xs mt-0.5">{errors.dob}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 font-manrope mb-1">
                    Grade
                  </label>
                  <select
                    value={form.grade}
                    onChange={(e) =>
                      setForm({ ...form, grade: e.target.value })
                    }
                    className={inputClass("grade")}
                  >
                    <option value="">Select</option>
                    {GRADE_OPTIONS.map((g) => (
                      <option key={g.value} value={g.value}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 font-manrope mb-1">
                    Jersey Size
                  </label>
                  <select
                    value={form.jersey}
                    onChange={(e) =>
                      setForm({ ...form, jersey: e.target.value })
                    }
                    className={inputClass("jersey")}
                  >
                    <option value="">Select</option>
                    {["xs", "s", "m", "l", "xl", "xxl"].map((s) => (
                      <option key={s} value={s}>
                        {s.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Medical & Insurance */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 font-manrope mb-1">
                    Medical Conditions
                  </label>
                  <input
                    type="text"
                    value={form.medical}
                    onChange={(e) =>
                      setForm({ ...form, medical: e.target.value })
                    }
                    className={inputClass("medical")}
                    placeholder="None or describe..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 font-manrope mb-1">
                    Insurance Number
                  </label>
                  <input
                    type="text"
                    value={form.insurance}
                    onChange={(e) =>
                      setForm({ ...form, insurance: e.target.value })
                    }
                    className={inputClass("insurance")}
                    placeholder="Optional"
                  />
                </div>
              </div>

              {/* After school & How heard */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 font-manrope mb-1">
                    After School Attendance
                  </label>
                  <select
                    value={form.afterschool}
                    onChange={(e) =>
                      setForm({ ...form, afterschool: e.target.value })
                    }
                    className={inputClass("afterschool")}
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 font-manrope mb-1">
                    How did you hear about us?
                  </label>
                  <select
                    value={form.hearAbout}
                    onChange={(e) =>
                      setForm({ ...form, hearAbout: e.target.value })
                    }
                    className={inputClass("hearAbout")}
                  >
                    <option value="">Select</option>
                    <option value="friend">Friend/Word of Mouth</option>
                    <option value="social_media">Social Media</option>
                    <option value="school">School</option>
                    <option value="flyer">Flyer</option>
                    <option value="google">Google Search</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Emergency Contact */}
              <div>
                <p className="text-xs font-semibold text-[#173151] font-manrope mb-2 uppercase tracking-wide">
                  Emergency Contact
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 font-manrope mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={form.emergencyName}
                      onChange={(e) =>
                        setForm({ ...form, emergencyName: e.target.value })
                      }
                      className={inputClass("emergencyName")}
                      placeholder="Contact name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 font-manrope mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={form.emergencyPhone}
                      onChange={(e) =>
                        setForm({ ...form, emergencyPhone: e.target.value })
                      }
                      className={inputClass("emergencyPhone")}
                      placeholder="Phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 font-manrope mb-1">
                      Relation
                    </label>
                    <select
                      value={form.emergencyRelation}
                      onChange={(e) =>
                        setForm({ ...form, emergencyRelation: e.target.value })
                      }
                      className={inputClass("emergencyRelation")}
                    >
                      <option value="">Select</option>
                      <option value="Parent">Parent</option>
                      <option value="Guardian">Guardian</option>
                      <option value="Grandparent">Grandparent</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingChildId(null);
                }}
                className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-manrope font-semibold rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-5 py-2 bg-[#F3BC48] hover:bg-[#e5a920] text-[#173151] text-sm font-manrope font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                {isSubmitting
                  ? "Saving..."
                  : editingChildId
                    ? "Save Changes"
                    : "Add Child"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

// Helper component for detail display
function Detail({ label, value }) {
  return (
    <div>
      <p className="text-xs text-[#666D80] font-manrope">{label}</p>
      <p className="text-sm text-[#173151] font-manrope font-medium">
        {value || "—"}
      </p>
    </div>
  );
}
