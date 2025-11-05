import React, { useState, useRef } from 'react';
import PageHeader from '../components/PageHeader';
import InfoSection from '../components/InfoSection';
import { Copy, Check, Upload, Download, Image as ImageIcon, RotateCcw } from 'lucide-react';

const ImageBase64Converter: React.FC = () => {
  const [mode, setMode] = useState<'toBase64' | 'fromBase64'>('toBase64');
  const [base64String, setBase64String] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [copied, setCopied] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileSize((file.size / 1024).toFixed(2) + ' KB');

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setBase64String(result);
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleBase64Input = (value: string) => {
    setBase64String(value);
    
    // Validate and preview if it's a valid data URL
    if (value.startsWith('data:image/')) {
      setImagePreview(value);
    } else if (value.trim()) {
      // Try to create a valid data URL
      const dataUrl = `data:image/png;base64,${value.replace(/^data:image\/\w+;base64,/, '')}`;
      setImagePreview(dataUrl);
    } else {
      setImagePreview('');
    }
  };

  const handleCopy = async () => {
    if (!base64String) return;
    
    try {
      await navigator.clipboard.writeText(base64String);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDownload = () => {
    if (!imagePreview) return;

    const link = document.createElement('a');
    link.href = imagePreview;
    link.download = fileName || 'image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClear = () => {
    setBase64String('');
    setImagePreview('');
    setFileName('');
    setFileSize('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setFileName(file.name);
      setFileSize((file.size / 1024).toFixed(2) + ' KB');

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setBase64String(result);
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="Image to Base64 Converter"
          description="Convert images to Base64 strings and vice versa - essential for embedding images in CSS, emails, or APIs."
        />

        <section aria-labelledby="mode-selector-heading">
          <h2 id="mode-selector-heading" className="sr-only">Conversion Mode</h2>
          <div className="mb-6 flex items-center space-x-4">
            <div className="flex bg-gray-100 rounded-lg p-1" role="group" aria-label="Conversion mode selection">
              <button
                onClick={() => setMode('toBase64')}
                aria-pressed={mode === 'toBase64'}
                aria-label="Convert image to Base64 string"
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === 'toBase64'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Image → Base64
              </button>
              <button
                onClick={() => setMode('fromBase64')}
                aria-pressed={mode === 'fromBase64'}
                aria-label="Convert Base64 string to image"
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === 'fromBase64'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Base64 → Image
              </button>
            </div>
          </div>
        </section>

        {mode === 'toBase64' ? (
          <div className="space-y-6">
            {/* Upload Area */}
            <section aria-labelledby="upload-heading">
              <h2 id="upload-heading" className="sr-only">Upload Image</h2>
              <label
                htmlFor="image-upload-input"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="block bg-white rounded-lg shadow-lg border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors p-12 text-center cursor-pointer"
              >
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" aria-hidden="true" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-gray-500">
                  PNG, JPG, GIF, WebP, SVG (Max 10MB)
                </p>
                <input
                  id="image-upload-input"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  aria-label="Upload image file for Base64 conversion"
                  className="hidden"
                />
              </label>
            </section>

            {fileName && (
              <div className="bg-blue-50 rounded-lg p-4 flex items-center justify-between" role="status">
                <div className="flex items-center space-x-3">
                  <ImageIcon className="h-5 w-5 text-blue-600" aria-hidden="true" />
                  <div>
                    <p className="font-medium text-gray-800">{fileName}</p>
                    <p className="text-sm text-gray-600">{fileSize}</p>
                  </div>
                </div>
                <button
                  onClick={handleClear}
                  aria-label="Clear uploaded image"
                  className="text-gray-500 hover:text-gray-700"
                >
                  <RotateCcw className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            )}

            {imagePreview && (
              <section aria-labelledby="image-preview-heading" className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 id="image-preview-heading" className="text-lg font-semibold text-gray-800">Preview</h2>
                </div>
                <div className="flex justify-center bg-gray-50 rounded-lg p-4">
                  <img
                    src={imagePreview}
                    alt={`Preview of uploaded image: ${fileName}`}
                    className="max-w-full max-h-96 object-contain"
                  />
                </div>
              </section>
            )}

            {base64String && (
              <section aria-labelledby="base64-output-heading" className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col">
                <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
                  <h2 id="base64-output-heading" className="text-lg font-semibold text-gray-800">Base64 String</h2>
                  <button
                    onClick={handleCopy}
                    aria-label={copied ? 'Base64 string copied to clipboard' : 'Copy Base64 string to clipboard'}
                    className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
                  >
                    {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                    <span className="text-sm font-medium">
                      {copied ? 'Copied!' : 'Copy'}
                    </span>
                  </button>
                </div>
                <div className="p-4 max-h-64 overflow-auto">
                  <label htmlFor="base64-output-textarea" className="sr-only">Base64 string output</label>
                  <textarea
                    id="base64-output-textarea"
                    value={base64String}
                    readOnly
                    aria-label="Base64 encoded string"
                    className="w-full h-48 resize-none border-0 outline-none font-mono text-xs leading-relaxed bg-gray-50"
                  />
                </div>
              </section>
            )}
            {copied && (
              <div role="status" aria-live="polite" className="sr-only">
                Base64 string copied to clipboard
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Base64 Input */}
            <section aria-labelledby="base64-input-heading" className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col">
              <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
                <h2 id="base64-input-heading" className="text-lg font-semibold text-gray-800">Paste Base64 String</h2>
                <button
                  onClick={handleClear}
                  aria-label="Clear Base64 input"
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <div className="p-4">
                <label htmlFor="base64-input-textarea" className="sr-only">Base64 string input</label>
                <textarea
                  id="base64-input-textarea"
                  value={base64String}
                  onChange={(e) => handleBase64Input(e.target.value)}
                  placeholder="Paste Base64 string here (with or without data:image prefix)..."
                  aria-label="Paste Base64 string for image conversion"
                  className="w-full h-48 resize-none border border-gray-300 rounded-lg p-3 outline-none font-mono text-xs leading-relaxed focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  spellCheck={false}
                />
              </div>
            </section>

            {imagePreview && (
              <section aria-labelledby="decoded-image-heading" className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 id="decoded-image-heading" className="text-lg font-semibold text-gray-800">Image Preview</h2>
                  <button
                    onClick={handleDownload}
                    aria-label="Download decoded image"
                    className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    <span className="text-sm font-medium">Download</span>
                  </button>
                </div>
                <div className="flex justify-center bg-gray-50 rounded-lg p-4">
                  <img
                    src={imagePreview}
                    alt="Decoded image from Base64 string"
                    className="max-w-full max-h-96 object-contain"
                    onError={() => setImagePreview('')}
                  />
                </div>
              </section>
            )}
          </div>
        )}

        <InfoSection 
          title="Image Base64 Conversion"
          items={[
            {
              label: "Image to Base64",
              description: "Upload or drag & drop an image to convert it to a Base64 encoded string"
            },
            {
              label: "Base64 to Image",
              description: "Paste a Base64 string to preview and download the image"
            },
            {
              label: "Supported Formats",
              description: "PNG, JPG, GIF, WebP, SVG, and other common image formats"
            },
            {
              label: "Data URL",
              description: "Base64 strings can include the data:image prefix for direct embedding"
            }
          ]}
          useCases="CSS backgrounds, email templates, API payloads, embedded images, offline applications"
        />
      </div>
    </div>
  );
};

export default ImageBase64Converter;
