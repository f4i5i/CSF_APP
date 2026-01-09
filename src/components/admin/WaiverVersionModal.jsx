/**
 * WaiverVersionModal - Shows version info and acceptance stats for a waiver template
 */

import React, { useState, useEffect, useCallback } from 'react';
import { X, Info, Calendar, BarChart3 } from 'lucide-react';
import waiversService from '../../api/services/waivers.service';

const WaiverVersionModal = ({ waiver, onClose }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await waiversService.getStats(waiver.id);
      setStats(data);
    } catch (error) {
      console.error('Failed to load waiver stats:', error);
    } finally {
      setLoading(false);
    }
  }, [waiver.id]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 rounded-full p-2">
              <Info className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#173151]">
                Version Information
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {waiver.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {loading ? (
            <div className="text-center py-10">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#173151] border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading statistics...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Version Info */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-[#173151] mb-4">
                  Current Version
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Version Number</p>
                    <p className="text-2xl font-bold text-[#173151]">
                      {waiver.version}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Acceptances</p>
                    <p className="text-2xl font-bold text-[#173151]">
                      {stats?.total_acceptances || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Created At</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(waiver.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Updated</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(waiver.updated_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Acceptance by Version */}
              {stats?.acceptances_by_version && Object.keys(stats.acceptances_by_version).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-[#173151] mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Acceptances by Version
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(stats.acceptances_by_version)
                      .sort((a, b) => b[0] - a[0])
                      .map(([version, count]) => (
                        <div
                          key={version}
                          className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                              parseInt(version) === waiver.version
                                ? 'bg-green-600'
                                : 'bg-gray-400'
                            }`}>
                              v{version}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                Version {version}
                                {parseInt(version) === waiver.version && (
                                  <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                    Current
                                  </span>
                                )}
                              </p>
                              <p className="text-sm text-gray-600">
                                {count} acceptance{count !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-[#173151]">
                              {count}
                            </p>
                            <p className="text-xs text-gray-500">
                              {Math.round((count / (stats.total_acceptances || 1)) * 100)}%
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Latest Acceptance */}
              {stats?.latest_acceptance && (
                <div>
                  <h3 className="text-lg font-semibold text-[#173151] mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Latest Acceptance
                  </h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Signer</p>
                        <p className="font-medium text-gray-900">
                          {stats.latest_acceptance.signer_name || 'Unknown'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Date</p>
                        <p className="font-medium text-gray-900">
                          {new Date(stats.latest_acceptance.accepted_at).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Version Signed</p>
                        <p className="font-medium text-gray-900">
                          v{stats.latest_acceptance.waiver_version || 1}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">IP Address</p>
                        <p className="font-medium text-gray-900">
                          {stats.latest_acceptance.signer_ip || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Info Note */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> When you update the waiver content, the version number will automatically increment. Users who signed previous versions will need to re-sign if the waiver is required.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default WaiverVersionModal;
