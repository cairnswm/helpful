import React, { useState, useRef } from 'react';
import { Upload, Download, RotateCcw, Info, Camera, MapPin, Calendar } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import InfoSection from '../components/InfoSection';

interface ExifData {
  [key: string]: any;
}

interface MetadataField {
  key: string;
  label: string;
  value: string;
  editable: boolean;
  category: 'camera' | 'location' | 'datetime' | 'other';
}

const ImageMetadataEditor: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string>('');
  const [fileName, setFileName] = useState('image-with-metadata');
  const [metadata, setMetadata] = useState<MetadataField[]>([]);
  const [loading, setLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    setLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setOriginalImage(result);
      setFileName(file.name.split('.')[0] + '-edited');
      extractMetadata(file);
    };
    reader.readAsDataURL(file);
  };

  const extractMetadata = async (file: File) => {
    try {
      // For demo purposes, we'll simulate EXIF data extraction
      // In a real implementation, you'd use a library like exif-js or piexifjs
      const simulatedExif: MetadataField[] = [
        // Camera Information
        { key: 'Make', label: 'Camera Make', value: 'Canon', editable: true, category: 'camera' },
        { key: 'Model', label: 'Camera Model', value: 'EOS R5', editable: true, category: 'camera' },
        { key: 'LensModel', label: 'Lens Model', value: 'RF 24-70mm F2.8 L IS USM', editable: true, category: 'camera' },
        { key: 'FocalLength', label: 'Focal Length', value: '50mm', editable: true, category: 'camera' },
        { key: 'FNumber', label: 'Aperture', value: 'f/2.8', editable: true, category: 'camera' },
        { key: 'ExposureTime', label: 'Shutter Speed', value: '1/125', editable: true, category: 'camera' },
        { key: 'ISOSpeedRatings', label: 'ISO', value: '400', editable: true, category: 'camera' },
        
        // Date/Time Information
        { key: 'DateTime', label: 'Date Taken', value: new Date().toISOString().split('T')[0], editable: true, category: 'datetime' },
        { key: 'DateTimeOriginal', label: 'Original Date', value: new Date().toISOString().split('T')[0], editable: true, category: 'datetime' },
        
        // Location Information
        { key: 'GPSLatitude', label: 'Latitude', value: '', editable: true, category: 'location' },
        { key: 'GPSLongitude', label: 'Longitude', value: '', editable: true, category: 'location' },
        { key: 'GPSAltitude', label: 'Altitude', value: '', editable: true, category: 'location' },
        
        // Other Information
        { key: 'ImageDescription', label: 'Description', value: '', editable: true, category: 'other' },
        { key: 'Artist', label: 'Artist/Photographer', value: '', editable: true, category: 'other' },
        { key: 'Copyright', label: 'Copyright', value: '', editable: true, category: 'other' },
        { key: 'Software', label: 'Software', value: 'Helpful Image Tools', editable: true, category: 'other' },
        
        // File Information (read-only)
        { key: 'FileSize', label: 'File Size', value: `${(file.size / 1024 / 1024).toFixed(2)} MB`, editable: false, category: 'other' },
        { key: 'FileType', label: 'File Type', value: file.type, editable: false, category: 'other' },
        { key: 'LastModified', label: 'Last Modified', value: new Date(file.lastModified).toLocaleString(), editable: false, category: 'other' }
      ];

      setMetadata(simulatedExif);
    } catch (error) {
      console.error('Error extracting metadata:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateMetadata = (key: string, value: string) => {
    setMetadata(prev => prev.map(field => 
      field.key === key ? { ...field, value } : field
    ));
  };

  const addCustomField = () => {
    const newField: MetadataField = {
      key: `Custom_${Date.now()}`,
      label: 'Custom Field',
      value: '',
      editable: true,
      category: 'other'
    };
    setMetadata(prev => [...prev, newField]);
  };

  const removeField = (key: string) => {
    setMetadata(prev => prev.filter(field => field.key !== key));
  };

  const downloadWithMetadata = () => {
    if (!originalImage) return;
    
    // In a real implementation, you would embed the metadata back into the image
    // For this demo, we'll download the original image
    const link = document.createElement('a');
    link.href = originalImage;
    link.download = `${fileName}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Also download metadata as JSON
    const metadataJson = metadata.reduce((acc, field) => {
      acc[field.key] = field.value;
      return acc;
    }, {} as any);
    
    const metadataBlob = new Blob([JSON.stringify(metadataJson, null, 2)], { type: 'application/json' });
    const metadataUrl = URL.createObjectURL(metadataBlob);
    const metadataLink = document.createElement('a');
    metadataLink.href = metadataUrl;
    metadataLink.download = `${fileName}-metadata.json`;
    document.body.appendChild(metadataLink);
    metadataLink.click();
    document.body.removeChild(metadataLink);
    URL.revokeObjectURL(metadataUrl);
  };

  const handleClear = () => {
    setOriginalImage('');
    setMetadata([]);
    setFileName('image-with-metadata');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'camera': return <Camera className="h-4 w-4 text-blue-500" />;
      case 'location': return <MapPin className="h-4 w-4 text-green-500" />;
      case 'datetime': return <Calendar className="h-4 w-4 text-purple-500" />;
      default: return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const groupedMetadata = metadata.reduce((acc, field) => {
    if (!acc[field.category]) {
      acc[field.category] = [];
    }
    acc[field.category].push(field);
    return acc;
  }, {} as Record<string, MetadataField[]>);

  const categoryLabels = {
    camera: 'Camera Information',
    location: 'Location Data',
    datetime: 'Date & Time',
    other: 'Other Information'
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <PageHeader 
          title="Image Metadata Editor"
          description="View and edit EXIF data including camera settings, GPS coordinates, and custom metadata fields."
        />

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-6">
          <div className="p-4 bg-gray-50 border-b rounded-t-lg">
            <div className="flex items-center space-x-2">
              <Info className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">Metadata Controls</h3>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File Name
                </label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={addCustomField}
                  disabled={!originalImage}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    originalImage
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Add Custom Field
                </button>
                <button
                  onClick={downloadWithMetadata}
                  disabled={!originalImage}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    originalImage
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </button>
                <button
                  onClick={handleClear}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Clear all"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload and Image Preview */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="p-4 bg-gray-50 border-b rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-800">Image Preview</h3>
            </div>
            
            <div className="p-6">
              {!originalImage ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                >
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Upload an image to view metadata
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports JPEG, PNG, WebP, and other image formats
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              ) : (
                <div>
                  <img
                    src={originalImage}
                    alt="Preview"
                    className="w-full h-auto max-h-96 object-contain bg-gray-50 rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Metadata Editor */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="p-4 bg-gray-50 border-b rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-800">Metadata Fields</h3>
            </div>
            
            <div className="p-6 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading metadata...</p>
                </div>
              ) : metadata.length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(groupedMetadata).map(([category, fields]) => (
                    <div key={category}>
                      <div className="flex items-center space-x-2 mb-3">
                        {getCategoryIcon(category)}
                        <h4 className="font-medium text-gray-900">
                          {categoryLabels[category as keyof typeof categoryLabels]}
                        </h4>
                      </div>
                      <div className="space-y-3 ml-6">
                        {fields.map((field) => (
                          <div key={field.key} className="flex items-center space-x-2">
                            <label className="text-sm font-medium text-gray-700 w-32 flex-shrink-0">
                              {field.label}:
                            </label>
                            {field.editable ? (
                              <input
                                type="text"
                                value={field.value}
                                onChange={(e) => updateMetadata(field.key, e.target.value)}
                                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            ) : (
                              <span className="flex-1 text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
                                {field.value}
                              </span>
                            )}
                            {field.editable && field.key.startsWith('Custom_') && (
                              <button
                                onClick={() => removeField(field.key)}
                                className="text-red-500 hover:text-red-700 text-sm"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Upload an image to view and edit its metadata
                </div>
              )}
            </div>
          </div>
        </div>

        <InfoSection 
          title="Metadata Editor Features"
          items={[
            {
              label: "EXIF Data",
              description: "View camera settings, lens information, and shooting parameters"
            },
            {
              label: "GPS Information",
              description: "Edit location coordinates and altitude data"
            },
            {
              label: "Custom Fields",
              description: "Add your own metadata fields for organization"
            },
            {
              label: "Bulk Export",
              description: "Download both the image and metadata as separate files"
            },
            {
              label: "Note",
              description: "This is a demo implementation. Real metadata embedding requires specialized libraries"
            }
          ]}
        />
      </div>
    </div>
  );
};

export default ImageMetadataEditor;