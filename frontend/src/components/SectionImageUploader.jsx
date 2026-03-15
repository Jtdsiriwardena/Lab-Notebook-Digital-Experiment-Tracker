import { useState } from "react";
import api from "../api/axios";

export default function SectionImageUploader({ 
  experimentId, 
  section, 
  onImageUploaded,
  existingImages = [] 
}) {
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!image) {
      setError("Please select an image");
      return;
    }

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("image", image);
    formData.append("section", section);
    formData.append("description", description);

    try {
      const response = await api.post(`/experiments/${experimentId}/section-images/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      setImage(null);
      setDescription("");
      setPreview(null);
      if (onImageUploaded) {
        onImageUploaded(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to upload image");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;
    
    try {
      await api.delete(`/experiments/${experimentId}/section-images/${imageId}/`);
      if (onImageUploaded) {
        onImageUploaded(null, imageId);
      }
    } catch (err) {
      alert("Failed to delete image");
      console.error(err);
    }
  };

  const cancelPreview = () => {
    setImage(null);
    setPreview(null);
    setDescription("");
  };

  return (
    <div className="space-y-4">
      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {existingImages.map((img) => (
            <div key={img.id} className="relative group border rounded-lg overflow-hidden">
              <img 
                src={img.image} 
                alt={img.description || "Section image"} 
                className="w-full h-40 object-cover"
              />
              {img.description && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-sm">
                  {img.description}
                </div>
              )}
              <button
                onClick={() => handleDelete(img.id)}
                className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-700"
                title="Delete image"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Form */}
      <form onSubmit={handleUpload} className="space-y-3">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-2">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {preview ? (
          <div className="relative">
            <img src={preview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
            <button
              type="button"
              onClick={cancelPreview}
              className="absolute top-2 right-2 bg-gray-800 text-white p-1 rounded-full hover:bg-gray-900"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id={`image-upload-${section}`}
            />
            <label 
              htmlFor={`image-upload-${section}`}
              className="cursor-pointer block"
            >
              <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="mt-1 text-sm text-gray-600">Click to upload an image</p>
            </label>
          </div>
        )}

        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Image description (optional)"
          className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />

        {preview && (
          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-semibold transition-colors duration-200 disabled:opacity-50 flex items-center justify-center"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : (
              'Upload Image'
            )}
          </button>
        )}
      </form>
    </div>
  );
}