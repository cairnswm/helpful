import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import PageHeader from '../components/PageHeader';
import InfoSection from '../components/InfoSection';
import { Download, Upload, RotateCcw } from 'lucide-react';

type QRType = 'text' | 'url' | 'email' | 'phone' | 'sms' | 'wifi';
type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

const QRCodeGenerator: React.FC = () => {
  const [qrType, setQrType] = useState<QRType>('text');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [sms, setSms] = useState('');
  const [smsBody, setSmsBody] = useState('');
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiEncryption, setWifiEncryption] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [size, setSize] = useState(256);
  const [errorCorrection, setErrorCorrection] = useState<ErrorCorrectionLevel>('M');
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [logoImage, setLogoImage] = useState<string>('');
  const [logoSize, setLogoSize] = useState(50);
  const [logoBorderRadius, setLogoBorderRadius] = useState(4);
  const [logoColor, setLogoColor] = useState('#000000');
  const [logoBackgroundColor, setLogoBackgroundColor] = useState('#ffffff');
  const [isSvgLogo, setIsSvgLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getQRValue = (): string => {
    switch (qrType) {
      case 'text':
        return text;
      case 'url':
        return url;
      case 'email':
        return `mailto:${email}`;
      case 'phone':
        return `tel:${phone}`;
      case 'sms':
        return `sms:${sms}${smsBody ? `?body=${encodeURIComponent(smsBody)}` : ''}`;
      case 'wifi':
        return `WIFI:T:${wifiEncryption};S:${wifiSsid};P:${wifiPassword};;`;
      default:
        return '';
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if the file is an SVG
    const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
    setIsSvgLogo(isSvg);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setLogoImage(result);
      
      // Debug: log the data URL format
      if (isSvg) {
        console.log('SVG file detected. Data URL starts with:', result.substring(0, 100));
      }
    };
    reader.readAsDataURL(file);
  };

  const modifySvgColors = (svgString: string, fillColor: string, backgroundColor: string): string => {
    try {
      // Parse SVG and modify colors
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgString, 'image/svg+xml');
      const svgElement = svgDoc.documentElement;

      // Check for parsing errors
      const errorNode = svgDoc.querySelector('parsererror');
      if (errorNode) {
        console.error('SVG parsing error:', errorNode.textContent);
        return svgString; // Return original if parsing fails
      }

      // Ensure we have proper SVG dimensions
      if (!svgElement.getAttribute('viewBox') && !svgElement.getAttribute('width')) {
        svgElement.setAttribute('viewBox', '0 0 100 100');
        svgElement.setAttribute('width', '100');
        svgElement.setAttribute('height', '100');
      }
      
      // If SVG has width/height but no viewBox, create viewBox from dimensions
      if (!svgElement.getAttribute('viewBox')) {
        const width = svgElement.getAttribute('width') || '100';
        const height = svgElement.getAttribute('height') || '100';
        const w = parseFloat(width.replace(/[^\d.]/g, '')) || 100;
        const h = parseFloat(height.replace(/[^\d.]/g, '')) || 100;
        svgElement.setAttribute('viewBox', `0 0 ${w} ${h}`);
      }

      // Set background if specified and not transparent
      if (backgroundColor && backgroundColor !== 'transparent' && backgroundColor !== '#ffffff') {
        const rect = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', '0');
        rect.setAttribute('y', '0');
        rect.setAttribute('width', '100%');
        rect.setAttribute('height', '100%');
        rect.setAttribute('fill', backgroundColor);
        svgElement.insertBefore(rect, svgElement.firstChild);
      }

      // Find all elements with fill attributes and update them
      const elementsWithFill = svgElement.querySelectorAll('[fill]:not([fill="none"]):not([fill="transparent"])');
      elementsWithFill.forEach((element) => {
        const currentFill = element.getAttribute('fill');
        if (currentFill && !currentFill.includes('url(')) { // Don't modify gradients/patterns
          element.setAttribute('fill', fillColor);
        }
      });

      // Find all path, circle, rect, polygon elements without explicit fill and set the color
      const shapeElements = svgElement.querySelectorAll('path:not([fill]), circle:not([fill]), rect:not([fill]), polygon:not([fill]), ellipse:not([fill])');
      shapeElements.forEach((element) => {
        element.setAttribute('fill', fillColor);
      });

      // Handle stroke colors for outlined icons
      const elementsWithStroke = svgElement.querySelectorAll('[stroke]:not([stroke="none"]):not([stroke="transparent"])');
      elementsWithStroke.forEach((element) => {
        const currentStroke = element.getAttribute('stroke');
        if (currentStroke && !currentStroke.includes('url(')) { // Don't modify gradients/patterns
          element.setAttribute('stroke', fillColor);
        }
      });

      // Handle CSS styles within the SVG
      const styleElements = svgElement.querySelectorAll('style');
      styleElements.forEach((styleElement) => {
        let cssText = styleElement.textContent || '';
        // Replace common CSS color properties
        cssText = cssText.replace(/fill:\s*#[0-9a-fA-F]{3,6}/g, `fill: ${fillColor}`);
        cssText = cssText.replace(/stroke:\s*#[0-9a-fA-F]{3,6}/g, `stroke: ${fillColor}`);
        styleElement.textContent = cssText;
      });

      return new XMLSerializer().serializeToString(svgDoc);
    } catch (error) {
      console.error('Error modifying SVG colors:', error);
      return svgString; // Return original if modification fails
    }
  };

  const drawRoundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  const generateQRCode = async () => {
    const qrValue = getQRValue();
    if (!qrValue || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      // Set canvas size
      canvas.width = size;
      canvas.height = size;

      // Generate QR code
      await QRCode.toCanvas(canvas, qrValue, {
        width: size,
        margin: 2,
        errorCorrectionLevel: errorCorrection,
        color: {
          dark: fgColor,
          light: bgColor,
        },
      });

      // Add logo if provided
      if (logoImage) {
        if (isSvgLogo) {
          // Handle SVG logos with color modification
          let svgData = '';
          
          if (logoImage.startsWith('data:image/svg+xml;base64,')) {
            // Base64 encoded SVG
            svgData = atob(logoImage.split(',')[1]);
          } else if (logoImage.startsWith('data:image/svg+xml;charset=utf-8,')) {
            // URL encoded SVG
            svgData = decodeURIComponent(logoImage.split(',')[1]);
          } else if (logoImage.startsWith('data:image/svg+xml,')) {
            // Plain SVG
            svgData = logoImage.split(',')[1];
          } else {
            // Fallback - try to extract SVG content
            const base64Match = logoImage.match(/data:image\/svg\+xml;base64,(.+)/);
            if (base64Match) {
              svgData = atob(base64Match[1]);
            } else {
              console.error('Could not parse SVG data');
              return;
            }
          }
          
          console.log('Processing SVG, original data length:', svgData.length);
          console.log('SVG starts with:', svgData.substring(0, 50));
          
          const modifiedSvg = modifySvgColors(svgData, logoColor, logoBackgroundColor);
          console.log('Modified SVG length:', modifiedSvg.length);
          
          const svgBlob = new Blob([modifiedSvg], { type: 'image/svg+xml;charset=utf-8' });
          const svgUrl = URL.createObjectURL(svgBlob);
          console.log('Created SVG URL:', svgUrl);
          
          const img = new Image();
          img.onload = () => {
            console.log('SVG image loaded successfully');
            console.log('Image dimensions:', img.naturalWidth, 'x', img.naturalHeight);
            
            const logoSizePixels = logoSize;
            const x = (size - logoSizePixels) / 2;
            const y = (size - logoSizePixels) / 2;

            // Draw background for logo
            ctx.fillStyle = logoBackgroundColor;
            ctx.fillRect(x - 8, y - 8, logoSizePixels + 16, logoSizePixels + 16);

            // Draw logo with border radius
            ctx.save();
            
            if (logoBorderRadius > 0) {
              drawRoundedRect(ctx, x, y, logoSizePixels, logoSizePixels, logoBorderRadius);
            } else {
              ctx.rect(x, y, logoSizePixels, logoSizePixels);
            }
            
            ctx.clip();
            ctx.drawImage(img, x, y, logoSizePixels, logoSizePixels);
            ctx.restore();
            
            URL.revokeObjectURL(svgUrl);
          };
          
          img.onerror = (e) => {
            console.error('Error loading SVG image:', e);
            console.log('Failed SVG URL:', svgUrl);
            URL.revokeObjectURL(svgUrl);
          };
          
          img.src = svgUrl;
        } else {
          // Handle raster images (PNG, JPG, etc.)
          const img = new Image();
          img.onload = () => {
            const logoSizePixels = logoSize;
            const x = (size - logoSizePixels) / 2;
            const y = (size - logoSizePixels) / 2;

            // Draw background for logo
            ctx.fillStyle = bgColor;
            ctx.fillRect(x - 8, y - 8, logoSizePixels + 16, logoSizePixels + 16);

            // Draw logo with border radius
            ctx.save();
            
            if (logoBorderRadius > 0) {
              drawRoundedRect(ctx, x, y, logoSizePixels, logoSizePixels, logoBorderRadius);
            } else {
              ctx.rect(x, y, logoSizePixels, logoSizePixels);
            }
            
            ctx.clip();
            ctx.drawImage(img, x, y, logoSizePixels, logoSizePixels);
            ctx.restore();
          };
          img.src = logoImage;
        }
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  // Generate QR code when parameters change
  useEffect(() => {
    const qrValue = getQRValue();
    if (qrValue) {
      generateQRCode();
    }
  }, [text, url, email, phone, sms, smsBody, wifiSsid, wifiPassword, wifiEncryption, 
      size, errorCorrection, fgColor, bgColor, logoImage, logoSize, logoBorderRadius,
      logoColor, logoBackgroundColor, isSvgLogo]);

  const handleDownload = (format: 'png' | 'svg') => {
    if (!canvasRef.current) return;

    const qrValue = getQRValue();
    if (!qrValue) return;

    if (format === 'svg') {
      // Generate SVG using QRCode library
      QRCode.toString(qrValue, {
        type: 'svg',
        width: size,
        margin: 2,
        errorCorrectionLevel: errorCorrection,
        color: {
          dark: fgColor,
          light: bgColor,
        },
      }).then((svgString) => {
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);
        const link = document.createElement('a');
        link.href = svgUrl;
        link.download = 'qrcode.svg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(svgUrl);
      }).catch((error) => {
        console.error('Error generating SVG:', error);
      });
      return;
    }

    // PNG export from canvas
    canvasRef.current.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'qrcode.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  };

  const handleResetLogo = () => {
    setLogoImage('');
    setIsSvgLogo(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClear = () => {
    setText('');
    setUrl('');
    setEmail('');
    setPhone('');
    setSms('');
    setSmsBody('');
    setWifiSsid('');
    setWifiPassword('');
    handleResetLogo();
  };

  const qrValue = getQRValue();

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="QR Code Generator"
          description="Create QR codes for URLs, text, contact info, WiFi credentials, etc. with customizable size, error correction, and optional logo."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration Panel */}
          <div className="space-y-6">
            <section className="bg-white rounded-lg shadow-lg border border-gray-200 p-6" aria-labelledby="qr-content-heading">
              <h2 id="qr-content-heading" className="text-lg font-semibold text-gray-800 mb-4">Content</h2>
              
              <div className="mb-4">
                <label htmlFor="qr-type-select" className="block text-sm font-medium text-gray-700 mb-2">
                  QR Code Type
                </label>
                <select
                  id="qr-type-select"
                  value={qrType}
                  onChange={(e) => setQrType(e.target.value as QRType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Select QR code type"
                >
                  <option value="text">Plain Text</option>
                  <option value="url">URL</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="sms">SMS</option>
                  <option value="wifi">WiFi</option>
                </select>
              </div>

              {qrType === 'text' && (
                <div>
                  <label htmlFor="qr-text-input" className="block text-sm font-medium text-gray-700 mb-2">
                    Text
                  </label>
                  <textarea
                    id="qr-text-input"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter text..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    aria-label="Text for QR code"
                  />
                </div>
              )}

              {qrType === 'url' && (
                <div>
                  <label htmlFor="qr-url-input" className="block text-sm font-medium text-gray-700 mb-2">
                    URL
                  </label>
                  <input
                    id="qr-url-input"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    aria-label="URL for QR code"
                  />
                </div>
              )}

              {qrType === 'email' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {qrType === 'phone' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1234567890"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {qrType === 'sms' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={sms}
                      onChange={(e) => setSms(e.target.value)}
                      placeholder="+1234567890"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message (Optional)
                    </label>
                    <textarea
                      value={smsBody}
                      onChange={(e) => setSmsBody(e.target.value)}
                      placeholder="Message text..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={2}
                    />
                  </div>
                </div>
              )}

              {qrType === 'wifi' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Network Name (SSID)
                    </label>
                    <input
                      type="text"
                      value={wifiSsid}
                      onChange={(e) => setWifiSsid(e.target.value)}
                      placeholder="MyWiFiNetwork"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <input
                      type="text"
                      value={wifiPassword}
                      onChange={(e) => setWifiPassword(e.target.value)}
                      placeholder="password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Encryption
                    </label>
                    <select
                      value={wifiEncryption}
                      onChange={(e) => setWifiEncryption(e.target.value as 'WPA' | 'WEP' | 'nopass')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="WPA">WPA/WPA2</option>
                      <option value="WEP">WEP</option>
                      <option value="nopass">None</option>
                    </select>
                  </div>
                </div>
              )}
            </section>

            <section className="bg-white rounded-lg shadow-lg border border-gray-200 p-6" aria-labelledby="qr-customization-heading">
              <h2 id="qr-customization-heading" className="text-lg font-semibold text-gray-800 mb-4">Customization</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Size: {size}px
                  </label>
                  <input
                    type="range"
                    min="128"
                    max="512"
                    step="32"
                    value={size}
                    onChange={(e) => setSize(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Error Correction
                  </label>
                  <select
                    value={errorCorrection}
                    onChange={(e) => setErrorCorrection(e.target.value as ErrorCorrectionLevel)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="L">Low (7%)</option>
                    <option value="M">Medium (15%)</option>
                    <option value="Q">Quartile (25%)</option>
                    <option value="H">High (30%)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Foreground Color
                    </label>
                    <input
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="w-full h-10 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Background Color
                    </label>
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-full h-10 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Center Logo (Optional)
                  </label>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <Upload className="h-4 w-4" />
                      <span className="text-sm font-medium">Upload Logo</span>
                    </button>
                    {logoImage && (
                      <button
                        onClick={handleResetLogo}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </div>

                {logoImage && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Logo Size: {logoSize}px
                      </label>
                      <input
                        type="range"
                        min="20"
                        max="100"
                        step="5"
                        value={logoSize}
                        onChange={(e) => setLogoSize(parseInt(e.target.value))}
                        className="w-full"
                        aria-label="Adjust logo size"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Logo Border Radius: {logoBorderRadius}px
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        step="2"
                        value={logoBorderRadius}
                        onChange={(e) => setLogoBorderRadius(parseInt(e.target.value))}
                        className="w-full"
                        aria-label="Adjust logo border radius"
                      />
                    </div>
                    
                    {isSvgLogo && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-blue-800 mb-3">SVG Color Controls</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Icon Color
                            </label>
                            <input
                              type="color"
                              value={logoColor}
                              onChange={(e) => setLogoColor(e.target.value)}
                              className="w-full h-10 rounded-lg cursor-pointer"
                              aria-label="Choose SVG icon color"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Icon Background
                            </label>
                            <input
                              type="color"
                              value={logoBackgroundColor}
                              onChange={(e) => setLogoBackgroundColor(e.target.value)}
                              className="w-full h-10 rounded-lg cursor-pointer"
                              aria-label="Choose SVG icon background color"
                            />
                          </div>
                        </div>
                        <p className="text-xs text-blue-600 mt-2">
                          SVG detected! You can customize the icon colors above.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </section>

            <button
              onClick={handleClear}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center justify-center space-x-2"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Clear All</span>
            </button>
          </div>

          {/* Preview Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Preview</h3>
              
              <div className="flex justify-center items-center bg-gray-50 rounded-lg p-8 min-h-[400px]">
                {qrValue ? (
                  <canvas
                    ref={canvasRef}
                    className="border border-gray-200 rounded-lg bg-white"
                    style={{ maxWidth: '100%', height: 'auto' }}
                    aria-label="Generated QR code"
                  />
                ) : (
                  <p className="text-gray-400">Enter content to generate QR code</p>
                )}
              </div>

              {qrValue && (
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={() => handleDownload('png')}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span className="text-sm font-medium">Download PNG</span>
                  </button>
                  <button
                    onClick={() => handleDownload('svg')}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span className="text-sm font-medium">Download SVG</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <InfoSection 
          title="QR Code Generator Features"
          items={[
            {
              label: "Multiple Types",
              description: "Generate QR codes for text, URLs, email, phone, SMS, and WiFi credentials"
            },
            {
              label: "Logo Support",
              description: "Add custom logos to the center of QR codes with adjustable size, border radius, and SVG color customization"
            },
            {
              label: "Customization",
              description: "Adjust size, colors, error correction level for optimal scanning performance"
            },
            {
              label: "Export Options", 
              description: "Download as PNG (with logo) or SVG format for various use cases"
            },
            {
              label: "Error Correction",
              description: "Higher levels allow QR codes to be readable even if partially damaged or covered by logos"
            }
          ]}
          useCases="marketing materials, business cards, product packaging, event tickets, WiFi sharing, contactless payments, branded QR codes"
        />
      </div>
    </div>
  );
};

export default QRCodeGenerator;
