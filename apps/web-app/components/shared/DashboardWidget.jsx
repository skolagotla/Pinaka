"use client";

import { Card, Typography, Space, Button } from 'antd';
import { EditOutlined, CloseOutlined } from '@ant-design/icons';
import { useState } from 'react';

const { Title, Text } = Typography;

export default function DashboardWidget({
  id,
  title,
  children,
  icon,
  onEdit,
  onRemove,
  editable = false,
  style = {},
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      style={{
        height: '100%',
        position: 'relative',
        ...style,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={
        <Space>
          {icon}
          <span>{title}</span>
        </Space>
      }
      extra={
        editable && isHovered && (
          <Space>
            {onEdit && (
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={onEdit}
              />
            )}
            {onRemove && (
              <Button
                type="text"
                size="small"
                danger
                icon={<CloseOutlined />}
                onClick={onRemove}
              />
            )}
          </Space>
        )
      }
    >
      {children}
    </Card>
  );
}

