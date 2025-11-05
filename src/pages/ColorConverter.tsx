import React, { useState, useCallback } from 'react';
import InfoSection from '../components/InfoSection';
import PageHeader from '../components/PageHeader';
import { Copy, Check, RotateCcw, Palette, Eye } from 'lucide-react';

interface ColorFormats {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  hsv: { h: number; s: number; v: number };
  cmyk: { c: number; m: number; y: number; k: number };
  lab: { l: number; a: number; b: number };
  xyz: { x: number; y: number; z: number };
}

interface ColorInput {
  type: 'hex' | 'rgb' | 'hsl' | 'hsv' | 'cmyk' | 'lab' | 'xyz';
  value: string;
}

const ColorConverter: React.FC = () => {
  const [input, setInput] = useState<ColorInput>({ type: 'hex', value: '#3b82f6' });
  const [formats, setFormats] = useState<ColorFormats | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState('');

  const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) throw new Error('Invalid hex color');
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    };
  };

  const rgbToHex = (r: number, g: number, b: number): string => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
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

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  const rgbToHsv = (r: number, g: number, b: number): { h: number; s: number; v: number } => {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    const v = max;
    const d = max - min;
    const s = max === 0 ? 0 : d / max;

    if (max !== min) {
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      v: Math.round(v * 100)
    };
  };

  const rgbToCmyk = (r: number, g: number, b: number): { c: number; m: number; y: number; k: number } => {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const k = 1 - Math.max(r, Math.max(g, b));
    const c = k === 1 ? 0 : (1 - r - k) / (1 - k);
    const m = k === 1 ? 0 : (1 - g - k) / (1 - k);
    const y = k === 1 ? 0 : (1 - b - k) / (1 - k);

    return {
      c: Math.round(c * 100),
      m: Math.round(m * 100),
      y: Math.round(y * 100),
      k: Math.round(k * 100)
    };
  };

  const rgbToXyz = (r: number, g: number, b: number): { x: number; y: number; z: number } => {
    // Convert to linear RGB
    r = r / 255;
    g = g / 255;
    b = b / 255;

    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

    // Observer = 2°, Illuminant = D65
    const x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
    const y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750;
    const z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041;

    return {
      x: Math.round(x * 100 * 100) / 100,
      y: Math.round(y * 100 * 100) / 100,
      z: Math.round(z * 100 * 100) / 100
    };
  };

  const xyzToLab = (x: number, y: number, z: number): { l: number; a: number; b: number } => {
    // Reference white D65
    const xn = 95.047;
    const yn = 100.000;
    const zn = 108.883;

    x = x / xn;
    y = y / yn;
    z = z / zn;

    const fx = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x + 16/116);
    const fy = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y + 16/116);
    const fz = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z + 16/116);

    const l = 116 * fy - 16;
    const a = 500 * (fx - fy);
    const b = 200 * (fy - fz);

    return {
      l: Math.round(l * 100) / 100,
      a: Math.round(a * 100) / 100,
      b: Math.round(b * 100) / 100
    };
  };

  const parseColorInput = (input: ColorInput): { r: number; g: number; b: number } => {
    const value = input.value.trim();
    
    switch (input.type) {
      case 'hex':
        return hexToRgb(value);
      
      case 'rgb': {
        const match = value.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)|(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
        if (!match) throw new Error('Invalid RGB format. Use: rgb(255, 255, 255) or 255, 255, 255');
        const r = parseInt(match[1] || match[4]);
        const g = parseInt(match[2] || match[5]);
        const b = parseInt(match[3] || match[6]);
        if (r > 255 || g > 255 || b > 255) throw new Error('RGB values must be 0-255');
        return { r, g, b };
      }
      
      case 'hsl': {
        const match = value.match(/hsl\s*\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*\)|(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?/);
        if (!match) throw new Error('Invalid HSL format. Use: hsl(360, 100%, 50%) or 360, 100, 50');
        const h = parseInt(match[1] || match[4]) / 360;
        const s = parseInt(match[2] || match[5]) / 100;
        const l = parseInt(match[3] || match[6]) / 100;
        
        const hue2rgb = (p: number, q: number, t: number) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1/6) return p + (q - p) * 6 * t;
          if (t < 1/2) return q;
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
        };

        let r, g, b;
        if (s === 0) {
          r = g = b = l;
        } else {
          const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
          const p = 2 * l - q;
          r = hue2rgb(p, q, h + 1/3);
          g = hue2rgb(p, q, h);
          b = hue2rgb(p, q, h - 1/3);
        }

        return {
          r: Math.round(r * 255),
          g: Math.round(g * 255),
          b: Math.round(b * 255)
        };
      }
      
      case 'hsv': {
        const match = value.match(/hsv\s*\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*\)|(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?/);
        if (!match) throw new Error('Invalid HSV format. Use: hsv(360, 100%, 100%) or 360, 100, 100');
        const h = parseInt(match[1] || match[4]) / 60;
        const s = parseInt(match[2] || match[5]) / 100;
        const v = parseInt(match[3] || match[6]) / 100;
        
        const c = v * s;
        const x = c * (1 - Math.abs((h % 2) - 1));
        const m = v - c;
        
        let r = 0, g = 0, b = 0;
        if (h >= 0 && h < 1) { r = c; g = x; b = 0; }
        else if (h >= 1 && h < 2) { r = x; g = c; b = 0; }
        else if (h >= 2 && h < 3) { r = 0; g = c; b = x; }
        else if (h >= 3 && h < 4) { r = 0; g = x; b = c; }
        else if (h >= 4 && h < 5) { r = x; g = 0; b = c; }
        else if (h >= 5 && h < 6) { r = c; g = 0; b = x; }
        
        return {
          r: Math.round((r + m) * 255),
          g: Math.round((g + m) * 255),
          b: Math.round((b + m) * 255)
        };
      }
      
      case 'cmyk': {
        const match = value.match(/cmyk\s*\(\s*(\d+)%?\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*\)|(\d+)%?\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*,\s*(\d+)%?/);
        if (!match) throw new Error('Invalid CMYK format. Use: cmyk(0%, 50%, 100%, 0%) or 0, 50, 100, 0');
        const c = parseInt(match[1] || match[5]) / 100;
        const m = parseInt(match[2] || match[6]) / 100;
        const y = parseInt(match[3] || match[7]) / 100;
        const k = parseInt(match[4] || match[8]) / 100;
        
        const r = 255 * (1 - c) * (1 - k);
        const g = 255 * (1 - m) * (1 - k);
        const b = 255 * (1 - y) * (1 - k);
        
        return {
          r: Math.round(r),
          g: Math.round(g),
          b: Math.round(b)
        };
      }
      
      default:
        throw new Error('Unsupported color format');
    }
  };

  const convertColor = useCallback((input: ColorInput) => {
    try {
      const rgb = parseColorInput(input);
      const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
      const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
      const xyz = rgbToXyz(rgb.r, rgb.g, rgb.b);
      const lab = xyzToLab(xyz.x, xyz.y, xyz.z);

      setFormats({
        hex,
        rgb,
        hsl,
        hsv,
        cmyk,
        lab,
        xyz
      });
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid color format');
      setFormats(null);
    }
  }, []);

  const handleInputChange = (value: string) => {
    const newInput = { ...input, value };
    setInput(newInput);
    convertColor(newInput);
  };

  const handleTypeChange = (type: ColorInput['type']) => {
    const newInput = { ...input, type };
    setInput(newInput);
    convertColor(newInput);
  };

  const handleCopy = async (format: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(format);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleClear = () => {
    setInput({ type: 'hex', value: '' });
    setFormats(null);
    setError('');
  };

  const loadSample = () => {
    const newInput = { type: 'hex' as const, value: '#3b82f6' };
    setInput(newInput);
    convertColor(newInput);
  };

  // Initialize with default color
  React.useEffect(() => {
    convertColor(input);
  }, [convertColor, input]);

  const formatOptions = [
    { value: 'hex', label: 'HEX', example: '#FF5733' },
    { value: 'rgb', label: 'RGB', example: 'rgb(255, 87, 51) or 255, 87, 51' },
    { value: 'hsl', label: 'HSL', example: 'hsl(9, 100%, 60%) or 9, 100, 60' },
    { value: 'hsv', label: 'HSV', example: 'hsv(9, 80%, 100%) or 9, 80, 100' },
    { value: 'cmyk', label: 'CMYK', example: 'cmyk(0%, 66%, 80%, 0%) or 0, 66, 80, 0' },
  ];

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <PageHeader 
          title="Color Converter"
          description="Convert between different color formats: HEX, RGB, HSL, HSV, CMYK, LAB, and XYZ."
        />

        {/* Input Section */}
        <section className="bg-white rounded-lg shadow-lg border border-gray-200 mb-6" aria-labelledby="color-input-heading">
          <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
            <div className="flex items-center space-x-2">
              <Palette className="h-5 w-5 text-blue-600" aria-hidden="true" />
              <h2 id="color-input-heading" className="text-lg font-semibold text-gray-800">Color Input</h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={loadSample}
                className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
                aria-label="Load sample color"
              >
                Load Sample
              </button>
              <button
                onClick={handleClear}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                aria-label="Clear input"
                title="Clear input"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="md:col-span-1">
                <label htmlFor="color-format-select" className="block text-sm font-medium text-gray-700 mb-2">
                  Color Format
                </label>
                <select
                  id="color-format-select"
                  value={input.type}
                  onChange={(e) => handleTypeChange(e.target.value as ColorInput['type'])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Select color format"
                >
                  {formatOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="color-value-input" className="block text-sm font-medium text-gray-700 mb-2">
                  Color Value
                </label>
                <input
                  id="color-value-input"
                  type="text"
                  value={input.value}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder={formatOptions.find(opt => opt.value === input.type)?.example || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Color value to convert"
                  aria-invalid={error ? 'true' : 'false'}
                />
              </div>
            </div>
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg" role="alert">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
          </div>
        </section>

        {/* Color Preview */}
        {formats && (
          <section className="bg-white rounded-lg shadow-lg border border-gray-200 mb-6" aria-labelledby="color-preview-heading">
            <div className="p-4 bg-gray-50 border-b rounded-t-lg">
              <div className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-green-600" aria-hidden="true" />
                <h2 id="color-preview-heading" className="text-lg font-semibold text-gray-800">Color Preview</h2>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-center space-x-6">
                <div className="flex-1">
                  <div 
                    className="w-full h-32 rounded-lg border-4 border-gray-200 shadow-lg"
                    style={{ backgroundColor: formats.hex }}
                  ></div>
                  <p className="text-center mt-2 text-sm text-gray-600">Color Sample</p>
                </div>
                <div className="flex-1">
                  <div 
                    className="w-full h-32 rounded-lg border-4 border-gray-200 shadow-lg flex items-center justify-center"
                    style={{ backgroundColor: '#000000' }}
                  >
                    <div 
                      className="w-24 h-24 rounded-lg border-2 border-white"
                      style={{ backgroundColor: formats.hex }}
                    ></div>
                  </div>
                  <p className="text-center mt-2 text-sm text-gray-600">On Black Background</p>
                </div>
                <div className="flex-1">
                  <div 
                    className="w-full h-32 rounded-lg border-4 border-gray-200 shadow-lg flex items-center justify-center"
                    style={{ backgroundColor: '#ffffff' }}
                  >
                    <div 
                      className="w-24 h-24 rounded-lg border-2 border-gray-300"
                      style={{ backgroundColor: formats.hex }}
                    ></div>
                  </div>
                  <p className="text-center mt-2 text-sm text-gray-600">On White Background</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Color Formats */}
        {formats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" role="region" aria-label="Converted color formats">
            {/* HEX */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="p-4 bg-gray-50 border-b rounded-t-lg">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">HEX</h4>
                  <button
                    onClick={() => handleCopy('hex', formats.hex)}
                    className="flex items-center space-x-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                  >
                    {copied === 'hex' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copied === 'hex' ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>
              <div className="p-4">
                <code className="text-sm font-mono text-gray-800 bg-gray-50 px-2 py-1 rounded">
                  {formats.hex}
                </code>
              </div>
            </div>

            {/* RGB */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="p-4 bg-gray-50 border-b rounded-t-lg">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">RGB</h4>
                  <button
                    onClick={() => handleCopy('rgb', `rgb(${formats.rgb.r}, ${formats.rgb.g}, ${formats.rgb.b})`)}
                    className="flex items-center space-x-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                  >
                    {copied === 'rgb' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copied === 'rgb' ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>
              <div className="p-4">
                <code className="text-sm font-mono text-gray-800 bg-gray-50 px-2 py-1 rounded">
                  rgb({formats.rgb.r}, {formats.rgb.g}, {formats.rgb.b})
                </code>
              </div>
            </div>

            {/* HSL */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="p-4 bg-gray-50 border-b rounded-t-lg">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">HSL</h4>
                  <button
                    onClick={() => handleCopy('hsl', `hsl(${formats.hsl.h}, ${formats.hsl.s}%, ${formats.hsl.l}%)`)}
                    className="flex items-center space-x-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                  >
                    {copied === 'hsl' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copied === 'hsl' ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>
              <div className="p-4">
                <code className="text-sm font-mono text-gray-800 bg-gray-50 px-2 py-1 rounded">
                  hsl({formats.hsl.h}, {formats.hsl.s}%, {formats.hsl.l}%)
                </code>
              </div>
            </div>

            {/* HSV */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="p-4 bg-gray-50 border-b rounded-t-lg">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">HSV</h4>
                  <button
                    onClick={() => handleCopy('hsv', `hsv(${formats.hsv.h}, ${formats.hsv.s}%, ${formats.hsv.v}%)`)}
                    className="flex items-center space-x-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                  >
                    {copied === 'hsv' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copied === 'hsv' ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>
              <div className="p-4">
                <code className="text-sm font-mono text-gray-800 bg-gray-50 px-2 py-1 rounded">
                  hsv({formats.hsv.h}, {formats.hsv.s}%, {formats.hsv.v}%)
                </code>
              </div>
            </div>

            {/* CMYK */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="p-4 bg-gray-50 border-b rounded-t-lg">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">CMYK</h4>
                  <button
                    onClick={() => handleCopy('cmyk', `cmyk(${formats.cmyk.c}%, ${formats.cmyk.m}%, ${formats.cmyk.y}%, ${formats.cmyk.k}%)`)}
                    className="flex items-center space-x-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                  >
                    {copied === 'cmyk' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copied === 'cmyk' ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>
              <div className="p-4">
                <code className="text-sm font-mono text-gray-800 bg-gray-50 px-2 py-1 rounded">
                  cmyk({formats.cmyk.c}%, {formats.cmyk.m}%, {formats.cmyk.y}%, {formats.cmyk.k}%)
                </code>
              </div>
            </div>

            {/* LAB */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="p-4 bg-gray-50 border-b rounded-t-lg">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">LAB</h4>
                  <button
                    onClick={() => handleCopy('lab', `lab(${formats.lab.l}, ${formats.lab.a}, ${formats.lab.b})`)}
                    className="flex items-center space-x-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                  >
                    {copied === 'lab' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copied === 'lab' ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>
              <div className="p-4">
                <code className="text-sm font-mono text-gray-800 bg-gray-50 px-2 py-1 rounded">
                  lab({formats.lab.l}, {formats.lab.a}, {formats.lab.b})
                </code>
              </div>
            </div>

            {/* XYZ */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="p-4 bg-gray-50 border-b rounded-t-lg">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">XYZ</h4>
                  <button
                    onClick={() => handleCopy('xyz', `xyz(${formats.xyz.x}, ${formats.xyz.y}, ${formats.xyz.z})`)}
                    className="flex items-center space-x-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                  >
                    {copied === 'xyz' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copied === 'xyz' ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>
              <div className="p-4">
                <code className="text-sm font-mono text-gray-800 bg-gray-50 px-2 py-1 rounded">
                  xyz({formats.xyz.x}, {formats.xyz.y}, {formats.xyz.z})
                </code>
              </div>
            </div>
          </div>
        )}

        {/* Color Space Information */}
        <div className="mt-6 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Color Space Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-medium text-blue-800 mb-2">RGB & HEX</div>
              <ul className="text-blue-700 space-y-1">
                <li>• RGB: Red, Green, Blue (0-255)</li>
                <li>• HEX: Hexadecimal notation</li>
                <li>• Most common for web/digital</li>
              </ul>
            </div>
            <div>
              <div className="font-medium text-blue-800 mb-2">HSL & HSV</div>
              <ul className="text-blue-700 space-y-1">
                <li>• HSL: Hue, Saturation, Lightness</li>
                <li>• HSV: Hue, Saturation, Value</li>
                <li>• Intuitive for color selection</li>
              </ul>
            </div>
            <div>
              <div className="font-medium text-blue-800 mb-2">Print & Lab</div>
              <ul className="text-blue-700 space-y-1">
                <li>• CMYK: Cyan, Magenta, Yellow, Key</li>
                <li>• LAB: Lightness, A, B channels</li>
                <li>• XYZ: CIE color space</li>
              </ul>
            </div>
          </div>
        </div>

        <InfoSection 
          title="Color Space Conversion"
          items={[
            {
              label: "RGB & HEX",
              description: "Red, Green, Blue (0-255) and hexadecimal notation - most common for web/digital"
            },
            {
              label: "HSL & HSV",
              description: "Hue, Saturation, Lightness/Value - intuitive for color selection"
            },
            {
              label: "CMYK",
              description: "Cyan, Magenta, Yellow, Key (black) - used for print design"
            },
            {
              label: "LAB & XYZ",
              description: "Lightness, A, B channels and CIE color space - device-independent"
            }
          ]}
          useCases="Web design, graphic design, print production, color matching, accessibility"
        />
      </div>
    </div>
  );
};

export default ColorConverter;