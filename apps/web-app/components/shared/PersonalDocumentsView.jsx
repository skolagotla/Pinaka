/**
 * Personal Documents View Component
 * 
 * Displays personal documents (checklist and table) without tabs or PageBanner
 * Used in admin/library page and can be embedded in other components
 */

"use client";

import { Card, Space, Empty, Table, Text } from 'antd';
import { FileProtectOutlined } from '@ant-design/icons';

export default function PersonalDocumentsView({
  userRole,
  renderDocumentChecklist,
  displayDocuments,
  library,
  documentsSearch,
  tableProps,
  selectedTenant,
}) {
  return (
    <div style={{ padding: '24px' }}>
      {renderDocumentChecklist && renderDocumentChecklist()}

      <Card
        title={
          <Space>
            <FileProtectOutlined style={{ fontSize: 18 }} />
            <Text strong style={{ fontSize: 16 }}>
              Documents: {displayDocuments.length}
            </Text>
          </Space>
        }
      >
        {library.loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Empty description="Loading documents..." />
          </div>
        ) : displayDocuments.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              userRole === 'landlord'
                ? (selectedTenant 
                    ? "No documents uploaded yet for this tenant." 
                    : "No documents found. Upload documents using the + button above.")
                : "No documents uploaded yet. Upload documents using the + button above."
            }
          />
        ) : (
          <Table
            {...tableProps}
            dataSource={documentsSearch.filteredData}
            rowKey="id"
            pagination={userRole === 'tenant' ? {
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} documents`,
            } : { pageSize: 25 }}
          />
        )}
      </Card>
    </div>
  );
}

