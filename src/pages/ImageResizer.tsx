import React, { useState, useCallback, useRef } from 'react';
import { Upload, Download, RotateCcw, Image as ImageIcon, Settings, Info } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import InfoSection from '../components/InfoSection';

interface ResizeSettings {
  targetSizeKB: number;
  quality: number;
  format: 'jpeg' | 'png' | 'webp';
  maxWidth: number;
  maxHeight: number;
}

const ImageResizer: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string>('');
  const [resizedImageUrl, setResizedImageUrl] = useState<string>('');
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [resizedSize, setResizedSize] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [settings, setSettings] = useState<ResizeSettings>(() => {
    const saved = localStorage.getItem('imageResizerSettings');
    return saved ? JSON.parse(saved) : {
      targetSizeKB: 200,
      quality: 0.8,
      format: 'jpeg' as const,
      maxWidth: 1920,
      maxHeight: 1080
    };
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Save settings to localStorage whenever they change
  React.useEffect(() => {
    localStorage.setItem('imageResizerSettings', JSON.stringify(settings));
  }, [settings]);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    setOriginalImage(file);
    setOriginalSize(file.size);
    setResizedImageUrl('');
    setResizedSize(0);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setOriginalImageUrl(url);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const resizeImage = async () => {
    if (!originalImage || !canvasRef.current) return;

    setIsProcessing(true);

    try {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;

        // Calculate new dimensions
        let { width, height } = img;
        const aspectRatio = width / height;

        // Resize to fit within max dimensions
        if (width > settings.maxWidth) {
          width = settings.maxWidth;
          height = width / aspectRatio;
        }
        if (height > settings.maxHeight) {
          height = settings.maxHeight;
          width = height * aspectRatio;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw the resized image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob with quality adjustment
        let quality = settings.quality;
        const targetBytes = settings.targetSizeKB * 1024;

        const tryCompress = (currentQuality: number) => {
          canvas.toBlob((blob) => {
            if (!blob) return;

            // If the image is still too large and quality can be reduced further
            if (blob.size > targetBytes && currentQuality > 0.1) {
              const newQuality = Math.max(0.1, currentQuality - 0.1);
              tryCompress(newQuality);
            } else {
              // Create download URL
              const url = URL.createObjectURL(blob);
              setResizedImageUrl(url);
              setResizedSize(blob.size);
              setIsProcessing(false);
            }
          }, `image/${settings.format}`, currentQuality);
        };

        tryCompress(quality);
      };

      img.src = originalImageUrl;
    } catch (error) {
      console.error('Error resizing image:', error);
      setIsProcessing(false);
    }
  };

  const downloadResizedImage = () => {
    if (!resizedImageUrl || !originalImage) return;

    const link = document.createElement('a');
    link.href = resizedImageUrl;
    const extension = settings.format === 'jpeg' ? 'jpg' : settings.format;
    link.download = `resized_${originalImage.name.split('.')[0]}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClear = () => {
    setOriginalImage(null);
    setOriginalImageUrl('');
    setResizedImageUrl('');
    setOriginalSize(0);
    setResizedSize(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const compressionRatio = originalSize > 0 && resizedSize > 0 
    ? ((originalSize - resizedSize) / originalSize * 100).toFixed(1)
    : '0';

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <PageHeader 
          title="Image Resizer"
          description="Upload and resize images to reduce file size while maintaining quality. Perfect for web optimization."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Panel */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="p-4 bg-gray-50 border-b rounded-t-lg">
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">Resize Settings</h3>
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Size (KB)
                </label>
                <input
                  type="number"
                  min="10"
                  max="5000"
                  value={settings.targetSizeKB}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    targetSizeKB: parseInt(e.target.value) || 200 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quality ({Math.round(settings.quality * 100)}%)
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={settings.quality}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    quality: parseFloat(e.target.value) 
                  }))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Output Format
                </label>
                <select
                  value={settings.format}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    format: e.target.value as 'jpeg' | 'png' | 'webp'
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="jpeg">JPEG</option>
                  <option value="png">PNG</option>
                  <option value="webp">WebP</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Width (px)
                </label>
                <input
                  type="number"
                  min="100"
                  max="4000"
                  value={settings.maxWidth}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    maxWidth: parseInt(e.target.value) || 1920 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Height (px)
                </label>
                <input
                  type="number"
                  min="100"
                  max="4000"
                  value={settings.maxHeight}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    maxHeight: parseInt(e.target.value) || 1080 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={resizeImage}
                disabled={!originalImage || isProcessing}
                className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  originalImage && !isProcessing
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <ImageIcon className="h-4 w-4" />
                <span>{isProcessing ? 'Processing...' : 'Resize Image'}</span>
              </button>
            </div>
          </div>

          {/* Upload and Preview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload Area */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
                <h3 className="text-lg font-semibold text-gray-800">Upload Image</h3>
                <button
                  onClick={handleClear}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                  title="Clear all"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
              
              <div className="p-6">
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Drop your image here or click to browse
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports JPEG, PNG, WebP, and other image formats
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* Image Preview and Results */}
            {originalImageUrl && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Original Image */}
                <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                  <div className="p-4 bg-gray-50 border-b rounded-t-lg">
                    <h4 className="font-semibold text-gray-800">Original</h4>
                    <p className="text-sm text-gray-600">{formatFileSize(originalSize)}</p>
                  </div>
                  <div className="p-4">
                    <img
                      src={originalImageUrl}
                      alt="Original"
                      className="w-full h-48 object-contain bg-gray-50 rounded-lg"
                    />
                  </div>
                </div>

                {/* Resized Image */}
                <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                  <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
                    <div>
                      <h4 className="font-semibold text-gray-800">Resized</h4>
                      {resizedSize > 0 && (
                        <p className="text-sm text-gray-600">
                          {formatFileSize(resizedSize)} ({compressionRatio}% smaller)
                        </p>
                      )}
                    </div>
                    {resizedImageUrl && (
                      <button
                        onClick={downloadResizedImage}
                        className="flex items-center space-x-2 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                      </button>
                    )}
                  </div>
                  <div className="p-4">
                    {resizedImageUrl ? (
                      <img
                        src={resizedImageUrl}
                        alt="Resized"
                        className="w-full h-48 object-contain bg-gray-50 rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                        <p className="text-gray-500">Click "Resize Image" to process</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <InfoSection 
          title="Image Resizing Tips"
          items={[
            {
              label: "Target Size",
              description: "The tool will automatically adjust quality to reach your target file size"
            },
            {
              label: "Quality",
              description: "Higher quality preserves more detail but results in larger files"
            },
            {
              label: "Format",
              description: "JPEG is best for photos, PNG for graphics with transparency, WebP for modern browsers"
            },
            {
              label: "Dimensions",
              description: "Images will be resized proportionally to fit within your max width/height"
            },
            {
              label: "Settings",
              description: "Your preferences are automatically saved for next time"
            }
          ]}
        />

        {/* Hidden canvas for image processing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default ImageResizer;