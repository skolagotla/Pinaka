"use client";

import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button, Spinner } from 'flowbite-react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

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
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-70 p-5"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl w-[90%] max-w-6xl h-[90%] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h3 className="m-0 text-lg font-semibold text-gray-900 dark:text-white">
              Rent Receipt
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-mono">
              {receipt.receiptNumber ? `#${receipt.receiptNumber}` : 'N/A'}
            </p>
          </div>
          <Button color="light" onClick={onClose}>
            Close
          </Button>
        </div>

        {/* PDF Content */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          {loadError ? (
            <div className="text-center">
              <p className="text-red-600 dark:text-red-400">Error loading PDF</p>
            </div>
          ) : (
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex justify-center items-center h-full">
                  <Spinner size="xl" />
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="shadow-lg"
              />
            </Document>
          )}
        </div>

        {/* Footer with Navigation */}
        {numPages && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <Button
              color="light"
              onClick={previousPage}
              disabled={pageNumber <= 1}
              className="flex items-center gap-2"
            >
              <HiChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {pageNumber} of {numPages}
            </span>
            <Button
              color="light"
              onClick={nextPage}
              disabled={pageNumber >= numPages}
              className="flex items-center gap-2"
            >
              Next
              <HiChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
