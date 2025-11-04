import React, { useState, useRef } from 'react';
import { Upload, Download, RotateCcw, RotateCw, FlipHorizontal, FlipVertical, RotateCcw as Reset } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import InfoSection from '../components/InfoSection';

interface Transform {
  rotation: number;
  flipHorizontal: boolean;
  flipVertical: boolean;
}

const ImageRotatorFlipper: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string>('');
  const [processedImage, setProcessedImage] = useState<string>('');
  const [transform, setTransform] = useState<Transform>({
    rotation: 0,
    flipHorizontal: false,
    flipVertical: false
  });
  const [fileName, setFileName] = useState('transformed-image');
  const [customAngle, setCustomAngle] = useState(0);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setFileName(file.name.split('.')[0] + '-transformed');
      setProcessedImage('');
      setTransform({ rotation: 0, flipHorizontal: false, flipVertical: false });
      setCustomAngle(0);
    };
    reader.readAsDataURL(file);
  };

  const applyTransform = () => {
    if (!originalImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Calculate canvas size based on rotation
      const angle = (transform.rotation + customAngle) * Math.PI / 180;
      const cos = Math.abs(Math.cos(angle));
      const sin = Math.abs(Math.sin(angle));
      
      const newWidth = img.width * cos + img.height * sin;
      const newHeight = img.width * sin + img.height * cos;
      
      canvas.width = newWidth;
      canvas.height = newHeight;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Save context state
      ctx.save();
      
      // Move to center
      ctx.translate(canvas.width / 2, canvas.height / 2);
      
      // Apply transformations
      ctx.rotate(angle);
      
      if (transform.flipHorizontal) {
        ctx.scale(-1, 1);
      }
      
      if (transform.flipVertical) {
        ctx.scale(1, -1);
      }
      
      // Draw image centered
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      
      // Restore context state
      ctx.restore();
      
      const processedDataUrl = canvas.toDataURL('image/png');
      setProcessedImage(processedDataUrl);
    };
    img.src = originalImage;
  };

  React.useEffect(() => {
    if (originalImage) {
      applyTransform();
    }
  }, [originalImage, transform, customAngle]);

  const rotate = (degrees: number) => {
    setTransform(prev => ({
      ...prev,
      rotation: (prev.rotation + degrees) % 360
    }));
  };

  const flip = (direction: 'horizontal' | 'vertical') => {
    setTransform(prev => ({
      ...prev,
      [direction === 'horizontal' ? 'flipHorizontal' : 'flipVertical']: 
        !prev[direction === 'horizontal' ? 'flipHorizontal' : 'flipVertical']
    }));
  };

  const resetTransform = () => {
    setTransform({ rotation: 0, flipHorizontal: false, flipVertical: false });
    setCustomAngle(0);
  };

  const downloadProcessedImage = () => {
    if (!processedImage) return;
    
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = `${fileName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClear = () => {
    setOriginalImage('');
    setProcessedImage('');
    setTransform({ rotation: 0, flipHorizontal: false, flipVertical: false });
    setCustomAngle(0);
    setFileName('transformed-image');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <PageHeader 
          title="Image Rotator & Flipper"
          description="Rotate images by any angle and flip them horizontally or vertically with real-time preview."
        />

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-6">
          <div className="p-4 bg-gray-50 border-b rounded-t-lg">
            <div className="flex items-center space-x-2">
              <RotateCw className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-800">Transform Controls</h3>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* File Name */}
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

              {/* Rotation Controls */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quick Rotation
                </label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => rotate(-90)}
                    disabled={!originalImage}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                      originalImage
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>90°</span>
                  </button>
                  <button
                    onClick={() => rotate(90)}
                    disabled={!originalImage}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                      originalImage
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <RotateCw className="h-4 w-4" />
                    <span>90°</span>
                  </button>
                </div>
              </div>

              {/* Custom Angle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Angle ({customAngle}°)
                </label>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={customAngle}
                  onChange={(e) => setCustomAngle(parseInt(e.target.value))}
                  disabled={!originalImage}
                  className="w-full"
                />
              </div>

              {/* Flip Controls */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Flip Options
                </label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => flip('horizontal')}
                    disabled={!originalImage}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                      originalImage
                        ? transform.flipHorizontal
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-600 text-white hover:bg-gray-700'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <FlipHorizontal className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => flip('vertical')}
                    disabled={!originalImage}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                      originalImage
                        ? transform.flipVertical
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-600 text-white hover:bg-gray-700'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <FlipVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                {originalImage && (
                  <p>
                    Rotation: {(transform.rotation + customAngle) % 360}° | 
                    Horizontal: {transform.flipHorizontal ? 'Flipped' : 'Normal'} | 
                    Vertical: {transform.flipVertical ? 'Flipped' : 'Normal'}
                  </p>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={resetTransform}
                  disabled={!originalImage}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    originalImage
                      ? 'bg-gray-600 text-white hover:bg-gray-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Reset className="h-4 w-4" />
                  <span>Reset</span>
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
                    Upload an image to transform
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
                    alt="Original"
                    className="w-full h-auto max-h-96 object-contain bg-gray-50 rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Transformed Result */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-800">Transformed Image</h3>
              {processedImage && (
                <button
                  onClick={downloadProcessedImage}
                  className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </button>
              )}
            </div>
            
            <div className="p-6">
              {processedImage ? (
                <div>
                  <img
                    src={processedImage}
                    alt="Transformed"
                    className="w-full h-auto max-h-96 object-contain bg-gray-50 rounded-lg border"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <RotateCw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Transformed image will appear here</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hidden canvas for processing */}
        <canvas ref={canvasRef} className="hidden" />

        <InfoSection 
          title="Image Rotation & Flipping Features"
          items={[
            {
              label: "Custom Rotation",
              description: "Rotate images to any angle with precision control"
            },
            {
              label: "Quick Actions",
              description: "90° clockwise/counterclockwise rotation with one click"
            },
            {
              label: "Flip Operations",
              description: "Horizontal and vertical flipping with instant preview"
            },
            {
              label: "Real-time Preview",
              description: "See transformations applied immediately as you adjust"
            }
          ]}
          useCases="Photo correction, artistic effects, image orientation fixes, social media content"
        />
      </div>
    </div>
  );
};

export default ImageRotatorFlipper;