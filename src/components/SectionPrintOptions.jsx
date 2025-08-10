import React from 'react';
import { Printer, FileSpreadsheet, FileText, Calendar } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';


const SectionPrintOptions = ({ 
  data, 
  columns, 
  title, 
  sectionName,
  profileData = null,
  dateRange = null,
  className = ""
}) => {
  const addCompanyHeader = (doc, title, dateRange) => {
    // Company Logo (using Building2 icon as placeholder)
    doc.setFillColor(37, 99, 235); // Blue color
    doc.rect(20, 15, 15, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text('HC', 27.5, 25);
    
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
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 59);
    
    return 70; // Return Y position for content
  };

  const handleSectionPrint = () => {
    const printWindow = window.open('', '_blank');
    
    // Generate HTML for printing with company branding
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title} - ${sectionName}</title>
          <style>
            @page { 
              margin: 0.75in; 
              size: A4; 
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
              margin-bottom: 30px; 
              border-bottom: 3px solid #2563eb; 
              padding-bottom: 20px; 
            }
            .logo {
              width: 60px;
              height: 60px;
              background: linear-gradient(135deg, #2563eb, #1d4ed8);
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 24px;
              font-weight: bold;
              margin-right: 20px;
            }
            .company-info h1 { 
              font-size: 28px; 
              font-weight: bold; 
              margin: 0 0 5px 0; 
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
              margin: 20px 0 10px 0; 
              color: #1f2937;
            }
            .date-range {
              background: #eff6ff;
              border: 1px solid #bfdbfe;
              border-radius: 8px;
              padding: 12px;
              margin: 15px 0;
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
              margin-bottom: 25px; 
              padding: 15px; 
              border: 1px solid #d1d5db; 
              background: linear-gradient(to right, #f8fafc, #f1f5f9);
              border-radius: 8px;
            }
            .profile-grid { 
              display: grid; 
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
              gap: 15px; 
              margin-top: 10px; 
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
              margin: 20px 0;
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
            .summary-section { 
              margin-top: 25px; 
              padding: 20px; 
              border: 2px solid #2563eb; 
              background: linear-gradient(to right, #eff6ff, #dbeafe);
              border-radius: 8px;
            }
            .summary-grid { 
              display: grid; 
              grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); 
              gap: 15px; 
              margin-top: 15px; 
            }
            .summary-item { 
              text-align: center; 
              padding: 15px; 
              border: 1px solid #bfdbfe; 
              background: white;
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
           img src={logo} alt="compnay logo" class="logo" />
            <div class="company-info">
              <h1>Haype Construction</h1>
              <p>Business Management System</p>
            </div>
            <div class="report-info">
              <p style="font-size: 12px; color: #6b7280;">Report Generated</p>
              <p style="font-weight: bold; color: #1f2937;">${new Date().toLocaleDateString()}</p>
            </div>
          </div>
          
          <div class="report-title">${title} - ${sectionName}</div>
          
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
            <h3 class="section-title">${sectionName} (${data.length} records)</h3>
            <table class="data-table">
              <thead>
                <tr>
                  ${columns.map(col => `<th>${col.header}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${data.map(row => `
                  <tr>
                    ${columns.map(col => {
                      let value = row[col.accessor];
                      
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
                      if (col.accessor.includes('Date') && value) {
                        value = format(new Date(value), 'MMM dd, yyyy');
                      }
                      
                      // Format currency
                      if (col.accessor.includes('balance') || col.accessor.includes('amount') || col.accessor.includes('total') || col.accessor.includes('price')) {
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
          
          <div class="summary-section no-break">
            <h3 style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold; color: #1e40af;">Summary Statistics</h3>
            <div class="summary-grid">
              <div class="summary-item">
                <div class="summary-label">Total Records</div>
                <div class="summary-value">${data.length}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Report Section</div>
                <div class="summary-value">${sectionName}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Generated By</div>
                <div class="summary-value">Haype System</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Print Date</div>
                <div class="summary-value">${format(new Date(), 'MMM dd, yyyy')}</div>
              </div>
            </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  const handleSectionExcel = () => {
    try {
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
      
      excelData.push({ [columns[0]?.header || 'Field']: `GENERATED: ${new Date().toLocaleDateString()}` });
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
        columns.forEach(col => {
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

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const colWidths = columns.map(() => ({ wch: 18 }));
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, sectionName);

      // Generate filename with timestamp and date range
      const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm');
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
      const doc = new jsPDF('l', 'mm', 'a4');
      
      // Add company header and get Y position
      const startY = addCompanyHeader(doc, title, dateRange);
      
      // Add section title
      doc.setFontSize(16);
      doc.setTextColor(30, 64, 175);
      doc.text(`${sectionName} (${data.length} records)`, 20, startY);

      let yPosition = startY + 15;

      // Add profile information if available
      if (profileData) {
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Profile Information', 20, yPosition);
        yPosition += 10;

        Object.entries(profileData).forEach(([key, value]) => {
          doc.setFontSize(10);
          doc.setTextColor(75, 85, 99);
          doc.text(`${key}: ${value}`, 25, yPosition);
          yPosition += 6;
        });
        
        yPosition += 10;
      }

      // Prepare table data
      const tableColumns = columns.map(col => col.header);
      const tableRows = data.map(row => {
        return columns.map(col => {
          let value = row[col.accessor];
          
          // Handle nested objects
          if (col.accessor && col.accessor.includes('.')) {
            const keys = col.accessor.split('.');
            value = keys.reduce((obj, key) => obj?.[key], row);
          }
          
          // Convert to string for PDF
          if (typeof value === 'object' && value !== null) {
            if (value.customerName) return value.customerName;
            if (value.carName) return value.carName;
            if (value.itemName) return value.itemName;
            if (value.employeeName) return value.employeeName;
            return JSON.stringify(value);
          }
          
          // Format dates
          if (col.accessor.includes('Date') && value) {
            return format(new Date(value), 'MMM dd, yyyy');
          }
          
          return value || '';
        });
      });

      // Add table
      doc.autoTable({
        head: [tableColumns],
        body: tableRows,
        startY: yPosition,
        styles: {
          fontSize: 9,
          cellPadding: 4,
        },
        headStyles: {
          fillColor: [37, 99, 235],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        margin: { left: 20, right: 20 }
      });

      // Generate filename
      const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm');
      const dateRangeStr = dateRange ? 
        `_${format(dateRange.from, 'MMM-dd')}_to_${format(dateRange.to, 'MMM-dd')}` : '';
      const filename = `${sectionName}_${timestamp}${dateRangeStr}.pdf`;

      doc.save(filename);
      
      console.log('✅ Section PDF exported:', filename);
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