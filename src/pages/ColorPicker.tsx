import React, { useState, useCallback } from 'react';
import { Copy, Check, Palette, Eye } from 'lucide-react';

interface ColorFormats {
  hex: string;
  rgb: string;
  hsl: string;
  hsv: string;
  cmyk: string;
}

interface TailwindShade {
  shade: string;
  hex: string;
  rgb: string;
}

const ColorPicker: React.FC = () => {
  const [color, setColor] = useState('#3b82f6');
  const [formats, setFormats] = useState<ColorFormats>({
    hex: '#3b82f6',
    rgb: 'rgb(59, 130, 246)',
    hsl: 'hsl(217, 91%, 60%)',
    hsv: 'hsv(217, 76%, 96%)',
    cmyk: 'cmyk(76%, 47%, 0%, 4%)'
  });
  const [tailwindShades, setTailwindShades] = useState<TailwindShade[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
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
    const c = (1 - r - k) / (1 - k) || 0;
    const m = (1 - g - k) / (1 - k) || 0;
    const y = (1 - b - k) / (1 - k) || 0;

    return {
      c: Math.round(c * 100),
      m: Math.round(m * 100),
      y: Math.round(y * 100),
      k: Math.round(k * 100)
    };
  };

  const hslToRgb = (h: number, s: number, l: number): { r: number; g: number; b: number } => {
    h /= 360;
    s /= 100;
    l /= 100;

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
  };

  const rgbToHex = (r: number, g: number, b: number): string => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  const generateTailwindShades = (baseColor: string): TailwindShade[] => {
    const rgb = hexToRgb(baseColor);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    const shades = [
      { shade: '50', lightness: 95 },
      { shade: '100', lightness: 90 },
      { shade: '200', lightness: 80 },
      { shade: '300', lightness: 70 },
      { shade: '400', lightness: 60 },
      { shade: '500', lightness: 50 },
      { shade: '600', lightness: 40 },
      { shade: '700', lightness: 30 },
      { shade: '800', lightness: 20 },
      { shade: '900', lightness: 10 },
      { shade: '950', lightness: 5 }
    ];

    return shades.map(({ shade, lightness }) => {
      const adjustedRgb = hslToRgb(hsl.h, hsl.s, lightness);
      const hex = rgbToHex(adjustedRgb.r, adjustedRgb.g, adjustedRgb.b);
      const rgb = `rgb(${adjustedRgb.r}, ${adjustedRgb.g}, ${adjustedRgb.b})`;
      
      return { shade, hex, rgb };
    });
  };

  const updateFormats = useCallback((hexColor: string) => {
    const rgb = hexToRgb(hexColor);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);

    setFormats({
      hex: hexColor.toUpperCase(),
      rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
      hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
      hsv: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`,
      cmyk: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`
    });

    setTailwindShades(generateTailwindShades(hexColor));
  }, []);

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    updateFormats(newColor);
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

  const presetColors = [
    '#FF0000', '#FF8000', '#FFFF00', '#80FF00', '#00FF00', '#00FF80',
    '#00FFFF', '#0080FF', '#0000FF', '#8000FF', '#FF00FF', '#FF0080',
    '#000000', '#404040', '#808080', '#C0C0C0', '#FFFFFF', '#8B4513',
    '#FFA500', '#FFD700', '#ADFF2F', '#00CED1', '#FF69B4', '#DDA0DD'
  ];

  // Initialize formats on mount
  React.useEffect(() => {
    updateFormats(color);
  }, [color, updateFormats]);

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Color Picker & Converter</h1>
          <p className="text-gray-600">
            Pick colors and convert between different color formats with Tailwind CSS shade variations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Color Picker */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="p-4 bg-gray-50 border-b rounded-t-lg">
              <div className="flex items-center space-x-2">
                <Palette className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">Color Picker</h3>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Color Preview */}
              <div className="text-center">
                <div 
                  className="w-32 h-32 mx-auto rounded-lg border-4 border-gray-200 shadow-lg"
                  style={{ backgroundColor: color }}
                ></div>
                <p className="mt-2 text-sm text-gray-600">Current Color</p>
              </div>

              {/* Color Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pick a Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="w-16 h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="#000000"
                  />
                </div>
              </div>

              {/* Preset Colors */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Preset Colors
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {presetColors.map((presetColor) => (
                    <button
                      key={presetColor}
                      onClick={() => handleColorChange(presetColor)}
                      className={`w-8 h-8 rounded border-2 transition-all hover:scale-110 ${
                        color.toLowerCase() === presetColor.toLowerCase()
                          ? 'border-gray-800 shadow-lg'
                          : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: presetColor }}
                      title={presetColor}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Color Formats */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="p-4 bg-gray-50 border-b rounded-t-lg">
              <div className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-800">Color Formats</h3>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              {Object.entries(formats).map(([format, value]) => (
                <div key={format} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-700 uppercase mb-1">
                      {format}
                    </div>
                    <code className="text-sm text-gray-800 font-mono">
                      {value}
                    </code>
                  </div>
                  <button
                    onClick={() => handleCopy(format, value)}
                    className="ml-3 flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                  >
                    {copied === format ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span className="font-medium">
                      {copied === format ? 'Copied!' : 'Copy'}
                    </span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tailwind CSS Shades */}
        <div className="mt-6 bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="p-4 bg-gray-50 border-b rounded-t-lg">
            <h3 className="text-lg font-semibold text-gray-800">Tailwind CSS Color Shades</h3>
            <p className="text-sm text-gray-600 mt-1">
              Color variations inspired by Tailwind CSS shade system
            </p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {tailwindShades.map((shade) => (
                <div
                  key={shade.shade}
                  className="group relative"
                >
                  <div
                    className="w-full h-16 rounded-lg border border-gray-200 cursor-pointer transition-transform hover:scale-105"
                    style={{ backgroundColor: shade.hex }}
                    onClick={() => handleCopy(`shade-${shade.shade}`, shade.hex)}
                    title={`Click to copy ${shade.hex}`}
                  />
                  <div className="mt-2 text-center">
                    <div className="text-xs font-medium text-gray-700">
                      {shade.shade}
                    </div>
                    <div className="text-xs text-gray-500 font-mono">
                      {shade.hex}
                    </div>
                  </div>
                  
                  {/* Copy indicator */}
                  {copied === `shade-${shade.shade}` && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                      <div className="flex items-center space-x-1 text-white text-xs font-medium">
                        <Check className="h-3 w-3" />
                        <span>Copied!</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Color Information */}
        <div className="mt-6 bg-indigo-50 rounded-lg p-4">
          <h4 className="font-semibold text-indigo-900 mb-2">Color Format Information</h4>
          <div className="text-sm text-indigo-800 space-y-1">
            <p><strong>HEX:</strong> Hexadecimal color notation (#RRGGBB) - most common for web</p>
            <p><strong>RGB:</strong> Red, Green, Blue values (0-255) - additive color model</p>
            <p><strong>HSL:</strong> Hue, Saturation, Lightness - intuitive for designers</p>
            <p><strong>HSV:</strong> Hue, Saturation, Value - similar to HSL but different lightness calculation</p>
            <p><strong>CMYK:</strong> Cyan, Magenta, Yellow, Key (black) - subtractive color model for printing</p>
            <p><strong>Tailwind Shades:</strong> Color variations from 50 (lightest) to 950 (darkest)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;