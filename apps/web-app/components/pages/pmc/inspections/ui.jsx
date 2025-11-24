"use client";

import { useState, useMemo } from 'react';
import { Card, Button, Badge, Modal, Textarea, Label, Tooltip, Accordion, Spinner } from 'flowbite-react';
import Image from 'next/image';
import { HiCheckCircle, HiXCircle, HiEye, HiCheck, HiX, HiDocumentText, HiDownload, HiClock } from 'react-icons/hi';
import { PageLayout, TableWrapper, FlowbiteTable, renderDate } from '@/components/shared';
import { renderStatus } from '@/components/shared/TableRenderers';
import { STANDARD_COLUMNS, customizeColumn } from '@/lib/constants/standard-columns';
import { notify } from '@/lib/utils/notification-helper';
import { useUnifiedApi } from '@/lib/hooks/useUnifiedApi';
import { useModalState } from '@/lib/hooks/useModalState';
import { useV2Auth } from '@/lib/hooks/useV2Auth';
import { useUpdateInspection } from '@/lib/hooks/useV2Data';
import dayjs from 'dayjs';

export default function PMCInspectionsClient({ initialChecklists = [] }) {
  const { fetch } = useUnifiedApi({ showUserMessage: true });
  const { user } = useV2Auth();
  const updateInspection = useUpdateInspection();
  const [checklists, setChecklists] = useState(initialChecklists);
  const { editingItem: selectedChecklist, setEditingItem: setSelectedChecklist, openForEdit: openDetailModalForEdit } = useModalState();
  const { isOpen: detailModalOpen, open: openDetailModal, close: closeDetailModal } = useModalState();
  const { isOpen: photoModalOpen, open: openPhotoModal, close: closePhotoModal, editingItem: selectedPhotos, setEditingItem: setSelectedPhotos } = useModalState({ defaultItem: [] });
  const { isOpen: rejectModalOpen, open: openRejectModal, close: closeRejectModal } = useModalState();
  const [landlordNotes, setLandlordNotes] = useState({});
  const [itemApprovals, setItemApprovals] = useState({});
  const [rejectionReason, setRejectionReason] = useState('');
  const [globalCarouselIndex, setGlobalCarouselIndex] = useState(0);

  const groupedChecklists = useMemo(() => {
    const grouped = {
      pending: [],
      submitted: [],
      approved: [],
      rejected: []
    };

    checklists.forEach(checklist => {
      if (checklist.status === 'pending') {
        grouped.pending.push(checklist);
      } else if (checklist.status === 'submitted') {
        grouped.submitted.push(checklist);
      } else if (checklist.status === 'approved') {
        grouped.approved.push(checklist);
      } else if (checklist.status === 'rejected') {
        grouped.rejected.push(checklist);
      }
    });

    return grouped;
  }, [checklists]);

  const handleViewDetails = (checklist) => {
    setSelectedChecklist(checklist);
    openDetailModalForEdit(checklist);
    // Initialize landlord notes and approvals from existing data
    const notes = {};
    const approvals = {};
    checklist.items.forEach(item => {
      if (item.landlordNotes) notes[item.id] = item.landlordNotes;
      if (item.landlordApproval) approvals[item.id] = item.landlordApproval;
    });
    setLandlordNotes(notes);
    setItemApprovals(approvals);
    // Reset global carousel index
    setGlobalCarouselIndex(0);
    openDetailModal();
  };

  const handleViewPhotos = (photos) => {
    setSelectedPhotos(photos);
    openPhotoModal();
  };

  const handleApproveItem = async (itemId) => {
    setItemApprovals(prev => ({ ...prev, [itemId]: 'approved' }));
  };

  const handleRejectItem = async (itemId) => {
    setItemApprovals(prev => ({ ...prev, [itemId]: 'rejected' }));
  };

  const handleSaveItemNotes = async (itemId, notes) => {
    setLandlordNotes(prev => ({ ...prev, [itemId]: notes }));
  };

  const handleApproveChecklist = async () => {
    if (!selectedChecklist) return;

    try {
      const items = selectedChecklist.items.map(item => ({
        id: item.id,
        landlordNotes: landlordNotes[item.id] || null,
        landlordApproval: itemApprovals[item.id] || null
      }));

      const updated = await updateInspection.mutateAsync({
        id: selectedChecklist.id,
        data: {
          status: 'approved',
          items
        }
      });
      setChecklists(prev => prev.map(c => c.id === updated.id ? updated : c));
      notify.success('Checklist approved successfully');
      closeDetailModal();
    } catch (error) {
      notify.error('Failed to approve checklist');
    }
  };

  const handleRejectChecklist = async () => {
    if (!rejectionReason.trim()) {
      notify.warning('Please provide a reason for rejection');
      return;
    }

    try {
      const updated = await updateInspection.mutateAsync({
        id: selectedChecklist.id,
        data: {
          status: 'rejected',
          rejection_reason: rejectionReason
        }
      });
      setChecklists(prev => prev.map(c => c.id === updated.id ? updated : c));
      notify.success('Checklist rejected');
      closeDetailModal();
      closeRejectModal();
      setRejectionReason('');
    } catch (error) {
      notify.error('Failed to reject checklist');
    }
  };

  const columns = [
    {
      header: 'Tenant',
      accessorKey: 'tenant',
      cell: ({ row }) => (
        <div className="font-semibold">{row.original.tenant.firstName} {row.original.tenant.lastName}</div>
      )
    },
    {
      header: 'Type',
      accessorKey: 'checklistType',
      cell: ({ row }) => (
        <Badge color={row.original.checklistType === 'move-in' ? 'blue' : 'warning'}>
          {row.original.checklistType === 'move-in' ? 'Move-in' : 'Move-out'}
        </Badge>
      )
    },
    {
      header: 'Inspection Date',
      accessorKey: 'inspectionDate',
      cell: ({ row }) => renderDate(row.original.inspectionDate)
    },
    {
      header: 'Items',
      accessorKey: 'items',
      cell: ({ row }) => {
        const checkedCount = row.original.items.filter(i => i.isChecked).length;
        const totalCount = row.original.items.length;
        return `${checkedCount}/${totalCount}`;
      }
    },
    {
      header: 'Submitted',
      accessorKey: 'submittedAt',
      cell: ({ row }) => renderDate(row.original.submittedAt)
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => {
        const statusMap = {
          pending: 'Pending',
          submitted: 'In Progress',
          approved: 'Completed',
          rejected: 'Cancelled'
        };
        return renderStatus(statusMap[row.original.status] || row.original.status, {
          customColors: {
            'Pending': 'orange',
            'In Progress': 'blue',
            'Completed': 'green',
            'Cancelled': 'red'
          }
        });
      }
    },
    {
      header: 'Actions',
      accessorKey: 'actions',
      cell: ({ row }) => (
        <Button
          color="light"
          onClick={() => handleViewDetails(row.original)}
        >
          <HiEye className="mr-2 h-4 w-4" />
          View
        </Button>
      )
    }
  ];

  const renderChecklistDetails = () => {
    if (!selectedChecklist) return null;

    // Collect all photos from all items with metadata
    const allPhotos = [];
    selectedChecklist.items.forEach(item => {
      if (item.photos && item.photos.length > 0) {
        // Handle both old format (strings) and new format (objects)
        let photoObjects = item.photos;
        if (typeof item.photos[0] === 'string') {
          // Old format: convert to objects
          photoObjects = item.photos.map((url) => ({ url, comment: null }));
        }
        
        photoObjects.forEach((photoObj, photoIdx) => {
          allPhotos.push({
            photo: photoObj.url || photoObj,
            photoComment: photoObj.comment || null,
            itemId: item.id,
            itemLabel: item.itemLabel,
            itemCategory: item.category,
            itemNotes: item.notes,
            photoIndex: photoIdx,
            totalPhotosInItem: photoObjects.length
          });
        });
      }
    });

    const currentPhoto = allPhotos.length > 0 ? allPhotos[globalCarouselIndex] : null;
    const groupedItems = selectedChecklist.items.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});

    return (
      <div className="space-y-6">
        {/* Banner Card */}
        <Card className="bg-gradient-to-br from-gray-50 to-white border-gray-200 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-center flex-1 min-w-[120px]">
              <div className="text-xs text-gray-500 mb-1">Tenant</div>
              <div className="font-semibold text-sm">{selectedChecklist.tenant.firstName} {selectedChecklist.tenant.lastName}</div>
            </div>
            <div className="h-10 w-px bg-gray-300"></div>
            <div className="text-center flex-1 min-w-[120px]">
              <div className="text-xs text-gray-500 mb-1">Type</div>
              <Badge color={selectedChecklist.checklistType === 'move-in' ? 'blue' : 'warning'} className="text-xs">
                {selectedChecklist.checklistType === 'move-in' ? 'Move-in' : 'Move-out'}
              </Badge>
            </div>
            <div className="h-10 w-px bg-gray-300"></div>
            <div className="text-center flex-1 min-w-[120px]">
              <div className="text-xs text-gray-500 mb-1">Inspection Date</div>
              <div className="font-semibold text-sm">
                {dayjs(selectedChecklist.inspectionDate).format('MMM D, YYYY')}
              </div>
            </div>
            <div className="h-10 w-px bg-gray-300"></div>
            <div className="text-center flex-1 min-w-[120px]">
              <div className="text-xs text-gray-500 mb-1">Status</div>
              <Badge 
                color={
                  selectedChecklist.status === 'approved' ? 'success' : 
                  selectedChecklist.status === 'rejected' ? 'failure' : 
                  'warning'
                }
                className="text-xs"
              >
                {selectedChecklist.status.charAt(0).toUpperCase() + selectedChecklist.status.slice(1)}
              </Badge>
            </div>
            {selectedChecklist.status === 'submitted' && (
              <>
                <div className="h-10 w-px bg-gray-300"></div>
                <div className="flex items-center gap-2">
                  <Tooltip content="Reject Checklist">
                    <Button
                      color="failure"
                      onClick={openRejectModal}
                      className="rounded-full"
                    >
                      <HiXCircle className="h-5 w-5" />
                    </Button>
                  </Tooltip>
                  <Tooltip content="Approve Checklist">
                    <Button
                      color="success"
                      onClick={handleApproveChecklist}
                      className="rounded-full"
                    >
                      <HiCheckCircle className="h-5 w-5" />
                    </Button>
                  </Tooltip>
                </div>
              </>
            )}
            {selectedChecklist.status === 'approved' && (
              <>
                <div className="h-10 w-px bg-gray-300"></div>
                <div>
                  <Tooltip content="Download PDF">
                    <Button
                      color="blue"
                      onClick={() => {
                        window.open(`/api/inspection-checklists/${selectedChecklist.id}/download-pdf`, '_blank');
                      }}
                      className="rounded-full"
                    >
                      <HiDownload className="h-5 w-5" />
                    </Button>
                  </Tooltip>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Global Photo Gallery with Notes Panel */}
        {allPhotos.length > 0 && (
          <Card>
            <div className="grid grid-cols-3 gap-6">
              {/* Photo Gallery - Left Side (2/3) */}
              <div className="col-span-2">
                <div className="mb-3">
                  <span className="font-semibold text-sm">All Photos ({allPhotos.length})</span>
                  {allPhotos.length > 1 && (
                    <span className="text-gray-500 text-sm ml-2">
                      {globalCarouselIndex + 1} / {allPhotos.length}
                    </span>
                  )}
                </div>
                <div className="relative border-2 border-gray-200 rounded-lg overflow-hidden bg-black" style={{ height: '500px' }}>
                  <img
                    src={currentPhoto.photo}
                    alt={`${currentPhoto.itemLabel} - Photo ${currentPhoto.photoIndex + 1}`}
                    className="w-full h-full object-contain cursor-pointer"
                    onClick={() => {
                      // Open full screen modal
                      const modal = document.createElement('div');
                      modal.className = 'fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center';
                      modal.onclick = () => document.body.removeChild(modal);
                      const img = document.createElement('img');
                      img.src = currentPhoto.photo;
                      img.className = 'max-w-full max-h-full object-contain';
                      modal.appendChild(img);
                      document.body.appendChild(modal);
                    }}
                  />
                  {allPhotos.length > 1 && (
                    <>
                      <Button
                        color="light"
                        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full"
                        onClick={() => setGlobalCarouselIndex(prev => prev > 0 ? prev - 1 : allPhotos.length - 1)}
                      >
                        <HiX className="h-5 w-5 rotate-90" />
                      </Button>
                      <Button
                        color="light"
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
                        onClick={() => setGlobalCarouselIndex(prev => prev < allPhotos.length - 1 ? prev + 1 : 0)}
                      >
                        <HiX className="h-5 w-5 -rotate-90" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Notes Panel - Right Side (1/3) */}
              <div className="space-y-4">
                {/* Photo Comment */}
                {currentPhoto.photoComment && (
                  <div>
                    <div className="font-semibold text-xs text-blue-600 mb-2">Photo Comment</div>
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">{currentPhoto.photoComment}</p>
                    </div>
                  </div>
                )}

                {/* Item Info */}
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Item</div>
                  <div className="font-semibold text-sm mb-2">{currentPhoto.itemLabel}</div>
                  <Badge color="blue" className="text-xs">{currentPhoto.itemCategory}</Badge>
                </div>

                {/* Tenant Notes */}
                {currentPhoto.itemNotes && (
                  <div>
                    <div className="font-semibold text-xs text-blue-600 mb-2">Tenant Notes</div>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg max-h-36 overflow-y-auto">
                      <p className="text-sm text-blue-900">{currentPhoto.itemNotes}</p>
                    </div>
                  </div>
                )}

                {/* Landlord Notes */}
                <div className="flex-1">
                  <Label htmlFor={`notes-${currentPhoto.itemId}-${currentPhoto.photoIndex}`} className="font-semibold text-xs text-gray-700 mb-2 block">
                    Your Notes
                  </Label>
                  <Textarea
                    id={`notes-${currentPhoto.itemId}-${currentPhoto.photoIndex}`}
                    rows={8}
                    value={landlordNotes[`${currentPhoto.itemId}_${currentPhoto.photoIndex}`] || landlordNotes[currentPhoto.itemId] || ''}
                    onChange={(e) => handleSaveItemNotes(`${currentPhoto.itemId}_${currentPhoto.photoIndex}`, e.target.value)}
                    placeholder="Add your notes about this photo..."
                    className="min-h-[150px]"
                  />
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Checklist Items by Category */}
        <Accordion collapseAll={false}>
          {Object.entries(groupedItems).map(([category, items]) => {
            // Create a map of existing items for quick lookup
            const existingItemsMap = {};
            selectedChecklist.items.forEach(existingItem => {
              existingItemsMap[existingItem.itemId || existingItem.id] = existingItem;
            });
            
            return (
              <Accordion.Panel key={category}>
                <Accordion.Title>
                  <div className="flex items-center justify-between w-full">
                    <span className="font-semibold">{category}</span>
                    <Badge color="info">
                      {items.filter(item => {
                        const existingItem = existingItemsMap[item.id];
                        return existingItem && existingItem.isChecked;
                      }).length}/{items.length}
                    </Badge>
                  </div>
                </Accordion.Title>
                <Accordion.Content>
                  <div className="space-y-2">
                    {items.map((item) => {
                      const existingItem = existingItemsMap[item.id];
                      const hasNotes = existingItem?.notes && typeof existingItem.notes === 'string' && existingItem.notes.trim() !== '';
                      const hasPhotos = existingItem?.photos && existingItem.photos.length > 0;
                      const isSubmitted = existingItem && existingItem.isChecked && (hasNotes || hasPhotos);
                      
                      return (
                        <div
                          key={item.id}
                          className={`p-3 rounded-lg border-2 ${
                            isSubmitted 
                              ? 'bg-green-50 border-green-500' 
                              : existingItem?.isChecked 
                              ? 'bg-blue-50 border-blue-500' 
                              : 'bg-gray-50 border-gray-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2 flex-1">
                              {isSubmitted ? (
                                <HiCheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                              ) : existingItem?.isChecked ? (
                                <HiClock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                              ) : null}
                              <span className={`text-sm ${isSubmitted ? 'line-through text-gray-500' : existingItem?.isChecked ? 'font-semibold' : ''}`}>
                                {item.itemLabel}
                              </span>
                            </div>
                            {hasPhotos && (
                              <Badge color="blue" className="text-xs">
                                {existingItem.photos.length} photo{existingItem.photos.length !== 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>
                          {hasNotes && (
                            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-900">
                              {existingItem.notes}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Accordion.Content>
              </Accordion.Panel>
            );
          })}
        </Accordion>
      </div>
    );
  };

  const pendingCount = groupedChecklists.submitted.length;
  const totalCount = checklists.length;

  const stats = [
    {
      title: 'Pending Review',
      value: pendingCount,
      prefix: <HiClock className="h-5 w-5" />,
      valueStyle: { color: '#faad14' },
    },
    {
      title: 'Total Inspections',
      value: totalCount,
      prefix: <HiDocumentText className="h-5 w-5" />,
      valueStyle: { color: '#1890ff' },
    },
  ];

  return (
    <PageLayout
      headerTitle={<><HiDocumentText className="inline mr-2" /> Tenant Inspections</>}
      stats={stats}
      statsCols={2}
    >
      <TableWrapper>
        <FlowbiteTable
          columns={columns}
          data={checklists}
          keyField="id"
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Total ${total} inspections` }}
        />
      </TableWrapper>

      <Modal
        show={detailModalOpen}
        onClose={() => {
          closeDetailModal();
          setRejectionReason('');
        }}
        size="7xl"
      >
        <Modal.Header>
          <div className="flex items-center gap-3">
            <HiDocumentText className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-lg">
              {selectedChecklist?.tenant ? 
                `${selectedChecklist.tenant.firstName} ${selectedChecklist.tenant.lastName} ${selectedChecklist.checklistType === 'move-in' ? 'Move-in' : 'Move-out'} Checklist` :
                'Inspection Checklist Details'
              }
            </span>
          </div>
        </Modal.Header>
        <Modal.Body className="max-h-[calc(100vh-200px)] overflow-y-auto">
          {renderChecklistDetails()}
        </Modal.Body>
      </Modal>

      {/* Reject Modal */}
      <Modal show={rejectModalOpen} onClose={closeRejectModal} size="md">
        <Modal.Header>Reject Checklist</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <Label htmlFor="rejectionReason" className="mb-2 block">
              Please provide a reason for rejection <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="rejectionReason"
              rows={4}
              placeholder="Please provide a reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="gray" onClick={closeRejectModal}>
            Cancel
          </Button>
          <Button color="failure" onClick={handleRejectChecklist}>
            Reject
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Photo Gallery Modal */}
      <Modal show={photoModalOpen} onClose={closePhotoModal} size="xl">
        <Modal.Header>Photos</Modal.Header>
        <Modal.Body>
          <div className="grid grid-cols-3 gap-4">
            {selectedPhotos.map((photo, idx) => (
              <div key={idx} className="relative">
                <Image
                  src={photo}
                  alt={`Photo ${idx + 1}`}
                  width={200}
                  height={200}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
        </Modal.Body>
      </Modal>
    </PageLayout>
  );
}
