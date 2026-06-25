import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Utility to export data to CSV or PDF formats.
 * 
 * @param {Array} data - Array of objects containing the data.
 * @param {Array} columns - Array of column definitions: [{ header: 'Header Name', dataKey: 'objectKey' }]
 * @param {string} filename - Base name for the exported file (without extension).
 */
export const exportToCSV = (data, columns, filename) => {
  if (!data || !data.length) {
    alert("No data available to export.");
    return;
  }

  // Create header row
  const headers = columns.map(col => `"${col.header.replace(/"/g, '""')}"`).join(',');

  // Create data rows
  const csvRows = data.map(row => {
    return columns.map(col => {
      let cellData = row[col.dataKey];
      
      // Handle nested or complex data
      if (cellData === null || cellData === undefined) {
        cellData = '';
      } else if (typeof cellData === 'object') {
        cellData = JSON.stringify(cellData);
      } else {
        cellData = String(cellData);
      }
      
      // Escape quotes and wrap in quotes to handle commas/newlines in data
      return `"${cellData.replace(/"/g, '""')}"`;
    }).join(',');
  });

  const csvString = [headers, ...csvRows].join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  
  // Download logic
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

export const exportToPDF = (data, columns, filename, title = "Export Report") => {
  if (!data || !data.length) {
    alert("No data available to export.");
    return;
  }

  const doc = new jsPDF();
  
  // Header details
  doc.setFontSize(14);
  doc.text(title, 14, 15);
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

  // Prepare table data
  const head = [columns.map(col => col.header)];
  const body = data.map(row => 
    columns.map(col => {
      let cellData = row[col.dataKey];
      if (cellData === null || cellData === undefined) return '';
      if (typeof cellData === 'object') return JSON.stringify(cellData);
      return String(cellData);
    })
  );

  autoTable(doc, {
    startY: 28,
    head: head,
    body: body,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [63, 131, 248], textColor: 255 }, // matches brand blue
    alternateRowStyles: { fillColor: [249, 250, 251] }
  });

  doc.save(`${filename}.pdf`);
};
