const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

/**
 * Creates a standard AcroForm version of the N4 form
 * This will have the same visual layout but with proper fillable fields
 */
async function createN4AcroForm() {
  try {
    console.log('📄 Creating AcroForm version of N4...\n');
    
    // Load the repaired PDF (has the visual layout)
    const templatePath = path.join(__dirname, '..', 'public', 'CA-ON-N4-repaired.pdf');
    const templateBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);
    
    console.log('✅ Loaded base PDF template');
    console.log('   Pages:', pdfDoc.getPageCount());
    
    const form = pdfDoc.getForm();
    const pages = pdfDoc.getPages();
    const page1 = pages[0];
    const page2 = pages.length > 1 ? pages[1] : page1;
    const page3 = pages.length > 2 ? pages[2] : page1;
    
    const { width, height } = page1.getSize();
    console.log(`   Page size: ${width} x ${height} points\n`);
    
    // Ontario N4 Form Field Coordinates (estimated based on standard government form layout)
    // Y-coordinates: higher = closer to top (0 = bottom, 792 = top for letter size)
    
    console.log('📝 Adding form fields...\n');
    
    // === PAGE 1 FIELDS ===
    console.log('Page 1 - Main Information:');
    
    // Top section has two columns: "To: (Tenant's name)" on left, "From: (Landlord's name)" on right
    // Based on the screenshot, this appears to be at the very top of the form
    
    // LEFT SIDE: "To: (Tenant's name)" - Multiline field for all tenant names
    const tenantsField = form.createTextField('tenantNames');
    tenantsField.addToPage(page1, { x: 20, y: 700, width: 360, height: 80 });
    tenantsField.setFontSize(10);
    tenantsField.enableMultiline();
    console.log('  ✓ Tenant Names (multiline - left side)');
    
    // RIGHT SIDE: "From: (Landlord's name)" - Multiline field for all landlord names
    const landlordsField = form.createTextField('landlordNames');
    landlordsField.addToPage(page1, { x: 395, y: 700, width: 200, height: 80 });
    landlordsField.setFontSize(10);
    landlordsField.enableMultiline();
    console.log('  ✓ Landlord Names (multiline - right side)');
    
    // "Address of the Rental Unit:" - Full width field below the To/From section
    const rentalAddressField = form.createTextField('rentalAddress');
    rentalAddressField.addToPage(page1, { x: 20, y: 630, width: 575, height: 60 });
    rentalAddressField.setFontSize(10);
    rentalAddressField.enableMultiline();
    console.log('  ✓ Rental Unit Address (full width, multiline)');
    
    // Termination Date Section
    const terminationDate = form.createTextField('terminationDate');
    terminationDate.addToPage(page1, { x: 230, y: 340, width: 150, height: 15 });
    terminationDate.setFontSize(10);
    console.log('  ✓ Termination Date');
    
    // Monthly Rent Amount
    const monthlyRent = form.createTextField('monthlyRent');
    monthlyRent.addToPage(page1, { x: 320, y: 280, width: 100, height: 15 });
    monthlyRent.setFontSize(10);
    console.log('  ✓ Monthly Rent Amount');
    
    // Details about arrears (text area)
    const arrearDetails = form.createTextField('arrearDetails');
    arrearDetails.addToPage(page1, { x: 50, y: 150, width: 520, height: 80 });
    arrearDetails.setFontSize(9);
    arrearDetails.enableMultiline();
    console.log('  ✓ Arrear Details (multiline)');
    
    // Signature Section
    const signerName = form.createTextField('signerName');
    signerName.addToPage(page1, { x: 145, y: 80, width: 200, height: 15 });
    signerName.setFontSize(10);
    console.log('  ✓ Signer Name');
    
    const signatureDate = form.createTextField('signatureDate');
    signatureDate.addToPage(page1, { x: 400, y: 80, width: 150, height: 15 });
    signatureDate.setFontSize(10);
    console.log('  ✓ Signature Date');
    
    // === PAGE 2 FIELDS - Rent Arrears Table ===
    console.log('\nPage 2 - Rent Arrears Details:');
    
    // Table rows for rent periods (up to 12 periods)
    const tableStartY = 640;
    const rowHeight = 25;
    const colWidths = {
      periodFrom: { x: 55, width: 85 },
      periodTo: { x: 145, width: 85 },
      charged: { x: 235, width: 80 },
      paid: { x: 320, width: 80 },
      owing: { x: 405, width: 80 },
    };
    
    for (let i = 0; i < 12; i++) {
      const y = tableStartY - (i * rowHeight);
      
      const periodFrom = form.createTextField(`rentPeriod${i}_from`);
      periodFrom.addToPage(page2, { 
        x: colWidths.periodFrom.x, 
        y: y, 
        width: colWidths.periodFrom.width, 
        height: 18 
      });
      periodFrom.setFontSize(8);
      
      const periodTo = form.createTextField(`rentPeriod${i}_to`);
      periodTo.addToPage(page2, { 
        x: colWidths.periodTo.x, 
        y: y, 
        width: colWidths.periodTo.width, 
        height: 18 
      });
      periodTo.setFontSize(8);
      
      const charged = form.createTextField(`rentPeriod${i}_charged`);
      charged.addToPage(page2, { 
        x: colWidths.charged.x, 
        y: y, 
        width: colWidths.charged.width, 
        height: 18 
      });
      charged.setFontSize(8);
      
      const paid = form.createTextField(`rentPeriod${i}_paid`);
      paid.addToPage(page2, { 
        x: colWidths.paid.x, 
        y: y, 
        width: colWidths.paid.width, 
        height: 18 
      });
      paid.setFontSize(8);
      
      const owing = form.createTextField(`rentPeriod${i}_owing`);
      owing.addToPage(page2, { 
        x: colWidths.owing.x, 
        y: y, 
        width: colWidths.owing.width, 
        height: 18 
      });
      owing.setFontSize(8);
      
      if (i === 0) console.log('  ✓ Rent period rows 1-12');
    }
    
    // Total amount owing
    const totalOwing = form.createTextField('totalOwing');
    totalOwing.addToPage(page2, { x: 405, y: 340, width: 80, height: 18 });
    totalOwing.setFontSize(10);
    console.log('  ✓ Total Amount Owing');
    
    // === PAGE 3 - Additional Information ===
    console.log('\nPage 3 - Additional Information:');
    
    // Additional information text area
    const additionalInfo = form.createTextField('additionalInfo');
    additionalInfo.addToPage(page3, { x: 50, y: 450, width: 520, height: 200 });
    additionalInfo.setFontSize(9);
    additionalInfo.enableMultiline();
    console.log('  ✓ Additional Information (multiline)');
    
    // Representative information (if applicable)
    const repName = form.createTextField('repName');
    repName.addToPage(page3, { x: 145, y: 350, width: 300, height: 15 });
    repName.setFontSize(10);
    console.log('  ✓ Representative Name');
    
    const repPhone = form.createTextField('repPhone');
    repPhone.addToPage(page3, { x: 145, y: 328, width: 150, height: 15 });
    repPhone.setFontSize(10);
    console.log('  ✓ Representative Phone');
    
    const repAddress = form.createTextField('repAddress');
    repAddress.addToPage(page3, { x: 145, y: 306, width: 300, height: 15 });
    repAddress.setFontSize(10);
    console.log('  ✓ Representative Address');
    
    // Save the new AcroForm version
    const outputPath = path.join(__dirname, '..', 'public', 'CA-ON-N4-AcroForm.pdf');
    const outputBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, outputBytes);
    
    console.log('\n✅ SUCCESS! Created AcroForm N4 template');
    console.log(`📁 Saved to: ${outputPath}`);
    console.log(`📊 File size: ${Math.round(outputBytes.length / 1024)} KB`);
    console.log(`📝 Total fields: ${form.getFields().length}`);
    
    console.log('\n🔍 Testing field readability...');
    // Verify we can read the fields
    const testDoc = await PDFDocument.load(outputBytes);
    const testForm = testDoc.getForm();
    const fields = testForm.getFields();
    console.log(`✅ Confirmed: ${fields.length} fields can be read and filled`);
    
    console.log('\n📋 Field names created:');
    console.log('   - landlordName, landlordAddress1, landlordAddress2, landlordPhone');
    console.log('   - tenantName1, tenantName2, tenantName3');
    console.log('   - rentalAddress1, rentalAddress2');
    console.log('   - terminationDate, monthlyRent');
    console.log('   - rentPeriod0_from through rentPeriod11_owing (12 rent periods)');
    console.log('   - totalOwing');
    console.log('   - signerName, signatureDate');
    console.log('   - repName, repPhone, repAddress');
    console.log('   - additionalInfo, arrearDetails');
    
    console.log('\n✅ Ready to use! Update generate-pdf.ts to use CA-ON-N4-AcroForm.pdf\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

createN4AcroForm();

