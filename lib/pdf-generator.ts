/**
 * Shared PDF Generation Utility for Rent Receipts
 * 
 * This module provides a single source of truth for generating rent receipt PDFs.
 * Both landlord and tenant endpoints use this same function to ensure consistent
 * PDF appearance regardless of who is viewing it.
 * 
 * Access control is handled at the API route level, not here.
 */

import PDFDocument from "pdfkit";

interface RentPayment {
  id: string;
  amount: number;
  dueDate: Date;
  paidDate: Date | null;
  status: string;
  paymentMethod: string | null;
  referenceNumber: string | null;
  receiptNumber: string | null;
  lease: {
    rentAmount: number;
    startDate: Date;
    unit: {
      unitNumber: string;
      property: {
        addressLine1: string;
        addressLine2?: string | null;
        city: string;
        provinceState: string;
        postalZip: string;
        country: string;
        landlord: {
          firstName: string;
          lastName: string;
          email: string;
          phone: string | null;
        };
      };
    };
    leaseTenants: Array<{
      tenant: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string | null;
      };
    }>;
  };
  partialPayments?: Array<{
    id: string;
    amount: number;
    paidDate: Date;
    paymentMethod: string;
    referenceNumber: string | null;
  }>;
}

/**
 * Format phone number according to rules engine
 * Format: (XXX)XXX-XXXX (no space after area code per rules)
 */
function formatPhoneNumber(phone: string | null, country: string): string {
  if (!phone) return "N/A";
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, "");
  
  // For US/CA, format as (XXX)XXX-XXXX (per rules engine)
  if ((country === "US" || country === "CA") && cleaned.length === 10) {
    return `(${cleaned.substring(0, 3)})${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
  }
  
  // Return original if not 10 digits or unknown format
  return phone;
}

/**
 * Generates a rent receipt PDF document
 * 
 * @param rentPayment - The rent payment data with related lease, property, tenant, and landlord info
 * @returns PDFKit document stream
 */
export function generateRentReceiptPDF(rentPayment: RentPayment): InstanceType<typeof PDFDocument> {
  const doc = new PDFDocument({ margin: 50, size: "LETTER" });

  const pageWidth = doc.page.width;
  
  // Extract the first tenant from leaseTenants array
  const tenant = rentPayment.lease.leaseTenants[0]?.tenant;
  
  if (!tenant) {
    throw new Error("No tenant found for this lease");
  }
  
  // Extract landlord from unit.property.landlord
  const landlord = rentPayment.lease.unit.property.landlord;
  
  if (!landlord) {
    throw new Error("No landlord found for this property");
  }

  // Modern Vaadin-style accent bar at top
  doc
    .fillColor("#00B4F0") // Vaadin blue
    .rect(0, 0, pageWidth, 8)
    .fill()
    .fillColor("black");

  doc.moveDown(2);

  // Save Y position before title for PAID stamp
  const beforeTitleY = doc.y;

  // Title - centered and modern
  doc
    .fontSize(24)
    .font("Helvetica-Bold")
    .fillColor("#2C3E50") // Dark professional blue
    .text("RENT RECEIPT", { align: "center" })
    .fillColor("black")
    .moveDown(0.5);
  
  // Save Y position after title for receipt info
  const afterTitleY = doc.y;

  // PAID Stamp Badge at top right (only for paid receipts)
  if (rentPayment.status === "Paid") {
    const stampX = 520; // Top right position
    const stampY = beforeTitleY + 10; // Position at top
    const stampRadius = 35; // Smaller radius
    
    // Shadow effect
    doc.save();
    doc
      .opacity(0.25)
      .fillColor("#000000")
      .circle(stampX + 2, stampY + 2, stampRadius)
      .fill()
      .opacity(1);
    doc.restore();
    
    // Main circle - solid red
    doc
      .fillColor("#D32F2F")
      .circle(stampX, stampY, stampRadius)
      .fill();
    
    // Inner circle - white
    doc
      .fillColor("#FFFFFF")
      .circle(stampX, stampY, stampRadius - 4)
      .fill();
    
    // Inner red circle
    doc
      .fillColor("#D32F2F")
      .circle(stampX, stampY, stampRadius - 6)
      .fill();
    
    // Decorative dots around the circle
    const dotCount = 24;
    for (let i = 0; i < dotCount; i++) {
      const angle = (i / dotCount) * Math.PI * 2;
      const dotRadius = 1.5;
      const dotDistance = stampRadius - 2;
      const dotX = stampX + Math.cos(angle) * dotDistance;
      const dotY = stampY + Math.sin(angle) * dotDistance;
      
      doc
        .fillColor("#FFFFFF")
        .circle(dotX, dotY, dotRadius)
        .fill();
    }
    
    // Text: "RENT" at top (smaller font)
    doc
      .fontSize(7)
      .font("Helvetica-Bold")
      .fillColor("#FFFFFF");
    
    const topText = "RENT";
    const topTextWidth = doc.widthOfString(topText);
    doc.text(topText, stampX - topTextWidth / 2, stampY - 22);
    
    // Large "PAID" in center (smaller font)
    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .fillColor("#FFFFFF");
    const paidWidth = doc.widthOfString("PAID");
    doc.text("PAID", stampX - paidWidth / 2, stampY - 8);
    
    // Bottom text "THANK YOU" (smaller font)
    doc
      .fontSize(6)
      .font("Helvetica-Bold")
      .fillColor("#FFFFFF");
    const bottomText = "THANK YOU";
    const bottomTextWidth = doc.widthOfString(bottomText);
    doc.text(bottomText, stampX - bottomTextWidth / 2, stampY + 12);
  }

  // Receipt info - aligned with right column (same as To: and Payment Details:)
  // Position BELOW title to avoid overlap
  const rightColumn = 380; // Will be used below for To: and Payment Details:
  const receiptInfoX = rightColumn;
  const receiptInfoY = afterTitleY + 5; // Position below the title
  
  doc
    .fontSize(9)
    .font("Helvetica-Bold")
    .fillColor("#5A6C7D")
    .text("Receipt Date", receiptInfoX, receiptInfoY)
    .text("Receipt #", receiptInfoX, receiptInfoY + 14);
  
  doc
    .font("Helvetica")
    .fillColor("#2C3E50")
    .text(`: ${new Date().toLocaleDateString()}`, receiptInfoX + 70, receiptInfoY)
    .text(`: ${rentPayment.receiptNumber || "N/A"}`, receiptInfoX + 70, receiptInfoY + 14)
    .fillColor("black");

  doc.y = Math.max(afterTitleY + 60, receiptInfoY + 25); // Reduced spacing between receipt info and From/To sections

  // Layout - two columns (From/Property on left, To/Payment Details on right)
  const leftColumn = 50;
  // rightColumn already defined above at line 188 (380px)
  const row1StartY = doc.y;

  // Get country for phone formatting
  const country = rentPayment.lease.unit.property.country;

  // From (Landlord) - Left side
  doc.fontSize(10).font("Helvetica-Bold").fillColor("#2C3E50").text("From:", leftColumn, row1StartY);
  doc
    .fontSize(9)
    .font("Helvetica")
    .fillColor("#5A6C7D")
    .text(`${landlord.firstName} ${landlord.lastName}`, leftColumn, row1StartY + 15)
    .text(landlord.email, leftColumn, row1StartY + 28)
    .text(formatPhoneNumber(landlord.phone, country), leftColumn, row1StartY + 41);

  // To (Tenant) - Right side
  doc.fontSize(10).font("Helvetica-Bold").fillColor("#2C3E50").text("To:", rightColumn, row1StartY);
  doc
    .fontSize(9)
    .font("Helvetica")
    .fillColor("#5A6C7D")
    .text(`${tenant.firstName} ${tenant.lastName}`, rightColumn, row1StartY + 15)
    .text(tenant.email, rightColumn, row1StartY + 28)
    .text(formatPhoneNumber(tenant.phone, country), rightColumn, row1StartY + 41);

  doc.y = row1StartY + 70;

  // Property Information - Left & Payment Details - Right (aligned on same line)
  const row2StartY = doc.y;
  
  // Property Information - Left
  doc.fontSize(10).font("Helvetica-Bold").fillColor("#2C3E50").text("Property Information:", leftColumn, row2StartY);
  const propertyY = row2StartY + 15;
  // Display full country name instead of code
  const countryFullName = rentPayment.lease.unit.property.country === "CA" ? "CANADA" : "USA";
  
  doc
    .fontSize(9)
    .font("Helvetica")
    .fillColor("#5A6C7D")
    .text(rentPayment.lease.unit.property.addressLine1, leftColumn, propertyY)
    .text(
      `${rentPayment.lease.unit.property.city}, ${rentPayment.lease.unit.property.provinceState} ${rentPayment.lease.unit.property.postalZip}`,
      leftColumn,
      propertyY + 13
    )
    .text(countryFullName, leftColumn, propertyY + 26);

  // Payment Details - Right (same starting Y as Property Information)
  doc.fontSize(10).font("Helvetica-Bold").fillColor("#2C3E50").text("Payment Details:", rightColumn, row2StartY);

  // Helper function to format amount with commas
  const formatAmountWithCommas = (amount: number) => {
    return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Professional table-like alignment for Payment Details
  const labelColumn = rightColumn;
  const valueColumn = rightColumn + 95; // Align all values at this X position

  // 1. Rental Amount (first, with comma separator and currency code)
  const currency = rentPayment.lease.unit.property.country === "CA" ? "CAD" : "USD";
  const rentalAmountFormatted = `${formatAmountWithCommas(rentPayment.amount)} ${currency}`;
  
  doc
    .fontSize(9)
    .font("Helvetica")
    .fillColor("#5A6C7D")
    .text("Rental Amount:", labelColumn, row2StartY + 15)
    .fillColor("#2C3E50")
    .text(rentalAmountFormatted, valueColumn, row2StartY + 15);

  // 2. Payment Date (second) - Show last payment date (from partial payments if exists)
  let paidDateStr = "NOT SET";
  
  if (rentPayment.partialPayments && rentPayment.partialPayments.length > 0) {
    // If there are partial payments, use the most recent partial payment date
    const sortedPartials = [...rentPayment.partialPayments].sort(
      (a, b) => new Date(b.paidDate).getTime() - new Date(a.paidDate).getTime()
    );
    paidDateStr = new Date(sortedPartials[0].paidDate).toLocaleDateString();
  } else if (rentPayment.paidDate) {
    // Otherwise use the main paid date
    paidDateStr = new Date(rentPayment.paidDate).toLocaleDateString();
  }

  doc
    .font("Helvetica")
    .fillColor("#5A6C7D")
    .text("Payment Date:", labelColumn, row2StartY + 28)
    .fillColor("#2C3E50")
    .text(paidDateStr, valueColumn, row2StartY + 28);

  // 3. Payment Made: On Time / Late / Partial (third)
  const paymentMadeY = row2StartY + 41;
  
  // Determine payment status
  let paymentMadeText = "On Time";
  let paymentMadeColor = "#43A047"; // Green
  
  const currentDate = new Date();
  const dueDate = new Date(rentPayment.dueDate);
  
  if (rentPayment.status === "Partial") {
    // Check if due date has passed
    if (currentDate > dueDate) {
      // Past due date and still partial = Late
      paymentMadeText = "Late";
      paymentMadeColor = "#E53935"; // Red
    } else {
      // Before due date and partial = Partial
      paymentMadeText = "Partial";
      paymentMadeColor = "#FB8C00"; // Orange
    }
  } else if (rentPayment.status === "Paid") {
    // Check if full payment was made late
    let finalPaymentDate: Date | null = null;
    
    if (rentPayment.partialPayments && rentPayment.partialPayments.length > 0) {
      // If there are partial payments, use the last one that completed the payment
      const sortedPartials = [...rentPayment.partialPayments].sort(
        (a, b) => new Date(b.paidDate).getTime() - new Date(a.paidDate).getTime()
      );
      finalPaymentDate = new Date(sortedPartials[0].paidDate);
    } else if (rentPayment.paidDate) {
      // Single full payment
      finalPaymentDate = new Date(rentPayment.paidDate);
    }
    
    if (finalPaymentDate && finalPaymentDate > dueDate) {
      paymentMadeText = "Late";
      paymentMadeColor = "#E53935"; // Red
    }
  }

  doc
    .font("Helvetica")
    .fillColor("#5A6C7D")
    .text("Payment Made:", labelColumn, paymentMadeY)
    .fillColor(paymentMadeColor)
    .text(paymentMadeText, valueColumn, paymentMadeY);

  doc.y = propertyY + 68; // Adjusted to account for new row
  doc.moveDown(1);

  // Payment breakdown table - modern design with Date column first
  const tableStartY = doc.y;
  const tableWidth = pageWidth - 100;
  const col1Start = 50;
  const dateWidth = 75;
  const descriptionWidth = 140;
  const paymentMethodWidth = 105;
  const referenceWidth = 85;
  const amountWidth = 90;

  const col2Start = col1Start + dateWidth;
  const col3Start = col2Start + descriptionWidth;
  const col4Start = col3Start + paymentMethodWidth;
  const col5Start = col4Start + referenceWidth;

  // Currency note - right aligned above table (in RED for emphasis)
  // Position at the right edge of the page with enough width for full text
  const currencyText = rentPayment.lease.unit.property.country === "CA" 
    ? "* Amount in Canadian Dollars" 
    : "* Amount in US Dollars";
  
  doc
    .fontSize(8)
    .font("Helvetica")
    .fillColor("#E53935") // Red color for emphasis
    .text(currencyText, pageWidth - 200, tableStartY - 15, { 
      width: 150, 
      align: "right",
      lineBreak: false // Ensure it stays on one line
    })
    .fillColor("black");

  // Table header with Vaadin blue background (5 columns now: Date, Description, Payment Method, Reference #, Amount)
  doc
    .fillColor("#00B4F0")
    .roundedRect(50, tableStartY, tableWidth, 30, 4)
    .fill()
    .fillColor("#FFFFFF")
    .fontSize(9)
    .font("Helvetica-Bold")
    .text("Date", col1Start + 5, tableStartY + 10, { width: dateWidth - 10 })
    .text("Description", col2Start + 5, tableStartY + 10, { width: descriptionWidth - 10 })
    .text("Payment Method", col3Start + 5, tableStartY + 10, { width: paymentMethodWidth - 10 })
    .text("Reference #", col4Start + 5, tableStartY + 10, { width: referenceWidth - 10 })
    .text("Amount", col5Start + 5, tableStartY + 10, { width: amountWidth - 10, align: "right" })
    .fillColor("black");

  let currentTop = tableStartY + 30;

  // Determine what to display based on payment status and partial payments
  const hasPartialPayments = rentPayment.partialPayments && rentPayment.partialPayments.length > 0;

  if (hasPartialPayments) {
    // Show all partial payments with dates
    rentPayment.partialPayments!.forEach((payment, index) => {
      const itemHeight = 35;
      const bgColor = index % 2 === 0 ? "#F8F9FA" : "#FFFFFF";
      
      // Format the payment date
      const paymentDate = new Date(payment.paidDate).toLocaleDateString("en-US", { 
        month: "numeric", 
        day: "numeric", 
        year: "numeric" 
      });

      doc
        .fillColor(bgColor)
        .rect(50, currentTop, tableWidth, itemHeight)
        .fill()
        .strokeColor("#E0E0E0")
        .lineWidth(0.5)
        .roundedRect(50, currentTop, tableWidth, itemHeight, 4)
        .stroke()
        .fillColor("#2C3E50")
        .fontSize(9)
        .font("Helvetica")
        .text(paymentDate, col1Start + 5, currentTop + 10, { width: dateWidth - 10 })
        .text(
          `Rent for ${new Date(rentPayment.dueDate).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" })}`,
          col2Start + 5,
          currentTop + 10,
          { width: descriptionWidth - 10 }
        )
        .text(payment.paymentMethod, col3Start + 5, currentTop + 10, { width: paymentMethodWidth - 10 })
        .text(payment.referenceNumber || "N/A", col4Start + 5, currentTop + 10, { width: referenceWidth - 10 })
        .text(`$${payment.amount.toFixed(2)}`, col5Start + 5, currentTop + 10, { width: amountWidth - 10, align: "right" });

      currentTop += itemHeight;
    });

    // Calculate remaining balance
    const totalPaid = rentPayment.partialPayments!.reduce((sum, p) => sum + p.amount, 0);
    const remainingBalance = Math.max(0, rentPayment.amount - totalPaid);
    const balanceColor = remainingBalance === 0 ? "#43A047" : "#E53935";
    const itemHeight = 35;

    doc
      .fillColor("#F0F0F0")
      .rect(50, currentTop, tableWidth, itemHeight)
      .fill()
      .strokeColor("#E0E0E0")
      .lineWidth(0.5)
      .roundedRect(50, currentTop, tableWidth, itemHeight, 4)
      .stroke()
      .font("Helvetica-Bold")
      .fillColor(balanceColor)
      .text("Remaining Balance", col1Start + 5, currentTop + 10, { width: dateWidth + descriptionWidth + paymentMethodWidth + referenceWidth - 10, align: "center" })
      .text(`$${remainingBalance.toFixed(2)}`, col5Start + 5, currentTop + 10, { width: amountWidth - 10, align: "right" })
      .fillColor("black")
      .font("Helvetica");
  } else {
    // Show single full payment with date
    const itemHeight = 35;
    
    // Format the payment date for full payment
    const fullPaymentDate = rentPayment.paidDate 
      ? new Date(rentPayment.paidDate).toLocaleDateString("en-US", { 
          month: "numeric", 
          day: "numeric", 
          year: "numeric" 
        })
      : "N/A";

    doc
      .fillColor("#FFFFFF")
      .rect(50, currentTop, tableWidth, itemHeight)
      .fill()
      .strokeColor("#E0E0E0")
      .lineWidth(0.5)
      .roundedRect(50, currentTop, tableWidth, itemHeight, 4)
      .stroke()
      .fillColor("#2C3E50")
      .fontSize(9)
      .font("Helvetica")
      .text(fullPaymentDate, col1Start + 5, currentTop + 10, { width: dateWidth - 10 })
      .text(
        `Rent for ${new Date(rentPayment.dueDate).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" })}`,
        col2Start + 5,
        currentTop + 10,
        { width: descriptionWidth - 10 }
      )
      .text(rentPayment.paymentMethod || "N/A", col3Start + 5, currentTop + 10, { width: paymentMethodWidth - 10 })
      .text(rentPayment.referenceNumber || "N/A", col4Start + 5, currentTop + 10, { width: referenceWidth - 10 })
      .text(`$${rentPayment.amount.toFixed(2)}`, col5Start + 5, currentTop + 10, { width: amountWidth - 10, align: "right" });

    currentTop += itemHeight;

    // Remaining balance (should be $0.00 for full payment)
    const remainingBalance = 0;
    const balanceColor = "#43A047";

    doc
      .fillColor("#F0F0F0")
      .rect(50, currentTop, tableWidth, itemHeight)
      .fill()
      .strokeColor("#E0E0E0")
      .lineWidth(0.5)
      .roundedRect(50, currentTop, tableWidth, itemHeight, 4)
      .stroke()
      .fillColor(balanceColor)
      .text("Remaining Balance", col1Start + 5, currentTop + 10, { width: dateWidth + descriptionWidth + paymentMethodWidth + referenceWidth - 10, align: "center" })
      .text(`$${remainingBalance.toFixed(2)}`, col5Start + 5, currentTop + 10, { width: amountWidth - 10, align: "right" })
      .fillColor("black")
      .font("Helvetica");
  }

  // Finalize the PDF and end the stream
  doc.end();
  
  return doc;
}

