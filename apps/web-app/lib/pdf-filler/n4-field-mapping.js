/**
 * N4 Form Field Mapping
 * Maps our database fields to official LTB N4 PDF form fields
 * 
 * PDF Field Names extracted from CA-ON-N4-decrypted.pdf using pdftk
 */

module.exports = {
  /**
   * Map form data to PDF fields
   * @param {Object} formData - Data from GeneratedForm.formData
   * @param {Object} landlord - Landlord information
   * @param {Object} tenant - Tenant information
   * @param {Object} property - Property information
   * @returns {Object} - Mapped PDF field values
   */
  mapN4Fields: (formData, landlord, tenant, property) => {
    console.log('\n=== N4 FIELD MAPPING DEBUG ===');
    console.log('Input Data:');
    console.log('- formData:', JSON.stringify(formData, null, 2));
    console.log('- landlord:', JSON.stringify(landlord, null, 2));
    console.log('- tenant:', JSON.stringify(tenant, null, 2));
    console.log('- property:', JSON.stringify(property, null, 2));
    
    const fields = {};

    // ===== CHECKLIST (Optional - auto-check all) =====
    fields['form1[0].#subform[0].CheckList1[0]'] = '1'; // Waited until day after rent due
    fields['form1[0].#subform[0].CheckList2[0]'] = '1'; // Filled correct termination date
    fields['form1[0].#subform[0].CheckList3[0]'] = '1'; // Named each tenant
    fields['form1[0].#subform[0].CheckList4[0]'] = '1'; // Complete address
    fields['form1[0].#subform[0].CheckList5[0]'] = '1'; // Checked math
    fields['form1[0].#subform[0].CheckList6[0]'] = '1'; // Only rent amounts
    fields['form1[0].#subform[0].CheckList7[0]'] = '1'; // Signed and dated

    // ===== NAMES AND ADDRESSES =====
    // Tenant name
    fields['form1[0].#subform[1].Notice_Name_and_Address[0].TO_TenameName[0]'] = 
      `${tenant.firstName || ''} ${tenant.lastName || ''}`.trim();

    // Landlord name
    fields['form1[0].#subform[1].Notice_Name_and_Address[0].From_LandlordName[0]'] = 
      `${landlord.firstName || ''} ${landlord.lastName || ''}`.trim();

    // Rental unit address
    const address = [
      property.addressLine1,
      property.addressLine2,
      property.provinceState,
      property.postalZip
    ].filter(Boolean).join(', ');
    fields['form1[0].#subform[1].Notice_Name_and_Address[0].RentalUnitAddress[0]'] = address;

    // ===== AMOUNT AND TERMINATION DATE =====
    // Total amount owing
    fields['form1[0].#subform[1].OweMeAmount[0]'] = 
      formData.totalArrears ? parseFloat(formData.totalArrears).toFixed(2) : '0.00';

    // Termination date - pass string directly to formatDate for LOCAL parsing
    if (formData.terminationDate) {
      fields['form1[0].#subform[1].PayDate[0]'] = formatDate(formData.terminationDate);
    }

    // ===== ARREARS BREAKDOWN TABLE =====
    // The N4 form has 3 rows for rent periods
    // We'll populate based on arrears data if available
    if (formData.arrearsBreakdown && Array.isArray(formData.arrearsBreakdown)) {
      formData.arrearsBreakdown.slice(0, 3).forEach((arrear, index) => {
        const rowNum = index + 1;
        
        // For rent periods, use the first day of the month to the last day of the month
        // Based on the due date in the arrear object
        let fromDate = arrear.fromDate;
        let toDate = arrear.toDate;
        
        // If fromDate and toDate are provided, use them directly
        // They should already be the first and last day of the rental period
        // Pass strings directly - formatDate() now handles LOCAL parsing
        if (fromDate) {
          fields[`form1[0].#subform[4].LTHAS_Arrear_L1[0].Table1[0].Row${rowNum}[0].ArrearFrom${rowNum}[0]`] = 
            formatDate(fromDate);  // String like "2025-06-01"
        }
        
        if (toDate) {
          fields[`form1[0].#subform[4].LTHAS_Arrear_L1[0].Table1[0].Row${rowNum}[0].ArrearTo${rowNum}[0]`] = 
            formatDate(toDate);  // String like "2025-06-30"
        }
        
        // Rent charged
        if (arrear.rentCharged !== undefined) {
          fields[`form1[0].#subform[4].LTHAS_Arrear_L1[0].Table1[0].Row${rowNum}[0].RentCharge${rowNum}[0]`] = 
            parseFloat(arrear.rentCharged).toFixed(2);
        }
        
        // Rent paid
        if (arrear.rentPaid !== undefined) {
          fields[`form1[0].#subform[4].LTHAS_Arrear_L1[0].Table1[0].Row${rowNum}[0].RentPaid${rowNum}[0]`] = 
            parseFloat(arrear.rentPaid).toFixed(2);
        }
        
        // Rent owing (calculated)
        const owing = (arrear.rentCharged || 0) - (arrear.rentPaid || 0);
        fields[`form1[0].#subform[4].LTHAS_Arrear_L1[0].Table1[0].Row${rowNum}[0].RentOwe${rowNum}[0]`] = 
          owing.toFixed(2);
      });
    } else {
      // If no breakdown provided, create a single entry from arrears start date
      if (formData.arrearsStartDate && formData.rentAmount) {
        fields['form1[0].#subform[4].LTHAS_Arrear_L1[0].Table1[0].Row1[0].ArrearFrom1[0]'] = 
          formatDate(formData.arrearsStartDate);  // Pass string directly
        fields['form1[0].#subform[4].LTHAS_Arrear_L1[0].Table1[0].Row1[0].ArrearTo1[0]'] = 
          formatDate(new Date());
        fields['form1[0].#subform[4].LTHAS_Arrear_L1[0].Table1[0].Row1[0].RentCharge1[0]'] = 
          parseFloat(formData.rentAmount || 0).toFixed(2);
        fields['form1[0].#subform[4].LTHAS_Arrear_L1[0].Table1[0].Row1[0].RentPaid1[0]'] = '0.00';
        fields['form1[0].#subform[4].LTHAS_Arrear_L1[0].Table1[0].Row1[0].RentOwe1[0]'] = 
          parseFloat(formData.totalArrears || 0).toFixed(2);
      }
    }

    // Total rent owing
    fields['form1[0].#subform[4].LTHAS_Arrear_L1[0].TotalRentOwe[0]'] = 
      formData.totalArrears ? parseFloat(formData.totalArrears).toFixed(2) : '0.00';

    // ===== SIGNATURE SECTION =====
    // Select signature type: '1' = Landlord, '2' = Agent/Representative
    fields['form1[0].#subform[4].SelectSign[0]'] = '1'; // Default to Landlord

    // Landlord signature info
    console.log('📞 Landlord phone raw value:', landlord.phone);
    fields['form1[0].#subform[4].Signature_for_Notice[0].RFirstName[0]'] = 
      landlord.firstName || '';
    fields['form1[0].#subform[4].Signature_for_Notice[0].RLastName[0]'] = 
      landlord.lastName || '';
    const formattedPhone = formatPhoneNumber(landlord.phone);
    console.log('📞 Formatted phone:', formattedPhone);
    fields['form1[0].#subform[4].Signature_for_Notice[0].RDayPhone[0]'] = formattedPhone;
    
    // Signature field (will be empty - tenant signs physically)
    // fields['form1[0].#subform[4].Signature_for_Notice[0].Signature[0]'] = '';
    
    // Sign date - current date
    fields['form1[0].#subform[4].Signature_for_Notice[0].SignDate[0]'] = 
      formatDate(new Date());

    // ===== AGENT/REPRESENTATIVE INFORMATION (Optional) =====
    // Leave blank if landlord is signing directly
    // If you have a property manager or lawyer, fill these:
    // fields['form1[0].#subform[4].Agent_Information_for_Notice[0].AgentName[0]'] = '';
    // fields['form1[0].#subform[4].Agent_Information_for_Notice[0].AgentLSUC[0]'] = '';
    // fields['form1[0].#subform[4].Agent_Information_for_Notice[0].AgentCompany[0]'] = '';
    // fields['form1[0].#subform[4].Agent_Information_for_Notice[0].AgentAddress[0]'] = '';
    // fields['form1[0].#subform[4].Agent_Information_for_Notice[0].AgentPhoneNum[0]'] = '';
    // fields['form1[0].#subform[4].Agent_Information_for_Notice[0].AgentMunicipality[0]'] = '';
    // fields['form1[0].#subform[4].Agent_Information_for_Notice[0].AgentProvince[0]'] = '';
    // fields['form1[0].#subform[4].Agent_Information_for_Notice[0].AgentPostCode[0]'] = '';
    // fields['form1[0].#subform[4].Agent_Information_for_Notice[0].AgentFaxNum[0]'] = '';

    console.log('\n=== MAPPED PDF FIELDS ===');
    console.log('Total fields mapped:', Object.keys(fields).length);
    console.log('Fields:', JSON.stringify(fields, null, 2));
    console.log('=== END FIELD MAPPING ===\n');

    return fields;
  }
};

/**
 * Parse ISO date string as LOCAL date (NOT UTC!)
 * CRITICAL: Prevents timezone shifts when parsing date strings
 * 
 * Handles both formats:
 * - "2025-06-01" (simple date)
 * - "2025-11-20T05:29:59.437Z" (ISO timestamp)
 * 
 * When you pass these to new Date(), JavaScript interprets them as UTC,
 * which causes dates to shift. This function extracts date parts and creates LOCAL dates.
 */
function parseLocalDate(dateString) {
  if (!dateString) return null;
  
  // Extract date part only (ignore time if present)
  // "2025-06-01" → "2025-06-01"
  // "2025-11-20T05:29:59.437Z" → "2025-11-20"
  const datePart = dateString.split('T')[0];
  
  const [year, month, day] = datePart.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);  // LOCAL midnight
}

/**
 * Format phone number for LTB forms
 * Converts: "2128142020" → "(212)814-2020"
 * LTB format: (XXX)XXX-XXXX - NO SPACES
 * Handles various input formats and cleans non-numeric characters
 */
function formatPhoneNumber(phone) {
  if (!phone) return '';
  
  // Remove all non-numeric characters
  const digits = phone.toString().replace(/\D/g, '');
  
  // Need exactly 10 digits for North American format
  if (digits.length !== 10) {
    return phone; // Return as-is if not 10 digits
  }
  
  // Format as (XXX)XXX-XXXX - NO SPACES!
  return `(${digits.substring(0, 3)})${digits.substring(3, 6)}-${digits.substring(6, 10)}`;
}

/**
 * Format date for PDF (LTB expects DD/MM/YYYY format)
 * Standard format for electronically-filled LTB forms
 * Handles both Date objects and ISO date strings (YYYY-MM-DD)
 */
function formatDate(date) {
  if (!date) return '';
  
  // If it's a string (e.g., "2025-06-01"), parse it as LOCAL date
  if (typeof date === 'string') {
    date = parseLocalDate(date);
  }
  
  if (!(date instanceof Date) || isNaN(date)) {
    return '';
  }
  
  const year = date.getFullYear();        // LOCAL timezone
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // Standard DD/MM/YYYY format - matches how all LTB software fills these forms
  return `${day}/${month}/${year}`;
}

