/**
 * Invoices Management Page
 * Admin page for managing invoices
 */

import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, Mail, CheckCircle } from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import FilterBar from '../../components/admin/FilterBar';
import ordersService from '../../api/services/orders.service';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchInvoices();
  }, [currentPage, statusFilter, searchQuery, dateFrom, dateTo]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      // Fetch orders which contain invoice data
      const response = await ordersService.getAll({
        page: currentPage,
        limit: itemsPerPage,
        status: statusFilter,
        search: searchQuery,
        date_from: dateFrom,
        date_to: dateTo,
      });
      setInvoices(response.data || response);
      setTotalItems(response.total || response.length);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (orderId) => {
    try {
      const response = await ordersService.downloadInvoice(orderId);
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to download invoice:', error);
      alert('Failed to download invoice');
    }
  };

  const handleResendInvoice = async (orderId) => {
    try {
      await ordersService.resendConfirmation(orderId);
      alert('Invoice email sent successfully');
    } catch (error) {
      console.error('Failed to resend invoice:', error);
      alert('Failed to resend invoice');
    }
  };

  const columns = [
    {
      key: 'order_number',
      label: 'Invoice #',
      sortable: true,
      render: (value) => (
        <span className="font-mono font-semibold text-[#173151]">INV-{value}</span>
      ),
    },
    {
      key: 'created_at',
      label: 'Date',
      type: 'date',
      sortable: true,
    },
    {
      key: 'user',
      label: 'Customer',
      render: (value, row) => (
        <div>
          <p className="font-semibold text-[#173151]">
            {row.user?.first_name} {row.user?.last_name}
          </p>
          <p className="text-xs text-gray-500">{row.user?.email}</p>
        </div>
      ),
    },
    {
      key: 'order_id',
      label: 'Order #',
      render: (value, row) => (
        <span className="font-mono text-sm text-gray-600">{row.order_number}</span>
      ),
    },
    {
      key: 'total',
      label: 'Amount',
      type: 'currency',
      sortable: true,
      align: 'right',
    },
    {
      key: 'payment_status',
      label: 'Status',
      render: (value) => {
        const statusMap = {
          paid: { label: 'Paid', color: 'green' },
          pending: { label: 'Pending', color: 'yellow' },
          failed: { label: 'Failed', color: 'red' },
          voided: { label: 'Voided', color: 'gray' },
        };
        const status = statusMap[value] || statusMap.pending;
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold bg-${status.color}-100 text-${status.color}-800`}>
            {status.label}
          </span>
        );
      },
    },
    {
      key: 'invoice_sent',
      label: 'Sent',
      render: (value) => (
        <span className="text-xs text-gray-500">{value ? 'Yes' : 'No'}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      type: 'actions',
      align: 'right',
      actions: (row) => [
        {
          label: 'View Invoice',
          icon: Eye,
          onClick: () => alert(`View invoice for order ${row.id}`),
        },
        {
          label: 'Download PDF',
          icon: Download,
          onClick: () => handleDownloadInvoice(row.id),
        },
        {
          label: 'Resend Email',
          icon: Mail,
          onClick: () => handleResendInvoice(row.id),
        },
        {
          label: 'Mark as Paid',
          icon: CheckCircle,
          onClick: () => alert('Mark as paid'),
          disabled: row.payment_status === 'paid',
        },
      ],
    },
  ];

  const filters = [
    {
      type: 'select',
      placeholder: 'All Statuses',
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
        { value: 'paid', label: 'Paid' },
        { value: 'pending', label: 'Pending' },
        { value: 'failed', label: 'Failed' },
      ],
    },
    {
      type: 'daterange',
      startValue: dateFrom,
      endValue: dateTo,
      onStartChange: setDateFrom,
      onEndChange: setDateTo,
    },
  ];

  const hasActiveFilters = statusFilter || searchQuery || dateFrom || dateTo;
  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  const totalAmount = invoices
    .filter((i) => i.payment_status === 'paid')
    .reduce((sum, i) => sum + parseFloat(i.total || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#173151] font-manrope">
                Invoices Management
              </h1>
              <p className="text-gray-600 font-manrope mt-1">
                View and manage all invoices
              </p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-[140px]">
              <p className="text-sm text-gray-600 font-manrope">Total Invoiced</p>
              <p className="text-2xl font-bold text-[#173151] font-manrope mt-1">
                ${totalAmount.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <FilterBar
          searchValue={searchQuery}
          searchPlaceholder="Search by invoice #, customer name, or order #..."
          onSearch={setSearchQuery}
          filters={filters}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
        />

        <DataTable
          columns={columns}
          data={invoices}
          loading={loading}
          emptyMessage="No invoices found"
          pagination={true}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
