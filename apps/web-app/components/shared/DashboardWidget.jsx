"use client";

import { Card, Button, Tooltip } from 'flowbite-react';
import { HiPencil, HiX } from 'react-icons/hi';
import { useState } from 'react';

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
      className="h-full relative"
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon && <span>{icon}</span>}
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        {editable && isHovered && (
          <div className="flex items-center gap-2">
            {onEdit && (
              <Tooltip content="Edit">
                <Button
                  color="light"
                  size="sm"
                  onClick={onEdit}
                  className="p-2"
                >
                  <HiPencil className="h-4 w-4" />
                </Button>
              </Tooltip>
            )}
            {onRemove && (
              <Tooltip content="Remove">
                <Button
                  color="light"
                  size="sm"
                  onClick={onRemove}
                  className="p-2 text-red-600 hover:text-red-700"
                >
                  <HiX className="h-4 w-4" />
                </Button>
              </Tooltip>
            )}
          </div>
        )}
      </div>
      {children}
    </Card>
  );
}
