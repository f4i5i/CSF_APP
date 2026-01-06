import React from "react";
import Sidebar from "../components/Sidebar";
import PaymentCard from "../components/payment/PaymentCard";
import BillingInfo from "../components/payment/BillingInfo";
import MembershipList from "../components/payment/MembershipList";
import InvoiceTable from "../components/payment/InvoiceTable";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Logo from "../components/Logo";
import DottedOverlay from "@/components/DottedOverlay";
const PaymentPage = () => {
  return (
    // <div className="min-h-screen bg-gradient-to-b from-[#f3f6fb] via-[#dee5f2] to-[#c7d3e7] flex flex-col justify-between max-sm:pb-20">
    <div className="min-h-screen bg-page-gradient flex flex-col justify-between ">
        {/* <div className="sm:h-full relative  bg-page-gradient flex flex-col  justify-between  max-sm:justify-start "> */}
                <DottedOverlay className="inset-x-6 inset-y-10 sm:inset-x-0 sm:inset-y-0 max-sm:hidden " />
    
      {/* HEADER */}
     <div className="flex  mr-6 ml-1 mt-5 max-sm:mx-auto w-fluid-avatar-lg h-fluid-avatar-lg items-center max-sm:flex max-sm:justify-center max-sm:items-center">
         <Logo/>
        </div>
       <main className="ww-full  max-sm:px-5 z-50">
           <div className="sm:w-[90%] xl:w-[80%] max-sm:mt-8 flex max-sm:flex-col max-sm:w-full justify-between items-center max-sm:justify-start max-sm:items-start mx-auto">
      <div className="text-lg max-sm:text-3xl font-manrope font-semibold  text-nuetral-200">
        Settings
      </div>
 {/* BUTTONS */}
          <div className="flex justify-end max-sm:mt-6 max-sm:justify-between max-sm:w-full max-sm:flex gap-4 font-manrope ">
            <button className="px-2  text-nuetral-200 font-bold text-sm h-10 max-sm:w-[168px] w-[140px] rounded-full bg-white  hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed">
              Cancel
            </button>
            <button className="px-2 max-sm:w-[168px] font-bold text-sm w-[140px] h-10 text-nuetral-200 rounded-full bg-[#f4b728] hover:bg-[#e5a920] transition disabled:opacity-50 disabled:cursor-not-allowed">
              Save Changes
            </button>
          </div>
          </div>

      {/* MAIN WHITE CONTAINER */}
      <div className="bg-white sm:w-[90%] xl:w-[80%]  max-sm:w-full mx-auto mt-6 rounded-2xl shadow-sm flex flex-col lg:flex-row ">

        {/* LEFT SIDEBAR */}
        <Sidebar />

        {/* RIGHT CONTENT */}
        <div className="flex max-lg:flex-col gap-6 p-6 max-sm:p-1 flex-1">
            <div className="flex flex-col gap-6 w-[40%] max-sm:px-5 max-sm:pt-5 max-sm:w-full">
          <div className="">
            <h2 className="font-semibold text-[#000000] text-lg">Payment</h2>
            <p className="text-sm text-[#666D80] mt-1">
              Manage your payment methods securely. Add, update or remove cards.
            </p>
          </div>

          <div className="max-lg:hidden">
            <h2 className="font-semibold text-[#000000] text-lg">Billing</h2>
            <p className="text-sm text-[#666D80] mt-1">
              Review and update your billing information.
            </p>
          </div>

          <div className="max-lg:hidden">
            <h2 className="font-semibold text-[#000000] text-lg">Memberships</h2>
            <p className="text-sm text-[#666D80] mt-1">
              View all your children's class enrollments and membership details.
            </p>
          </div>

          <div className="max-lg:hidden">
            <h2 className="font-semibold text-[#000000] text-lg">Invoices</h2>
            <p className="text-sm text-[#666D80] mt-1">
              Download and view your payment history and invoices.
            </p>
          </div>
          </div>
          <div className="flex-1">
          <div className="max-sm:border-b border-border-light max-sm:border-gray-200 max-sm:pb-6 max-sm:px-6">
  <PaymentCard />
</div>
 <div className="lg:hidden max-sm:px-5 my-2 max-sm:pt-5 max-sm:w-full">
            <h2 className="font-semibold text-[#000] text-lg">Billing</h2>
            <p className="text-sm text-[#666D80] mt-1">
              Review and update your billing information.
            </p>
          </div>
<div className="max-sm:border-b border-border-light max-sm:border-gray-200 max-sm:py-6  max-sm:px-6">
  <BillingInfo />
</div>

 <div className="lg:hidden max-sm:px-5 max-sm:pt-5 max-sm:w-full">
            <h2 className="font-semibold text-[#000] text-lg">Memberships</h2>
            <p className="text-sm text-[#666D80] mt-1">
              View all your children's class enrollments and membership details.
            </p>
          </div>
<div className="max-sm:border-b border-border-light max-sm:border-gray-200 max-sm:py-6 max-sm:px-6">
  <MembershipList />
</div>

 <div className="lg:hidden max-sm:px-5 max-sm:pt-5 my-3 max-sm:w-full">
            <h2 className="font-semibold text-[#000] text-lg">Invoices</h2>
            <p className="text-sm text-[#666D80] mt-1">
              Download and view your payment history and invoices.
            </p>
          </div>
<div className="max-sm:border-b border-border-light max-sm:border-gray-200 max-sm:py-6 max-sm:px-6">
  <InvoiceTable />
</div>
          </div>
        </div>
      </div>
</main>
      {/* FOOTER */}
     <Footer isFixed={false} />
    </div>
  );
};

export default PaymentPage;
