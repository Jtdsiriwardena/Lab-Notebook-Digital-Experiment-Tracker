import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const exportExperimentToPDF = async (experiment, elementId, fileName = 'experiment') => {
  try {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element with ID "${elementId}" not found`);
      throw new Error(`Element with ID "${elementId}" not found`);
    }
    const clone = element.cloneNode(true);
    
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.width = '1200px';
    container.style.backgroundColor = '#ffffff';
    container.style.padding = '0';
    container.style.zIndex = '-1000';
    
    container.appendChild(clone);
    document.body.appendChild(container);

    // Configure html2canvas for high-quality output
    const canvas = await html2canvas(container, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      allowTaint: true,
      useCORS: true,
      windowWidth: 1200,
      onclone: (clonedDoc) => {

        const style = clonedDoc.createElement('style');
        style.textContent = `
          .pdf-document {
            font-family: Arial, sans-serif !important;
          }
          * {
            box-sizing: border-box;
          }
        `;
        clonedDoc.head.appendChild(style);
      }
    });

    document.body.removeChild(container);

    const imgData = canvas.toDataURL('image/png');
    
    // Calculate dimensions for A4
    const imgWidth = 210; 
    const pageHeight = 297; 
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    
    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    let position = 0;
    
    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    // Add additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    // Add page numbers
    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text(
        `Page ${i} of ${pageCount}`,
        pdf.internal.pageSize.width - 30,
        pdf.internal.pageSize.height - 10
      );
    }
    
    // Save the PDF
    const sanitizedFileName = fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    pdf.save(`${sanitizedFileName}_${new Date().toISOString().split('T')[0]}.pdf`);
    
    return { success: true };
  } catch (error) {
    console.error('Error generating PDF:', error);
    return { success: false, error: error.message };
  }
};