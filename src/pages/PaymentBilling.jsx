import React from "react";
import Sidebar from "../components/Sidebar";
import PaymentCard from "../components/payment/PaymentCard";
import BillingInfo from "../components/payment/BillingInfo";
import InvoiceTable from "../components/payment/InvoiceTable";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Logo from "../components/Logo";

const PaymentPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f3f6fb] via-[#dee5f2] to-[#c7d3e7] flex flex-col justify-between max-sm:pb-20">
      {/* HEADER */}
     <div className="flex  mr-6 ml-1 mt-5 max-sm:mx-auto w-[64px] h-[62px] items-center max-sm:flex max-sm:justify-center max-sm:items-center">
         <Logo/>
        </div>
       <main className="w-full max-sm:px-4">
           <div className="w-[60%] max-xl:w-[70%]  flex max-sm:flex-col max-sm:w-full justify-between items-center max-sm:justify-start max-sm:items-start mx-auto">
      <div className="px-10 pt-10 max-sm:px-3 max-sm:pt-1 text-[20px] font-manrope font-semibold text-[#0f1d2e]">
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

      {/* MAIN WHITE CONTAINER */}
      <div className="bg-white w-[60%] max-xl:w-[70%]  max-sm:w-full mx-auto mt-6 rounded-2xl shadow-sm flex flex-col lg:flex-row ">

        {/* LEFT SIDEBAR */}
        <Sidebar />

        {/* RIGHT CONTENT */}
        <div className="flex max-sm:flex-col gap-6 p-6 max-sm:p-1">
            <div className="flex flex-col gap-6 w-[40%] max-sm:px-5 max-sm:pt-5 max-sm:w-full">
          <div className="">
            <h2 className="font-semibold text-[#000000] text-lg">Payment</h2>
            <p className="text-sm text-[#666D80] mt-1">
              Manage your payment methods securely. Add, update or remove cards.
            </p>
          </div>

         

          <div className="max-sm:hidden">
            <h2 className="font-semibold text-[#000000] text-lg">Billing</h2>
            <p className="text-sm text-[#666D80] mt-1">
              Review and update your billing information.
            </p>
          </div>
          </div>
          <div>
          <div className="max-sm:border-b max-sm:border-gray-200 max-sm:pb-6 max-sm:px-6">
  <PaymentCard />
</div>
 <div className="sm:hidden max-sm:px-5 max-sm:pt-5 max-sm:w-full">
            <h2 className="font-semibold text-[#000] text-lg">Billing</h2>
            <p className="text-sm text-[#666D80] mt-1">
              Review and update your billing information.
            </p>
          </div>
<div className="max-sm:border-b max-sm:border-gray-200 max-sm:py-6  max-sm:px-6">
 
  <BillingInfo />
</div>

<div className="max-sm:border-b max-sm:border-gray-200 max-sm:py-6  max-sm:px-6">
  <InvoiceTable />
</div>
          </div>
        </div>
      </div>
</main>
      {/* FOOTER */}
     <Footer/>
    </div>
  );
};

export default PaymentPage;
