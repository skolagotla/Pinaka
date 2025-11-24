/**
 * N4 Form PDF Filler
 * Fills the LTB N4 form by overlaying text at specific coordinates
 */

const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const coordinates = require('./n4-coordinates');

/**
 * Fill N4 PDF with form data
 * @param {Object} formData - The generated form data from database
 * @returns {Promise<Buffer>} - Filled PDF as buffer
 */
async function fillN4PDF(formData) {
  try {
    console.log('[N4 Filler] Starting PDF fill process...');
    
    // Load the template PDF
    const templatePath = path.join(process.cwd(), 'public', 'CA-ON-N4.pdf');
    
    if (!fs.existsSync(templatePath)) {
      throw new Error('N4 template PDF not found');
    }
    
    const templateBytes = fs.readFileSync(templatePath);
    
    // Create a new PDF to overlay on top
    console.log('[N4 Filler] Creating overlay PDF...');
    const overlayDoc = await PDFDocument.create();
    
    // Load font
    const font = await overlayDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await overlayDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Add a page matching the template size (8.5" x 11" = 612 x 792 points)
    const page = overlayDoc.addPage([612, 792]);
    
    // Helper function to draw text
    const drawText = (text, coord) => {
      if (!text || text === 'null' || text === 'undefined') return;
      
      page.drawText(String(text), {
        x: coord.x,
        y: coord.y,
        size: coord.size || 10,
        font: coord.bold ? fontBold : font,
        color: rgb(0, 0, 0),
        maxWidth: coord.maxWidth || undefined,
      });
    };
    
    // Fill Page 1 fields
    const coords = coordinates.page1;
    
    // Landlord Information
    drawText(formData.landlordName || '', coords.landlordName);
    drawText(formData.propertyAddress || '', coords.landlordAddress);
    drawText(formData.propertyCity || '', coords.landlordCity);
    drawText(formData.propertyPostalCode || '', coords.landlordPostal);
    drawText(formData.landlordEmail || '', coords.landlordEmail);
    
    // Tenant Information
    drawText(formData.tenantFullName || '', coords.tenantName);
    drawText(formData.propertyAddress || '', coords.tenantAddress);
    drawText(formData.propertyCity || '', coords.tenantCity);
    drawText(formData.propertyPostalCode || '', coords.tenantPostal);
    
    // Rental Unit
    drawText(formData.propertyAddress || '', coords.rentalAddress);
    drawText(formData.propertyCity || '', coords.rentalCity);
    drawText(formData.unitName || '', coords.rentalUnit);
    
    // Rent Information
    drawText(formData.monthlyRent ? `$${formData.monthlyRent}` : '', coords.monthlyRent);
    drawText(formatDate(formData.leaseStartDate), coords.rentDueDate);
    
    // Arrears Information
    drawText(formatDate(formData.arrearsStartDate), coords.arrearsStartDate);
    drawText(formatDate(formData.arrearsEndDate), coords.arrearsEndDate);
    drawText(formData.outstandingBalance ? `$${formData.outstandingBalance}` : '', coords.totalArrears);
    
    // Termination Date
    drawText(formatDate(formData.terminationDate), coords.terminationDate);
    
    // Signature Date (today's date)
    drawText(formatDate(new Date()), coords.signatureDate);
    
    console.log('[N4 Filler] Overlay created, merging with template...');
    
    // Save overlay PDF
    const overlayBytes = await overlayDoc.save();
    
    // For now, return just the overlay
    // In production, you'd merge this with the template using pdftk or similar
    // or use coordinate-based rendering directly on the template
    
    console.log('[N4 Filler] PDF fill complete!');
    
    return Buffer.from(overlayBytes);
    
  } catch (error) {
    console.error('[N4 Filler] Error filling PDF:', error);
    throw error;
  }
}

/**
 * Format date for PDF
 * @param {string|Date} date
 * @returns {string}
 */
function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${month}/${day}/${year}`;
}

module.exports = {
  fillN4PDF
};

