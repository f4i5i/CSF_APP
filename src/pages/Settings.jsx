import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";
import Logo from "../components/Logo";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("payment");

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
     <div className="flex  mr-6 ml-1 mt-5 max-sm:mx-auto w-[64px] h-[62px] items-center max-sm:flex max-sm:justify-center max-sm:items-center">
         <Logo/>
        </div>
      {/* PAGE HEADER */}
      <main className="w-full  max-sm:px-4 ">
        <div className="w-[60%] max-xl:w-[70%] flex max-sm:flex-col max-sm:w-full justify-between items-center max-sm:justify-start max-sm:items-start mx-auto">
      <div className="px-10 pt-10  max-sm:px-3 max-sm:pt-1 text-[20px] font-manrope font-semibold text-[#0f1d2e]">
        Settings
      </div>
 {/* BUTTONS */}
          <div className="flex justify-end max-sm:justify-between max-sm:px-3 max-sm:w-full max-sm:flex max-sm:mt-4 gap-4 mt-10">
            <button className="px-6 py-3 max-sm:w-[168px] rounded-full bg-white border">
              Cancel
            </button>
            <button className="px-6 py-3 max-sm:w-[168px]  rounded-full bg-[#f4b728] text-white">
              Save Changes
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
          <h2 className="text-[18px] font-semibold text-[#0f1d2e]">
            Account Setting
          </h2>

          <p className="text-sm max-sm:w-full text-gray-500 mt-1 mb-8 max-sm:mb-2">
            View and update your account details, profile, and more.
          </p>
</div>
          <form className="space-y-6">

            <div>
              <label className="text-sm font-medium text-[#1d3557]">
                Full Name *
              </label>
              <input
                type="text"
                defaultValue="Robert Johnson"
                className="mt-2 w-full border rounded-lg px-4 py-3 bg-white outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#1d3557]">
                Email Address *
              </label>
              <input
                type="email"
                defaultValue="robertjohnson@gmail.com"
                className="mt-2 w-full border rounded-lg px-4 py-3 bg-white outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#1d3557]">
                Phone Number (optional)
              </label>
              <input
                type="text"
                defaultValue="+1 (212) 555 4567"
                className="mt-2 w-full border rounded-lg px-4 py-3 bg-white outline-none"
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
