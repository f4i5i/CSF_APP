import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";
import Logo from "../components/Logo";
import { useAuth } from "../context/auth";
import usersService from "../api/services/users.service";
import toast from "react-hot-toast";
import DottedOverlay from "@/components/DottedOverlay";

export default function Settings() {
  const { user, updateUser } = useAuth();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Determine active section based on route
  const isPasswordSection = location.pathname.includes("/password");

  // Load user data when component mounts or user changes
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedUser = await usersService.update(formData);
      updateUser(updatedUser); // Update user in auth context
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original user data
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
    // Reset password form
    setPasswordData({
      current_password: "",
      new_password: "",
      confirm_password: "",
    });
    toast.success("Changes cancelled");
  };

  // Password form handlers
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();

    // Validate passwords match
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error("New passwords do not match");
      return;
    }

    // Validate password strength
    if (passwordData.new_password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (!/[A-Z]/.test(passwordData.new_password)) {
      toast.error("Password must contain at least one uppercase letter");
      return;
    }

    if (!/[a-z]/.test(passwordData.new_password)) {
      toast.error("Password must contain at least one lowercase letter");
      return;
    }

    if (!/[0-9]/.test(passwordData.new_password)) {
      toast.error("Password must contain at least one number");
      return;
    }

    setLoading(true);

    try {
      await usersService.changePassword(passwordData);
      toast.success("Password changed successfully!");
      // Reset form
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (error) {
      console.error("Failed to change password:", error);
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || "Failed to change password";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { key: "account", label: "My Account" },
    { key: "payment", label: "Payment & Billing" },
    { key: "password", label: "Password" },
    { key: "badges", label: "Badges" },
    { key: "contact", label: "Contact" },
    { key: "logout", label: "Log out", isDanger: true },
  ];

  return (
    // <div className="min-h-screen  bg-gradient-to-b from-[#f3f6fb] via-[#dee5f2] to-[#c7d3e7] flex flex-col  justify-between  max-sm:justify-start max-sm:pb-20">
    <div className="sm:h-full relative  bg-page-gradient flex flex-col  justify-between  max-sm:justify-start ">
            <DottedOverlay className="inset-x-6 inset-y-10 sm:inset-x-0 sm:inset-y-0 max-sm:hidden " />

     <div className="flex  mr-6 ml-1 mt-5 max-sm:mx-auto w-fluid-avatar-lg h-fluid-avatar-lg items-center max-sm:flex max-sm:justify-center max-sm:items-center">
         <Logo/>
        </div>
      {/* PAGE HEADER */}
      <main className="w-full  max-sm:px-5 z-50">
        <div className="w-[60%] max-xl:w-[75%] max-sm:mt-8 flex max-sm:flex-col max-sm:w-full justify-between items-center max-sm:justify-start max-sm:items-start mx-auto">
      <div className="text-lg max-sm:text-3xl font-manrope font-semibold  text-nuetral-200">
        Settings
      </div>
 {/* BUTTONS */}
          <div className="flex justify-end max-sm:mt-6 max-sm:justify-between max-sm:w-full max-sm:flex gap-4 font-manrope ">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="px-2  text-nuetral-200 font-bold text-sm h-10 max-sm:w-[168px] w-[140px] rounded-full bg-white  hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              form={isPasswordSection ? "password-form" : "profile-form"}
              disabled={loading}
              className="px-2 max-sm:w-[168px] font-bold text-sm w-[140px] h-10 text-nuetral-200 rounded-full bg-[#f4b728] hover:bg-[#e5a920] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : isPasswordSection ? "Update Password" : "Save Changes"}
            </button>
          </div>
          </div>
      {/* CONTENT BOX */}
      <div className="mt-6 mx-auto max-xl:w-[75%] w-[60%] max-sm:w-full  bg-white rounded-3xl shadow-sm flex max-sm:flex-col overflow-hidden border-solid-border-light ">
        
        {/* LEFT SIDEBAR */}
       <Sidebar/>

        {/* RIGHT FORM SECTION */}
        <div className="flex max-lg:flex-col gap-4 sm:gap-10 justify-between w-full p-6 max-sm:p-6 max-sm:border-t">
          <div className="md:w-[40%] max-lg:w-full">
            <h2 className="text-fluid-md font-semibold text-[#000]">
              {isPasswordSection ? "Change Password" : "Account Setting"}
            </h2>
            <p className="text-sm max-sm:w-full text-text-muted leading-[150%] mt-1 max-sm:mb-2">
              {isPasswordSection
                ? "Update your password to keep your account secure."
                : "View and update your account details, profile, and more."}
            </p>
          </div>

          {/* Profile Form */}
          {!isPasswordSection && (
            <form id="profile-form" onSubmit={handleSave} className="space-y-4 w-full">
              <div>
                <label className="text-sm font-medium text-text-muted">
                  First Name <span className="text-[#DF1C41]">*</span>
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="mt-2 w-full border text-nuetral-200 placeholder-nuetral-200 font-medium rounded-xl px-4 py-3 bg-white outline-none border-border-light focus:ring-2 focus:ring-[#f4b728] disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter your first name"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-text-muted">
                  Last Name <span className="text-[#DF1C41]">*</span>
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="mt-2 w-full border text-nuetral-200 placeholder-nuetral-200 font-medium rounded-xl px-4 py-3 bg-white outline-none border-border-light focus:ring-2 focus:ring-[#f4b728] disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter your last name"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-text-muted">
                  Email Address <span className="text-[#DF1C41]">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="mt-2 w-full border text-nuetral-200 placeholder-nuetral-200 font-medium rounded-xl px-4 py-3 bg-white outline-none border-border-light focus:ring-2 focus:ring-[#f4b728] disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-text-muted">
                  Phone Number (optional)
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-2 w-full border text-nuetral-200 placeholder-nuetral-200 font-medium rounded-xl px-4 py-3 bg-white outline-none border-border-light focus:ring-2 focus:ring-[#f4b728] disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="+1 (212) 555 4567"
                />
              </div>
            </form>
          )}

          {/* Password Form */}
          {isPasswordSection && (
            <form id="password-form" onSubmit={handlePasswordSave} className="space-y-4 w-full">
              <div>
                <label className="text-sm font-medium text-text-muted">
                  Current Password <span className="text-[#DF1C41]">*</span>
                </label>
                <div className="relative mt-2">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    name="current_password"
                    value={passwordData.current_password}
                    onChange={handlePasswordChange}
                    required
                    disabled={loading}
                    className="w-full border text-nuetral-200 placeholder-nuetral-200 font-medium rounded-xl px-4 py-3 pr-12 bg-white outline-none border-border-light focus:ring-2 focus:ring-[#f4b728] disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("current")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-text-muted">
                  New Password <span className="text-[#DF1C41]">*</span>
                </label>
                <div className="relative mt-2">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    name="new_password"
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    required
                    disabled={loading}
                    className="w-full border text-nuetral-200 placeholder-nuetral-200 font-medium rounded-xl px-4 py-3 pr-12 bg-white outline-none border-border-light focus:ring-2 focus:ring-[#f4b728] disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("new")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Must be at least 8 characters with uppercase, lowercase, and number
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-text-muted">
                  Confirm New Password <span className="text-[#DF1C41]">*</span>
                </label>
                <div className="relative mt-2">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    name="confirm_password"
                    value={passwordData.confirm_password}
                    onChange={handlePasswordChange}
                    required
                    disabled={loading}
                    className="w-full border text-nuetral-200 placeholder-nuetral-200 font-medium rounded-xl px-4 py-3 pr-12 bg-white outline-none border-border-light focus:ring-2 focus:ring-[#f4b728] disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("confirm")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
      </main>
      <Footer isFixed={false} /> 
    </div>
  );
}
