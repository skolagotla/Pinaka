"use client";

import { useState, useMemo, useRef, useEffect } from 'react';
import { Card, Button, Modal, TextInput, Label, Textarea, Badge, Tooltip, Divider, Table } from 'flowbite-react';
import Image from 'next/image';
import { 
  HiCheckCircle, 
  HiXCircle, 
  HiEye, 
  HiCheck, 
  HiX, 
  HiDocumentText, 
  HiDownload, 
  HiChevronLeft, 
  HiChevronRight, 
  HiClock,
  HiPaperAirplane
} from 'react-icons/hi';
import { PageLayout, TableWrapper, renderDate } from '@/components/shared';
import FlowbiteTable from '@/components/shared/FlowbiteTable';
import { renderStatus } from '@/components/shared/FlowbiteTableRenderers';
import { STANDARD_COLUMNS, customizeColumn } from '@/lib/constants/standard-columns';
import { notify } from '@/lib/utils/notification-helper';
// useUnifiedApi removed - use v2Api from @/lib/api/v2-client';
import { useModalState } from '@/lib/hooks/useModalState';
import { formatDateDisplay } from '@/lib/utils/safe-date-formatter';
import FlowbitePopconfirm from '@/components/shared/FlowbitePopconfirm';
import { useV2Auth } from '@/lib/hooks/useV2Auth';
import { useUpdateInspection } from '@/lib/hooks/useV2Data';

export default function InspectionsClient({ initialChecklists = [] }) {
  // useUnifiedApi removed - use v2Api
  const { user } = useV2Auth();
  const updateInspection = useUpdateInspection();
  const [checklists, setChecklists] = useState(initialChecklists);
  const { editingItem: selectedChecklist, setEditingItem: setSelectedChecklist, openForEdit: openDetailModalForEdit } = useModalState();
  const { isOpen: detailModalOpen, open: openDetailModal, close: closeDetailModal } = useModalState();
  const { isOpen: photoModalOpen, open: openPhotoModal, close: closePhotoModal, editingItem: selectedPhotos, setEditingItem: setSelectedPhotos } = useModalState({ defaultItem: [] });
  const [landlordNotes, setLandlordNotes] = useState({});
  const [itemApprovals, setItemApprovals] = useState({});
  const [rejectionReason, setRejectionReason] = useState('');
  const [activeCategories, setActiveCategories] = useState([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState({});
  const [globalCarouselIndex, setGlobalCarouselIndex] = useState(0);
  const carouselRef = useRef(null);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

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
    const notes = {};
    const approvals = {};
    checklist.items.forEach(item => {
      if (item.landlordNotes) notes[item.id] = item.landlordNotes;
      if (item.landlordApproval) approvals[item.id] = item.landlordApproval;
    });
    setLandlordNotes(notes);
    setItemApprovals(approvals);
    const photoIndices = {};
    checklist.items.forEach(item => {
      if (item.photos && item.photos.length > 0) {
        photoIndices[item.id] = 0;
      }
    });
    setCurrentPhotoIndex(photoIndices);
    setGlobalCarouselIndex(0);
    const categories = Object.keys(
      checklist.items.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        return acc;
      }, {})
    );
    setActiveCategories(categories);
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

  const handleRejectChecklist = () => {
    if (!selectedChecklist) return;
    setRejectionReasonInput('');
    setRejectionModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectionReasonInput.trim()) {
      notify.warning('Please provide a reason for rejection');
      return;
    }

    try {
      const updated = await updateInspection.mutateAsync({
        id: selectedChecklist.id,
        data: {
          status: 'rejected',
          rejection_reason: rejectionReasonInput
        }
      });
      setChecklists(prev => prev.map(c => c.id === updated.id ? updated : c));
      notify.success('Checklist rejected');
      setRejectionModalOpen(false);
      setRejectionReasonInput('');
      closeDetailModal();
    } catch (error) {
      notify.error('Failed to reject checklist');
    }
  };

  const columns = [
    {
      title: 'Tenant',
      dataIndex: ['tenant', 'firstName'],
      key: 'tenant',
      render: (_, record) => (
        <span className="font-semibold">{record.tenant.firstName} {record.tenant.lastName}</span>
      )
    },
    {
      title: 'Type',
      dataIndex: 'checklistType',
      key: 'checklistType',
      render: (type) => (
        <Badge color={type === 'move-in' ? 'blue' : 'warning'}>
          {type === 'move-in' ? 'Move-in' : 'Move-out'}
        </Badge>
      )
    },
    {
      title: 'Inspection Date',
      dataIndex: 'inspectionDate',
      key: 'inspectionDate',
      render: (_, record) => renderDate(record.inspectionDate)
    },
    {
      title: 'Items',
      key: 'items',
      render: (_, record) => {
        const checkedCount = record.items.filter(i => i.isChecked).length;
        const totalCount = record.items.length;
        return `${checkedCount}/${totalCount}`;
      }
    },
    customizeColumn(STANDARD_COLUMNS.CREATED_DATE, {
      title: 'Submitted',
      dataIndex: 'submittedAt',
      render: (_, record) => renderDate(record.submittedAt)
    }),
    customizeColumn(STANDARD_COLUMNS.STATUS, {
      render: (status) => {
        const statusMap = {
          pending: 'Pending',
          submitted: 'In Progress',
          approved: 'Completed',
          rejected: 'Cancelled'
        };
        return renderStatus(statusMap[status] || status, {
          customColors: {
            'Pending': 'warning',
            'In Progress': 'info',
            'Completed': 'success',
            'Cancelled': 'failure'
          }
        });
      }
    }),
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        return (
          <div className="flex items-center gap-2">
            <Tooltip content="View Details">
              <Button
                color="gray"
                size="sm"
                onClick={() => handleViewDetails(record)}
                title="View Details"
              >
                <HiEye className="h-4 w-4" />
              </Button>
            </Tooltip>
          </div>
        );
      }
    }
  ];

  // Custom Carousel Component
  const CustomCarousel = ({ photos, currentIndex, onIndexChange }) => {
    const goToPrevious = () => {
      if (currentIndex > 0) {
        onIndexChange(currentIndex - 1);
      } else {
        onIndexChange(photos.length - 1);
      }
    };

    const goToNext = () => {
      if (currentIndex < photos.length - 1) {
        onIndexChange(currentIndex + 1);
      } else {
        onIndexChange(0);
      }
    };

    const goToSlide = (index) => {
      onIndexChange(index);
    };

    if (photos.length === 0) return null;

    return (
      <div className="relative">
        <div className="relative h-[500px] bg-black rounded-lg overflow-hidden border-2 border-gray-300 shadow-lg">
          <img
            src={photos[currentIndex].photo}
            alt={photos[currentIndex].itemLabel || `Photo ${currentIndex + 1}`}
            className="w-full h-full object-contain cursor-pointer"
            onClick={() => {
              setSelectedImage({
                src: photos[currentIndex].photo,
                title: `${photos[currentIndex].itemLabel} - Photo ${photos[currentIndex].photoIndex + 1}`
              });
              setImageModalOpen(true);
            }}
          />
          
          {photos.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
              >
                <HiChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
              >
                <HiChevronRight className="h-6 w-6" />
              </button>
              
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {photos.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToSlide(idx)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      idx === currentIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderChecklistDetails = () => {
    if (!selectedChecklist) return null;

    const groupedItems = selectedChecklist.items.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});

    // Collect all photos from all items with metadata
    const allPhotos = [];
    selectedChecklist.items.forEach(item => {
      if (item.photos && item.photos.length > 0) {
        let photoObjects = item.photos;
        if (typeof item.photos[0] === 'string') {
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

    const currentPhoto = allPhotos[globalCarouselIndex];

    return (
      <div>
        {/* Banner */}
        <Card className="mb-6 bg-gradient-to-br from-gray-50 to-white border border-gray-300 shadow-md">
          <div className="grid grid-cols-5 gap-4 items-center">
            <div className="text-center">
              <span className="text-xs text-gray-500 block mb-1">Tenant</span>
              <span className="font-semibold text-base">{selectedChecklist.tenant.firstName} {selectedChecklist.tenant.lastName}</span>
            </div>
            <div className="w-px h-10 bg-gray-300 self-center" />
            <div className="text-center">
              <span className="text-xs text-gray-500 block mb-1">Type</span>
              <Badge color={selectedChecklist.checklistType === 'move-in' ? 'blue' : 'warning'} className="text-xs px-3 py-1">
                {selectedChecklist.checklistType === 'move-in' ? 'Move-in' : 'Move-out'}
              </Badge>
            </div>
            <div className="w-px h-10 bg-gray-300 self-center" />
            <div className="text-center">
              <span className="text-xs text-gray-500 block mb-1">Inspection Date</span>
              <span className="font-semibold text-base">
                {formatDateDisplay(selectedChecklist.inspectionDate)}
              </span>
            </div>
            <div className="w-px h-10 bg-gray-300 self-center" />
            <div className="text-center">
              <span className="text-xs text-gray-500 block mb-1">Status</span>
              <Badge 
                color={
                  selectedChecklist.status === 'approved' ? 'success' : 
                  selectedChecklist.status === 'rejected' ? 'failure' : 
                  'warning'
                } 
                className="text-xs px-3 py-1"
              >
                {selectedChecklist.status.charAt(0).toUpperCase() + selectedChecklist.status.slice(1)}
              </Badge>
            </div>
            {selectedChecklist.status === 'submitted' && (
              <>
                <div className="w-px h-10 bg-gray-300 self-center" />
                <div className="flex items-center gap-2">
                  <Tooltip content="Reject Checklist">
                    <Button
                      color="failure"
                      onClick={handleRejectChecklist}
                      className="rounded-full p-3"
                    >
                      <HiXCircle className="h-5 w-5" />
                    </Button>
                  </Tooltip>
                  <Tooltip content="Approve Checklist">
                    <Button
                      color="success"
                      onClick={handleApproveChecklist}
                      className="rounded-full p-3"
                    >
                      <HiCheckCircle className="h-5 w-5" />
                    </Button>
                  </Tooltip>
                </div>
              </>
            )}
            {selectedChecklist.status === 'approved' && (
              <>
                <div className="w-px h-10 bg-gray-300 self-center" />
                <div>
                  <Tooltip content="Download PDF">
                    <Button
                      color="blue"
                      onClick={() => {
                        window.open(`/api/inspection-checklists/${selectedChecklist.id}/download-pdf`, '_blank');
                      }}
                      className="rounded-full p-3"
                    >
                      <HiDownload className="h-5 w-5" />
                    </Button>
                  </Tooltip>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Global Photo Carousel with Notes Panel */}
        {allPhotos.length > 0 && (
          <Card className="mb-6 border border-gray-300 shadow-md">
            <div className="grid grid-cols-3 gap-6">
              {/* Photo Carousel - Left Side */}
              <div className="col-span-2">
                <div className="mb-3">
                  <span className="font-semibold text-sm text-gray-800">
                    All Photos ({allPhotos.length})
                  </span>
                  {allPhotos.length > 1 && (
                    <span className="ml-3 text-sm text-gray-500">
                      {globalCarouselIndex + 1} / {allPhotos.length}
                    </span>
                  )}
                </div>
                <CustomCarousel
                  photos={allPhotos}
                  currentIndex={globalCarouselIndex}
                  onIndexChange={setGlobalCarouselIndex}
                />
              </div>

              {/* Notes Panel - Right Side */}
              <div className="col-span-1">
                <div className="space-y-4">
                  {/* Photo Comment */}
                  {currentPhoto?.photoComment && (
                    <div>
                      <span className="font-semibold text-xs block mb-2 text-blue-600">
                        Photo Comment
                      </span>
                      <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 min-h-[40px]">
                        <p className="text-sm text-yellow-800 leading-relaxed">
                          {currentPhoto.photoComment}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Item Info */}
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wide block mb-1">
                      Item
                    </span>
                    <span className="font-semibold text-sm text-gray-800 block mb-2">
                      {currentPhoto?.itemLabel}
                    </span>
                    <Badge color="blue" className="text-xs">
                      {currentPhoto?.itemCategory}
                    </Badge>
                  </div>

                  {/* Tenant Notes */}
                  {currentPhoto?.itemNotes && (
                    <div>
                      <span className="font-semibold text-xs block mb-2 text-blue-600">
                        Tenant Notes
                      </span>
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 min-h-[60px] max-h-[150px] overflow-y-auto">
                        <p className="text-sm text-blue-900 leading-relaxed">
                          {currentPhoto.itemNotes}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Landlord Notes */}
                  <div className="flex-1">
                    <Label htmlFor="landlordNotes" className="font-semibold text-xs block mb-2 text-gray-600">
                      Your Notes
                    </Label>
                    <Textarea
                      id="landlordNotes"
                      rows={8}
                      value={landlordNotes[`${currentPhoto?.itemId}_${currentPhoto?.photoIndex}`] || landlordNotes[currentPhoto?.itemId] || ''}
                      onChange={(e) => handleSaveItemNotes(`${currentPhoto?.itemId}_${currentPhoto?.photoIndex}`, e.target.value)}
                      placeholder="Add your notes about this photo..."
                      className="rounded-lg border border-gray-300 resize-y min-h-[150px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}
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
      headerTitle={
        <div className="flex items-center gap-2">
          <HiDocumentText className="h-5 w-5" />
          <span>Tenant Inspections</span>
        </div>
      }
      stats={stats}
      statsCols={2}
    >
      <TableWrapper>
        <FlowbiteTable
          columns={columns}
          dataSource={checklists}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true }}
        />
      </TableWrapper>

      <Modal
        show={detailModalOpen}
        onClose={() => {
          closeDetailModal();
          setRejectionReason('');
        }}
        size="6xl"
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
        <Modal.Body className="max-h-[calc(100vh-200px)] overflow-y-auto p-6">
          {renderChecklistDetails()}
        </Modal.Body>
      </Modal>

      <Modal
        show={photoModalOpen}
        onClose={closePhotoModal}
        size="4xl"
      >
        <Modal.Header>Photos</Modal.Header>
        <Modal.Body>
          <div className="grid grid-cols-3 gap-4">
            {selectedPhotos.map((photo, idx) => (
              <div key={idx} className="relative">
                <img
                  src={photo}
                  alt={`Photo ${idx + 1}`}
                  className="w-full rounded-lg cursor-pointer"
                  onClick={() => {
                    setSelectedImage({
                      src: photo,
                      title: `Photo ${idx + 1}`
                    });
                    setImageModalOpen(true);
                  }}
                />
              </div>
            ))}
          </div>
        </Modal.Body>
      </Modal>

      {/* Rejection Reason Modal */}
      <Modal
        show={rejectionModalOpen}
        onClose={() => setRejectionModalOpen(false)}
        size="md"
      >
        <Modal.Header>Reject Checklist</Modal.Header>
        <Modal.Body>
          <div>
            <Label htmlFor="rejectionReason" className="mb-2 block">Reason for rejection:</Label>
            <Textarea
              id="rejectionReason"
              rows={4}
              placeholder="Please provide a reason for rejection..."
              value={rejectionReasonInput}
              onChange={(e) => setRejectionReasonInput(e.target.value)}
              className="mt-2"
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="gray" onClick={() => setRejectionModalOpen(false)}>
            Cancel
          </Button>
          <Button color="failure" onClick={handleConfirmReject}>
            Reject
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Image View Modal */}
      <Modal
        show={imageModalOpen}
        onClose={() => {
          setImageModalOpen(false);
          setSelectedImage(null);
        }}
        size="6xl"
      >
        <Modal.Header>{selectedImage?.title || 'Image'}</Modal.Header>
        <Modal.Body>
          {selectedImage && (
            <img
              src={selectedImage.src}
              alt={selectedImage.title}
              className="w-full h-auto"
            />
          )}
        </Modal.Body>
      </Modal>
    </PageLayout>
  );
}
