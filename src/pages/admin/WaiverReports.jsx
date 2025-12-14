/**
 * WaiverReports - Admin page for viewing waiver acceptance reports
 * Shows who has signed which waivers, with filters and export
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Download,
  FileText,
  Search,
  Filter,
  Users,
  BarChart3,
  Calendar,
  Globe,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useApi } from '../../hooks';
import waiversService from '../../api/services/waivers.service';

const WaiverReports = () => {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [versionFilter, setVersionFilter] = useState('all');

  // Fetch all waiver templates
  const {
    data: templates = [],
    loading: loadingTemplates,
  } = useApi(
    () => waiversService.getTemplates({ include_inactive: true }),
    {
      initialData: [],
      transform: (data) => data?.items || data || [],
    }
  );

  // Fetch acceptances
  const {
    data: acceptancesData,
    loading: loadingAcceptances,
    refetch,
  } = useApi(
    () => waiversService.getAcceptances({
      template_id: selectedTemplate || undefined,
    }),
    {
      initialData: { items: [], total: 0 },
      dependencies: [selectedTemplate],
    }
  );

  const acceptances = acceptancesData?.items || [];
  const total = acceptancesData?.total || 0;

  // Filter acceptances
  const filteredAcceptances = useMemo(() => {
    let filtered = acceptances;

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((acc) => {
        const userName = `${acc.user?.first_name || ''} ${acc.user?.last_name || ''}`.toLowerCase();
        const email = acc.user?.email?.toLowerCase() || '';
        const signerName = acc.signer_name?.toLowerCase() || '';
        return userName.includes(searchLower) || email.includes(searchLower) || signerName.includes(searchLower);
      });
    }

    // Version filter
    if (versionFilter !== 'all') {
      const version = parseInt(versionFilter, 10);
      filtered = filtered.filter((acc) => acc.waiver_version === version);
    }

    return filtered;
  }, [acceptances, searchTerm, versionFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const byTemplate = {};
    const byVersion = {};
    const byDate = {};

    acceptances.forEach((acc) => {
      const templateName = acc.waiver_template?.name || 'Unknown';
      const version = acc.waiver_version || 1;
      const date = new Date(acc.accepted_at).toLocaleDateString();

      byTemplate[templateName] = (byTemplate[templateName] || 0) + 1;
      byVersion[version] = (byVersion[version] || 0) + 1;
      byDate[date] = (byDate[date] || 0) + 1;
    });

    return { byTemplate, byVersion, byDate };
  }, [acceptances]);

  // Get unique versions for filter
  const availableVersions = useMemo(() => {
    const versions = new Set();
    acceptances.forEach((acc) => {
      versions.add(acc.waiver_version || 1);
    });
    return Array.from(versions).sort((a, b) => b - a);
  }, [acceptances]);

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredAcceptances.length === 0) {
      toast.error('No data to export');
      return;
    }

    const csvHeaders = [
      'User Name',
      'User Email',
      'Signer Name',
      'Waiver Template',
      'Waiver Type',
      'Version',
      'Accepted At',
      'IP Address',
      'User Agent',
    ];

    const csvRows = filteredAcceptances.map((acc) => [
      `${acc.user?.first_name || ''} ${acc.user?.last_name || ''}`.trim(),
      acc.user?.email || '',
      acc.signer_name || '',
      acc.waiver_template?.name || '',
      acc.waiver_template?.waiver_type || '',
      acc.waiver_version || 1,
      new Date(acc.accepted_at).toLocaleString(),
      acc.signer_ip || '',
      acc.signer_user_agent || '',
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `waiver-acceptances-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Exported successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#173151]">
                Waiver Reports
              </h1>
              <p className="text-gray-600 mt-2">
                View and analyze waiver acceptances
              </p>
            </div>
            <button
              onClick={handleExportCSV}
              disabled={filteredAcceptances.length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-5 h-5" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 rounded-full p-3">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Acceptances</p>
                <p className="text-2xl font-bold text-[#173151]">{total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 rounded-full p-3">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Unique Users</p>
                <p className="text-2xl font-bold text-[#173151]">
                  {new Set(acceptances.map((a) => a.user_id)).size}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 rounded-full p-3">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Templates</p>
                <p className="text-2xl font-bold text-[#173151]">
                  {Object.keys(stats.byTemplate).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 rounded-full p-3">
                <Globe className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Versions</p>
                <p className="text-2xl font-bold text-[#173151]">
                  {Object.keys(stats.byVersion).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Template Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="w-4 h-4 inline mr-1" />
                Filter by Template
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#173151] outline-none"
              >
                <option value="">All Templates</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} (v{template.version})
                  </option>
                ))}
              </select>
            </div>

            {/* Version Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <BarChart3 className="w-4 h-4 inline mr-1" />
                Filter by Version
              </label>
              <select
                value={versionFilter}
                onChange={(e) => setVersionFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#173151] outline-none"
              >
                <option value="all">All Versions</option>
                {availableVersions.map((version) => (
                  <option key={version} value={version}>
                    Version {version}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="w-4 h-4 inline mr-1" />
                Search Users
              </label>
              <input
                type="text"
                placeholder="Name, email, or signer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#173151] outline-none"
              />
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredAcceptances.length} of {total} acceptance
            {total !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Acceptances Table */}
        {loadingAcceptances ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#173151] border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading acceptances...</p>
          </div>
        ) : filteredAcceptances.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 font-medium text-lg">
              {searchTerm || selectedTemplate || versionFilter !== 'all'
                ? 'No acceptances match your filters'
                : 'No waiver acceptances yet'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Waiver Template
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Version
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Accepted At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP Address
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAcceptances.map((acceptance) => (
                    <tr key={acceptance.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {acceptance.signer_name || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {acceptance.user?.email || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {acceptance.waiver_template?.name || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                          {acceptance.waiver_template?.waiver_type?.replace('_', ' ') || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          v{acceptance.waiver_version || 1}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(acceptance.accepted_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(acceptance.accepted_at).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {acceptance.signer_ip || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WaiverReports;
