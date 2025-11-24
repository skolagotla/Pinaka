/**
 * PDF Generation Utility
 * Generates PDFs from form data by overlaying text on existing PDF templates
 */

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

export interface FormField {
  x: number;
  y: number;
  text: string;
  fontSize?: number;
  maxWidth?: number;
}

/**
 * Generate PDF for a form by overlaying data on template
 */
export async function generateFormPDF(
  formType: string,
  formData: Record<string, any>
): Promise<Buffer> {
  try {
    // Load the base PDF template
    const templatePath = path.join(process.cwd(), 'public', `CA-ON-${formType}.pdf`);
    
    if (!fs.existsSync(templatePath)) {
      throw new Error(`PDF template not found for form type: ${formType}`);
    }

    const existingPdfBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { height } = firstPage.getSize();
    
    // Load font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Get field positions based on form type
    const fields = getFieldPositions(formType, formData, height);

    // Draw text on PDF
    for (const field of fields) {
      if (field.text) {
        const fontSize = field.fontSize || 10;
        const textFont = field.text.length < 50 ? boldFont : font;
        
        firstPage.drawText(field.text, {
          x: field.x,
          y: field.y,
          size: fontSize,
          font: textFont,
          color: rgb(0, 0, 0),
          maxWidth: field.maxWidth || 500
        });
      }
    }

    // Save the modified PDF
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);

  } catch (error) {
    console.error('[PDF Generation] Error:', error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
}

/**
 * Get field positions for specific form type
 * Note: These are approximate positions. Real forms would need exact coordinates.
 */
function getFieldPositions(
  formType: string,
  formData: Record<string, any>,
  pageHeight: number
): FormField[] {
  const data = formData as any;
  
  // Helper to convert top-based Y to bottom-based Y
  const y = (topY: number) => pageHeight - topY;

  // Common fields across forms
  const commonFields: FormField[] = [
    { x: 150, y: y(100), text: data.tenantFullName || '', fontSize: 11 },
    { x: 150, y: y(130), text: data.propertyAddress || '', fontSize: 10 },
    { x: 150, y: y(145), text: `${data.propertyCity || ''}, ${data.propertyProvince || ''}`, fontSize: 10 },
    { x: 150, y: y(160), text: data.propertyPostalCode || '', fontSize: 10 },
  ];

  switch (formType) {
    case 'N4':
      return [
        ...commonFields,
        { x: 150, y: y(200), text: data.unitName || '', fontSize: 10 },
        { x: 150, y: y(230), text: `$${data.monthlyRent?.toFixed(2) || '0.00'}`, fontSize: 11 },
        { x: 150, y: y(260), text: `$${data.outstandingBalance?.toFixed(2) || '0.00'}`, fontSize: 11, maxWidth: 200 },
        { x: 150, y: y(290), text: data.arrearsStartDate ? new Date(data.arrearsStartDate).toLocaleDateString() : '', fontSize: 10 },
        { x: 300, y: y(290), text: data.arrearsEndDate ? new Date(data.arrearsEndDate).toLocaleDateString() : '', fontSize: 10 },
        { x: 150, y: y(320), text: data.terminationDate ? new Date(data.terminationDate).toLocaleDateString() : '', fontSize: 10 },
        { x: 150, y: y(500), text: data.landlordName || '', fontSize: 10 },
        { x: 400, y: y(500), text: new Date().toLocaleDateString(), fontSize: 10 },
      ];

    case 'N5':
      return [
        ...commonFields,
        { x: 150, y: y(200), text: data.misconductDetails || '', fontSize: 9, maxWidth: 400 },
        { x: 150, y: y(280), text: data.incidentDate ? new Date(data.incidentDate).toLocaleDateString() : '', fontSize: 10 },
        { x: 150, y: y(310), text: data.terminationDate ? new Date(data.terminationDate).toLocaleDateString() : '', fontSize: 10 },
        { x: 150, y: y(500), text: data.landlordName || '', fontSize: 10 },
        { x: 400, y: y(500), text: new Date().toLocaleDateString(), fontSize: 10 },
      ];

    case 'N8':
      return [
        ...commonFields,
        { x: 150, y: y(200), text: data.leaseEndDate ? new Date(data.leaseEndDate).toLocaleDateString() : '', fontSize: 10 },
        { x: 150, y: y(230), text: data.terminationDate ? new Date(data.terminationDate).toLocaleDateString() : '', fontSize: 10 },
        { x: 150, y: y(260), text: data.reason || '', fontSize: 9, maxWidth: 400 },
        { x: 150, y: y(500), text: data.landlordName || '', fontSize: 10 },
        { x: 400, y: y(500), text: new Date().toLocaleDateString(), fontSize: 10 },
      ];

    case 'N12':
      return [
        ...commonFields,
        { x: 150, y: y(200), text: data.personMovingIn || '', fontSize: 10 },
        { x: 150, y: y(230), text: data.relationshipToLandlord || '', fontSize: 10 },
        { x: 150, y: y(260), text: data.moveInDate ? new Date(data.moveInDate).toLocaleDateString() : '', fontSize: 10 },
        { x: 150, y: y(290), text: data.terminationDate ? new Date(data.terminationDate).toLocaleDateString() : '', fontSize: 10 },
        { x: 150, y: y(500), text: data.landlordName || '', fontSize: 10 },
        { x: 400, y: y(500), text: new Date().toLocaleDateString(), fontSize: 10 },
      ];

    case 'L1':
      return [
        ...commonFields,
        { x: 150, y: y(200), text: data.n4FormDate ? new Date(data.n4FormDate).toLocaleDateString() : '', fontSize: 10 },
        { x: 150, y: y(230), text: data.n4TerminationDate ? new Date(data.n4TerminationDate).toLocaleDateString() : '', fontSize: 10 },
        { x: 150, y: y(260), text: `$${data.outstandingBalance?.toFixed(2) || '0.00'}`, fontSize: 11 },
        { x: 150, y: y(290), text: new Date().toLocaleDateString(), fontSize: 10 },
        { x: 150, y: y(500), text: data.landlordName || '', fontSize: 10 },
        { x: 400, y: y(500), text: new Date().toLocaleDateString(), fontSize: 10 },
      ];

    case 'L2':
      return [
        ...commonFields,
        { x: 150, y: y(200), text: data.noticeFormType || '', fontSize: 10 },
        { x: 150, y: y(230), text: data.noticeFormDate ? new Date(data.noticeFormDate).toLocaleDateString() : '', fontSize: 10 },
        { x: 150, y: y(260), text: data.terminationDate ? new Date(data.terminationDate).toLocaleDateString() : '', fontSize: 10 },
        { x: 150, y: y(290), text: new Date().toLocaleDateString(), fontSize: 10 },
        { x: 150, y: y(320), text: Array.isArray(data.reasons) ? data.reasons.join(', ') : '', fontSize: 9, maxWidth: 400 },
        { x: 150, y: y(500), text: data.landlordName || '', fontSize: 10 },
        { x: 400, y: y(500), text: new Date().toLocaleDateString(), fontSize: 10 },
      ];

    default:
      return commonFields;
  }
}

/**
 * Save generated PDF to disk
 */
export async function saveGeneratedPDF(
  formId: string,
  formType: string,
  pdfBuffer: Buffer
): Promise<string> {
  const uploadsDir = path.join(process.cwd(), 'public', 'generated-forms');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const fileName = `${formType}_${formId}_${Date.now()}.pdf`;
  const filePath = path.join(uploadsDir, fileName);
  
  fs.writeFileSync(filePath, pdfBuffer);
  
  return `/generated-forms/${fileName}`;
}

