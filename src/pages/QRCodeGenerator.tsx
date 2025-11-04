import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrRef = useRef<HTMLDivElement>(null);

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

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setLogoImage(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = (format: 'png' | 'svg') => {
    if (!qrRef.current) return;

    const qrValue = getQRValue();
    if (!qrValue) return;

    if (format === 'svg') {
      const svg = qrRef.current.querySelector('svg');
      if (!svg) return;

      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      const link = document.createElement('a');
      link.href = svgUrl;
      link.download = 'qrcode.svg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(svgUrl);
    } else {
      const svg = qrRef.current.querySelector('svg');
      if (!svg) return;

      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const svgData = new XMLSerializer().serializeToString(svg);
      const img = new Image();
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        
        canvas.toBlob((blob) => {
          if (!blob) return;
          const pngUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = pngUrl;
          link.download = 'qrcode.png';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(pngUrl);
        });
      };

      img.src = url;
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
    setLogoImage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Content</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  QR Code Type
                </label>
                <select
                  value={qrType}
                  onChange={(e) => setQrType(e.target.value as QRType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Text
                  </label>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter text..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
              )}

              {qrType === 'url' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            </div>

            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Customization</h3>
              
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
                        onClick={() => setLogoImage('')}
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
                    />
                  </div>
                )}
              </div>
            </div>

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
                  <div ref={qrRef} className="relative inline-block">
                    <QRCodeSVG
                      value={qrValue}
                      size={size}
                      level={errorCorrection}
                      fgColor={fgColor}
                      bgColor={bgColor}
                      includeMargin={true}
                    />
                    {logoImage && (
                      <img
                        src={logoImage}
                        alt="Logo"
                        className="absolute"
                        style={{
                          width: `${logoSize}px`,
                          height: `${logoSize}px`,
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          background: bgColor,
                          padding: '4px',
                          borderRadius: '4px'
                        }}
                      />
                    )}
                  </div>
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
              label: "Customization",
              description: "Adjust size, colors, error correction level, and add a center logo"
            },
            {
              label: "Error Correction",
              description: "Higher levels allow QR codes to be readable even if partially damaged"
            },
            {
              label: "Export Options",
              description: "Download as PNG or SVG format for various use cases"
            }
          ]}
          useCases="marketing materials, business cards, product packaging, event tickets, WiFi sharing, contactless payments"
        />
      </div>
    </div>
  );
};

export default QRCodeGenerator;
