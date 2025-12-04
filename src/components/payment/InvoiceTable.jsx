import React from "react";

const InvoiceTable = () => {
  return (
    <div className="border rounded-xl p-4 overflow-x-auto">
      <table className="w-full text-sm ">
        <thead className="text-gray-500 border-[#dfe1e7] rounded-3xl bg-[#F6F8FA]">
          <tr>
            <th className="py-2">Invoice #</th>
            <th>Date</th>
            <th>Plan</th>
            <th>Amount</th>
          </tr>
        </thead>

        <tbody>
          <tr className="border-t">
            <td className="py-3 font-medium">#018298</td>
            <td>Jan 20, 2025</td>
            <td>Pro Plan</td>
            <td>$79</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default InvoiceTable;
