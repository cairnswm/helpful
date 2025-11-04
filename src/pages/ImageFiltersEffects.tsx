import React, { useState, useRef } from 'react';
import { Upload, Download, RotateCcw, Palette, Sliders } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import InfoSection from '../components/InfoSection';

interface FilterSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  blur: number;
  grayscale: number;
  sepia: number;
  invert: number;
}

const ImageFiltersEffects: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string>('');
  const [processedImage, setProcessedImage] = useState<string>('');
  const [filters, setFilters] = useState<FilterSettings>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    hue: 0,
    blur: 0,
    grayscale: 0,
    sepia: 0,
    invert: 0
  });
  const [fileName, setFileName] = useState('filtered-image');
  
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
      setFileName(file.name.split('.')[0] + '-filtered');
      setProcessedImage('');
    };
    reader.readAsDataURL(file);
  };

  const applyFilters = () => {
    if (!originalImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Build filter string
      const filterString = [
        `brightness(${filters.brightness}%)`,
        `contrast(${filters.contrast}%)`,
        `saturate(${filters.saturation}%)`,
        `hue-rotate(${filters.hue}deg)`,
        `blur(${filters.blur}px)`,
        `grayscale(${filters.grayscale}%)`,
        `sepia(${filters.sepia}%)`,
        `invert(${filters.invert}%)`
      ].join(' ');
      
      ctx.filter = filterString;
      ctx.drawImage(img, 0, 0);
      
      const processedDataUrl = canvas.toDataURL('image/png');
      setProcessedImage(processedDataUrl);
    };
    img.src = originalImage;
  };

  React.useEffect(() => {
    if (originalImage) {
      applyFilters();
    }
  }, [originalImage, filters]);

  const updateFilter = (key: keyof FilterSettings, value: number) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      hue: 0,
      blur: 0,
      grayscale: 0,
      sepia: 0,
      invert: 0
    });
  };

  const applyPreset = (preset: string) => {
    switch (preset) {
      case 'vintage':
        setFilters({
          brightness: 110,
          contrast: 120,
          saturation: 80,
          hue: 10,
          blur: 0,
          grayscale: 0,
          sepia: 30,
          invert: 0
        });
        break;
      case 'bw':
        setFilters({
          brightness: 100,
          contrast: 110,
          saturation: 0,
          hue: 0,
          blur: 0,
          grayscale: 100,
          sepia: 0,
          invert: 0
        });
        break;
      case 'dramatic':
        setFilters({
          brightness: 90,
          contrast: 150,
          saturation: 120,
          hue: 0,
          blur: 0,
          grayscale: 0,
          sepia: 0,
          invert: 0
        });
        break;
      case 'soft':
        setFilters({
          brightness: 110,
          contrast: 90,
          saturation: 90,
          hue: 0,
          blur: 1,
          grayscale: 0,
          sepia: 0,
          invert: 0
        });
        break;
      default:
        resetFilters();
    }
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
    resetFilters();
    setFileName('filtered-image');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const filterControls = [
    { key: 'brightness', label: 'Brightness', min: 0, max: 200, unit: '%' },
    { key: 'contrast', label: 'Contrast', min: 0, max: 200, unit: '%' },
    { key: 'saturation', label: 'Saturation', min: 0, max: 200, unit: '%' },
    { key: 'hue', label: 'Hue', min: -180, max: 180, unit: '°' },
    { key: 'blur', label: 'Blur', min: 0, max: 10, unit: 'px' },
    { key: 'grayscale', label: 'Grayscale', min: 0, max: 100, unit: '%' },
    { key: 'sepia', label: 'Sepia', min: 0, max: 100, unit: '%' },
    { key: 'invert', label: 'Invert', min: 0, max: 100, unit: '%' }
  ];

  const presets = [
    { name: 'Original', value: 'original' },
    { name: 'Vintage', value: 'vintage' },
    { name: 'Black & White', value: 'bw' },
    { name: 'Dramatic', value: 'dramatic' },
    { name: 'Soft', value: 'soft' }
  ];

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <PageHeader 
          title="Image Filters & Effects"
          description="Apply various filters and effects to images including brightness, contrast, blur, and color adjustments."
        />

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-6">
          <div className="p-4 bg-gray-50 border-b rounded-t-lg">
            <div className="flex items-center space-x-2">
              <Palette className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-800">Filter Controls</h3>
            </div>
          </div>
          
          <div className="p-6">
            {/* File Name and Presets */}
            <div className="flex items-center justify-between mb-6">
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quick Presets
                </label>
                <div className="flex space-x-2">
                  {presets.map(preset => (
                    <button
                      key={preset.value}
                      onClick={() => applyPreset(preset.value)}
                      disabled={!originalImage}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        originalImage
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Filter Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filterControls.map(control => (
                <div key={control.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {control.label} ({filters[control.key as keyof FilterSettings]}{control.unit})
                  </label>
                  <input
                    type="range"
                    min={control.min}
                    max={control.max}
                    value={filters[control.key as keyof FilterSettings]}
                    onChange={(e) => updateFilter(control.key as keyof FilterSettings, parseInt(e.target.value))}
                    disabled={!originalImage}
                    className="w-full"
                  />
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end mt-6 pt-6 border-t border-gray-200 space-x-2">
              <button
                onClick={resetFilters}
                disabled={!originalImage}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  originalImage
                    ? 'bg-gray-600 text-white hover:bg-gray-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Sliders className="h-4 w-4" />
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
                    Upload an image to apply filters
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

          {/* Filtered Result */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-800">Filtered Image</h3>
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
                    alt="Filtered"
                    className="w-full h-auto max-h-96 object-contain bg-gray-50 rounded-lg border"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <Palette className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Filtered image will appear here</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hidden canvas for processing */}
        <canvas ref={canvasRef} className="hidden" />

        <InfoSection 
          title="Image Filter Features"
          items={[
            {
              label: "Color Adjustments",
              description: "Brightness, contrast, saturation, and hue controls"
            },
            {
              label: "Visual Effects",
              description: "Blur, grayscale, sepia, and invert filters"
            },
            {
              label: "Real-time Preview",
              description: "See filter effects applied instantly as you adjust settings"
            },
            {
              label: "Export Options",
              description: "Download filtered images in multiple formats"
            }
          ]}
          useCases="Photo enhancement, artistic effects, social media content, image processing"
        />
      </div>
    </div>
  );
};

export default ImageFiltersEffects;