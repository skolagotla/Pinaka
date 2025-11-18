"use client";

import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Spin, Button, Space } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

// Configure PDF.js worker (use local worker for reliability)
if (typeof window !== 'undefined' && pdfjs.GlobalWorkerOptions) {
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

/**
 * PDF Viewer Modal for displaying rent receipts
 * Uses react-pdf for consistent rendering across all browsers
 * Used by both landlord and tenant sides
 * 
 * @param {Object} receipt - Receipt object to display
 * @param {Function} onClose - Callback when modal is closed
 * @param {string} pdfUrl - URL to the PDF view endpoint
 */
export default function PDFViewerModal({ receipt, onClose, pdfUrl }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loadError, setLoadError] = useState(false);

  if (!receipt) return null;

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
    setLoadError(false);
  }

  function onDocumentLoadError(error) {
    console.error('Error loading PDF:', error);
    setLoadError(true);
  }

  function changePage(offset) {
    setPageNumber(prevPageNumber => prevPageNumber + offset);
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }
  
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        padding: 20
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          width: "90%",
          maxWidth: 1200,
          height: "90%",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: "16px 24px",
          borderBottom: "1px solid #e8eaed",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "#202124" }}>
              Rent Receipt
            </h3>
            <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "#5f6368", fontFamily: "monospace" }}>
              {receipt.receiptNumber ? `#${receipt.receiptNumber}` : 'N/A'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "none",
              background: "#f1f3f4",
              cursor: "pointer",
              fontSize: 20,
              color: "#5f6368",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.2s"
            }}
            onMouseEnter={(e) => e.target.style.background = "#e8eaed"}
            onMouseLeave={(e) => e.target.style.background = "#f1f3f4"}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* PDF Viewer with react-pdf */}
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <div style={{ 
            flex: 1, 
            overflow: 'auto', 
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            padding: '20px',
            backgroundColor: '#f5f5f5'
          }}>
            {loadError ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px',
                color: '#666'
              }}>
                <p>Unable to load PDF</p>
                <p style={{ fontSize: 12, marginTop: 8 }}>Please try downloading instead</p>
              </div>
            ) : (
              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                  <Space direction="vertical" align="center" style={{ padding: 40 }}>
                    <Spin size="large" />
                    <div style={{ marginTop: 16, color: '#666' }}>Rendering PDF...</div>
                  </Space>
                }
              >
                <Page 
                  pageNumber={pageNumber}
                  width={1000}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                />
              </Document>
            )}
          </div>

          {/* Page Navigation */}
          {numPages && numPages > 1 && (
            <div style={{ 
              padding: '16px 24px',
              borderTop: '1px solid #e8eaed',
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              backgroundColor: '#fafafa'
            }}>
              <Button
                icon={<LeftOutlined />}
                disabled={pageNumber <= 1}
                onClick={previousPage}
                size="middle"
              >
                Previous
              </Button>
              <span style={{ 
                fontSize: 14, 
                color: '#595959', 
                minWidth: 100, 
                textAlign: 'center',
                fontWeight: 500
              }}>
                Page {pageNumber} of {numPages}
              </span>
              <Button
                icon={<RightOutlined />}
                disabled={pageNumber >= numPages}
                onClick={nextPage}
                size="middle"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

