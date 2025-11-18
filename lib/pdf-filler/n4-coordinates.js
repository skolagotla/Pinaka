/**
 * N4 Form Field Coordinates
 * Manually mapped positions for overlaying text on the LTB N4 form
 * 
 * Coordinates are in points (72 points = 1 inch) from bottom-left corner
 * You'll need to adjust these based on the actual PDF layout
 */

module.exports = {
  // Page 1 - Main Information
  page1: {
    // Landlord Information
    landlordName: { x: 150, y: 690, size: 10 },
    landlordAddress: { x: 150, y: 670, size: 10 },
    landlordCity: { x: 150, y: 650, size: 10 },
    landlordPostal: { x: 400, y: 650, size: 10 },
    landlordPhone: { x: 150, y: 630, size: 10 },
    landlordEmail: { x: 350, y: 630, size: 10 },
    
    // Tenant Information
    tenantName: { x: 150, y: 560, size: 10 },
    tenantAddress: { x: 150, y: 540, size: 10 },
    tenantCity: { x: 150, y: 520, size: 10 },
    tenantPostal: { x: 400, y: 520, size: 10 },
    
    // Rental Unit
    rentalAddress: { x: 150, y: 450, size: 10 },
    rentalCity: { x: 150, y: 430, size: 10 },
    rentalUnit: { x: 400, y: 430, size: 10 },
    
    // Rent Information
    monthlyRent: { x: 150, y: 360, size: 10 },
    rentDueDate: { x: 350, y: 360, size: 10 },
    
    // Arrears Information
    arrearsStartDate: { x: 150, y: 290, size: 10 },
    arrearsEndDate: { x: 350, y: 290, size: 10 },
    totalArrears: { x: 150, y: 270, size: 10 },
    
    // Termination Date
    terminationDate: { x: 150, y: 200, size: 10 },
    
    // Signature Date
    signatureDate: { x: 400, y: 100, size: 10 },
  },
  
  // Page 2 - Additional Details (if needed)
  page2: {
    additionalNotes: { x: 100, y: 700, size: 9, maxWidth: 450 },
  }
};

