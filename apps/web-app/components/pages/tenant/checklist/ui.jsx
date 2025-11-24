"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, Checkbox, Button, TextInput, Textarea, Label, Alert, Badge, Accordion, FileInput, Spinner, Tooltip } from 'flowbite-react';
import Image from 'next/image';
import { HiCheckCircle, HiClock, HiCamera, HiSave, HiDocumentText, HiTrash, HiEye } from 'react-icons/hi';
import { PageLayout } from '@/components/shared';
import { useUnifiedApi } from '@/lib/hooks/useUnifiedApi';
import { useLoading } from '@/lib/hooks/useLoading';
import { notify } from '@/lib/utils/notification-helper';
import dayjs from 'dayjs';
import { formatDateTimeDisplay } from '@/lib/utils/safe-date-formatter';

const MOVE_IN_CHECKLIST = [
  { id: 'walls', label: 'Walls - Check for holes, cracks, or damage', category: 'Interior' },
  { id: 'floors', label: 'Floors - Check for stains, scratches, or damage', category: 'Interior' },
  { id: 'ceiling', label: 'Ceiling - Check for water stains or damage', category: 'Interior' },
  { id: 'windows', label: 'Windows - Check for cracks, locks, and screens', category: 'Interior' },
  { id: 'doors', label: 'Doors - Check locks, handles, and frames', category: 'Interior' },
  { id: 'kitchen', label: 'Kitchen - Appliances, cabinets, and fixtures', category: 'Interior' },
  { id: 'bathroom', label: 'Bathroom - Fixtures, tiles, and plumbing', category: 'Interior' },
  { id: 'electrical', label: 'Electrical - Outlets, switches, and lighting', category: 'Interior' },
  { id: 'heating', label: 'Heating/Cooling - HVAC system functionality', category: 'Interior' },
  { id: 'smoke_detector', label: 'Smoke Detectors - Test all detectors', category: 'Safety' },
  { id: 'carbon_monoxide', label: 'Carbon Monoxide Detectors - Test all detectors', category: 'Safety' },
  { id: 'exterior', label: 'Exterior - Building exterior and common areas', category: 'Exterior' },
  { id: 'parking', label: 'Parking - Assigned space and condition', category: 'Exterior' },
  { id: 'keys', label: 'Keys - All keys received and tested', category: 'General' },
  { id: 'utilities', label: 'Utilities - All utilities transferred to tenant', category: 'General' },
];

const MOVE_OUT_CHECKLIST = [
  { id: 'clean', label: 'All rooms cleaned thoroughly', category: 'Cleaning' },
  { id: 'repairs', label: 'All repairs completed (beyond normal wear)', category: 'Repairs' },
  { id: 'personal_items', label: 'All personal items removed', category: 'General' },
  { id: 'appliances', label: 'Appliances cleaned and in working order', category: 'Cleaning' },
  { id: 'keys_returned', label: 'All keys returned to landlord', category: 'General' },
  { id: 'utilities_transferred', label: 'Utilities transferred out of tenant name', category: 'General' },
  { id: 'mail_forwarded', label: 'Mail forwarding arranged', category: 'General' },
  { id: 'final_inspection', label: 'Final inspection scheduled with landlord', category: 'General' },
];

export default function ChecklistClient({ tenant }) {
  const { fetch } = useUnifiedApi({ showUserMessage: true });
  const { loading, withLoading } = useLoading();
  const [checklistType, setChecklistType] = useState('move-in');
  const [checklistData, setChecklistData] = useState({});
  const [notes, setNotes] = useState({});
  const [photos, setPhotos] = useState({});
  const [photoData, setPhotoData] = useState({});
  const [photoComments, setPhotoComments] = useState({});
  const [inspectionDate, setInspectionDate] = useState('');
  const [existingChecklist, setExistingChecklist] = useState(null);
  const [existingItems, setExistingItems] = useState({});
  const [itemUpdateTimestamps, setItemUpdateTimestamps] = useState({});
  const [savingItems, setSavingItems] = useState({});
  const [originalNotes, setOriginalNotes] = useState({});
  const [originalPhotoData, setOriginalPhotoData] = useState({});
  const fileInputRefs = useRef({});

  const checklist = checklistType === 'move-in' ? MOVE_IN_CHECKLIST : MOVE_OUT_CHECKLIST;

  const groupedChecklist = checklist.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  useEffect(() => {
    const loadExistingChecklist = async () => {
      try {
        const response = await fetch(
          '/api/inspection-checklists',
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          },
          { operation: 'Load checklists' }
        );

        if (response.ok) {
          const checklists = await response.json();
          const matchingChecklist = checklists
            .filter(c => c.checklistType === checklistType)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

          if (matchingChecklist) {
            setExistingChecklist(matchingChecklist);
            if (matchingChecklist.inspectionDate) {
              const date = new Date(matchingChecklist.inspectionDate);
              const year = date.getUTCFullYear();
              const month = date.getUTCMonth();
              const day = date.getUTCDate();
              setInspectionDate(dayjs(new Date(year, month, day)).format('YYYY-MM-DD'));
            } else {
              setInspectionDate('');
            }

            const itemsMap = {};
            const timestampsMap = {};
            matchingChecklist.items.forEach(item => {
              itemsMap[item.itemId] = item;
              if (item.updatedAt) {
                timestampsMap[item.itemId] = item.updatedAt;
              }
            });
            setExistingItems(itemsMap);
            setItemUpdateTimestamps(timestampsMap);

            const dataMap = {};
            const notesMap = {};
            const photosMap = {};
            const photoDataMap = {};
            const commentsMap = {};

            matchingChecklist.items.forEach(item => {
              if (item.isChecked) {
                dataMap[item.itemId] = true;
              }
              if (item.notes) {
                notesMap[item.itemId] = item.notes;
              }
              if (item.photos && item.photos.length > 0) {
                let photoObjects = item.photos;
                // Handle both old format (base64 strings) and new format (objects with url)
                if (typeof item.photos[0] === 'string') {
                  // Check if it's base64 or URL
                  const firstPhoto = item.photos[0];
                  if (firstPhoto.startsWith('data:image')) {
                    // Old format: base64
                    photoObjects = item.photos.map((url) => ({ url, comment: null }));
                  } else {
                    // New format: URL string
                    photoObjects = item.photos.map((url) => ({ url, comment: null }));
                  }
                }
                
                photosMap[item.itemId] = photoObjects.map((photoObj, index) => {
                  const photoUrl = photoObj.url || photoObj;
                  return {
                    uid: `existing-${item.itemId}-${index}`,
                    name: `photo-${index + 1}.jpg`,
                    status: 'done',
                    url: photoUrl,
                    thumbUrl: photoUrl
                  };
                });
                photoDataMap[item.itemId] = photoObjects;
                
                photoObjects.forEach((photoObj, index) => {
                  if (photoObj.comment) {
                    if (!commentsMap[item.itemId]) commentsMap[item.itemId] = {};
                    commentsMap[item.itemId][index] = photoObj.comment;
                  }
                });
              }
            });

            setChecklistData(dataMap);
            setNotes(notesMap);
            setPhotos(photosMap);
            setPhotoData(photoDataMap);
            setPhotoComments(commentsMap);
            setOriginalNotes(notesMap);
            setOriginalPhotoData(photoDataMap);
          } else {
            setExistingChecklist(null);
            setExistingItems({});
            setItemUpdateTimestamps({});
            setChecklistData({});
            setNotes({});
            setPhotos({});
            setPhotoData({});
            setPhotoComments({});
            setOriginalNotes({});
            setOriginalPhotoData({});
            setInspectionDate('');
          }
        }
      } catch (error) {
        console.error('Failed to load existing checklist:', error);
      }
    };

    loadExistingChecklist();
  }, [checklistType, fetch]);

  const handleCheckboxChange = async (id, checked) => {
    setChecklistData(prev => ({ ...prev, [id]: checked }));
    
    if (existingChecklist?.id && inspectionDate) {
      const item = checklist.find(i => i.id === id);
      if (item) {
        await handleSaveItem(item, true);
      }
    }
  };

  const handleNoteChange = (id, note) => {
    setNotes(prev => ({ ...prev, [id]: note }));
  };

  const handlePhotoCommentChange = (itemId, photoIndex, comment) => {
    setPhotoComments(prev => {
      const itemComments = prev[itemId] || {};
      return {
        ...prev,
        [itemId]: {
          ...itemComments,
          [photoIndex]: comment
        }
      };
    });
  };

  const handleDeletePhoto = async (itemId, photoIndex) => {
    const itemPhotos = photos[itemId] || [];
    const itemPhotoData = photoData[itemId] || [];
    const itemComments = photoComments[itemId] || {};

    // Remove photo from arrays
    const newPhotos = itemPhotos.filter((_, index) => index !== photoIndex);
    const newPhotoData = itemPhotoData.filter((_, index) => index !== photoIndex);
    
    // Remove comment for deleted photo and reindex remaining comments
    const newComments = {};
    Object.keys(itemComments).forEach(key => {
      const index = parseInt(key);
      if (index < photoIndex) {
        newComments[index] = itemComments[key];
      } else if (index > photoIndex) {
        newComments[index - 1] = itemComments[key];
      }
    });

    // Update state
    setPhotos(prev => ({ ...prev, [itemId]: newPhotos }));
    setPhotoData(prev => ({ ...prev, [itemId]: newPhotoData }));
    setPhotoComments(prev => ({ ...prev, [itemId]: newComments }));

    // Auto-save if checklist exists
    if (existingChecklist?.id && inspectionDate) {
      const itemObj = checklist.find(i => i.id === itemId);
      if (itemObj) {
        // Temporarily update photoData for this save
        const tempPhotoData = { ...photoData, [itemId]: newPhotoData };
        const tempPhotos = { ...photos, [itemId]: newPhotos };
        
        // Convert photoData to array of URLs for saving
        const photosToSave = newPhotoData.map((photoObj) => {
          if (typeof photoObj === 'string') {
            return photoObj;
          } else if (photoObj && typeof photoObj === 'object') {
            return photoObj.url || photoObj;
          }
          return photoObj;
        });

        try {
          await handleSaveItem(itemObj, true, photosToSave.filter(Boolean));
        } catch (err) {
          console.error('Failed to auto-save after photo deletion:', err);
          notify.error('Failed to delete photo');
          // Revert state on error
          setPhotos(prev => ({ ...prev, [itemId]: itemPhotos }));
          setPhotoData(prev => ({ ...prev, [itemId]: itemPhotoData }));
          setPhotoComments(prev => ({ ...prev, [itemId]: itemComments }));
        }
      }
    }
  };

  const handleSaveItem = async (item, silent = false, photosOverride = null) => {
    if (!inspectionDate) {
      if (!silent) {
        notify.warning('Please select an inspection date first');
      }
      return;
    }

    let checklistId = existingChecklist?.id;
    
    if (!checklistId) {
      try {
        // BUG FIX: Added comprehensive null checks to prevent runtime errors
        const leaseTenant = tenant?.leaseTenants?.[0];
        if (!leaseTenant) {
          notify.error('No active lease found. Please contact your landlord.');
          return;
        }
        
        const lease = leaseTenant?.lease;
        if (!lease) {
          notify.error('Lease information not found. Please contact your landlord.');
          return;
        }
        
        const unit = lease?.unit;
        if (!unit) {
          notify.error('Unit information not found. Please contact your landlord.');
          return;
        }
        
        const property = unit?.property;
        if (!property) {
          notify.error('Property information not found. Please contact your landlord.');
          return;
        }

        const response = await fetch(
          '/api/inspection-checklists',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              checklistType,
              inspectionDate: inspectionDate ? dayjs(inspectionDate).format('YYYY-MM-DD') : null,
              items: [],
              leaseId: lease.id,
              propertyId: property.id,
              unitId: unit.id
            })
          },
          { operation: 'Create checklist' }
        );

        if (response.ok) {
          const newChecklist = await response.json();
          checklistId = newChecklist.id;
          setExistingChecklist(newChecklist);
        } else {
          notify.error('Failed to create checklist');
          return;
        }
      } catch (error) {
        notify.error('Failed to create checklist');
        return;
      }
    }

    setSavingItems(prev => ({ ...prev, [item.id]: true }));
    try {
      const existingItem = existingItems[item.id];
      let notesToSave = notes[item.id] || null;
      let photosToSave = photosOverride !== null ? photosOverride : (photoData[item.id] || []);
      
      if (existingItem) {
        const originalNote = originalNotes[item.id] || '';
        if (notesToSave === originalNote) {
          notesToSave = null;
        }
      }
      
      // Convert photos to the format expected by API: array of objects with url and comment
      // Handle both old format (base64 strings) and new format (objects with url)
      const photosArray = photosToSave.map((photo, index) => {
        let photoUrl;
        if (typeof photo === 'string') {
          // Old format: base64 string
          photoUrl = photo;
        } else if (photo && typeof photo === 'object') {
          // New format: object with url property
          photoUrl = photo.url || photo;
        } else {
          photoUrl = photo;
        }

        // Get comment for this photo
        const itemComments = photoComments[item.id] || {};
        const comment = itemComments[index];
        let commentStr = null;
        if (comment !== null && comment !== undefined) {
          if (typeof comment === 'string') {
            commentStr = comment;
          } else if (typeof comment === 'object' && comment.comment) {
            commentStr = typeof comment.comment === 'string' ? comment.comment : null;
          }
        }

        return {
          url: photoUrl,
          comment: commentStr
        };
      });

      // Convert photoComments to array format for backward compatibility
      const itemComments = photoComments[item.id] || {};
      const photoCommentsArray = photosArray.map((photoObj) => photoObj.comment);

      // Validate data before sending
      const requestBody = {
            checklistId,
            itemId: item.id,
            itemLabel: item.label,
            category: item.category,
            isChecked: checklistData[item.id] || false,
            notes: notesToSave,
            photos: photosArray.map(p => p.url), // Send array of URLs
            photoComments: photoCommentsArray
      };

      // Debug: Log what we're sending
      console.log('[Checklist] Sending save request:', {
        itemId: item.id,
        photosCount: photosToSave.length,
        photoCommentsArray: photoCommentsArray,
        photoCommentsTypes: photoCommentsArray.map(c => typeof c)
      });

      const response = await fetch(
        `/api/inspection-checklists/items/${item.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        },
        { operation: 'Save item' }
      );

      if (response.ok) {
        const result = await response.json();
        if (!silent) {
          notify.success('Item saved successfully');
        }
        
        const oldStatus = existingChecklist?.status;
        const reloadResponse = await fetch(
          `/api/inspection-checklists/${checklistId}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          },
          { operation: 'Reload checklist' }
        );
        
        if (reloadResponse.ok) {
          const updatedChecklist = await reloadResponse.json();
          setExistingChecklist(updatedChecklist);
          
          if ((oldStatus === 'approved' || oldStatus === 'rejected') && updatedChecklist.status === 'submitted') {
            notify.info('Checklist status changed to "Submitted" for landlord review');
          }
          
          const itemsMap = {};
          const timestampsMap = {};
          updatedChecklist.items.forEach(updatedItem => {
            itemsMap[updatedItem.itemId] = updatedItem;
            if (updatedItem.updatedAt) {
              timestampsMap[updatedItem.itemId] = updatedItem.updatedAt;
            }
          });
          setExistingItems(itemsMap);
          setItemUpdateTimestamps(timestampsMap);
          
          const savedItem = updatedChecklist.items.find(i => i.itemId === item.id);
          if (savedItem) {
            if (savedItem.notes) {
              setOriginalNotes(prev => ({ ...prev, [item.id]: savedItem.notes }));
            }
            if (savedItem.photos && savedItem.photos.length > 0) {
              let photoObjects = savedItem.photos;
              // Handle both old format (base64 strings) and new format (objects with url)
              if (typeof savedItem.photos[0] === 'string') {
                // Check if it's base64 or URL
                const firstPhoto = savedItem.photos[0];
                if (firstPhoto.startsWith('data:image')) {
                  // Old format: base64
                  photoObjects = savedItem.photos.map((url) => ({ url, comment: null }));
                } else {
                  // New format: URL string
                  photoObjects = savedItem.photos.map((url) => ({ url, comment: null }));
                }
              }
              
              // Store photo objects with url property
              setOriginalPhotoData(prev => ({ ...prev, [item.id]: photoObjects }));
              const fileList = photoObjects.map((photoObj, index) => {
                const photoUrl = photoObj.url || photoObj;
                return {
                  uid: `existing-${item.id}-${index}`,
                  name: `photo-${index + 1}.jpg`,
                  status: 'done',
                  url: photoUrl,
                  thumbUrl: photoUrl
                };
              });
              setPhotos(prev => ({ ...prev, [item.id]: fileList }));
              setPhotoData(prev => ({ ...prev, [item.id]: photoObjects }));
              
              const commentsMap = {};
              photoObjects.forEach((photoObj, index) => {
                if (photoObj.comment) {
                  if (!commentsMap[item.id]) commentsMap[item.id] = {};
                  commentsMap[item.id][index] = photoObj.comment;
                }
              });
              setPhotoComments(prev => ({ ...prev, ...commentsMap }));
            } else {
              setPhotos(prev => {
                const existing = prev[item.id] || [];
                const pendingFiles = existing.filter(f => f.originFileObj || f.status === 'uploading');
                if (pendingFiles.length > 0) {
                  return { ...prev, [item.id]: pendingFiles };
                }
                const updated = { ...prev };
                delete updated[item.id];
                return updated;
              });
            }
          }
        }
        
        if (existingItem && notesToSave) {
          setNotes(prev => ({ ...prev, [item.id]: '' }));
        }
      } else {
        if (!silent) {
          notify.error('Failed to save item');
        }
      }
    } catch (error) {
      notify.error('Failed to save item');
    } finally {
      setSavingItems(prev => ({ ...prev, [item.id]: false }));
    }
  };

  const handlePhotoUpload = async (id, files) => {
    if (!files || files.length === 0) return;

    const existingPhotos = photoData[id] || [];
    const existingUrls = new Set(existingPhotos.map(p => typeof p === 'string' ? p : (p?.url || p)));
    
    // Filter out files that are already uploaded
    const newFiles = Array.from(files).filter((file) => {
      // Create a temporary URL for preview
      const tempUrl = URL.createObjectURL(file);
      return !existingUrls.has(tempUrl);
    });

    if (newFiles.length === 0) {
      return;
    }

    // Upload new files to server
    try {
      const formData = new FormData();
      newFiles.forEach((file) => {
        formData.append('photos', file);
      });

      const uploadResponse = await fetch(
        '/api/inspection-checklists/photos/upload',
        {
          method: 'POST',
          body: formData,
        },
        { operation: 'Upload photos' }
      );

      if (uploadResponse.ok) {
        const result = await uploadResponse.json();
        const uploadedPhotos = result.photos || [];

        // Combine existing photos with newly uploaded ones
        const allPhotos = [...existingPhotos, ...uploadedPhotos.map(p => ({ url: p.url, comment: null }))];

        // Update fileList with uploaded URLs
        const validFileList = uploadedPhotos.map((uploadedPhoto, index) => ({
          uid: `upload-${id}-${Date.now()}-${index}`,
          status: 'done',
          name: uploadedPhoto.filename || `photo-${index + 1}.jpg`,
          url: uploadedPhoto.url,
          thumbUrl: uploadedPhoto.url
        }));

        // Merge with existing photos
        const existingFileList = photos[id] || [];
        setPhotos(prev => ({ ...prev, [id]: [...existingFileList, ...validFileList] }));
        setPhotoData(prev => ({ ...prev, [id]: allPhotos }));

        // Auto-save if checklist exists
        if (existingChecklist?.id && inspectionDate) {
          const item = checklist.find(i => i.id === id);
          if (item) {
            handleSaveItem(item, true, allPhotos).catch(err => {
              console.error('Failed to auto-save photos:', err);
            });
          }
        }

        if (allPhotos.length > 0 && !checklistData[id]) {
          setChecklistData(prev => ({ ...prev, [id]: true }));
        }

        // Reset file input
        if (fileInputRefs.current[id]) {
          fileInputRefs.current[id].value = '';
        }
      } else {
        notify.error('Failed to upload photos');
      }
    } catch (error) {
      console.error('Failed to upload photos:', error);
      notify.error('Failed to upload photos');
    }
  };

  const handleSave = async () => {
    if (!inspectionDate) {
      notify.warning('Please select an inspection date');
      return;
    }

    await withLoading(async () => {
      const leaseTenant = tenant?.leaseTenants?.[0];
      const lease = leaseTenant?.lease;
      const unit = lease?.unit;
      const property = unit?.property;

      let checklistId = existingChecklist?.id;

      if (!checklistId) {
        const createResponse = await fetch(
          '/api/inspection-checklists',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              checklistType,
              inspectionDate: inspectionDate ? dayjs(inspectionDate).format('YYYY-MM-DD') : null,
              items: [],
              leaseId: lease?.id || null,
              propertyId: property?.id || null,
              unitId: unit?.id || null
            })
          },
          { operation: 'Create checklist' }
        );

        if (createResponse.ok) {
          const newChecklist = await createResponse.json();
          checklistId = newChecklist.id;
          setExistingChecklist(newChecklist);
        } else {
          notify.error('Failed to create checklist');
          return;
        }
      }

      const itemsToSave = checklist.filter(item => 
        checklistData[item.id] || notes[item.id] || (photoData[item.id] && photoData[item.id].length > 0)
      );

      if (itemsToSave.length === 0) {
        notify.warning('Please check at least one item or add notes/photos before saving');
        return;
      }

      const savePromises = itemsToSave.map(item => handleSaveItem(item, true));
      await Promise.all(savePromises);

      notify.success('Checklist saved successfully');
    }).catch(error => {
      notify.error('Failed to save checklist');
    });
  };

  const completedCount = Object.values(checklistData).filter(Boolean).length;
  const totalCount = checklist.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleExportPDF = () => {
    notify.info('PDF generation coming soon');
  };

  const statsData = [
    {
      title: 'Completed',
      value: `${completedCount}/${totalCount}`,
      prefix: <HiCheckCircle className="h-5 w-5" />,
      valueStyle: { color: completionPercentage === 100 ? '#52c41a' : '#1890ff' },
    },
    {
      title: 'Progress',
      value: `${completionPercentage}%`,
      prefix: <HiClock className="h-5 w-5" />,
      valueStyle: { color: '#52c41a' },
    },
  ];

  return (
    <PageLayout
      headerTitle={<><HiDocumentText className="inline mr-2" /> Move-in/out Checklist</>}
      headerActions={[
        <Button
          key="save"
          color="blue"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? <Spinner size="sm" className="mr-2" /> : <HiSave className="mr-2 h-4 w-4" />}
          Save Checklist
        </Button>,
        <Button
          key="export"
          color="light"
          onClick={handleExportPDF}
        >
          <HiDocumentText className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
      ]}
      stats={statsData}
      statsCols={2}
    >
      <Card className="mb-6">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Checklist Type:</span>
            <div className="inline-flex rounded-lg" role="group">
              <Button
                color={checklistType === 'move-in' ? 'blue' : 'light'}
                onClick={() => setChecklistType('move-in')}
                className="rounded-r-none"
              >
                Move in
              </Button>
              <Button
                color={checklistType === 'move-out' ? 'blue' : 'light'}
                onClick={() => setChecklistType('move-out')}
                className="rounded-l-none"
              >
                Move out
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="inspectionDate" className="font-semibold">Inspection Date:</Label>
            <TextInput
              id="inspectionDate"
              type="date"
              value={inspectionDate}
              onChange={(e) => setInspectionDate(e.target.value)}
              className="w-40"
            />
          </div>
        </div>
        {completionPercentage === 100 && (
          <Alert color="success" className="mt-4">
            <div className="font-semibold">All items completed</div>
          </Alert>
        )}
      </Card>

      <Accordion collapseAll>
        {Object.entries(groupedChecklist).map(([category, items]) => {
          const categoryCompleted = items.filter(item => checklistData[item.id] || (existingItems[item.id] && existingItems[item.id].isChecked)).length;
          const categoryTotal = items.length;
          
          return (
            <Accordion.Panel key={category}>
              <Accordion.Title>
                <div className="flex items-center justify-between w-full">
                  <span className="font-semibold">{category}</span>
                  <Badge color={categoryCompleted === categoryTotal ? 'success' : 'info'}>
                    {categoryCompleted}/{categoryTotal}
                  </Badge>
                </div>
              </Accordion.Title>
              <Accordion.Content>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {items.map((item) => {
                    const existingItem = existingItems[item.id];
                    const hasNotes = existingItem?.notes && typeof existingItem.notes === 'string' && existingItem.notes.trim() !== '';
                    const hasPhotos = existingItem?.photos && existingItem.photos.length > 0;
                    const isSubmitted = existingItem && existingItem.isChecked && (hasNotes || hasPhotos);
                    const updateTimestamp = itemUpdateTimestamps[item.id];
                    const itemPhotos = photos[item.id] || [];
                    const itemPhotoData = photoData[item.id] || [];
                    const itemComments = photoComments[item.id] || {};
                    
                    return (
                      <div
                        key={item.id}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          isSubmitted 
                            ? 'bg-green-50 border-green-500' 
                            : checklistData[item.id] 
                            ? 'bg-blue-50 border-blue-500' 
                            : 'bg-gray-50 border-gray-300'
                        }`}
                      >
                        <div className="space-y-3">
                          {/* Header Row */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2 flex-1 min-w-0">
                              <Checkbox
                                checked={checklistData[item.id] || false}
                                onChange={(e) => handleCheckboxChange(item.id, e.target.checked)}
                              />
                              {isSubmitted ? (
                                <HiCheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                              ) : checklistData[item.id] ? (
                                <HiClock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                              ) : null}
                              <span 
                                className={`text-sm flex-1 ${
                                  checklistData[item.id] || isSubmitted ? 'font-semibold' : ''
                                } ${
                                  isSubmitted ? 'line-through text-gray-500' : ''
                                }`}
                              >
                                {item.label.split(' - ')[0]
                              </span>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {itemPhotoData.length > 0 && (
                                <Badge color="blue" className="text-xs">
                                  {itemPhotoData.length} photo{itemPhotoData.length !== 1 ? 's' : ''}
                                </Badge>
                              )}
                              {isSubmitted && updateTimestamp && (
                                <Badge color="success" className="text-xs">
                                  ✓ Submitted
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Photo Upload */}
                          <div>
                            <label
                              htmlFor={`photo-upload-${item.id}`}
                              className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex flex-col items-center justify-center pt-2 pb-3">
                                <HiCamera className="h-6 w-6 text-blue-600 mb-1" />
                                <p className="text-xs text-gray-500">Click or drag photos</p>
                              </div>
                              <FileInput
                                id={`photo-upload-${item.id}`}
                                ref={(el) => { fileInputRefs.current[item.id] = el; }}
                                accept="image/*"
                                multiple
                                onChange={(e) => {
                                  const files = e.target.files;
                                  if (files && files.length > 0) {
                                    handlePhotoUpload(item.id, files);
                                  }
                                }}
                                className="hidden"
                              />
                            </label>
                            
                            {itemPhotoData.length > 0 && (
                              <div className="mt-2 space-y-2 border border-gray-200 rounded-lg bg-white p-2">
                                {itemPhotoData.map((photoObj, photoIndex) => {
                                  // Handle both old format (base64 string) and new format (object with url)
                                  const photoUrl = typeof photoObj === 'string' 
                                    ? photoObj 
                                    : (photoObj?.url || photoObj);
                                  const fileName = itemPhotos[photoIndex]?.name || `Photo ${photoIndex + 1}`;
                                  return (
                                    <div 
                                      key={photoIndex} 
                                      className="flex items-center gap-2 p-2 border-b border-gray-100 last:border-b-0"
                                    >
                                      <div className="relative flex-shrink-0">
                                        <Image
                                          src={photoUrl}
                                          alt={fileName}
                                          width={50}
                                          height={50}
                                          className="object-cover rounded"
                                        />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="text-xs font-semibold truncate mb-1">
                                          {fileName}
                                        </div>
                                        <TextInput
                                          placeholder="Add a comment..."
                                          value={itemComments[photoIndex] || ''}
                                          onChange={(e) => handlePhotoCommentChange(item.id, photoIndex, e.target.value)}
                                          size="sm"
                                          onBlur={() => {
                                            if (existingChecklist?.id && inspectionDate) {
                                              const itemObj = checklist.find(i => i.id === item.id);
                                              if (itemObj) {
                                                handleSaveItem(itemObj, true).catch(err => {
                                                  console.error('Failed to auto-save photo comment:', err);
                                                });
                                              }
                                            }
                                          }}
                                        />
                                      </div>
                                      <Button
                                        color="failure"
                                        size="sm"
                                        onClick={() => handleDeletePhoto(item.id, photoIndex)}
                                        className="flex-shrink-0"
                                      >
                                        <HiTrash className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* Notes */}
                          <div>
                            <Textarea
                              placeholder="Add notes..."
                              rows={2}
                              value={notes[item.id] || ''}
                              onChange={(e) => handleNoteChange(item.id, e.target.value)}
                              onBlur={() => {
                                if (existingChecklist?.id && inspectionDate) {
                                  const itemObj = checklist.find(i => i.id === item.id);
                                  if (itemObj) {
                                    handleSaveItem(itemObj, true).catch(err => {
                                      console.error('Failed to auto-save note:', err);
                                    });
                                  }
                                }
                              }}
                            />
                          </div>

                          {/* Saving indicator */}
                          {savingItems[item.id] && (
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Spinner size="sm" />
                              <span>Saving...</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Accordion.Content>
            </Accordion.Panel>
          );
        })}
      </Accordion>
    </PageLayout>
  );
}
