/**
 * Script to inspect N4 PDF form fields
 * This will help us understand the structure of the LTB N4 form
 */

const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');

async function inspectN4PDF() {
  try {
    console.log('🔍 Inspecting N4 PDF form...\n');
    
    const pdfPath = path.join(__dirname, '..', 'public', 'CA-ON-N4.pdf');
    
    if (!fs.existsSync(pdfPath)) {
      console.error('❌ N4 PDF not found at:', pdfPath);
      return;
    }
    
    console.log('📄 Loading PDF from:', pdfPath);
    const pdfBytes = fs.readFileSync(pdfPath);
    
    // Try to load with ignoreEncryption for protected PDFs
    console.log('🔓 Attempting to load (PDF may be encrypted)...');
    const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    
    console.log('✅ PDF loaded successfully\n');
    console.log('📊 PDF Information:');
    console.log('  - Pages:', pdfDoc.getPageCount());
    console.log('  - Form:', pdfDoc.getForm() ? 'Yes' : 'No');
    
    const form = pdfDoc.getForm();
    
    if (!form) {
      console.log('\n⚠️  This PDF does not have standard AcroForm fields.');
      console.log('   It likely uses XFA (XML Forms Architecture).');
      console.log('   We\'ll need to use a different approach.\n');
      
      // Try to extract XFA data
      console.log('🔍 Checking for XFA data...');
      const catalog = pdfDoc.context.lookup(pdfDoc.context.trailerInfo.Root);
      const acroForm = catalog.get('AcroForm');
      
      if (acroForm) {
        console.log('✅ AcroForm dictionary found');
        const xfa = acroForm.get('XFA');
        if (xfa) {
          console.log('✅ XFA data found - this is an XFA form');
          console.log('   XFA forms require special handling (pdftk or Adobe SDK)');
        }
      }
      
      return;
    }
    
    // If we get here, it's a standard AcroForm
    const fields = form.getFields();
    
    console.log(`\n📋 Form has ${fields.length} fields:\n`);
    
    fields.forEach((field, index) => {
      const name = field.getName();
      const type = field.constructor.name;
      
      console.log(`${index + 1}. ${name}`);
      console.log(`   Type: ${type}`);
      
      try {
        if (type === 'PDFTextField') {
          const textField = form.getTextField(name);
          console.log(`   Max Length: ${textField.getMaxLength() || 'unlimited'}`);
        } else if (type === 'PDFCheckBox') {
          const checkbox = form.getCheckBox(name);
          console.log(`   Checked: ${checkbox.isChecked()}`);
        } else if (type === 'PDFDropdown') {
          const dropdown = form.getDropdown(name);
          console.log(`   Options: ${dropdown.getOptions().join(', ')}`);
        }
      } catch (e) {
        // Ignore field-specific errors
      }
      
      console.log('');
    });
    
    console.log('✅ Inspection complete!\n');
    
  } catch (error) {
    console.error('❌ Error inspecting PDF:', error.message);
    console.error(error.stack);
  }
}

// Run the inspection
inspectN4PDF();

