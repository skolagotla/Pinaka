/**
 * N4 PDF Filling Service
 * Uses pdftk to fill official LTB N4 forms with tenant/landlord data
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { mapN4Fields } = require('./n4-field-mapping');

/**
 * Fill N4 PDF with form data
 * @param {Object} params
 * @param {Object} params.formData - Form data from GeneratedForm
 * @param {Object} params.landlord - Landlord information
 * @param {Object} params.tenant - Tenant information
 * @param {Object} params.property - Property information
 * @param {string} params.outputPath - Path where filled PDF should be saved
 * @returns {Promise<string>} - Path to filled PDF
 */
async function fillN4PDF({ formData, landlord, tenant, property, outputPath }) {
  try {
    console.log('\n========================================');
    console.log('🔧 STARTING N4 PDF FILL PROCESS');
    console.log('========================================');
    console.log('Output Path:', outputPath);
    
    // 1. Map form data to PDF fields
    console.log('\n📋 Step 1: Mapping form data to PDF fields...');
    const pdfFields = mapN4Fields(formData, landlord, tenant, property);
    console.log('✅ Mapped', Object.keys(pdfFields).length, 'fields');

    // 2. Create FDF (Forms Data Format) file
    console.log('\n📝 Step 2: Generating FDF file...');
    const fdfContent = generateFDF(pdfFields);
    const fdfPath = outputPath.replace('.pdf', '.fdf');
    fs.writeFileSync(fdfPath, fdfContent);
    console.log('✅ FDF file created:', fdfPath);
    console.log('FDF size:', fdfContent.length, 'bytes');

    // 3. Get source PDF path (use decrypted version)
    console.log('\n📄 Step 3: Locating source PDF...');
    const sourcePDF = path.join(process.cwd(), 'public', 'CA-ON-N4-decrypted.pdf');
    
    if (!fs.existsSync(sourcePDF)) {
      console.error('❌ Source PDF not found at:', sourcePDF);
      throw new Error('Source N4 PDF not found. Please ensure CA-ON-N4-decrypted.pdf exists in public/');
    }
    console.log('✅ Source PDF found:', sourcePDF);
    const pdfStats = fs.statSync(sourcePDF);
    console.log('PDF size:', (pdfStats.size / 1024).toFixed(2), 'KB');

    // 4. Use pdftk to fill the PDF
    console.log('\n⚙️  Step 4: Running pdftk to fill PDF...');
    console.log('Command: pdftk', sourcePDF, 'fill_form', fdfPath, 'output', outputPath, 'flatten');
    await fillPDFWithFDF(sourcePDF, fdfPath, outputPath);
    
    // Check output file
    if (fs.existsSync(outputPath)) {
      const outputStats = fs.statSync(outputPath);
      console.log('✅ PDF generated successfully!');
      console.log('Output file:', outputPath);
      console.log('Output size:', (outputStats.size / 1024).toFixed(2), 'KB');
    } else {
      console.error('❌ Output PDF was not created!');
    }

    // 5. Clean up FDF file
    console.log('\n🧹 Step 5: Cleaning up temporary files...');
    try {
      fs.unlinkSync(fdfPath);
      console.log('✅ FDF file deleted');
    } catch (err) {
      console.error('⚠️  Failed to delete temporary FDF file:', err);
    }

    console.log('\n========================================');
    console.log('✅ N4 PDF FILL COMPLETE!');
    console.log('========================================\n');
    
    return outputPath;
  } catch (error) {
    console.error('\n========================================');
    console.error('❌ ERROR IN N4 PDF FILL PROCESS');
    console.error('========================================');
    console.error('Error:', error);
    console.error('Stack:', error.stack);
    console.error('========================================\n');
    throw error;
  }
}

/**
 * Generate FDF (Forms Data Format) content
 * @param {Object} fields - Field name/value pairs
 * @returns {string} - FDF file content
 */
function generateFDF(fields) {
  let fdf = '%FDF-1.2\n';
  fdf += '1 0 obj\n';
  fdf += '<<\n';
  fdf += '/FDF\n';
  fdf += '<<\n';
  fdf += '/Fields [\n';

  // Add each field
  for (const [fieldName, fieldValue] of Object.entries(fields)) {
    if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
      // Escape special characters in field values
      const escapedValue = String(fieldValue)
        .replace(/\\/g, '\\\\')
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)');
      
      fdf += `<<\n`;
      fdf += `/T (${fieldName})\n`;
      fdf += `/V (${escapedValue})\n`;
      fdf += `>>\n`;
    }
  }

  fdf += ']\n';
  fdf += '>>\n';
  fdf += '>>\n';
  fdf += 'endobj\n';
  fdf += 'trailer\n';
  fdf += '<<\n';
  fdf += '/Root 1 0 R\n';
  fdf += '>>\n';
  fdf += '%%EOF\n';

  return fdf;
}

/**
 * Use pdftk to fill PDF with FDF data and flatten
 * @param {string} sourcePDF - Path to source PDF template
 * @param {string} fdfPath - Path to FDF data file
 * @param {string} outputPath - Path for output filled PDF
 * @returns {Promise<void>}
 */
function fillPDFWithFDF(sourcePDF, fdfPath, outputPath) {
  return new Promise((resolve, reject) => {
    // pdftk source.pdf fill_form data.fdf output filled.pdf flatten
    const pdftk = spawn('pdftk', [
      sourcePDF,
      'fill_form',
      fdfPath,
      'output',
      outputPath,
      'flatten'
    ]);

    let stdout = '';
    let stderr = '';

    pdftk.stdout.on('data', (data) => {
      stdout += data.toString();
      console.log('pdftk stdout:', data.toString());
    });

    pdftk.stderr.on('data', (data) => {
      stderr += data.toString();
      console.log('pdftk stderr:', data.toString());
    });

    pdftk.on('close', (code) => {
      console.log('pdftk exit code:', code);
      if (code !== 0) {
        console.error('pdftk failed!');
        console.error('stdout:', stdout);
        console.error('stderr:', stderr);
        reject(new Error(`pdftk failed with code ${code}: ${stderr}`));
      } else {
        console.log('✅ pdftk completed successfully');
        resolve();
      }
    });

    pdftk.on('error', (err) => {
      console.error('pdftk spawn error:', err);
      reject(new Error(`Failed to spawn pdftk: ${err.message}`));
    });
  });
}

/**
 * Generate a filled N4 PDF for a GeneratedForm record
 * @param {Object} generatedForm - GeneratedForm record from database
 * @param {string} outputDir - Directory to save filled PDF (defaults to tmp/)
 * @returns {Promise<string>} - Path to filled PDF
 */
async function generateN4FromRecord(generatedForm, outputDir = null) {
  if (!outputDir) {
    outputDir = path.join(process.cwd(), 'tmp', 'generated-forms');
  }

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(
    outputDir,
    `N4-${generatedForm.id}-${Date.now()}.pdf`
  );

  // Extract data from generatedForm record
  const formData = generatedForm.formData || {};
  
  // You'll need to populate these from your database
  // This assumes the GeneratedForm includes these relationships
  const landlord = {
    firstName: generatedForm.landlord?.firstName || '',
    lastName: generatedForm.landlord?.lastName || '',
    phoneNumber: generatedForm.landlord?.phoneNumber || ''
  };

  const tenant = {
    firstName: generatedForm.tenant?.firstName || '',
    lastName: generatedForm.tenant?.lastName || ''
  };

  const property = {
    addressLine1: generatedForm.property?.addressLine1 || '',
    addressLine2: generatedForm.property?.addressLine2 || '',
    provinceState: generatedForm.property?.provinceState || '',
    postalZip: generatedForm.property?.postalZip || ''
  };

  return fillN4PDF({
    formData,
    landlord,
    tenant,
    property,
    outputPath
  });
}

module.exports = {
  fillN4PDF,
  generateN4FromRecord,
  generateFDF,
  fillPDFWithFDF
};

