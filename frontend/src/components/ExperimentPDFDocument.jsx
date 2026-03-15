import { useEffect, useRef, useState } from 'react';
import api from '../api/axios';

export default function ExperimentPDFDocument({ experiment, onRender }) {
  const documentRef = useRef(null);
  const [sectionImages, setSectionImages] = useState({});
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const imagesRes = await api.get(`/experiments/${experiment.id}/section-images/`);
        
        const grouped = {
          objective: [],
          procedure: [],
          results: []
        };
        
        imagesRes.data.forEach(img => {
          if (grouped[img.section]) {
            grouped[img.section].push(img);
          }
        });
        
        setSectionImages(grouped);
        
        // Fetch attachments
        const attachmentsRes = await api.get(`/experiments/${experiment.id}/`);
        setAttachments(attachmentsRes.data.attachments || []);
        
      } catch (error) {
        console.error('Error fetching images:', error);
      } finally {
        setLoading(false);
        if (onRender) {
          setTimeout(() => onRender(), 100);
        }
      }
    };

    fetchImages();
  }, [experiment.id, onRender]);

  // Format date nicely
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:8000${imagePath}`;
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ 
          border: '3px solid #f3f3f3',
          borderTop: '3px solid #2563eb',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }}></div>
        <p style={{ color: '#6b7280' }}>Loading experiment data...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div 
      id="experiment-pdf-document"
      ref={documentRef}
      className="pdf-document"
      style={{
        fontFamily: 'Arial, sans-serif',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px',
        backgroundColor: '#ffffff',
        color: '#333333',
        lineHeight: '1.6'
      }}
    >
      {/* Header with Title and Metadata */}
      <div style={{ 
        borderBottom: '3px solid #2563eb', 
        paddingBottom: '20px', 
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 'bold', 
          color: '#1e40af',
          marginBottom: '10px'
        }}>
          {experiment.name}
        </h1>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '30px',
          color: '#4b5563',
          fontSize: '14px',
          marginTop: '10px',
          flexWrap: 'wrap'
        }}>
          <div>
            <span style={{ fontWeight: 'bold', color: '#2563eb' }}>Created:</span>{' '}
            {formatDate(experiment.created_at)}
          </div>
          <div>
            <span style={{ fontWeight: 'bold', color: '#2563eb' }}>Updated:</span>{' '}
            {formatDate(experiment.updated_at)}
          </div>
          <div>
            <span style={{ fontWeight: 'bold', color: '#2563eb' }}>Role:</span>{' '}
            <span style={{ textTransform: 'capitalize' }}>{experiment.current_user_role}</span>
          </div>
        </div>
      </div>

      {/* Tags Section */}
      {experiment.tags && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={sectionTitleStyle}>Tags</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {experiment.tags.split(',').map((tag, index) => (
              <span
                key={index}
                style={{
                  backgroundColor: '#e0e7ff',
                  color: '#1e40af',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: '500'
                }}
              >
                {tag.trim()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Objective Section */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={sectionTitleStyle}>Objective</h2>
        <div style={contentBoxStyle}>
          <p style={paragraphStyle}>
            {experiment.objective || 'No objective provided'}
          </p>
          
          {/* Objective Images */}
          {sectionImages.objective && sectionImages.objective.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h3 style={subsectionTitleStyle}>Images</h3>
              <div style={imageGridStyle}>
                {sectionImages.objective.map((img, idx) => (
                  <div key={img.id} style={imageContainerStyle}>
                    <img 
                      src={getImageUrl(img.image)} 
                      alt={img.description || `Objective image ${idx + 1}`}
                      style={imageStyle}
                      crossOrigin="anonymous"
                    />
                    {img.description && (
                      <p style={imageCaptionStyle}>{img.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Procedure Section */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={sectionTitleStyle}>Procedure</h2>
        <div style={contentBoxStyle}>
          <p style={paragraphStyle}>
            {experiment.procedure || 'No procedure provided'}
          </p>
          
          {/* Procedure Images */}
          {sectionImages.procedure && sectionImages.procedure.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h3 style={subsectionTitleStyle}>Images</h3>
              <div style={imageGridStyle}>
                {sectionImages.procedure.map((img, idx) => (
                  <div key={img.id} style={imageContainerStyle}>
                    <img 
                      src={getImageUrl(img.image)} 
                      alt={img.description || `Procedure image ${idx + 1}`}
                      style={imageStyle}
                      crossOrigin="anonymous"
                    />
                    {img.description && (
                      <p style={imageCaptionStyle}>{img.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={sectionTitleStyle}>Results</h2>
        <div style={contentBoxStyle}>
          <p style={paragraphStyle}>
            {experiment.results || 'No results provided'}
          </p>
          
          {/* Results Images */}
          {sectionImages.results && sectionImages.results.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h3 style={subsectionTitleStyle}>Images</h3>
              <div style={imageGridStyle}>
                {sectionImages.results.map((img, idx) => (
                  <div key={img.id} style={imageContainerStyle}>
                    <img 
                      src={getImageUrl(img.image)} 
                      alt={img.description || `Results image ${idx + 1}`}
                      style={imageStyle}
                      crossOrigin="anonymous"
                    />
                    {img.description && (
                      <p style={imageCaptionStyle}>{img.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Attachments Section */}
      {attachments && attachments.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={sectionTitleStyle}>Attachments</h2>
          <div style={contentBoxStyle}>
            <div style={imageGridStyle}>
              {attachments.map((attachment, idx) => (
                <div key={attachment.id} style={imageContainerStyle}>
                  <img 
                    src={getImageUrl(attachment.image)} 
                    alt={`Attachment ${idx + 1}`}
                    style={imageStyle}
                    crossOrigin="anonymous"
                  />
                  <p style={imageCaptionStyle}>
                    Uploaded: {new Date(attachment.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}



      {/* Footer */}
      <div style={{
        marginTop: '50px',
        paddingTop: '20px',
        borderTop: '1px solid #e5e7eb',
        textAlign: 'center',
        color: '#9ca3af',
        fontSize: '12px'
      }}>
        <p>Generated from Experiment Management System</p>
        <p style={{ marginTop: '5px' }}>
          Document ID: {experiment.id} | Generated: {new Date().toLocaleString()}
        </p>
      </div>
    </div>
  );
}

// Style constants
const sectionTitleStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#1e40af',
  marginBottom: '15px',
  borderLeft: '5px solid #2563eb',
  paddingLeft: '15px'
};

const subsectionTitleStyle = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#4b5563',
  marginBottom: '15px',
  borderBottom: '1px solid #e5e7eb',
  paddingBottom: '5px'
};

const contentBoxStyle = {
  backgroundColor: '#f9fafb',
  padding: '20px',
  borderRadius: '8px',
  border: '1px solid #e5e7eb'
};

const paragraphStyle = {
  fontSize: '14px',
  lineHeight: '1.8',
  color: '#374151',
  margin: 0,
  whiteSpace: 'pre-wrap'
};

const imageGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
  gap: '20px',
  marginTop: '15px'
};

const imageContainerStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '10px',
  textAlign: 'center'
};

const imageStyle = {
  maxWidth: '100%',
  maxHeight: '200px',
  objectFit: 'contain'
};

const imageCaptionStyle = {
  fontSize: '12px',
  color: '#6b7280',
  marginTop: '8px',
  fontStyle: 'italic'
};