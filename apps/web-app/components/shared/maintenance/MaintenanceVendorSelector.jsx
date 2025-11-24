/**
 * Maintenance Vendor Selector Component
 * 
 * Handles vendor selection for maintenance requests (landlord/PMC only)
 * Extracted from MaintenanceClient.jsx to reduce component size
 */

"use client";
import {
  Modal, TextInput, Badge, Card, Button, Spinner, Tooltip, Select
} from 'flowbite-react';
import { HiWrench, HiSearch } from 'react-icons/hi';
import StarRating from '@/components/shared/StarRating';

/**
 * Maintenance Vendor Selector Component
 * 
 * @param {Object} props
 * @param {boolean} props.open - Modal open state
 * @param {Function} props.onCancel - Close modal handler
 * @param {Object} props.selectedRequest - Selected maintenance request
 * @param {Array} props.allVendors - All available vendors
 * @param {Array} props.suggestedVendors - Suggested vendors based on category
 * @param {boolean} props.loadingAllVendors - Loading state for vendors
 * @param {string} props.vendorSearchText - Search text
 * @param {Function} props.setVendorSearchText - Set search text
 * @param {string} props.vendorSourceFilter - Filter by source ('all', 'admin', 'landlord', 'pmc')
 * @param {Function} props.setVendorSourceFilter - Set source filter
 * @param {Object} props.vendorUsageStats - Vendor usage statistics
 * @param {Object} props.loadingVendorStats - Loading state for stats
 * @param {Function} props.onAssignVendor - Callback when vendor is assigned
 * @param {Function} props.fetchVendorUsageStats - Fetch vendor stats
 */
export default function MaintenanceVendorSelector({
  open,
  onCancel,
  selectedRequest,
  allVendors = [],
  suggestedVendors = [],
  loadingAllVendors = false,
  vendorSearchText = '',
  setVendorSearchText,
  vendorSourceFilter = 'all',
  setVendorSourceFilter,
  vendorUsageStats = {},
  loadingVendorStats = {},
  onAssignVendor,
  fetchVendorUsageStats
}) {
  const getVendorSourceInfo = (vendor) => {
    // Determine vendor source based on original logic
    const vendorSource = vendor?.isGlobal 
      ? 'admin' 
      : vendor?.invitedByRole === 'landlord' 
      ? 'landlord' 
      : vendor?.invitedByRole === 'pmc' 
      ? 'pmc' 
      : 'unknown';
    
    const sourceLabels = {
      admin: { label: 'Admin-Approved', color: 'success' },
      landlord: { label: 'Landlord-Added', color: 'info' },
      pmc: { label: 'PMC Team', color: 'purple' },
      unknown: { label: 'Unknown', color: 'gray' },
    };
    
    return sourceLabels[vendorSource] || sourceLabels.unknown;
  };

  const filterVendors = () => {
    // Ensure arrays are always arrays
    const safeAllVendors = Array.isArray(allVendors) ? allVendors : [];
    const safeSuggestedVendors = Array.isArray(suggestedVendors) ? suggestedVendors : [];
    
    // Show suggested vendors first (matching category), then all others
    const vendorsToShow = vendorSearchText 
      ? safeAllVendors 
      : [...safeSuggestedVendors, ...safeAllVendors.filter(v => v && !safeSuggestedVendors.find(sv => sv && sv.id === v.id))];
    
    const filtered = vendorsToShow.filter(vendor => {
      // Filter by search text if provided
      if (vendorSearchText) {
        const search = vendorSearchText.toLowerCase();
        if (!(
          vendor.name?.toLowerCase().includes(search) ||
          vendor.businessName?.toLowerCase().includes(search) ||
          vendor.category?.toLowerCase().includes(search) ||
          vendor.phone?.includes(search) ||
          vendor.email?.toLowerCase().includes(search)
        )) {
          return false;
        }
      }
      
      // Filter by source
      if (vendorSourceFilter !== 'all') {
        if (vendorSourceFilter === 'admin' && !vendor.isGlobal) return false;
        if (vendorSourceFilter === 'landlord' && (vendor.isGlobal || vendor.invitedByRole !== 'landlord')) return false;
        if (vendorSourceFilter === 'pmc' && (vendor.isGlobal || vendor.invitedByRole !== 'pmc')) return false;
      }
      
      return true;
    });
    
    return filtered.filter(vendor => vendor && vendor.id); // Ensure vendor exists and has an id
  };

  const filteredVendors = filterVendors();

  return (
    <Modal
      show={open}
      onClose={onCancel}
      size="3xl"
    >
      <Modal.Header>
        <div className="flex items-center gap-2">
          <HiWrench className="h-5 w-5" />
          <span className="font-semibold">Select Vendor</span>
          {selectedRequest?.category && (
            <Badge color="info">{selectedRequest.category}</Badge>
          )}
        </div>
      </Modal.Header>
      <Modal.Body>
        <div className="space-y-4">
          <div className="flex gap-2">
            <TextInput
              icon={HiSearch}
              placeholder="Search vendors by name, business, or category..."
              value={vendorSearchText}
              onChange={(e) => setVendorSearchText(e.target.value)}
              className="flex-1"
            />
            <Select
              value={vendorSourceFilter}
              onChange={(e) => setVendorSourceFilter(e.target.value)}
              className="w-[150px]"
            >
              <option value="all">All Sources</option>
              <option value="admin">Admin-Approved</option>
              <option value="landlord">Landlord-Added</option>
              <option value="pmc">PMC Team</option>
            </Select>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {loadingAllVendors ? (
              <div className="flex justify-center py-8">
                <Spinner size="xl" />
              </div>
            ) : filteredVendors.length === 0 ? (
              <div className="text-center py-12">
                <HiWrench className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No vendors found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredVendors.map((vendor) => {
                  const sourceInfo = getVendorSourceInfo(vendor);
                  const stats = vendor?.id ? vendorUsageStats[vendor.id] : null;
                  const loadingStats = vendor?.id ? loadingVendorStats[vendor.id] : false;
                  const isSuggested = Array.isArray(suggestedVendors) && suggestedVendors.some(sv => sv && sv.id === vendor.id);

                  return (
                    <Card
                      key={vendor.id}
                      className={`cursor-pointer hover:shadow-md transition-shadow ${
                        isSuggested ? 'border-2 border-blue-500' : 'border border-gray-200'
                      }`}
                      onMouseEnter={() => {
                        if (!stats && vendor?.id && !loadingStats) {
                          fetchVendorUsageStats(vendor.id);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-sm">
                              {vendor?.businessName || vendor?.name || 'Unknown Vendor'}
                            </span>
                            <Badge color={sourceInfo.color} size="sm">
                              {sourceInfo.label}
                            </Badge>
                            {vendor?.category && (
                              <Badge color="info" size="sm">
                                {vendor.category}
                              </Badge>
                            )}
                          </div>
                          {vendor?.name && (
                            <p className="text-xs text-gray-500 mb-2">{vendor.name}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-3 text-xs">
                            {vendor?.rating && (
                              <div className="flex items-center gap-1">
                                <StarRating value={vendor.rating} max={5} size="xs" />
                                <span className="text-gray-500">{vendor.rating.toFixed(1)}</span>
                              </div>
                            )}
                            {stats?.averageRating && (
                              <Tooltip content={`Average rating from ${stats.completedCount} completed jobs`}>
                                <span className="text-gray-500">
                                  Avg: {stats.averageRating.toFixed(1)}
                                </span>
                              </Tooltip>
                            )}
                            {vendor?.hourlyRate && vendor.hourlyRate > 0 && (
                              <Tooltip content="Hourly rate">
                                <span className="font-semibold text-blue-600">
                                  ${vendor.hourlyRate}/hr
                                </span>
                              </Tooltip>
                            )}
                            {stats?.averageCost && (
                              <Tooltip content={`Average cost per job (${stats.completedCount || 0} completed)`}>
                                <span className="text-gray-500">
                                  Avg Cost: ${stats.averageCost.toFixed(2)}
                                </span>
                              </Tooltip>
                            )}
                            {stats?.usageCount > 0 && (
                              <Tooltip content={`Used ${stats.usageCount} time${stats.usageCount !== 1 ? 's' : ''}`}>
                                <span className="text-gray-500">
                                  Used {stats.usageCount}x
                                </span>
                              </Tooltip>
                            )}
                            {vendor?.phone && (
                              <span className="text-gray-500">
                                📞 {vendor.phone}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          color="blue"
                          size="sm"
                          onClick={() => {
                            if (vendor?.id) {
                              onAssignVendor(vendor.id);
                            }
                          }}
                        >
                          Assign
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}
