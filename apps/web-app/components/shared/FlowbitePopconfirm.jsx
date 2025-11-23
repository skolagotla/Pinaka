"use client";

import React, { useState } from 'react';
import { Modal, Button } from 'flowbite-react';

/**
 * FlowbitePopconfirm Component
 * 
 * A Flowbite-compatible replacement for Ant Design's Popconfirm
 * Uses a Modal for confirmation dialogs
 * 
 * @param {string} title - Confirmation title
 * @param {string|ReactNode} description - Confirmation description
 * @param {function} onConfirm - Handler when confirmed
 * @param {string} okText - OK button text (default: "Yes")
 * @param {string} cancelText - Cancel button text (default: "No")
 * @param {boolean} danger - Show danger styling on OK button
 * @param {ReactNode} children - Element to wrap (triggers confirmation)
 */
export default function FlowbitePopconfirm({
  title = "Confirm",
  description,
  onConfirm,
  okText = "Yes",
  cancelText = "No",
  danger = false,
  children,
  ...props
}) {
  const [showModal, setShowModal] = useState(false);

  const handleConfirm = () => {
    setShowModal(false);
    if (onConfirm) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    setShowModal(false);
  };

  // Clone children and add onClick handler
  const childWithClick = React.cloneElement(children, {
    onClick: (e) => {
      e?.stopPropagation?.();
      setShowModal(true);
      if (children.props.onClick) {
        children.props.onClick(e);
      }
    },
  });

  return (
    <>
      {childWithClick}
      <Modal show={showModal} onClose={handleCancel} size="md">
        <Modal.Header>{title}</Modal.Header>
        <Modal.Body>
          {description && (
            <div className="mb-4">
              {typeof description === 'string' ? (
                <p className="text-gray-600">{description}</p>
              ) : (
                description
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button color="gray" onClick={handleCancel}>
            {cancelText}
          </Button>
          <Button color={danger ? 'failure' : 'blue'} onClick={handleConfirm}>
            {okText}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

