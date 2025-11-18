/**
 * Signature Service for N4 Forms
 * Adds digital signature to filled PDF forms
 */

const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const sharp = require('sharp');

/**
 * Add signature to filled N4 PDF
 * @param {string} pdfPath - Path to the filled PDF
 * @param {string} signaturePath - Path to the signature image
 * @returns {Promise<void>}
 */
async function addSignatureToPDF(pdfPath, signaturePath) {
  console.log('\n========================================');
  console.log('🖊️  ADDING SIGNATURE TO PDF');
  console.log('========================================');
  console.log('📄 PDF Path:', pdfPath);
  console.log('✍️  Signature Path:', signaturePath);

  try {
    // Check if signature file exists
    if (!fs.existsSync(signaturePath)) {
      console.log('⚠️  Signature file not found, skipping signature');
      console.log('   Expected path:', signaturePath);
      return;
    }
    console.log('✅ Signature file found');

    // Check file size
    const stats = fs.statSync(signaturePath);
    console.log('📊 Signature file size:', (stats.size / 1024).toFixed(2), 'KB');

    // Read the PDF
    // Note: We don't use ignoreEncryption here because the PDF should already be filled/flattened
    // If you get errors loading the PDF, you may need to add { ignoreEncryption: true }
    const pdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    console.log('✅ PDF loaded');

    // Read and crop the signature image to remove white space
    const signatureExt = path.extname(signaturePath).toLowerCase();
    console.log('✂️  Cropping white space from signature image...');
    
    // Use sharp to trim white space from the signature image
    const croppedSignatureBuffer = await sharp(signaturePath)
      .trim({ threshold: 10 }) // Trim white/transparent pixels (threshold: 0-255, lower = more aggressive)
      .toBuffer();
    
    console.log('✅ Signature image cropped (white space removed)');
    
    // Get original and cropped dimensions for comparison
    const originalMetadata = await sharp(signaturePath).metadata();
    const croppedMetadata = await sharp(croppedSignatureBuffer).metadata();
    console.log('📐 Original signature dimensions:', originalMetadata.width, 'x', originalMetadata.height);
    console.log('📐 Cropped signature dimensions:', croppedMetadata.width, 'x', croppedMetadata.height);
    
    // Embed the cropped signature image
    let signatureImage;
    if (signatureExt === '.png') {
      signatureImage = await pdfDoc.embedPng(croppedSignatureBuffer);
      console.log('✅ PNG signature embedded (cropped)');
    } else if (signatureExt === '.jpg' || signatureExt === '.jpeg') {
      signatureImage = await pdfDoc.embedJpg(croppedSignatureBuffer);
      console.log('✅ JPG signature embedded (cropped)');
    } else {
      console.error('❌ Unsupported signature format:', signatureExt);
      return;
    }

    // Get signature dimensions (now from cropped image)
    const signatureDims = signatureImage.scale(1);
    console.log('📐 Final signature dimensions for PDF:', signatureDims.width.toFixed(2), 'x', signatureDims.height.toFixed(2));

    // N4 Form - signature goes on the LAST page (after pdftk fills it, it becomes 2 pages)
    const pages = pdfDoc.getPages();
    const pageCount = pages.length;
    console.log('📄 Total pages:', pageCount);
    
    // Use the last page
    const signaturePage = pages[pageCount - 1]; // Last page (0-indexed)
    console.log('📄 Using last page (page', pageCount, ') for signature');

    // Get page dimensions
    const pageHeight = signaturePage.getHeight();
    const pageWidth = signaturePage.getWidth();
    console.log('📐 Page dimensions:', pageWidth, 'x', pageHeight);

    // Calculate signature placement - EXACT BOX MATCHING
    // The N4 form signature box is on the last page, in the left column
    // Signature box (LEFT column): X=60 to X=380 (320px wide)
    
    // Signature box boundaries (PDF coordinates: origin at bottom-left)
    const signatureBoxLeft = 60;
    const signatureBoxRight = 380;
    const signatureBoxWidth = signatureBoxRight - signatureBoxLeft; // 320px
    
    // Y coordinates in PDF space (from bottom)
    // IMPORTANT: PDF coordinates start from bottom-left (0,0)
    // The signature box is the large empty rectangle BELOW the phone number field
    // It's located in the lower portion of the page, around Y=150-250 from bottom
    // This is the actual signature box marked in the form
    const signatureBoxBottom = 150; // Bottom of signature box (from page bottom)
    const signatureBoxTop = 250;   // Top of signature box (from page bottom)
    const signatureBoxHeight = signatureBoxTop - signatureBoxBottom; // 100px height
    
    // RESIZE SIGNATURE TO MATCH REFERENCE IMAGE
    // Signature should be: left-aligned, much smaller (30-40% of box size), positioned lower in box
    // The original image (376x98) is too large - we need to scale it down significantly
    // Add margins to avoid overlapping "Signature" label above and date field on right
    const leftMargin = -15; // Move 15 pixels to the left (outside box boundary)
    const rightMargin = 60; // Large right margin to avoid date field (starts around X=380)
    const topMargin = 20; // Margin from top to avoid "Signature" label
    const bottomMargin = 15; // Margin from bottom
    
    // Calculate available space within the box (with margins)
    const availableWidth = signatureBoxWidth - leftMargin - rightMargin;
    const availableHeight = signatureBoxHeight - topMargin - bottomMargin;
    
    // Calculate scale to fit within available space
    const widthScale = availableWidth / signatureDims.width;
    const heightScale = availableHeight / signatureDims.height;
    
    // Use MUCH smaller scale - cap at 35% to match reference image
    // The signature in the reference appears to be about 30-40% of the box size
    const scale = Math.min(widthScale, heightScale, 0.35);
    
    // Calculate final dimensions - smaller to match reference image
    const scaledWidth = signatureDims.width * scale;
    const scaledHeight = signatureDims.height * scale;
    
    console.log('📐 Signature box dimensions:', signatureBoxWidth, 'x', signatureBoxHeight);
    console.log('📐 Available space (with margins):', availableWidth.toFixed(2), 'x', availableHeight.toFixed(2));
    console.log('📐 Original signature dimensions:', signatureDims.width.toFixed(2), 'x', signatureDims.height.toFixed(2));
    console.log('📐 Scaled signature dimensions:', scaledWidth.toFixed(2), 'x', scaledHeight.toFixed(2));
    console.log('📐 Scale factor:', scale.toFixed(4));
    
    // Position signature: LEFT-ALIGNED with small left margin
    const x = signatureBoxLeft + leftMargin;
    
    // Position LOWER in the box (not centered) - similar to reference image
    // Place it in the lower portion of the box, with more space from bottom to avoid border overlap
    const verticalOffset = 20; // Increased offset from bottom to prevent border overlap
    const finalY = signatureBoxBottom + bottomMargin + verticalOffset;
    
    // Ensure signature doesn't go too high (stay in lower portion of box)
    const maxY = signatureBoxTop - topMargin - scaledHeight - 5; // Leave 5px margin from top
    const clampedY = Math.min(finalY, maxY);
    
    console.log('📍 Signature box: X=[', signatureBoxLeft, '-', signatureBoxRight, '], Y=[', signatureBoxBottom, '-', signatureBoxTop, ']');
    console.log('📍 Signature position (LEFT-aligned): (', x.toFixed(2), ',', clampedY.toFixed(2), ')');
    console.log('📍 Signature dimensions: ', scaledWidth.toFixed(2), 'x', scaledHeight.toFixed(2));
    console.log('📍 Signature right edge: X=', (x + scaledWidth).toFixed(2), '(box ends at', signatureBoxRight, ')');
    console.log('📍 Signature bottom: Y=', clampedY.toFixed(2), '(box bottom:', signatureBoxBottom, ')');

    // Draw the signature
    // Verify coordinates are within page bounds
    if (x < 0 || clampedY < 0 || x + scaledWidth > pageWidth || clampedY + scaledHeight > pageHeight) {
      console.warn('⚠️  Warning: Signature position may be outside page bounds!');
      console.warn('   Page bounds: 0-', pageWidth, ' (width), 0-', pageHeight, ' (height)');
      console.warn('   Signature bounds: X=[', x, '-', x + scaledWidth, '], Y=[', clampedY, '-', clampedY + scaledHeight, ']');
    }
    
    // Verify signature is within the signature box
    if (x < signatureBoxLeft || x + scaledWidth > signatureBoxRight || 
        clampedY < signatureBoxBottom || clampedY + scaledHeight > signatureBoxTop) {
      console.warn('⚠️  Warning: Signature may extend outside signature box!');
      console.warn('   Signature Y range:', clampedY.toFixed(2), '-', (clampedY + scaledHeight).toFixed(2));
      console.warn('   Box Y range:', signatureBoxBottom, '-', signatureBoxTop);
    }
    
    signaturePage.drawImage(signatureImage, {
      x,
      y: clampedY,
      width: scaledWidth,
      height: scaledHeight,
      opacity: 1.0, // Ensure signature is fully opaque
    });
    console.log('✅ Signature drawn on last page (page', pageCount, ')');

    // Save the modified PDF
    const modifiedPdfBytes = await pdfDoc.save();
    fs.writeFileSync(pdfPath, modifiedPdfBytes);
    console.log('✅ PDF saved with signature');

    console.log('========================================');
    console.log('✅ SIGNATURE ADDED SUCCESSFULLY');
    console.log('========================================\n');

  } catch (error) {
    console.error('❌ Error adding signature to PDF:', error);
    console.error('Stack:', error.stack);
    // Don't throw - if signature fails, still return the unsigned PDF
    console.log('⚠️  Continuing without signature...\n');
  }
}

module.exports = {
  addSignatureToPDF
};

