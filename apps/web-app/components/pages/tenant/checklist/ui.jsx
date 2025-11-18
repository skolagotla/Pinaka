"use client";

import { useState, useEffect } from 'react';
import { Card, Checkbox, Button, Space, Typography, Row, Col, Alert, DatePicker, Input, Upload, Tag, Divider, Collapse, Modal } from 'antd';
import Image from 'next/image';
import { CheckCircleOutlined, ClockCircleOutlined, CameraOutlined, SaveOutlined, FileTextOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { PageLayout } from '@/components/shared';
import { useUnifiedApi } from '@/lib/hooks/useUnifiedApi';
import { useLoading } from '@/lib/hooks/useLoading';
import { notify } from '@/lib/utils/notification-helper';
import dayjs from 'dayjs';
import { formatDateTimeDisplay } from '@/lib/utils/safe-date-formatter';

const { Text } = Typography;
const { TextArea } = Input;

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
  const [inspectionDate, setInspectionDate] = useState(null);
  const [existingChecklist, setExistingChecklist] = useState(null);
  const [existingItems, setExistingItems] = useState({});
  const [itemUpdateTimestamps, setItemUpdateTimestamps] = useState({});
  const [savingItems, setSavingItems] = useState({});
  const [originalNotes, setOriginalNotes] = useState({});
  const [originalPhotoData, setOriginalPhotoData] = useState({});

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
              setInspectionDate(dayjs(new Date(year, month, day)));
            } else {
              setInspectionDate(null);
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
            setInspectionDate(null);
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

  const handlePhotoUpload = async (id, fileList) => {
    const existingPhotos = photoData[id] || [];
    const existingUrls = new Set(existingPhotos.map(p => typeof p === 'string' ? p : (p?.url || p)));
    
    // Filter out files that are already uploaded
    const newFiles = fileList.filter((file) => {
      const fileUrl = file.url || file.thumbUrl;
      return !fileUrl || !existingUrls.has(fileUrl);
    });

    if (newFiles.length === 0) {
      // Update fileList even if no new files
      const validFileList = fileList.map((file, index) => ({
        ...file,
        uid: file.uid || `upload-${id}-${Date.now()}-${index}`,
        status: file.status || 'done',
        name: file.name || (file.originFileObj ? file.originFileObj.name : `photo-${index + 1}.jpg`)
      })).filter(f => f && f.uid);
      setPhotos(prev => ({ ...prev, [id]: validFileList }));
      return;
    }

    // Upload new files to server
    try {
      const formData = new FormData();
      newFiles.forEach((file) => {
        if (file.originFileObj) {
          formData.append('photos', file.originFileObj);
        }
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
        const validFileList = fileList.map((file, index) => {
          // If this is a new file, find its uploaded URL
          if (file.originFileObj && newFiles.includes(file)) {
            const uploadedIndex = newFiles.indexOf(file);
            const uploadedPhoto = uploadedPhotos[uploadedIndex];
            if (uploadedPhoto) {
              return {
                ...file,
                uid: file.uid || `upload-${id}-${Date.now()}-${index}`,
                status: 'done',
                name: file.name || uploadedPhoto.filename,
                url: uploadedPhoto.url,
                thumbUrl: uploadedPhoto.url
              };
            }
          }
          return {
            ...file,
            uid: file.uid || `upload-${id}-${Date.now()}-${index}`,
            status: file.status || 'done',
            name: file.name || (file.originFileObj ? file.originFileObj.name : `photo-${index + 1}.jpg`)
          };
        }).filter(f => f && f.uid);

        setPhotos(prev => ({ ...prev, [id]: validFileList }));
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

      notify.success('Checklist saved successfully!');
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
      prefix: <CheckCircleOutlined />,
      valueStyle: { color: completionPercentage === 100 ? '#52c41a' : '#1890ff' },
    },
    {
      title: 'Progress',
      value: `${completionPercentage}%`,
      prefix: <ClockCircleOutlined />,
      valueStyle: { color: '#52c41a' },
    },
  ];

  return (
    <PageLayout
      headerTitle={<><FileTextOutlined /> Move-in/out Checklist</>}
      headerActions={[
        <Button
          key="save"
          type="primary"
          icon={<SaveOutlined />}
          onClick={handleSave}
          loading={loading}
        >
          Save Checklist
        </Button>,
        <Button
          key="export"
          icon={<FileTextOutlined />}
          onClick={handleExportPDF}
        >
          Export PDF
        </Button>,
      ]}
      stats={statsData}
      statsCols={2}
    >

      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col>
            <Space>
              <Text strong>Checklist Type:</Text>
              <Button.Group>
                <Button
                  type={checklistType === 'move-in' ? 'primary' : 'default'}
                  onClick={() => setChecklistType('move-in')}
                >
                  Move in
                </Button>
                <Button
                  type={checklistType === 'move-out' ? 'primary' : 'default'}
                  onClick={() => setChecklistType('move-out')}
                >
                  Move out
                </Button>
              </Button.Group>
            </Space>
          </Col>
          <Col>
            <Space>
              <Text strong>Inspection Date:</Text>
              <DatePicker
                value={inspectionDate}
                onChange={setInspectionDate}
                format="MMM D, YYYY"
              />
            </Space>
          </Col>
        </Row>
        {completionPercentage === 100 && (
          <Alert
            message="All items completed!"
            type="success"
            showIcon
            style={{ marginTop: 16 }}
          />
        )}
      </Card>

      <Collapse
        items={Object.entries(groupedChecklist).map(([category, items]) => {
          const categoryCompleted = items.filter(item => checklistData[item.id] || (existingItems[item.id] && existingItems[item.id].isChecked)).length;
          const categoryTotal = items.length;
          
          return {
            key: category,
            label: (
              <Space>
                <Text strong>{category}</Text>
                <Tag color={categoryCompleted === categoryTotal ? 'success' : 'processing'}>
                  {categoryCompleted}/{categoryTotal}
                </Tag>
              </Space>
            ),
            children: (
              <Row gutter={[16, 16]}>
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
                    <Col key={item.id} xs={24} sm={24} md={12} lg={8} xl={6}>
                      <div
                        style={{
                          background: isSubmitted ? '#f6ffed' : checklistData[item.id] ? '#e6f7ff' : '#fafafa',
                          border: isSubmitted ? '1px solid #52c41a' : checklistData[item.id] ? '1px solid #1890ff' : '1px solid #d9d9d9',
                          borderRadius: 8,
                          padding: '12px',
                          marginBottom: 12,
                          transition: 'all 0.3s'
                        }}
                      >
                        <Space direction="vertical" style={{ width: '100%' }} size={12}>
                          {/* Header Row */}
                          <Row gutter={8} align="middle" justify="space-between">
                            <Col flex="auto">
                              <Space>
                                <Checkbox
                                  checked={checklistData[item.id] || false}
                                  onChange={(e) => handleCheckboxChange(item.id, e.target.checked)}
                                />
                                {isSubmitted ? (
                                  <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />
                                ) : checklistData[item.id] ? (
                                  <ClockCircleOutlined style={{ color: '#1890ff', fontSize: 18 }} />
                                ) : null}
                                <Text 
                                  strong={checklistData[item.id] || isSubmitted} 
                                  style={{ 
                                    textDecoration: isSubmitted ? 'line-through' : 'none',
                                    color: isSubmitted ? '#8c8c8c' : 'inherit',
                                    fontSize: 13
                                  }}
                                >
                                  {item.label.split(' - ')[0]}
                                </Text>
                              </Space>
                            </Col>
                            <Col>
                              <Space>
                                {itemPhotoData.length > 0 && (
                                  <Tag color="blue" style={{ fontSize: 11 }}>
                                    {itemPhotoData.length} photo{itemPhotoData.length !== 1 ? 's' : ''}
                                  </Tag>
                                )}
                                {isSubmitted && updateTimestamp && (
                                  <Tag color="success" style={{ fontSize: 10 }}>
                                    ✓ Submitted
                                  </Tag>
                                )}
                              </Space>
                            </Col>
                          </Row>

                          {/* Photo Upload and List */}
                          <div>
                            <Upload.Dragger
                              fileList={itemPhotos}
                              onChange={({ fileList }) => handlePhotoUpload(item.id, fileList)}
                              beforeUpload={() => false}
                              accept="image/*"
                              multiple
                              showUploadList={false}
                              style={{ 
                                marginBottom: 8,
                                padding: '16px',
                                background: '#fafafa',
                                border: '1px dashed #d9d9d9',
                                borderRadius: 4
                              }}
                            >
                              <p className="ant-upload-drag-icon" style={{ margin: 0 }}>
                                <CameraOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                              </p>
                              <p className="ant-upload-text" style={{ margin: '8px 0 4px', fontSize: 12 }}>
                                Click or drag photos to upload
                              </p>
                            </Upload.Dragger>
                            
                            {itemPhotoData.length > 0 && (
                              <div style={{ 
                                marginTop: 8,
                                border: '1px solid #e8e8e8',
                                borderRadius: 4,
                                background: '#fff'
                              }}>
                                {itemPhotoData.map((photoObj, photoIndex) => {
                                  // Handle both old format (base64 string) and new format (object with url)
                                  const photoUrl = typeof photoObj === 'string' 
                                    ? photoObj 
                                    : (photoObj?.url || photoObj);
                                  const fileName = itemPhotos[photoIndex]?.name || `Photo ${photoIndex + 1}`;
                                  return (
                                    <div 
                                      key={photoIndex} 
                                      style={{ 
                                        padding: '8px 12px',
                                        borderBottom: photoIndex < itemPhotoData.length - 1 ? '1px solid #f0f0f0' : 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 12
                                      }}
                                    >
                                      <div style={{ position: 'relative', flexShrink: 0 }}>
                                        <Image
                                          src={photoUrl}
                                          alt={fileName}
                                          width={50}
                                          height={50}
                                          style={{ 
                                            objectFit: 'cover',
                                            borderRadius: 4
                                          }}
                                          preview={{
                                            mask: <EyeOutlined />
                                          }}
                                        />
                                      </div>
                                      <div style={{ flex: 1, minWidth: 0 }}>
                                        <Text 
                                          strong 
                                          style={{ 
                                            fontSize: 12, 
                                            display: 'block',
                                            marginBottom: 4,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                          }}
                                        >
                                          {fileName}
                                        </Text>
                                        <Input
                                          placeholder="Add a comment for this photo..."
                                          value={itemComments[photoIndex] || ''}
                                          onChange={(e) => handlePhotoCommentChange(item.id, photoIndex, e.target.value)}
                                          size="small"
                                          style={{ fontSize: 11 }}
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
                                        type="text"
                                        danger
                                        icon={<DeleteOutlined />}
                                        size="small"
                                        onClick={() => handleDeletePhoto(item.id, photoIndex)}
                                        style={{ flexShrink: 0 }}
                                        title="Delete photo"
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </Space>
                      </div>
                    </Col>
                  );
                })}
              </Row>
            )
          };
        })}
        defaultActiveKey={Object.keys(groupedChecklist)}
        style={{ marginBottom: 16 }}
      />
    </PageLayout>
  );
}
