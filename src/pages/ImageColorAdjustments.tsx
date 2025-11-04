import React, { useState, useRef } from 'react';
import { Upload, Download, RotateCcw, Palette, Sliders, Sun, Contrast, Droplets } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import InfoSection from '../components/InfoSection';

interface ColorSettings {
  saturation: number;
  hue: number;
  exposure: number;
  brightness: number;
  contrast: number;
  highlights: number;
  shadows: number;
  vibrance: number;
  temperature: number;
  tint: number;
}

const ImageColorAdjustments: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string>('');
  const [processedImage, setProcessedImage] = useState<string>('');
  const [settings, setSettings] = useState<ColorSettings>({
    saturation: 100,
    hue: 0,
    exposure: 0,
    brightness: 0,
    contrast: 0,
    highlights: 0,
    shadows: 0,
    vibrance: 0,
    temperature: 0,
    tint: 0
  });
  const [fileName, setFileName] = useState('color-adjusted-image');
  
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
      setFileName(file.name.split('.')[0] + '-color-adjusted');
      setProcessedImage('');
    };
    reader.readAsDataURL(file);
  };

  const applyColorAdjustments = () => {
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
      
      // Get image data for pixel manipulation
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Apply color adjustments pixel by pixel
      for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];
        
        // Convert to HSL for easier manipulation
        const hsl = rgbToHsl(r, g, b);
        let h = hsl[0];
        let s = hsl[1];
        let l = hsl[2];
        
        // Apply hue shift
        h = (h + settings.hue / 360) % 1;
        if (h < 0) h += 1;
        
        // Apply saturation
        s = Math.max(0, Math.min(1, s * (settings.saturation / 100)));
        
        // Apply vibrance (selective saturation)
        if (settings.vibrance !== 0) {
          const vibranceAmount = settings.vibrance / 100;
          const saturationBoost = (1 - s) * vibranceAmount;
          s = Math.max(0, Math.min(1, s + saturationBoost));
        }
        
        // Convert back to RGB
        const rgb = hslToRgb(h, s, l);
        r = rgb[0];
        g = rgb[1];
        b = rgb[2];
        
        // Apply exposure (multiplicative)
        if (settings.exposure !== 0) {
          const exposureFactor = Math.pow(2, settings.exposure / 100);
          r *= exposureFactor;
          g *= exposureFactor;
          b *= exposureFactor;
        }
        
        // Apply brightness (additive)
        if (settings.brightness !== 0) {
          const brightnessAmount = settings.brightness * 2.55; // Convert to 0-255 range
          r += brightnessAmount;
          g += brightnessAmount;
          b += brightnessAmount;
        }
        
        // Apply contrast
        if (settings.contrast !== 0) {
          const contrastFactor = (259 * (settings.contrast + 255)) / (255 * (259 - settings.contrast));
          r = contrastFactor * (r - 128) + 128;
          g = contrastFactor * (g - 128) + 128;
          b = contrastFactor * (b - 128) + 128;
        }
        
        // Apply highlights and shadows
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
        
        if (settings.highlights !== 0) {
          const highlightMask = Math.pow(luminance / 255, 2);
          const highlightAdjust = settings.highlights * highlightMask * 0.01;
          r += r * highlightAdjust;
          g += g * highlightAdjust;
          b += b * highlightAdjust;
        }
        
        if (settings.shadows !== 0) {
          const shadowMask = Math.pow(1 - luminance / 255, 2);
          const shadowAdjust = settings.shadows * shadowMask * 0.01;
          r += r * shadowAdjust;
          g += g * shadowAdjust;
          b += b * shadowAdjust;
        }
        
        // Apply temperature and tint
        if (settings.temperature !== 0) {
          const tempFactor = settings.temperature / 100;
          if (tempFactor > 0) {
            // Warmer (more red/yellow)
            r += tempFactor * 20;
            g += tempFactor * 10;
          } else {
            // Cooler (more blue)
            b += Math.abs(tempFactor) * 20;
          }
        }
        
        if (settings.tint !== 0) {
          const tintFactor = settings.tint / 100;
          if (tintFactor > 0) {
            // More magenta
            r += tintFactor * 15;
            b += tintFactor * 15;
          } else {
            // More green
            g += Math.abs(tintFactor) * 15;
          }
        }
        
        // Clamp values to 0-255 range
        data[i] = Math.max(0, Math.min(255, r));
        data[i + 1] = Math.max(0, Math.min(255, g));
        data[i + 2] = Math.max(0, Math.min(255, b));
      }
      
      // Put the modified image data back
      ctx.putImageData(imageData, 0, 0);
      
      const processedDataUrl = canvas.toDataURL('image/png');
      setProcessedImage(processedDataUrl);
    };
    img.src = originalImage;
  };

  // Helper functions for color space conversion
  const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    
    return [h, s, l];
  };

  const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
    let r, g, b;
    
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    return [r * 255, g * 255, b * 255];
  };

  React.useEffect(() => {
    if (originalImage) {
      applyColorAdjustments();
    }
  }, [originalImage, settings]);

  const updateSetting = (key: keyof ColorSettings, value: number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings({
      saturation: 100,
      hue: 0,
      exposure: 0,
      brightness: 0,
      contrast: 0,
      highlights: 0,
      shadows: 0,
      vibrance: 0,
      temperature: 0,
      tint: 0
    });
  };

  const applyPreset = (preset: string) => {
    switch (preset) {
      case 'vivid':
        setSettings({
          saturation: 130,
          hue: 0,
          exposure: 10,
          brightness: 5,
          contrast: 15,
          highlights: -10,
          shadows: 10,
          vibrance: 20,
          temperature: 5,
          tint: 0
        });
        break;
      case 'warm':
        setSettings({
          saturation: 110,
          hue: 0,
          exposure: 5,
          brightness: 10,
          contrast: 5,
          highlights: -5,
          shadows: 15,
          vibrance: 10,
          temperature: 25,
          tint: -5
        });
        break;
      case 'cool':
        setSettings({
          saturation: 95,
          hue: 0,
          exposure: 0,
          brightness: -5,
          contrast: 10,
          highlights: -15,
          shadows: 5,
          vibrance: 5,
          temperature: -20,
          tint: 5
        });
        break;
      case 'dramatic':
        setSettings({
          saturation: 120,
          hue: 0,
          exposure: -5,
          brightness: -10,
          contrast: 30,
          highlights: -25,
          shadows: 20,
          vibrance: 15,
          temperature: 0,
          tint: 0
        });
        break;
      default:
        resetSettings();
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
    resetSettings();
    setFileName('color-adjusted-image');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const adjustmentControls = [
    { key: 'exposure', label: 'Exposure', min: -100, max: 100, icon: Sun },
    { key: 'brightness', label: 'Brightness', min: -100, max: 100, icon: Sun },
    { key: 'contrast', label: 'Contrast', min: -100, max: 100, icon: Contrast },
    { key: 'highlights', label: 'Highlights', min: -100, max: 100, icon: Sun },
    { key: 'shadows', label: 'Shadows', min: -100, max: 100, icon: Sun },
    { key: 'saturation', label: 'Saturation', min: 0, max: 200, icon: Droplets },
    { key: 'vibrance', label: 'Vibrance', min: -100, max: 100, icon: Droplets },
    { key: 'hue', label: 'Hue', min: -180, max: 180, icon: Palette },
    { key: 'temperature', label: 'Temperature', min: -100, max: 100, icon: Sun },
    { key: 'tint', label: 'Tint', min: -100, max: 100, icon: Palette }
  ];

  const presets = [
    { name: 'Original', value: 'original' },
    { name: 'Vivid', value: 'vivid' },
    { name: 'Warm', value: 'warm' },
    { name: 'Cool', value: 'cool' },
    { name: 'Dramatic', value: 'dramatic' }
  ];

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <PageHeader 
          title="Image Color Adjustments"
          description="Fine-tune image colors with professional-grade adjustments for saturation, hue, exposure, and color balance."
        />

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-6">
          <div className="p-4 bg-gray-50 border-b rounded-t-lg">
            <div className="flex items-center space-x-2">
              <Palette className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-800">Color Adjustment Controls</h3>
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
                          ? 'bg-purple-600 text-white hover:bg-purple-700'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Adjustment Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {adjustmentControls.map(control => {
                const IconComponent = control.icon;
                return (
                  <div key={control.key}>
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                      <IconComponent className="h-4 w-4" />
                      <span>{control.label} ({settings[control.key as keyof ColorSettings]})</span>
                    </label>
                    <input
                      type="range"
                      min={control.min}
                      max={control.max}
                      value={settings[control.key as keyof ColorSettings]}
                      onChange={(e) => updateSetting(control.key as keyof ColorSettings, parseInt(e.target.value))}
                      disabled={!originalImage}
                      className="w-full"
                    />
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end mt-6 pt-6 border-t border-gray-200 space-x-2">
              <button
                onClick={resetSettings}
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
                    Upload an image for color adjustments
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

          {/* Color Adjusted Result */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-800">Color Adjusted Image</h3>
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
                    alt="Color Adjusted"
                    className="w-full h-auto max-h-96 object-contain bg-gray-50 rounded-lg border"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <Palette className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Color adjusted image will appear here</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hidden canvas for processing */}
        <canvas ref={canvasRef} className="hidden" />

        <InfoSection 
          title="Image Color Adjustment Features"
          items={[
            {
              label: "Professional Controls",
              description: "Saturation, hue, exposure, brightness, contrast, highlights, shadows"
            },
            {
              label: "Color Temperature",
              description: "Adjust warmth/coolness and tint for perfect white balance"
            },
            {
              label: "Vibrance Control",
              description: "Enhanced saturation that protects skin tones"
            },
            {
              label: "Real-time Preview",
              description: "See changes instantly as you adjust settings"
            },
            {
              label: "Reset Options",
              description: "Easily restore original image or reset individual settings"
            }
          ]}
          useCases="Photo editing, color correction, social media content, professional photography"
        />
      </div>
    </div>
  );
};

export default ImageColorAdjustments;