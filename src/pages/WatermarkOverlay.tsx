import React, { useState, useRef } from 'react';
import { Upload, Download, RotateCcw, Type, Image as ImageIcon, Move, Palette } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import InfoSection from '../components/InfoSection';

interface WatermarkSettings {
  text: string;
  fontSize: number;
  color: string;
  opacity: number;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  offsetX: number;
  offsetY: number;
  rotation: number;
}

const WatermarkOverlay: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string>('');
  const [watermarkImage, setWatermarkImage] = useState<string>('');
  const [processedImage, setProcessedImage] = useState<string>('');
  const [watermarkType, setWatermarkType] = useState<'text' | 'image'>('text');
  const [settings, setSettings] = useState<WatermarkSettings>({
    text: 'WATERMARK',
    fontSize: 48,
    color: '#ffffff',
    opacity: 50,
    position: 'bottom-right',
    offsetX: 20,
    offsetY: 20,
    rotation: 0
  });
  const [fileName, setFileName] = useState('watermarked-image');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const watermarkInputRef = useRef<HTMLInputElement>(null);

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
      setFileName(file.name.split('.')[0] + '-watermarked');
      setProcessedImage('');
    };
    reader.readAsDataURL(file);
  };

  const handleWatermarkUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setWatermarkImage(result);
    };
    reader.readAsDataURL(file);
  };

  const getWatermarkPosition = (canvasWidth: number, canvasHeight: number, watermarkWidth: number, watermarkHeight: number) => {
    let x = 0, y = 0;
    
    switch (settings.position) {
      case 'top-left':
        x = settings.offsetX;
        y = settings.offsetY;
        break;
      case 'top-right':
        x = canvasWidth - watermarkWidth - settings.offsetX;
        y = settings.offsetY;
        break;
      case 'bottom-left':
        x = settings.offsetX;
        y = canvasHeight - watermarkHeight - settings.offsetY;
        break;
      case 'bottom-right':
        x = canvasWidth - watermarkWidth - settings.offsetX;
        y = canvasHeight - watermarkHeight - settings.offsetY;
        break;
      case 'center':
        x = (canvasWidth - watermarkWidth) / 2 + settings.offsetX;
        y = (canvasHeight - watermarkHeight) / 2 + settings.offsetY;
        break;
    }
    
    return { x, y };
  };

  const applyWatermark = () => {
    if (!originalImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw original image
      ctx.drawImage(img, 0, 0);
      
      // Set watermark opacity
      ctx.globalAlpha = settings.opacity / 100;
      
      if (watermarkType === 'text') {
        // Apply text watermark
        ctx.font = `${settings.fontSize}px Arial`;
        ctx.fillStyle = settings.color;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        
        // Measure text
        const textMetrics = ctx.measureText(settings.text);
        const textWidth = textMetrics.width;
        const textHeight = settings.fontSize;
        
        const position = getWatermarkPosition(canvas.width, canvas.height, textWidth, textHeight);
        
        // Save context for rotation
        ctx.save();
        ctx.translate(position.x + textWidth / 2, position.y + textHeight / 2);
        ctx.rotate((settings.rotation * Math.PI) / 180);
        ctx.fillText(settings.text, -textWidth / 2, -textHeight / 2);
        ctx.restore();
        
      } else if (watermarkType === 'image' && watermarkImage) {
        // Apply image watermark
        const watermarkImg = new Image();
        watermarkImg.onload = () => {
          const maxSize = Math.min(canvas.width, canvas.height) * 0.3;
          const scale = Math.min(maxSize / watermarkImg.width, maxSize / watermarkImg.height);
          const watermarkWidth = watermarkImg.width * scale;
          const watermarkHeight = watermarkImg.height * scale;
          
          const position = getWatermarkPosition(canvas.width, canvas.height, watermarkWidth, watermarkHeight);
          
          // Save context for rotation
          ctx.save();
          ctx.translate(position.x + watermarkWidth / 2, position.y + watermarkHeight / 2);
          ctx.rotate((settings.rotation * Math.PI) / 180);
          ctx.drawImage(watermarkImg, -watermarkWidth / 2, -watermarkHeight / 2, watermarkWidth, watermarkHeight);
          ctx.restore();
          
          // Reset alpha and create final image
          ctx.globalAlpha = 1;
          const processedDataUrl = canvas.toDataURL('image/png');
          setProcessedImage(processedDataUrl);
        };
        watermarkImg.src = watermarkImage;
        return;
      }
      
      // Reset alpha and create final image
      ctx.globalAlpha = 1;
      const processedDataUrl = canvas.toDataURL('image/png');
      setProcessedImage(processedDataUrl);
    };
    img.src = originalImage;
  };

  React.useEffect(() => {
    if (originalImage && (watermarkType === 'text' || watermarkImage)) {
      applyWatermark();
    }
  }, [originalImage, watermarkImage, watermarkType, settings]);

  const updateSetting = (key: keyof WatermarkSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
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
    setWatermarkImage('');
    setProcessedImage('');
    setFileName('watermarked-image');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (watermarkInputRef.current) {
      watermarkInputRef.current.value = '';
    }
  };

  const positions = [
    { label: 'Top Left', value: 'top-left' },
    { label: 'Top Right', value: 'top-right' },
    { label: 'Bottom Left', value: 'bottom-left' },
    { label: 'Bottom Right', value: 'bottom-right' },
    { label: 'Center', value: 'center' }
  ];

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <PageHeader 
          title="Watermark Overlay"
          description="Add text or image watermarks to protect your images with customizable positioning and styling."
        />

        {/* Controls */}
        <section className="bg-white rounded-lg shadow-lg border border-gray-200 mb-6" aria-labelledby="settings-heading">
          <div className="p-4 bg-gray-50 border-b rounded-t-lg">
            <div className="flex items-center space-x-2">
              <Type className="h-5 w-5 text-blue-600" aria-hidden="true" />
              <h2 id="settings-heading" className="text-lg font-semibold text-gray-800">Watermark Settings</h2>
            </div>
          </div>
          
          <div className="p-6">
            {/* Watermark Type and File Name */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <span className="block text-sm font-medium text-gray-700 mb-2">
                  Watermark Type
                </span>
                <div className="flex bg-gray-100 rounded-lg p-1" role="group" aria-label="Watermark type selection">
                  <button
                    onClick={() => setWatermarkType('text')}
                    aria-pressed={watermarkType === 'text'}
                    aria-label="Use text watermark"
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      watermarkType === 'text'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Type className="h-4 w-4" aria-hidden="true" />
                    <span>Text</span>
                  </button>
                  <button
                    onClick={() => setWatermarkType('image')}
                    aria-pressed={watermarkType === 'image'}
                    aria-label="Use image watermark"
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      watermarkType === 'image'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <ImageIcon className="h-4 w-4" aria-hidden="true" />
                    <span>Image</span>
                  </button>
                </div>
              </div>
              
              <div>
                <label htmlFor="filename-input" className="block text-sm font-medium text-gray-700 mb-2">
                  File Name
                </label>
                <input
                  id="filename-input"
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  aria-label="Output filename for watermarked image"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {watermarkType === 'image' && (
                <div>
                  <span className="block text-sm font-medium text-gray-700 mb-2">
                    Watermark Image
                  </span>
                  <label htmlFor="watermark-upload" className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                    <Upload className="h-4 w-4" aria-hidden="true" />
                    <span className="text-sm">Upload Image</span>
                    <input
                      id="watermark-upload"
                      ref={watermarkInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleWatermarkUpload}
                      aria-label="Upload watermark image file"
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Text Settings */}
            {watermarkType === 'text' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div>
                  <label htmlFor="watermark-text-input" className="block text-sm font-medium text-gray-700 mb-2">
                    Watermark Text
                  </label>
                  <input
                    id="watermark-text-input"
                    type="text"
                    value={settings.text}
                    onChange={(e) => updateSetting('text', e.target.value)}
                    aria-label="Watermark text content"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="font-size-slider" className="block text-sm font-medium text-gray-700 mb-2">
                    Font Size ({settings.fontSize}px)
                  </label>
                  <input
                    id="font-size-slider"
                    type="range"
                    min="12"
                    max="120"
                    value={settings.fontSize}
                    onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
                    aria-valuemin={12}
                    aria-valuemax={120}
                    aria-valuenow={settings.fontSize}
                    aria-label={`Font size slider, current value ${settings.fontSize} pixels`}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label htmlFor="text-color-input" className="block text-sm font-medium text-gray-700 mb-2">
                    Text Color
                  </label>
                  <input
                    id="text-color-input"
                    type="color"
                    value={settings.color}
                    onChange={(e) => updateSetting('color', e.target.value)}
                    aria-label="Watermark text color"
                    className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>
                
                <div>
                  <label htmlFor="opacity-slider" className="block text-sm font-medium text-gray-700 mb-2">
                    Opacity ({settings.opacity}%)
                  </label>
                  <input
                    id="opacity-slider"
                    type="range"
                    min="10"
                    max="100"
                    value={settings.opacity}
                    onChange={(e) => updateSetting('opacity', parseInt(e.target.value))}
                    aria-valuemin={10}
                    aria-valuemax={100}
                    aria-valuenow={settings.opacity}
                    aria-label={`Opacity slider, current value ${settings.opacity} percent`}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {/* Position and Offset Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label htmlFor="position-select" className="block text-sm font-medium text-gray-700 mb-2">
                  Position
                </label>
                <select
                  id="position-select"
                  value={settings.position}
                  onChange={(e) => updateSetting('position', e.target.value)}
                  aria-label="Watermark position on image"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {positions.map(pos => (
                    <option key={pos.value} value={pos.value}>{pos.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="offset-x-slider" className="block text-sm font-medium text-gray-700 mb-2">
                  X Offset ({settings.offsetX}px)
                </label>
                <input
                  id="offset-x-slider"
                  type="range"
                  min="-100"
                  max="100"
                  value={settings.offsetX}
                  onChange={(e) => updateSetting('offsetX', parseInt(e.target.value))}
                  aria-valuemin={-100}
                  aria-valuemax={100}
                  aria-valuenow={settings.offsetX}
                  aria-label={`Horizontal offset slider, current value ${settings.offsetX} pixels`}
                  className="w-full"
                />
              </div>
              
              <div>
                <label htmlFor="offset-y-slider" className="block text-sm font-medium text-gray-700 mb-2">
                  Y Offset ({settings.offsetY}px)
                </label>
                <input
                  id="offset-y-slider"
                  type="range"
                  min="-100"
                  max="100"
                  value={settings.offsetY}
                  onChange={(e) => updateSetting('offsetY', parseInt(e.target.value))}
                  aria-valuemin={-100}
                  aria-valuemax={100}
                  aria-valuenow={settings.offsetY}
                  aria-label={`Vertical offset slider, current value ${settings.offsetY} pixels`}
                  className="w-full"
                />
              </div>
              
              <div>
                <label htmlFor="rotation-slider" className="block text-sm font-medium text-gray-700 mb-2">
                  Rotation ({settings.rotation}°)
                </label>
                <input
                  id="rotation-slider"
                  type="range"
                  min="-45"
                  max="45"
                  value={settings.rotation}
                  onChange={(e) => updateSetting('rotation', parseInt(e.target.value))}
                  aria-valuemin={-45}
                  aria-valuemax={45}
                  aria-valuenow={settings.rotation}
                  aria-label={`Rotation slider, current value ${settings.rotation} degrees`}
                  className="w-full"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={handleClear}
                aria-label="Clear all images and reset settings"
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                title="Clear all"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload and Original Image */}
          <section className="bg-white rounded-lg shadow-lg border border-gray-200" aria-labelledby="original-heading">
            <div className="p-4 bg-gray-50 border-b rounded-t-lg">
              <h2 id="original-heading" className="text-lg font-semibold text-gray-800">Original Image</h2>
            </div>
            
            <div className="p-6">
              {!originalImage ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                >
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" aria-hidden="true" />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Upload an image to add watermark
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports JPEG, PNG, WebP, and other image formats
                  </p>
                  <label htmlFor="original-image-upload" className="sr-only">Upload original image file</label>
                  <input
                    id="original-image-upload"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    aria-label="Upload original image to add watermark"
                    className="hidden"
                  />
                </div>
              ) : (
                <div>
                  <img
                    src={originalImage}
                    alt={`Original image: ${fileName}`}
                    className="w-full h-auto max-h-96 object-contain bg-gray-50 rounded-lg"
                  />
                </div>
              )}
            </div>
          </section>

          {/* Watermarked Result */}
          <section className="bg-white rounded-lg shadow-lg border border-gray-200" aria-labelledby="watermarked-heading">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
              <h2 id="watermarked-heading" className="text-lg font-semibold text-gray-800">Watermarked Image</h2>
              {processedImage && (
                <button
                  onClick={downloadProcessedImage}
                  aria-label="Download watermarked image"
                  className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  <span>Download</span>
                </button>
              )}
            </div>
            
            <div className="p-6">
              {processedImage ? (
                <div>
                  <img
                    src={processedImage}
                    alt={`Watermarked image: ${fileName}`}
                    className="w-full h-auto max-h-96 object-contain bg-gray-50 rounded-lg border"
                  />
                  <div role="status" aria-live="polite" className="sr-only">
                    Watermark applied successfully
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <Move className="h-12 w-12 text-gray-400 mx-auto mb-4" aria-hidden="true" />
                    <p className="text-gray-500">Watermarked image will appear here</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Hidden canvas for processing */}
        <canvas ref={canvasRef} className="hidden" />

        <InfoSection 
          title="Watermark Features"
          items={[
            {
              label: "Text Watermarks",
              description: "Add custom text with font size, color, and opacity controls"
            },
            {
              label: "Image Watermarks",
              description: "Upload and overlay image watermarks with transparency"
            },
            {
              label: "Flexible Positioning",
              description: "Place watermarks in corners, center, or custom positions"
            },
            {
              label: "Styling Options",
              description: "Adjust opacity, rotation, and scaling to fit your needs"
            }
          ]}
          useCases="Copyright protection, brand identification, photo attribution, content security"
        />
      </div>
    </div>
  );
};

export default WatermarkOverlay;