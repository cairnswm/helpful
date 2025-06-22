import React, { useState, useRef } from 'react';
import { Upload, Download, RotateCcw, Type, Image as ImageIcon, Move } from 'lucide-react';

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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Watermark Overlay</h1>
          <p className="text-gray-600">
            Add text or image watermarks to protect your images with customizable positioning and styling.
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-6">
          <div className="p-4 bg-gray-50 border-b rounded-t-lg">
            <div className="flex items-center space-x-2">
              <Type className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">Watermark Settings</h3>
            </div>
          </div>
          
          <div className="p-6">
            {/* Watermark Type and File Name */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Watermark Type
                </label>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setWatermarkType('text')}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      watermarkType === 'text'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Type className="h-4 w-4" />
                    <span>Text</span>
                  </button>
                  <button
                    onClick={() => setWatermarkType('image')}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      watermarkType === 'image'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <ImageIcon className="h-4 w-4" />
                    <span>Image</span>
                  </button>
                </div>
              </div>
              
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
              
              {watermarkType === 'image' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Watermark Image
                  </label>
                  <label className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                    <Upload className="h-4 w-4" />
                    <span className="text-sm">Upload Image</span>
                    <input
                      ref={watermarkInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleWatermarkUpload}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Watermark Text
                  </label>
                  <input
                    type="text"
                    value={settings.text}
                    onChange={(e) => updateSetting('text', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Font Size ({settings.fontSize}px)
                  </label>
                  <input
                    type="range"
                    min="12"
                    max="120"
                    value={settings.fontSize}
                    onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Text Color
                  </label>
                  <input
                    type="color"
                    value={settings.color}
                    onChange={(e) => updateSetting('color', e.target.value)}
                    className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opacity ({settings.opacity}%)
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={settings.opacity}
                    onChange={(e) => updateSetting('opacity', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {/* Position and Offset Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position
                </label>
                <select
                  value={settings.position}
                  onChange={(e) => updateSetting('position', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {positions.map(pos => (
                    <option key={pos.value} value={pos.value}>{pos.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  X Offset ({settings.offsetX}px)
                </label>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={settings.offsetX}
                  onChange={(e) => updateSetting('offsetX', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Y Offset ({settings.offsetY}px)
                </label>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={settings.offsetY}
                  onChange={(e) => updateSetting('offsetY', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rotation ({settings.rotation}°)
                </label>
                <input
                  type="range"
                  min="-45"
                  max="45"
                  value={settings.rotation}
                  onChange={(e) => updateSetting('rotation', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end mt-6 pt-6 border-t border-gray-200">
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
                    Upload an image to add watermark
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

          {/* Watermarked Result */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-800">Watermarked Image</h3>
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
                    alt="Watermarked"
                    className="w-full h-auto max-h-96 object-contain bg-gray-50 rounded-lg border"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <Move className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Watermarked image will appear here</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hidden canvas for processing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default WatermarkOverlay;