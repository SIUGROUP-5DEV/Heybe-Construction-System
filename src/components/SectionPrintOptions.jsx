import React from 'react';
import { Printer, FileSpreadsheet, FileText, Calendar } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


import { format } from 'date-fns';
import logo from '../assets/sitelogo.png';
import blue from '../assets/blue.png'
import cagaf from '../assets/cagaf.png'
import yellow from '../assets/yellow.png'

import { handlePrintContent, generatePrintStyles } from '../utils/printUtils';



const SectionPrintOptions = ({
  data,
  columns,
  title,
  sectionName,
  profileData = null,
  dateRange = null,
  balanceSummary = null,
  className = ""
}) => {
  // Calculate balance summary for the current data
  const calculateBalanceSummary = () => {
    // If balanceSummary is passed as prop, use it (for accurate totals from parent)
    if (balanceSummary) {
      return balanceSummary;
    }

    // Otherwise calculate from current data
    // Check if data contains transactions or payments
    const hasTransactions = data.some(row => row.total !== undefined || row.invoiceNo !== undefined);
    const hasPayments = data.some(row => row.amount !== undefined && row.paymentDate !== undefined);

    let totalAmount = 0;
    let totalPayments = 0;

    if (sectionName.includes('Payment')) {
      // For payment sections, totalPayments is sum of payment amounts
      totalPayments = data.reduce((sum, row) => sum + (row.amount || 0), 0);
      totalAmount = 0; // No transaction amount in payment-only view
    } else if (sectionName.includes('Transaction') || sectionName.includes('Cash')) {
      // For transaction sections, totalAmount is sum of transaction totals
      totalAmount = data.reduce((sum, row) => sum + (row.total || 0), 0);
      totalPayments = 0; // No payments in transaction-only view
    } else if (sectionName.includes('Combined')) {
      // For combined view, separate transactions and payments
      totalAmount = data
        .filter(row => row.type === 'transaction')
        .reduce((sum, row) => sum + (row.total || 0), 0);

      totalPayments = data
        .filter(row => row.type === 'payment')
        .reduce((sum, row) => sum + (row.amount || 0), 0);
    } else {
      // Fallback: try to determine from data structure
      totalAmount = data.reduce((sum, row) => sum + (row.total || 0), 0);
      totalPayments = data.reduce((sum, row) => sum + (row.amount || 0), 0);
    }

    const finalBalance = totalAmount - totalPayments;

    return { totalAmount, totalPayments, finalBalance };
  };

  const addCompanyHeader = (doc, title, dateRange) => {
  doc.addImage(logo, 'PNG', 10, 10, 25, 25);

    // Company Name
    doc.setFontSize(24);
    doc.setTextColor(37, 99, 235);
    doc.text('Haype Construction', 40, 25);
    
    // Subtitle
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text('Business Management System', 40, 32);
    
    // Report Title
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text(title, 20, 45);
    
    // Date Range
    if (dateRange) {
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Report Period: ${format(dateRange.from, 'MMM dd, yyyy')} - ${format(dateRange.to, 'MMM dd, yyyy')}`, 20, 52);
    }
    
    // Generation Date
    doc.setFontSize(10);
 doc.text(`Generated on: ${format(new Date(), 'MMM dd, yyyy')}`, 20, 59);


    
    return 70; // Return Y position for content
  };

  const handleSectionPrint = () => {
    const balanceSummary = calculateBalanceSummary();

    // Filter out Actions and Profit columns for printing
    const printColumns = columns.filter(col =>
      !col.header.toLowerCase().includes('action') &&
      !col.header.toLowerCase().includes('profit')
    );
    
    // Generate HTML for printing with company branding
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title} - ${sectionName}</title>
          <style>
            @page {
              margin: 0.5in;
              size: A4;
            }
            @media print {
              .no-print {
                display: none !important;
              }
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              font-size: 12px; 
              line-height: 1.4; 
              color: #000; 
              margin: 0; 
              padding: 0;
            }
            .header { 
              display: flex;
              align-items: center;
              margin-bottom: 8px; 
              border-bottom: 3px solid #2563eb; 
              padding-bottom: 20px; 
            }
            .logo {
              width: 60px;
              height: 60px;
             
            
            }
            .company-info h1 { 
              font-size: 28px; 
              font-weight: bold; 
              margin: 0 0 1px 0; 
              color: #2563eb;
            }
            .company-info p { 
              font-size: 14px; 
              color: #6b7280; 
              margin: 0;
            }
            .report-info {
              margin-left: auto;
              text-align: right;
            }
            .report-title { 
              font-size: 20px; 
              font-weight: bold; 
              margin: 0px 0 10px 0; 
              color: #1f2937;
            }
            .date-range {
              background: #eff6ff;
              border: 1px solid #bfdbfe;
              border-radius: 8px;
              padding: 12px;
              margin: 7px 0;
              text-align: center;
            }
            .date-range h3 {
              margin: 0 0 5px 0;
              color: #1e40af;
              font-size: 14px;
            }
            .date-range p {
              margin: 0;
              font-weight: bold;
              color: #1e40af;
              font-size: 16px;
            }
            .profile-section { 
              margin-bottom: 2px; 
              padding: 8px; 
              border: 1px solid #d1d5db; 
              background: linear-gradient(to right, #f8fafc, #f1f5f9);
              border-radius: 8px;
            }
            .profile-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
              gap: 15px;
              margin-top: 3px;
             
            }
            @media screen and (max-width: 768px) {
              .profile-grid {
                grid-template-columns: 1fr 1fr;
              }
            }
            @media screen and (max-width: 480px) {
              .profile-grid {
                grid-template-columns: 1fr;
              }
            }
            .profile-item { 
              background: white;
              padding: 10px;
              border-radius: 6px;
              border: 1px solid #e5e7eb;
            }
            .profile-label { 
              font-size: 11px; 
              color: #6b7280; 
              margin-bottom: 3px; 
              font-weight: 500;
            }
            .profile-value { 
              font-weight: bold; 
              font-size: 14px; 
              color: #1f2937;
            }
            .data-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: -25px;
              background: white;
            }
            .data-table th { 
              background: linear-gradient(to bottom, #2563eb, #1d4ed8);
              color: white;
              border: 1px solid #1e40af; 
              padding: 12px 8px; 
              text-align: left; 
              font-size: 11px;
              font-weight: bold;
            }
            .data-table td { 
              border: 1px solid #d1d5db; 
              padding: 10px 8px; 
              font-size: 11px;
            }
            .data-table tr:nth-child(even) { 
              background: #f8fafc; 
            }
            .data-table tr:hover {
              background: #eff6ff;
            }
            @media screen and (max-width: 768px) {
              .data-table {
                font-size: 10px;
              }
              .data-table th,
              .data-table td {
                padding: 6px 4px;
              }
            }
            @media screen and (max-width: 480px) {
              .data-table {
                font-size: 9px;
              }
              .data-table th,
              .data-table td {
                padding: 4px 3px;
              }
            }
            .summary-section { 
              margin-top: 25px; 
              padding: 20px; 
              border: 2px solid #2563eb; 
              background: linear-gradient(to right, #eff6ff, #dbeafe);
              border-radius: 8px;
            }
            .summary-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
              gap: 15px;
              margin-top: 10px;
            }
            @media screen and (max-width: 768px) {
              .summary-grid {
                grid-template-columns: 1fr 1fr;
              }
            }
            @media screen and (max-width: 480px) {
              .summary-grid {
                grid-template-columns: 1fr;
              }
            }
            .summary-item {
              text-align: center;
              padding: 15px;
              border: 1px solid #ccc;
              background-color: white;
              border-radius: 6px;
            }


            .summary-label { 
              font-size: 11px; 
              color: #6b7280; 
              margin-bottom: 5px; 
              font-weight: 500;
            }
            .summary-value { 
              font-weight: bold; 
              font-size: 16px; 
              color: #1e40af;
            }
            .no-break { 
              page-break-inside: avoid; 
            }
            .section-title {
              color: #1e40af;
              font-size: 16px;
              font-weight: bold;
              margin: 20px 0 10px 0;
              padding: 8px 0;
              border-bottom: 2px solid #bfdbfe;
            }
          </style>
        </head>
        <body>
          <div class="header">
          <div class="logo">
  <img src="${logo}" alt="Company Logo" style="width:420px;height:420px; margin-top:-170px; margin-left:-70px;" />
</div>
            <div class="company-info">
             
              
            </div>
            <div class="report-info">
              <p style="font-size: 12px; color: #6b7280;">Report Generated</p>
            <p style="font-weight: bold; color: #1f2937;">${format(new Date(), 'MMM dd, yyyy')}</p>


            </div>
          </div>
          
          
          
          ${dateRange ? `
            <div class="date-range">
              <h3>📅 Report Period</h3>
              <p>${format(dateRange.from, 'MMMM dd, yyyy')} - ${format(dateRange.to, 'MMMM dd, yyyy')}</p>
            </div>
          ` : ''}
          
          ${profileData ? `
            <div class="profile-section no-break">
              <h3 class="section-title">Profile Information</h3>
              <div class="profile-grid">
                ${Object.entries(profileData).map(([key, value]) => `
                  <div class="profile-item">
                    <div class="profile-label">${key}</div>
                    <div class="profile-value">${value}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
          
          <div class="no-break">
          
            <table class="data-table">
              <thead>
                <tr>
                  ${printColumns.map(col => `<th>${col.header}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${sortedData.map(row => `

                  <tr>
                    ${printColumns.map(col => {
                      let value = row[col.accessor];

                      // Special handling for combined history
                      if (col.header === 'Date' && !value) {
                        value = row.paymentDate || row.date;
                      }
                      if (col.header === 'Reference' && !value) {
                        value = row.paymentNo || row.invoiceNo;
                      }
                      if (col.header === 'Type') {
                        value = row.type === 'transaction' ? 'Credit Purchase' : 'MKPYN Payment';
                      }
                      if (col.header === 'Description') {
                        if (row.type === 'transaction') {
                          value = row.itemName && row.quantity && row.price
                            ? row.itemName + ' (' + row.quantity + ' units @ $' + row.price + ')'
                            : row.description || value || '';
                        } else {
                          value = row.description || 'Payment received';
                        }
                      }
                      if (col.header === 'Amount') {
                        const amount = row.type === 'transaction' ? row.total : row.amount;
                        const sign = row.type === 'transaction' ? '+' : '-';
                        value = sign + '$' + (amount || 0).toLocaleString();
                      }

                      // Handle nested objects
                      if (col.accessor && col.accessor.includes('.')) {
                        const keys = col.accessor.split('.');
                        value = keys.reduce((obj, key) => obj?.[key], row);
                      }

                      // Format special values
                      if (typeof value === 'object' && value !== null) {
                        if (value.customerName) value = value.customerName;
                        else if (value.carName) value = value.carName;
                        else if (value.itemName) value = value.itemName;
                        else if (value.employeeName) value = value.employeeName;
                        else value = JSON.stringify(value);
                      }

                      // Format dates
                      if (value && !isNaN(Date.parse(value)) && (col.accessor.toLowerCase().includes('date') || col.header.toLowerCase().includes('date'))) {
                        value = format(new Date(value), 'MMM dd, yyyy');
                      }

                      // Format currency (if not already formatted)
                      if (!value?.toString().includes('$') && (col.accessor.includes('balance') || col.accessor.includes('amount') || col.accessor.includes('total') || col.accessor.includes('price'))) {
                        if (typeof value === 'number') {
                          value = `$${value.toLocaleString()}`;
                        }
                      }

                      return `<td>${value || ''}</td>`;
                    }).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div style="margin-top: 20px; display: flex; justify-content: flex-end;">
            <div style="border: 2px solid #2563eb; background: #eff6ff; padding: 15px; border-radius: 8px; min-width: 200px;">
              <h4 style="margin: 0 0 10px 0; font-size: 14px; font-weight: bold; color: #1e40af; text-align: center;">Balance Summary</h4>
              <div style="text-align: right; flex  line-height: 1.6;">
                <div style="margin-bottom: 8px;">
                  <span style="font-size: 12px; color: #6b7280;">Total Amount:</span><br>
                  <span style="font-size: 16px; font-weight: bold; color: #059669;">$${balanceSummary.totalAmount.toLocaleString()}</span>
                </div>
                <div style="margin-bottom: 8px;">
                  <span style="font-size: 12px; color: #6b7280;">Total MKPYN Payments:</span><br>
                  <span style="font-size: 16px; font-weight: bold; color: #dc2626;">$${balanceSummary.totalPayments.toLocaleString()}</span>
                </div>
                <div style="border-top: 1px solid #bfdbfe; padding-top: 8px;">
                  <span style="font-size: 12px; color: #6b7280;">Final Balance:</span><br>
                  <span style="font-size: 18px; font-weight: bold; color: #1e40af;">$${balanceSummary.finalBalance.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
          
         
            </div>
        </body>
      </html>
    `;
    
    // Use universal print function that works on both mobile and desktop
    handlePrintContent(htmlContent, `${title} - ${sectionName}`);
  };

// Helper function to sort data by date
const sortDataByDate = (data) => {
  return [...data].sort((a, b) => {
    const dateA = new Date(a.date || a.invoiceDate || a.paymentDate || 0);
    const dateB = new Date(b.date || b.invoiceDate || b.paymentDate || 0);
    return dateA - dateB; // ascending order
  });
};


  const handleSectionExcel = () => {
    try {
      const balanceSummary = calculateBalanceSummary();
const sortedData = sortDataByDate(data);

      
      // Filter out Actions and Profit columns for Excel
      const excelColumns = columns.filter(col => 
        !col.header.toLowerCase().includes('action') && 
        !col.header.toLowerCase().includes('profit')
      );
      
      // Prepare data for Excel with date range info
      const excelData = [];
      
      // Add header information
      excelData.push({ [columns[0]?.header || 'Field']: 'HAYPE CONSTRUCTION - BUSINESS MANAGEMENT SYSTEM' });
      excelData.push({ [columns[0]?.header || 'Field']: '' });
      excelData.push({ [columns[0]?.header || 'Field']: `REPORT: ${title} - ${sectionName}` });
      
      if (dateRange) {
        excelData.push({ 
          [columns[0]?.header || 'Field']: `PERIOD: ${format(dateRange.from, 'MMM dd, yyyy')} - ${format(dateRange.to, 'MMM dd, yyyy')}` 
        });
      }
      excelData.push({ [columns[0]?.header || 'Field']: `GENERATED: ${format(new Date(), 'MMM dd, yyyy')}` });

      excelData.push({ [columns[0]?.header || 'Field']: '' });
      
      // Add profile data if available
      if (profileData) {
        excelData.push({ [columns[0]?.header || 'Field']: 'PROFILE INFORMATION' });
        Object.entries(profileData).forEach(([key, value]) => {
          excelData.push({ [columns[0]?.header || 'Field']: key, [columns[1]?.header || 'Value']: value });
        });
        excelData.push({ [columns[0]?.header || 'Field']: '' });
      }
      
      // Add section header
      excelData.push({ [columns[0]?.header || 'Field']: `${sectionName.toUpperCase()} (${data.length} records)` });
      excelData.push({ [columns[0]?.header || 'Field']: '' });
      
      // Add data
      const dataRows = data.map(row => {
        const excelRow = {};
        excelColumns.forEach(col => {
          if (col.accessor && col.header) {
            let value = row[col.accessor];
            
            // Handle nested objects
            if (col.accessor.includes('.')) {
              const keys = col.accessor.split('.');
              value = keys.reduce((obj, key) => obj?.[key], row);
            }
            
            // Convert to string for Excel
            if (typeof value === 'object' && value !== null) {
              if (value.customerName) value = value.customerName;
              else if (value.carName) value = value.carName;
              else if (value.itemName) value = value.itemName;
              else if (value.employeeName) value = value.employeeName;
              else value = JSON.stringify(value);
            }
            
            // Format dates
            if (col.accessor.includes('Date') && value) {
              value = format(new Date(value), 'MMM dd, yyyy');
            }
            
            excelRow[col.header] = value || '';
          }
        });
        return excelRow;
      });
      
      excelData.push(...dataRows);
      
      // Add balance summary
      excelData.push({ [excelColumns[0]?.header || 'Field']: '' });
      excelData.push({ [excelColumns[0]?.header || 'Field']: 'BALANCE SUMMARY' });
      excelData.push({ [excelColumns[0]?.header || 'Field']: 'Total Amount', [excelColumns[1]?.header || 'Value']: `$${balanceSummary.totalAmount.toLocaleString()}` });
      excelData.push({ [excelColumns[0]?.header || 'Field']: 'Total MKPYN Payments', [excelColumns[1]?.header || 'Value']: `$${balanceSummary.totalPayments.toLocaleString()}` });
      excelData.push({ [excelColumns[0]?.header || 'Field']: 'Final Balance', [excelColumns[1]?.header || 'Value']: `$${balanceSummary.finalBalance.toLocaleString()}` });

      // Create workbook and worksheettotalPayments
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const colWidths = columns.map(() => ({ wch: 18 }));
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, sectionName);

      // Generate filename with timestamp and date range
      const timestamp = format(new Date(), 'yyyy-MM-dd');
      const dateRangeStr = dateRange ? 
        `_${format(dateRange.from, 'MMM-dd')}_to_${format(dateRange.to, 'MMM-dd')}` : '';
      const filename = `${sectionName}_${timestamp}${dateRangeStr}.xlsx`;

      // Save file
      XLSX.writeFile(wb, filename);
      
      console.log('✅ Section Excel exported:', filename);
    } catch (error) {
      console.error('❌ Excel export error:', error);
      alert('Error exporting to Excel. Please try again.');
    }
  };

const handleSectionPDF = () => {
  try {
    const balanceSummary = calculateBalanceSummary();
    const pdfColumns = columns.filter(
      col =>
        !col.header.toLowerCase().includes('action') &&
        !col.header.toLowerCase().includes('profit')
    );

    const doc = new jsPDF('p', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 40;

    // ✅ COMPANY PROFILE SECTION (flex layout with logo + 3 images)
    const logoImg = new Image();
    logoImg.src = logo;

 

    // Layout sida flex: logo bidix, 3da image midig
    const logoWidth = 300;
    const logoHeight = 300;
    const iconWidth = 115;
    const iconHeight = 115;
    const spacing = 10;

    // Logo
    doc.addImage(logoImg, 'PNG', -28, y-120, logoWidth, logoHeight);

    // 3da image midig la saf ah
    const startXRight = pageWidth - (iconWidth * 3+ spacing * -1 + 40);
    doc.addImage(blue, 'PNG', startXRight , y-10, iconWidth, iconHeight);
    doc.addImage(cagaf, 'PNG', startXRight + iconWidth + spacing, y-10, iconWidth, iconHeight);
    doc.addImage(yellow, 'PNG', startXRight + (iconWidth + spacing) * 2, y-10, iconWidth, iconHeight);

    

    // Title
    y += 85;
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text(title || 'Report', 40, y);

    // Date Range
    if (dateRange) {
      y += 20;
      doc.setFontSize(10);
      doc.setTextColor(90, 90, 90);
      doc.text(
        `Report Period: ${format(dateRange.from, 'MMM dd, yyyy')} - ${format(
          dateRange.to,
          'MMM dd, yyyy'
        )}`,
        40,
        y
      );
    }

    // Generated Date
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(`Generated on: ${format(new Date(), 'MMM dd, yyyy')}`, 40, y + 15);

    // ✅ PROFILE INFORMATION BOX (same as print)
    if (profileData) {
      y += 35;
      doc.setDrawColor(189, 219, 254);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(40, y, pageWidth - 80, 100, 8, 8, 'FD');

      doc.setFontSize(14);
      doc.setTextColor(30, 64, 175);
      doc.text('Profile Information', 50, y + 20);

      const entries = Object.entries(profileData);
      const colCount = 3;
      const colWidth = (pageWidth - 120) / colCount;
      let rowY = y + 40;
      let colX = 50;

      entries.forEach(([key, value], i) => {
        doc.setFontSize(9);
        doc.setTextColor(107, 114, 128);
        doc.text(key, colX, rowY);
        doc.setFontSize(11);
        doc.setTextColor(31, 41, 55);
        doc.text(String(value), colX, rowY + 12);

        if ((i + 1) % colCount === 0) {
          rowY += 35;
          colX = 50;
        } else {
          colX += colWidth;
        }
      });

      y += 120;
    }

    // ✅ TABLE SECTION
    const tableColumns = pdfColumns.map(col => col.header);
   const sortedData = sortDataByDate(data);
const tableRows = sortedData.map(row => 

      pdfColumns.map(col => {
        let value = col.accessor ? row[col.accessor] : '';
        if (typeof value === 'object' && value !== null) {
          if (value.customerName) value = value.customerName;
          else if (value.carName) value = value.carName;
          else if (value.itemName) value = value.itemName;
          else if (value.employeeName) value = value.employeeName;
        }
        if (
          value &&
          !isNaN(Date.parse(value)) &&
          (col.accessor?.includes('date') ||
            col.header.toLowerCase().includes('date'))
        ) {
          value = format(new Date(value), 'MMM dd, yyyy');
        }
        return value || '';
      })
    );

    autoTable(doc, {
      startY: y,
      head: [tableColumns],
      body: tableRows,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 5,
        lineColor: [210, 210, 210],
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: { fillColor: [245, 248, 255] },
      margin: { left: 40, right: 40 },
      tableWidth: 'auto',
    });
// ✅ BALANCE SUMMARY (print-style design)
const finalY = doc.lastAutoTable.finalY + 25;

// background gradient effect (manual rectangle + fill)
doc.setDrawColor(37, 99, 235);
doc.setFillColor(239, 246, 255); // light blue tone
doc.roundedRect(pageWidth - 260, finalY, 200, 115, 10, 10, 'FD');

// header line
doc.setFillColor(37, 99, 235);
doc.rect(pageWidth - 260, finalY, 200, 28, 'F');

// title
doc.setFontSize(13);
doc.setTextColor(255, 255, 255);
doc.text('Balance Summary', pageWidth - 160, finalY + 18, { align: 'center' });

// box inner details
doc.setFontSize(10);
doc.setTextColor(55, 65, 81);
doc.text(`Total Amount:`, pageWidth - 240, finalY + 50);
doc.text(`Total MKPYN Payments:`, pageWidth - 240, finalY + 70);
doc.text(`Final Balance:`, pageWidth - 240, finalY + 90);

// values (align right)
doc.setFontSize(11);
doc.setTextColor(22, 101, 52); // green
doc.text(`$${balanceSummary.totalAmount.toLocaleString()}`, pageWidth - 100, finalY + 50, { align: 'right' });

doc.setTextColor(220, 38, 38); // red
doc.text(`$${balanceSummary.totalPayments.toLocaleString()}`, pageWidth - 100, finalY + 70, { align: 'right' });

doc.setFontSize(12);
doc.setTextColor(30, 64, 175); // blue
doc.text(`$${balanceSummary.finalBalance.toLocaleString()}`, pageWidth - 100, finalY + 90, { align: 'right' });


    // ✅ Footer
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(
      '© Haype Construction | Business Management System',
      40,
      doc.internal.pageSize.getHeight() - 25
    );

    const filename = `${sectionName}_${format(
      new Date(),
      'yyyy-MM-dd_HH-mm'
    )}.pdf`;
    doc.save(filename);

    console.log('✅ PDF Exported with Flex Header Design');
  } catch (error) {
    console.error('❌ PDF export error:', error);
    alert('Error exporting to PDF. Please try again.');
  }
};






  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <button
        onClick={handleSectionPrint}
        className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 shadow-sm"
        title={`Print ${sectionName}`}
      >
        <Printer className="w-4 h-4 mr-2" />
        Print
      </button>
      
      <button
        onClick={handleSectionExcel}
        className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium shadow-sm"
        title={`Export ${sectionName} to Excel`}
      >
        <FileSpreadsheet className="w-4 h-4 mr-2" />
        Excel
      </button>
      
      <button
        onClick={handleSectionPDF}
        className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
        title={`Export ${sectionName} to PDF`}
      >
        <FileText className="w-4 h-4 mr-2" />
        PDF
      </button>
      
      {dateRange && (
        <div className="flex items-center px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          <Calendar className="w-4 h-4 mr-2 text-blue-600" />
          <span className="text-blue-700 font-medium">
            {format(dateRange.from, 'MMM dd')} - {format(dateRange.to, 'MMM dd, yyyy')}
          </span>
        </div>
      )}
    </div>




  );
};




export default SectionPrintOptions;


