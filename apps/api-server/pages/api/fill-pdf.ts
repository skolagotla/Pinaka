import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/middleware/apiMiddleware';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
const prismaLib = require('@/lib/prisma');
const { prisma } = prismaLib;

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // 1. Get Form Data from the Request Body
  const formData = req.body;
  const { 
    tenantName, 
    landlordName,
    rentalAddress,
    amountOwing,
    rentPeriodFrom, 
    rentPeriodTo,
    terminationDate,
    password,
    tenantId  // We'll need the tenant ID from the form
  } = formData;

  console.log('=== N4 PDF Generation Request ===');
  console.log('Form data received:', { tenantName, landlordName, rentalAddress, amountOwing, tenantId });
  console.log('Date fields:', { rentPeriodFrom, rentPeriodTo, terminationDate });

  // Validate required fields
  if (!tenantName || !landlordName || !rentalAddress || !amountOwing) {
    console.error('Missing required fields');
    return res.status(400).json({ 
      message: 'Missing required fields',
      error: 'tenantName, landlordName, rentalAddress, and amountOwing are required'
    });
  }

  if (!rentPeriodFrom || !rentPeriodTo || !terminationDate) {
    console.error('Missing required date fields');
    return res.status(400).json({ 
      message: 'Missing required date fields',
      error: 'rentPeriodFrom, rentPeriodTo, and terminationDate are required'
    });
  }

  try {
    // 2. Load the N4 PDF template (unlocked version)
    const templatePath = path.join(process.cwd(), 'templates', 'forms', 'CA-ON-N4-unlocked.pdf');
    
    if (!fs.existsSync(templatePath)) {
      console.error('Unlocked N4 template not found at:', templatePath);
      return res.status(404).json({ message: 'N4 template not found. Please ensure CA-ON-N4-unlocked.pdf exists.' });
    }

    const originalPdfBuffer = fs.readFileSync(templatePath);

    console.log('Loading unlocked PDF...');
    console.log('Template size:', originalPdfBuffer.length, 'bytes');
    
    // 3. Load the unlocked PDF (no encryption)
    const pdfDoc = await PDFDocument.load(originalPdfBuffer);

    console.log('PDF loaded successfully');

    // 4. Embed fonts for text overlay
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // 5. Get the pages
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();
    
    console.log('Page dimensions:', { width, height });

    // 6. Overlay text on the PDF at appropriate coordinates
    // Note: PDF coordinates start from bottom-left (0,0)
    // You may need to adjust these coordinates based on your specific N4 form template
    
    try {
      const fontSize = 10;
      const textColor = rgb(0, 0, 0);

      // Format dates for display
      const formatDate = (dateString: string) => {
        try {
          const date = new Date(dateString);
          if (isNaN(date.getTime())) {
            return dateString;
          }
          return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        } catch (e) {
          return dateString;
        }
      };

      // Fill in the fields (adjust Y coordinates based on your PDF)
      firstPage.drawText(tenantName, {
        x: 50,
        y: height - 100,
        size: fontSize,
        font: font,
        color: textColor,
      });

      firstPage.drawText(landlordName, {
        x: 50,
        y: height - 130,
        size: fontSize,
        font: font,
        color: textColor,
      });

      firstPage.drawText(rentalAddress, {
        x: 50,
        y: height - 160,
        size: fontSize,
        font: font,
        color: textColor,
      });

      firstPage.drawText(`$${amountOwing}`, {
        x: 50,
        y: height - 190,
        size: fontSize,
        font: fontBold,
        color: textColor,
      });

      firstPage.drawText(formatDate(rentPeriodFrom), {
        x: 50,
        y: height - 220,
        size: fontSize,
        font: font,
        color: textColor,
      });

      firstPage.drawText(formatDate(rentPeriodTo), {
        x: 200,
        y: height - 220,
        size: fontSize,
        font: font,
        color: textColor,
      });

      firstPage.drawText(formatDate(terminationDate), {
        x: 50,
        y: height - 250,
        size: fontSize,
        font: fontBold,
        color: textColor,
      });

      console.log('Text overlay completed successfully');
    } catch (overlayError: any) {
      console.error('Error overlaying text:', overlayError.message);
      throw new Error(`Failed to overlay text: ${overlayError.message}`);
    }

    // 7. Save filled PDF
    const pdfBytes = await pdfDoc.save();
    console.log('PDF saved successfully, size:', pdfBytes.length, 'bytes');

    // 8. Generate unique filename
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').split('.')[0];
    const hash = crypto.createHash('sha256').update(user.email + timestamp).digest('hex').substring(0, 8);
    const filename = `N4-${timestamp}-${hash}.pdf`;

    // 9. Save to uploads directory
    const uploadsDir = path.join(process.cwd(), 'uploads', 'n4-forms');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const outputPath = path.join(uploadsDir, filename);
    fs.writeFileSync(outputPath, pdfBytes);
    console.log('PDF saved to:', outputPath);

    // 10. Save form record if tenantId provided
    if (tenantId) {
      try {
        await prisma.n4Form.create({
          data: {
            landlordId: user.userId,
            tenantId,
            fileName: filename,
            storagePath: outputPath,
            tenantName,
            landlordName,
            rentalAddress,
            amountOwing: parseFloat(amountOwing),
            rentPeriodFrom: new Date(rentPeriodFrom),
            rentPeriodTo: new Date(rentPeriodTo),
            terminationDate: new Date(terminationDate),
          },
        });
        console.log('N4 form record saved to database');
      } catch (dbError) {
        console.error('Failed to save N4 form to database:', dbError);
      }
    }

    // 11. Return success response
    return res.status(200).json({
      success: true,
      message: 'N4 form generated successfully',
      filename,
      viewUrl: `/api/n4-forms/view?file=${filename}`,
    });
  } catch (error: any) {
    console.error('=== Error generating N4 PDF ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to generate N4 form',
      error: error.message || 'Unknown error',
    });
  }
}, { requireRole: 'landlord', allowedMethods: ['POST'] });
