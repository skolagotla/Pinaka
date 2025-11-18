"use client";

import { useState, useMemo, useRef } from 'react';
import { Card, Table, Tag, Button, Space, Typography, Row, Col, Modal, Input, Select, Descriptions, Badge, Empty, Divider, Tabs, Radio, Collapse, FloatButton, Carousel, Tooltip } from 'antd';
import Image from 'next/image';
import { CheckCircleOutlined, CloseCircleOutlined, EyeOutlined, CheckOutlined, CloseOutlined, FileTextOutlined, DownloadOutlined, LeftOutlined, RightOutlined, ClockCircleOutlined, SendOutlined } from '@ant-design/icons';
import { PageLayout, TableWrapper, renderDate } from '@/components/shared';
import { renderStatus } from '@/components/shared/TableRenderers';
import { STANDARD_COLUMNS, customizeColumn } from '@/lib/constants/standard-columns';
import { notify } from '@/lib/utils/notification-helper';
import { useUnifiedApi } from '@/lib/hooks/useUnifiedApi';
import { useModalState } from '@/lib/hooks/useModalState';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function PMCInspectionsClient({ initialChecklists = [] }) {
  const { fetch } = useUnifiedApi({ showUserMessage: true });
  const [checklists, setChecklists] = useState(initialChecklists);
  const { editingItem: selectedChecklist, setEditingItem: setSelectedChecklist, openForEdit: openDetailModalForEdit } = useModalState();
  const { isOpen: detailModalOpen, open: openDetailModal, close: closeDetailModal } = useModalState();
  const { isOpen: photoModalOpen, open: openPhotoModal, close: closePhotoModal, editingItem: selectedPhotos, setEditingItem: setSelectedPhotos } = useModalState({ defaultItem: [] });
  const [landlordNotes, setLandlordNotes] = useState({});
  const [itemApprovals, setItemApprovals] = useState({});
  const [rejectionReason, setRejectionReason] = useState('');
  const [activeCategories, setActiveCategories] = useState([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState({}); // { itemId: index }
  const [globalCarouselIndex, setGlobalCarouselIndex] = useState(0); // Index for all photos carousel
  const carouselRef = useRef(null);

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
    // Initialize photo indices for carousel
    const photoIndices = {};
    checklist.items.forEach(item => {
      if (item.photos && item.photos.length > 0) {
        photoIndices[item.id] = 0; // Start at first photo
      }
    });
    setCurrentPhotoIndex(photoIndices);
    // Reset global carousel index
    setGlobalCarouselIndex(0);
    // Expand all categories by default
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

      // Use v1Api client
      const { v1Api } = await import('@/lib/api/v1-client');
      const response = await v1Api.inspections.update(selectedChecklist.id, {
        status: 'approved',
        items
      });
      const updated = response.data || response;
      setChecklists(prev => prev.map(c => c.id === updated.id ? updated : c));
      notify.success('Checklist approved successfully');
      closeDetailModal();
    } catch (error) {
      notify.error('Failed to approve checklist');
    }
  };

  const handleRejectChecklist = async () => {
    if (!selectedChecklist) return;
    
    // Prompt for rejection reason
    Modal.confirm({
      title: 'Reject Checklist',
      content: (
        <div style={{ marginTop: 16 }}>
          <TextArea
            rows={4}
            placeholder="Please provide a reason for rejection..."
            onChange={(e) => setRejectionReason(e.target.value)}
            style={{ marginTop: 8 }}
          />
        </div>
      ),
      okText: 'Reject',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      onOk: async () => {
        if (!rejectionReason.trim()) {
          notify.warning('Please provide a reason for rejection');
          return Promise.reject();
        }

        try {
          // Use v1Api client
          const { v1Api } = await import('@/lib/api/v1-client');
          const response = await v1Api.inspections.update(selectedChecklist.id, {
            status: 'rejected',
            rejectionReason
          });
          const updated = response.data || response;
          setChecklists(prev => prev.map(c => c.id === updated.id ? updated : c));
          notify.success('Checklist rejected');
          closeDetailModal();
          setRejectionReason('');
        } catch (error) {
          notify.error('Failed to reject checklist');
        }
      }
    });
  };

  const columns = [
    {
      title: 'Tenant',
      dataIndex: ['tenant', 'firstName'],
      key: 'tenant',
      align: 'center',
      render: (_, record) => (
        <Text strong>{record.tenant.firstName} {record.tenant.lastName}</Text>
      )
    },
    {
      title: 'Type',
      dataIndex: 'checklistType',
      key: 'checklistType',
      align: 'center',
      render: (type) => (
        <Tag color={type === 'move-in' ? 'blue' : 'orange'}>
          {type === 'move-in' ? 'Move-in' : 'Move-out'}
        </Tag>
      )
    },
    {
      title: 'Inspection Date',
      dataIndex: 'inspectionDate',
      key: 'inspectionDate',
      align: 'center',
      render: (_, record) => renderDate(record.inspectionDate)
    },
    {
      title: 'Items',
      key: 'items',
      align: 'center',
      render: (_, record) => {
        const checkedCount = record.items.filter(i => i.isChecked).length;
        const totalCount = record.items.length;
        return `${checkedCount}/${totalCount}`;
      }
    },
    customizeColumn(STANDARD_COLUMNS.CREATED_DATE, {
      title: 'Submitted',
      dataIndex: 'submittedAt',
      align: 'center',
      render: (_, record) => renderDate(record.submittedAt)
    }),
    customizeColumn(STANDARD_COLUMNS.STATUS, {
      align: 'center',
      render: (status) => {
        const statusMap = {
          pending: 'Pending',
          submitted: 'In Progress',
          approved: 'Completed',
          rejected: 'Cancelled'
        };
        return renderStatus(statusMap[status] || status, {
          customColors: {
            'Pending': 'orange',
            'In Progress': 'blue',
            'Completed': 'green',
            'Cancelled': 'red'
          }
        });
      }
    }),
    {
      title: 'Actions',
      key: 'actions',
      align: 'center',
      render: (_, record) => {
        return (
          <Space size="middle">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
              title="View Details"
            />
          </Space>
        );
      }
    }
  ];

  const renderChecklistDetails = () => {
    if (!selectedChecklist) return null;

    const groupedItems = selectedChecklist.items.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});

    return (
      <div>
        {/* Banner in single row with all values in one box - evenly spaced */}
        <Card 
          style={{ 
            marginBottom: 24,
            background: 'linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%)',
            border: '1px solid #e8e8e8',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}
          bodyStyle={{ padding: '20px 24px' }}
        >
          <Row gutter={[0, 0]} align="middle" justify="space-between">
            <Col flex="1" style={{ textAlign: 'center' }}>
              <div>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Tenant</Text>
                <Text strong style={{ fontSize: 15 }}>{selectedChecklist.tenant.firstName} {selectedChecklist.tenant.lastName}</Text>
              </div>
            </Col>
            <Divider type="vertical" style={{ height: 40, margin: '0 16px' }} />
            <Col flex="1" style={{ textAlign: 'center' }}>
              <div>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Type</Text>
                <Tag 
                  color={selectedChecklist.checklistType === 'move-in' ? 'blue' : 'orange'}
                  style={{ margin: 0, fontSize: 13, padding: '4px 12px' }}
                >
                  {selectedChecklist.checklistType === 'move-in' ? 'Move-in' : 'Move-out'}
                </Tag>
              </div>
            </Col>
            <Divider type="vertical" style={{ height: 40, margin: '0 16px' }} />
            <Col flex="1" style={{ textAlign: 'center' }}>
              <div>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Inspection Date</Text>
                <Text strong style={{ fontSize: 15 }}>
                  {formatDateDisplay(selectedChecklist.inspectionDate)}
                </Text>
              </div>
            </Col>
            <Divider type="vertical" style={{ height: 40, margin: '0 16px' }} />
            <Col flex="1" style={{ textAlign: 'center' }}>
              <div>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Status</Text>
                <Badge 
                  status={selectedChecklist.status === 'approved' ? 'success' : selectedChecklist.status === 'rejected' ? 'error' : 'processing'} 
                  text={
                    <Text strong style={{ fontSize: 13 }}>
                      {selectedChecklist.status.charAt(0).toUpperCase() + selectedChecklist.status.slice(1)}
                    </Text>
                  }
                />
              </div>
            </Col>
            {selectedChecklist.status === 'submitted' && (
              <>
                <Divider type="vertical" style={{ height: 40, margin: '0 16px' }} />
                <Col>
                  <Space>
                    <Tooltip title="Reject Checklist">
                      <Button
                        type="default"
                        danger
                        icon={<CloseCircleOutlined />}
                        onClick={handleRejectChecklist}
                        shape="circle"
                        size="large"
                      />
                    </Tooltip>
                    <Tooltip title="Approve Checklist">
                      <Button
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        onClick={handleApproveChecklist}
                        shape="circle"
                        size="large"
                      />
                    </Tooltip>
                  </Space>
                </Col>
              </>
            )}
            {selectedChecklist.status === 'approved' && (
              <>
                <Divider type="vertical" style={{ height: 40, margin: '0 16px' }} />
                <Col>
                  <Tooltip title="Download PDF">
                    <Button
                      type="primary"
                      icon={<DownloadOutlined />}
                      onClick={() => {
                        window.open(`/api/inspection-checklists/${selectedChecklist.id}/download-pdf`, '_blank');
                      }}
                      shape="circle"
                      size="large"
                    />
                  </Tooltip>
                </Col>
              </>
            )}
          </Row>
        </Card>

        {/* Global Photo Carousel with Notes Panel */}
        {(() => {
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

          if (allPhotos.length > 0) {
            const currentPhoto = allPhotos[globalCarouselIndex];
            
            return (
              <Card 
                style={{ 
                  marginBottom: 24,
                  border: '1px solid #e8e8e8',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                }}
                bodyStyle={{ padding: '24px' }}
              >
                <Row gutter={24}>
                  {/* Photo Carousel - Left Side */}
                  <Col span={16}>
                    <div style={{ marginBottom: 12 }}>
                      <Text strong style={{ fontSize: 14, color: '#262626' }}>
                        All Photos ({allPhotos.length})
                      </Text>
                      {allPhotos.length > 1 && (
                        <Text type="secondary" style={{ marginLeft: 12, fontSize: 13 }}>
                          {globalCarouselIndex + 1} / {allPhotos.length}
                        </Text>
                      )}
                    </div>
                    <div style={{ 
                      borderRadius: 8,
                      overflow: 'hidden',
                      border: '2px solid #e8e8e8',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      background: '#000',
                      height: '500px'
                    }}>
                      <Carousel
                        ref={carouselRef}
                        afterChange={(current) => {
                          setGlobalCarouselIndex(current);
                        }}
                        dots={allPhotos.length > 1}
                        arrows={allPhotos.length > 1}
                        effect="scrollx"
                        autoplay={false}
                        style={{ height: '500px' }}
                      >
                        {allPhotos.map((photoData, idx) => (
                          <div key={idx}>
                            <div style={{ 
                              height: '500px', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              background: '#000'
                            }}>
                              <img
                                src={photoData.photo}
                                alt={`${photoData.itemLabel} - Photo ${photoData.photoIndex + 1}`}
                                style={{
                                  maxWidth: '100%',
                                  maxHeight: '100%',
                                  objectFit: 'contain',
                                  cursor: 'pointer'
                                }}
                                onClick={() => {
                                  const modal = Modal.info({
                                    title: `${photoData.itemLabel} - Photo ${photoData.photoIndex + 1}`,
                                    content: (
                                      <img
                                        src={photoData.photo}
                                        alt={`${photoData.itemLabel} - Photo ${photoData.photoIndex + 1}`}
                                        style={{
                                          width: '100%',
                                          height: 'auto'
                                        }}
                                      />
                                    ),
                                    width: '90%',
                                    styles: {
                                      body: { padding: 0 }
                                    },
                                    footer: null
                                  });
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </Carousel>
                    </div>
                  </Col>

                  {/* Notes Panel - Right Side */}
                  <Col span={8}>
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                      {/* Photo Comment */}
                      {currentPhoto.photoComment && (
                        <div>
                          <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 8, color: '#1890ff' }}>
                            Photo Comment
                          </Text>
                          <div style={{
                            padding: '12px',
                            background: '#fff7e6',
                            borderRadius: 6,
                            border: '1px solid #ffd591',
                            minHeight: '40px'
                          }}>
                            <Text style={{ fontSize: 13, color: '#ad6800', lineHeight: 1.6 }}>
                              {currentPhoto.photoComment}
                            </Text>
                          </div>
                        </div>
                      )}

                      {/* Item Info */}
                      <div>
                        <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          Item
                        </Text>
                        <div style={{ marginTop: 4 }}>
                          <Text strong style={{ fontSize: 14, color: '#262626' }}>
                            {currentPhoto.itemLabel}
                          </Text>
                        </div>
                        <Tag color="blue" style={{ marginTop: 8, fontSize: 11 }}>
                          {currentPhoto.itemCategory}
                        </Tag>
                      </div>

                      {/* Tenant Notes */}
                      {currentPhoto.itemNotes && (
                        <div>
                          <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 8, color: '#1890ff' }}>
                            Tenant Notes
                          </Text>
                          <div style={{
                            padding: '12px',
                            background: '#e6f7ff',
                            borderRadius: 6,
                            border: '1px solid #91d5ff',
                            minHeight: '60px',
                            maxHeight: '150px',
                            overflowY: 'auto'
                          }}>
                            <Text style={{ fontSize: 13, color: '#0050b3', lineHeight: 1.6 }}>
                              {currentPhoto.itemNotes}
                            </Text>
                          </div>
                        </div>
                      )}

                      {/* Landlord Notes */}
                      <div style={{ flex: 1 }}>
                        <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 8, color: '#595959' }}>
                          Your Notes
                        </Text>
                        <TextArea
                          rows={8}
                          value={landlordNotes[`${currentPhoto.itemId}_${currentPhoto.photoIndex}`] || landlordNotes[currentPhoto.itemId] || ''}
                          onChange={(e) => handleSaveItemNotes(`${currentPhoto.itemId}_${currentPhoto.photoIndex}`, e.target.value)}
                          placeholder="Add your notes about this photo..."
                          style={{
                            borderRadius: 6,
                            border: '1px solid #d9d9d9',
                            resize: 'vertical',
                            overflowY: 'auto',
                            minHeight: '150px'
                          }}
                        />
                      </div>
                    </Space>
                  </Col>
                </Row>
              </Card>
            );
          }
          return null;
        })()}

      </div>
    );
  };

  const pendingCount = groupedChecklists.submitted.length;
  const totalCount = checklists.length;

  const stats = [
    {
      title: 'Pending Review',
      value: pendingCount,
      prefix: <ClockCircleOutlined />,
      valueStyle: { color: '#faad14' },
    },
    {
      title: 'Total Inspections',
      value: totalCount,
      prefix: <FileTextOutlined />,
      valueStyle: { color: '#1890ff' },
    },
  ];

  return (
    <PageLayout
      headerTitle={<><FileTextOutlined /> Tenant Inspections</>}
      stats={stats}
      statsCols={2}
    >
      <TableWrapper>
        <Table
          columns={columns}
          dataSource={checklists}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Total ${total} inspections` }}
          size="middle"
        />
      </TableWrapper>

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <FileTextOutlined style={{ fontSize: 20, color: '#1890ff' }} />
            <Text strong style={{ fontSize: 18 }}>
              {selectedChecklist?.tenant ? 
                `${selectedChecklist.tenant.firstName} ${selectedChecklist.tenant.lastName} ${selectedChecklist.checklistType === 'move-in' ? 'Move-in' : 'Move-out'} Checklist` :
                'Inspection Checklist Details'
              }
            </Text>
          </div>
        }
        open={detailModalOpen}
        onCancel={() => {
          closeDetailModal();
          setRejectionReason('');
        }}
        width={1000}
        styles={{
          body: { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', padding: '24px' }
        }}
        footer={null}
      >
        {renderChecklistDetails()}
      </Modal>

      <Modal
        title="Photos"
        open={photoModalOpen}
        onCancel={() => setPhotoModalOpen(false)}
        footer={null}
        width={800}
      >
        <Image.PreviewGroup>
          <Row gutter={16}>
            {selectedPhotos.map((photo, idx) => (
              <Col key={idx} span={8}>
                <Image
                  src={photo}
                  style={{ width: '100%', borderRadius: 4 }}
                  preview={{
                    mask: <EyeOutlined />
                  }}
                />
              </Col>
            ))}
          </Row>
        </Image.PreviewGroup>
      </Modal>
    </PageLayout>
  );
}

