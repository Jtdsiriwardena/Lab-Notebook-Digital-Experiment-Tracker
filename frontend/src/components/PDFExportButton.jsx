import { useState } from 'react';
import { createPortal } from 'react-dom';
import ExperimentPDFDocument from './ExperimentPDFDocument';
import { exportExperimentToPDF } from '../../utils/pdfExport';

export default function PDFExportButton({ experiment }) {
  const [isExporting, setIsExporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isRendered, setIsRendered] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    // Short delay to ensure the component is fully rendered
    setTimeout(async () => {
      try {
        const fileName = `${experiment.name}_Experiment_Report`;
        const result = await exportExperimentToPDF(experiment, 'experiment-pdf-document', fileName);
        
        if (result.success) {
          setShowPreview(false);
          console.log('PDF exported successfully');
        } else {
          alert('Failed to export PDF. Please try again.');
        }
      } catch (error) {
        console.error('Export error:', error);
        alert('An error occurred while exporting.');
      } finally {
        setIsExporting(false);
        setIsRendered(false);
      }
    }, 500); // Wait 500ms for rendering
  };

  return (
    <>
      <button
        onClick={() => {
          setShowPreview(true);
          setTimeout(() => setIsRendered(true), 100);
        }}
        disabled={isExporting}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
      >
        {isExporting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            <span>Generating PDF...</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Export as PDF</span>
          </>
        )}
      </button>

      {/* Hidden PDF document for export */}
      {showPreview && createPortal(
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            maxWidth: '90%',
            maxHeight: '90%',
            overflow: 'auto'
          }}>
            <div style={{ marginBottom: '20px', textAlign: 'right' }}>
              <button
                onClick={() => {
                  setShowPreview(false);
                  setIsRendered(false);
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  marginRight: '10px'
                }}
              >
                Close Preview
              </button>
              {isRendered && (
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#16a34a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: isExporting ? 'not-allowed' : 'pointer',
                    opacity: isExporting ? 0.5 : 1
                  }}
                >
                  {isExporting ? 'Exporting...' : 'Download PDF'}
                </button>
              )}
            </div>
            <ExperimentPDFDocument 
              experiment={experiment}
              onRender={() => setIsRendered(true)}
            />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}