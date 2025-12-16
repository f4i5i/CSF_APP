import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";
import Logo from "../components/Logo";
import { useAuth } from "../context/auth";
import usersService from "../api/services/users.service";
import toast from "react-hot-toast";

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });

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
    toast.success("Changes cancelled");
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
    <div className="min-h-screen  bg-gradient-to-b from-[#f3f6fb] via-[#dee5f2] to-[#c7d3e7] flex flex-col  justify-between  max-sm:justify-start max-sm:pb-20">
     <div className="flex  mr-6 ml-1 mt-5 max-sm:mx-auto w-fluid-avatar-lg h-fluid-avatar-lg items-center max-sm:flex max-sm:justify-center max-sm:items-center">
         <Logo/>
        </div>
      {/* PAGE HEADER */}
      <main className="w-full  max-sm:px-4 ">
        <div className="w-[60%] max-xl:w-[70%] flex max-sm:flex-col max-sm:w-full justify-between items-center max-sm:justify-start max-sm:items-start mx-auto">
      <div className="px-10 pt-10  max-sm:px-3 max-sm:pt-1 text-fluid-lg font-manrope font-semibold text-[#0f1d2e]">
        Settings
      </div>
 {/* BUTTONS */}
          <div className="flex justify-end max-sm:justify-between max-sm:px-3 max-sm:w-full max-sm:flex max-sm:mt-4 gap-4 mt-10">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="px-6 py-3 text-[#0D0D12] max-sm:w-[168px] rounded-full bg-white border hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="profile-form"
              disabled={loading}
              className="px-6 py-3 max-sm:w-[168px] text-[#0D0D12] rounded-full bg-[#f4b728] hover:bg-[#e5a920] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
          </div>
      {/* CONTENT BOX */}
      <div className="mt-6 mx-auto max-xl:w-[70%] w-[60%] max-sm:w-full  bg-white rounded-3xl shadow-sm flex max-sm:flex-col overflow-hidden">
        
        {/* LEFT SIDEBAR */}
       <Sidebar/>

        {/* RIGHT FORM SECTION */}
        <div className="flex max-sm:flex-col gap-4 p-10 max-sm:p-6">
            <div className="w-[35%] max-sm:w-full">
          <h2 className="text-fluid-md font-semibold text-[#000]">
            Account Setting
          </h2>

          <p className="text-sm max-sm:w-full text-[#666D80] mt-1 mb-8 max-sm:mb-2">
            View and update your account details, profile, and more.
          </p>
</div>
          <form id="profile-form" onSubmit={handleSave} className="space-y-6">

            <div>
              <label className="text-sm font-medium text-[#666D80]">
                First Name *
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                disabled={loading}
                className="mt-2 w-full border text-[#0D0D12] rounded-lg px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-[#f4b728] disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Enter your first name"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#666D80]">
                Last Name *
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                disabled={loading}
                className="mt-2 w-full border text-[#0D0D12] rounded-lg px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-[#f4b728] disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Enter your last name"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#666D80]">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
                className="mt-2 w-full border text-[#0D0D12] rounded-lg px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-[#f4b728] disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#666D80]">
                Phone Number (optional)
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={loading}
                className="mt-2 w-full text-[#0D0D12] border rounded-lg px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-[#f4b728] disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="+1 (212) 555 4567"
              />
            </div>
          </form>
        </div>
      </div>
      </main>
      <Footer/> 
    </div>
  );
}
