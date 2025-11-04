import React, { useState, useRef, useCallback } from 'react';
import { Upload, Download, RotateCcw, Crop, Square, Maximize } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import InfoSection from '../components/InfoSection';

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

const ImageCropper: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string>('');
  const [croppedImage, setCroppedImage] = useState<string>('');
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 200, height: 200 });
  const [aspectRatio, setAspectRatio] = useState<string>('free');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [fileName, setFileName] = useState('cropped-image');
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectRatios = [
    { label: 'Free', value: 'free' },
    { label: '1:1 (Square)', value: '1:1' },
    { label: '4:3', value: '4:3' },
    { label: '16:9', value: '16:9' },
    { label: '3:2', value: '3:2' },
    { label: '2:3 (Portrait)', value: '2:3' }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setOriginalImage(result);
      setFileName(file.name.split('.')[0] + '-cropped');
      setCroppedImage('');
      
      // Load image to get dimensions
      const img = new Image();
      img.onload = () => {
        setImageSize({ width: img.width, height: img.height });
        // Reset crop area to center
        const size = Math.min(img.width, img.height) * 0.5;
        setCropArea({
          x: (img.width - size) / 2,
          y: (img.height - size) / 2,
          width: size,
          height: size
        });
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const updateCropArea = useCallback((newArea: Partial<CropArea>) => {
    setCropArea(prev => {
      const updated = { ...prev, ...newArea };
      
      // Apply aspect ratio constraints
      if (aspectRatio !== 'free') {
        const [widthRatio, heightRatio] = aspectRatio.split(':').map(Number);
        const ratio = widthRatio / heightRatio;
        
        if (newArea.width !== undefined) {
          updated.height = updated.width / ratio;
        } else if (newArea.height !== undefined) {
          updated.width = updated.height * ratio;
        }
      }
      
      // Ensure crop area stays within image bounds
      updated.x = Math.max(0, Math.min(updated.x, imageSize.width - updated.width));
      updated.y = Math.max(0, Math.min(updated.y, imageSize.height - updated.height));
      updated.width = Math.min(updated.width, imageSize.width - updated.x);
      updated.height = Math.min(updated.height, imageSize.height - updated.y);
      
      return updated;
    });
  }, [aspectRatio, imageSize]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const scaleX = imageSize.width / rect.width;
    const scaleY = imageSize.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    setIsDragging(true);
    setDragStart({ x: x - cropArea.x, y: y - cropArea.y });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const scaleX = imageSize.width / rect.width;
    const scaleY = imageSize.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    updateCropArea({
      x: x - dragStart.x,
      y: y - dragStart.y
    });
  }, [isDragging, dragStart, updateCropArea, imageSize]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const cropImage = () => {
    if (!originalImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = cropArea.width;
      canvas.height = cropArea.height;
      
      ctx.drawImage(
        img,
        cropArea.x, cropArea.y, cropArea.width, cropArea.height,
        0, 0, cropArea.width, cropArea.height
      );
      
      const croppedDataUrl = canvas.toDataURL('image/png');
      setCroppedImage(croppedDataUrl);
    };
    img.src = originalImage;
  };

  const downloadCroppedImage = () => {
    if (!croppedImage) return;
    
    const link = document.createElement('a');
    link.href = croppedImage;
    link.download = `${fileName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClear = () => {
    setOriginalImage('');
    setCroppedImage('');
    setCropArea({ x: 0, y: 0, width: 200, height: 200 });
    setFileName('cropped-image');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getCropOverlayStyle = () => {
    if (!imageRef.current || !originalImage) return {};
    
    const rect = imageRef.current.getBoundingClientRect();
    const scaleX = rect.width / imageSize.width;
    const scaleY = rect.height / imageSize.height;
    
    return {
      left: cropArea.x * scaleX,
      top: cropArea.y * scaleY,
      width: cropArea.width * scaleX,
      height: cropArea.height * scaleY
    };
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <PageHeader 
          title="Image Cropper"
          description="Select and crop portions of images with adjustable aspect ratios and precise controls."
        />

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-6">
          <div className="p-4 bg-gray-50 border-b rounded-t-lg">
            <div className="flex items-center space-x-2">
              <Crop className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">Crop Settings</h3>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File Name
                </label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aspect Ratio
                </label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {aspectRatios.map(ratio => (
                    <option key={ratio.value} value={ratio.value}>{ratio.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Crop Size
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={Math.round(cropArea.width)}
                    onChange={(e) => updateCropArea({ width: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-2 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="W"
                  />
                  <input
                    type="number"
                    value={Math.round(cropArea.height)}
                    onChange={(e) => updateCropArea({ height: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-2 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="H"
                  />
                </div>
              </div>
              
              <div className="flex items-end space-x-2">
                <button
                  onClick={cropImage}
                  disabled={!originalImage}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    originalImage
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Crop className="h-4 w-4" />
                  <span>Crop</span>
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
          {/* Upload and Original Image */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="p-4 bg-gray-50 border-b rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-800">Original Image</h3>
            </div>
            
            <div className="p-6">
              {!originalImage ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                >
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Upload an image to crop
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
                <div className="relative">
                  <img
                    ref={imageRef}
                    src={originalImage}
                    alt="Original"
                    className="w-full h-auto max-h-96 object-contain bg-gray-50 rounded-lg"
                    onMouseDown={handleMouseDown}
                    style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                  />
                  
                  {/* Crop Overlay */}
                  <div
                    className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-20"
                    style={getCropOverlayStyle()}
                  >
                    <div className="absolute inset-0 border border-white border-dashed"></div>
                    {/* Corner handles */}
                    <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 border border-white rounded-full"></div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border border-white rounded-full"></div>
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 border border-white rounded-full"></div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border border-white rounded-full"></div>
                  </div>
                  
                  <div className="mt-4 text-sm text-gray-600">
                    <p>Image size: {imageSize.width} × {imageSize.height}px</p>
                    <p>Crop area: {Math.round(cropArea.width)} × {Math.round(cropArea.height)}px</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cropped Result */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-800">Cropped Image</h3>
              {croppedImage && (
                <button
                  onClick={downloadCroppedImage}
                  className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </button>
              )}
            </div>
            
            <div className="p-6">
              {croppedImage ? (
                <div>
                  <img
                    src={croppedImage}
                    alt="Cropped"
                    className="w-full h-auto max-h-96 object-contain bg-gray-50 rounded-lg border"
                  />
                  <div className="mt-4 text-sm text-gray-600">
                    <p>Cropped size: {Math.round(cropArea.width)} × {Math.round(cropArea.height)}px</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <Square className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Cropped image will appear here</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hidden canvas for cropping */}
        <canvas ref={canvasRef} className="hidden" />

        <InfoSection 
          title="Image Cropping Features"
          items={[
            {
              label: "Interactive Selection",
              description: "Click and drag to select crop area with visual feedback"
            },
            {
              label: "Aspect Ratio Control",
              description: "Free form, square, 4:3, 16:9, and other preset ratios"
            },
            {
              label: "Precise Positioning",
              description: "Drag crop area to exact position on image"
            },
            {
              label: "Multiple Formats",
              description: "Export cropped images in PNG, JPEG, or WebP formats"
            }
          ]}
          useCases="Profile pictures, thumbnails, social media content, image optimization"
        />
      </div>
    </div>
  );
};

export default ImageCropper;