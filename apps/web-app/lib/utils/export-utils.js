/**
 * Export Utilities
 * Functions for exporting data to PDF, CSV, and Excel formats
 */

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

/**
 * Export data to CSV format (Excel-compatible)
 * @param {Array} data - Array of objects to export
 * @param {Array} columns - Column definitions with title and dataIndex
 * @param {string} filename - Filename for download
 */
export function exportToCSV(data, columns, filename = 'export') {
  if (!data || data.length === 0) {
    console.warn('[Export] No data to export');
    return;
  }

  // Get headers from columns
  const headers = columns.map(col => col.title || col.key || col.dataIndex);
  
  // Convert data to CSV rows
  const csvRows = data.map(row => {
    return columns.map(col => {
      const key = col.dataIndex || col.key;
      let value = row[key];
      
      // Handle nested objects (e.g., landlord.firstName)
      if (col.render && typeof col.render === 'function') {
        // For rendered columns, try to extract the raw value
        value = row[key];
      }
      
      // Handle nested properties
      if (key && key.includes('.')) {
        const keys = key.split('.');
        value = keys.reduce((obj, k) => obj?.[k], row);
      }
      
      // Format value
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') {
        // Handle objects like landlord: { firstName, lastName }
        if (value.firstName && value.lastName) {
          value = `${value.firstName} ${value.lastName}`;
        } else {
          value = JSON.stringify(value);
        }
      }
      
      // Escape commas and quotes
      const stringValue = String(value).replace(/"/g, '""');
      return `"${stringValue}"`;
    }).join(',');
  });

  // Combine headers and rows
  const csvContent = [
    headers.map(h => `"${h}"`).join(','),
    ...csvRows
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export data to PDF format
 * @param {Array} data - Array of objects to export
 * @param {Array} columns - Column definitions
 * @param {string} title - Report title
 * @param {string} filename - Filename for download
 */
export async function exportToPDF(data, columns, title = 'Report', filename = 'report') {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]); // US Letter size
    const { width, height } = page.getSize();
    
    // Load fonts
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    let yPosition = height - 50;
    const margin = 50;
    const rowHeight = 20;
    const fontSize = 10;
    
    // Add title
    page.drawText(title, {
      x: margin,
      y: yPosition,
      size: 16,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    
    yPosition -= 30;
    
    // Add date
    page.drawText(`Generated: ${new Date().toLocaleDateString()}`, {
      x: margin,
      y: yPosition,
      size: fontSize,
      font: font,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    yPosition -= 30;
    
    if (!data || data.length === 0) {
      page.drawText('No data available', {
        x: margin,
        y: yPosition,
        size: fontSize,
        font: font,
        color: rgb(0, 0, 0),
      });
    } else {
      // Calculate column widths
      const numColumns = columns.length;
      const columnWidth = (width - (margin * 2)) / numColumns;
      
      // Draw headers
      let xPosition = margin;
      columns.forEach((col, index) => {
        const headerText = col.title || col.key || col.dataIndex || '';
        page.drawText(headerText, {
          x: xPosition,
          y: yPosition,
          size: fontSize,
          font: boldFont,
          color: rgb(0, 0, 0),
        });
        xPosition += columnWidth;
      });
      
      yPosition -= rowHeight;
      
      // Draw data rows
      data.forEach((row, rowIndex) => {
        // Check if we need a new page
        if (yPosition < margin + rowHeight) {
          const newPage = pdfDoc.addPage([612, 792]);
          yPosition = height - 50;
        }
        
        xPosition = margin;
        columns.forEach((col) => {
          const key = col.dataIndex || col.key;
          let value = row[key];
          
          // Handle nested properties
          if (key && key.includes('.')) {
            const keys = key.split('.');
            value = keys.reduce((obj, k) => obj?.[k], row);
          }
          
          // Format value
          if (value === null || value === undefined) value = '';
          if (typeof value === 'object') {
            if (value.firstName && value.lastName) {
              value = `${value.firstName} ${value.lastName}`;
            } else {
              value = JSON.stringify(value);
            }
          }
          
          const text = String(value).substring(0, 30); // Truncate long values
          page.drawText(text, {
            x: xPosition,
            y: yPosition,
            size: fontSize,
            font: font,
            color: rgb(0, 0, 0),
          });
          xPosition += columnWidth;
        });
        
        yPosition -= rowHeight;
      });
    }
    
    // Save PDF
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('[Export PDF] Error:', error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
}

/**
 * Export financial report to PDF
 * @param {Object} report - Report data with summary and details
 * @param {string} filename - Filename for download
 */
export async function exportFinancialReportToPDF(report, filename = 'financial-report') {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]);
    const { width, height } = page.getSize();
    
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    let yPosition = height - 50;
    const margin = 50;
    const fontSize = 10;
    
    // Title
    page.drawText('Financial Report', {
      x: margin,
      y: yPosition,
      size: 18,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    
    yPosition -= 30;
    
    // Date
    page.drawText(`Generated: ${new Date().toLocaleDateString()}`, {
      x: margin,
      y: yPosition,
      size: fontSize,
      font: font,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    yPosition -= 40;
    
    // Summary
    if (report.summary) {
      page.drawText('Summary', {
        x: margin,
        y: yPosition,
        size: 14,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 25;
      
      const summaryItems = [
        { label: 'Total Revenue', value: `$${report.summary.totalRevenue?.toLocaleString() || '0'}` },
        { label: 'Total Expenses', value: `$${report.summary.totalExpenses?.toLocaleString() || '0'}` },
        { label: 'Net Income', value: `$${report.summary.netIncome?.toLocaleString() || '0'}` },
        { label: 'Properties', value: String(report.summary.propertyCount || 0) },
      ];
      
      summaryItems.forEach(item => {
        page.drawText(`${item.label}:`, {
          x: margin,
          y: yPosition,
          size: fontSize,
          font: boldFont,
          color: rgb(0, 0, 0),
        });
        page.drawText(item.value, {
          x: margin + 150,
          y: yPosition,
          size: fontSize,
          font: font,
          color: rgb(0, 0, 0),
        });
        yPosition -= 20;
      });
      
      yPosition -= 20;
    }
    
    // By Landlord section
    if (report.byLandlord && report.byLandlord.length > 0) {
      if (yPosition < 150) {
        const newPage = pdfDoc.addPage([612, 792]);
        yPosition = height - 50;
      }
      
      page.drawText('By Landlord', {
        x: margin,
        y: yPosition,
        size: 14,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 25;
      
      report.byLandlord.forEach(item => {
        const landlordName = `${item.landlord?.firstName || ''} ${item.landlord?.lastName || ''}`.trim();
        const text = `${landlordName}: Revenue $${item.revenue?.toLocaleString() || '0'}, Expenses $${item.expenses?.toLocaleString() || '0'}, Net $${item.netIncome?.toLocaleString() || '0'}`;
        page.drawText(text, {
          x: margin,
          y: yPosition,
          size: fontSize,
          font: font,
          color: rgb(0, 0, 0),
        });
        yPosition -= 18;
        
        if (yPosition < 50) {
          const newPage = pdfDoc.addPage([612, 792]);
          yPosition = height - 50;
        }
      });
    }
    
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('[Export Financial Report PDF] Error:', error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
}

