import React, { useState, useCallback } from 'react';
import { Copy, Check, RotateCcw, Download, FileText, Upload, Eye, Code } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const HtmlPdfConverter: React.FC = () => {
  const [input, setInput] = useState('');
  const [fileName, setFileName] = useState('document');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [previewMode, setPreviewMode] = useState<'code' | 'preview'>('code');
  const [conversionMethod, setConversionMethod] = useState<'html' | 'canvas'>('html');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setInput(content);
      setFileName(file.name.replace(/\.[^/.]+$/, ""));
    };
    reader.readAsText(file);
  };

  const generatePdfFromHtml = async () => {
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Create a temporary div with the HTML content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = input;
      tempDiv.style.width = '190mm';
      tempDiv.style.padding = '10mm';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.style.fontSize = '12px';
      tempDiv.style.lineHeight = '1.6';
      tempDiv.style.color = '#333';
      tempDiv.style.backgroundColor = 'white';

      // Add to DOM temporarily
      document.body.appendChild(tempDiv);

      await pdf.html(tempDiv, {
        callback: function (pdf) {
          document.body.removeChild(tempDiv);
          pdf.save(`${fileName}.pdf`);
        },
        x: 10,
        y: 10,
        width: 190,
        windowWidth: 800,
        margin: [10, 10, 10, 10]
      });

    } catch (err) {
      throw new Error('Failed to generate PDF from HTML');
    }
  };

  const generatePdfFromCanvas = async () => {
    try {
      // Create a temporary div with the HTML content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = input;
      tempDiv.style.width = '800px';
      tempDiv.style.padding = '40px';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.style.fontSize = '14px';
      tempDiv.style.lineHeight = '1.6';
      tempDiv.style.color = '#333';
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';

      // Add to DOM temporarily
      document.body.appendChild(tempDiv);

      // Convert to canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Remove temporary div
      document.body.removeChild(tempDiv);

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 190; // A4 width minus margins
      const pageHeight = 277; // A4 height minus margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 10;

      // Add first page
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${fileName}.pdf`);

    } catch (err) {
      throw new Error('Failed to generate PDF from canvas');
    }
  };

  const generatePdf = async () => {
    if (!input.trim()) {
      setError('Please enter HTML content or upload a file');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      if (conversionMethod === 'html') {
        await generatePdfFromHtml();
      } else {
        await generatePdfFromCanvas();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate PDF');
    } finally {
      setProcessing(false);
    }
  };

  const handleCopy = async () => {
    if (!input) return;
    
    try {
      await navigator.clipboard.writeText(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleClear = () => {
    setInput('');
    setError('');
    setFileName('document');
  };

  const loadSampleData = () => {
    const sample = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sample Document</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        h1 {
            color: #2563eb;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 10px;
        }
        h2 {
            color: #3b82f6;
            margin-top: 30px;
        }
        .highlight {
            background-color: #fef3c7;
            padding: 15px;
            border-left: 4px solid #f59e0b;
            margin: 20px 0;
        }
        .code {
            background-color: #f3f4f6;
            padding: 10px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            border: 1px solid #d1d5db;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            border: 1px solid #d1d5db;
            padding: 8px 12px;
            text-align: left;
        }
        th {
            background-color: #f9fafb;
            font-weight: bold;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <h1>Project Report</h1>
    
    <h2>Executive Summary</h2>
    <p>This document provides a comprehensive overview of our project progress and key findings. The project has been <strong>successfully completed</strong> within the allocated timeframe and budget.</p>
    
    <div class="highlight">
        <strong>Key Achievement:</strong> We exceeded our initial goals by 15% and delivered the project 2 weeks ahead of schedule.
    </div>
    
    <h2>Technical Implementation</h2>
    <p>The solution was implemented using modern web technologies:</p>
    
    <ul>
        <li><strong>Frontend:</strong> React with TypeScript</li>
        <li><strong>Backend:</strong> Node.js with Express</li>
        <li><strong>Database:</strong> PostgreSQL</li>
        <li><strong>Deployment:</strong> Docker containers on AWS</li>
    </ul>
    
    <h2>Performance Metrics</h2>
    <table>
        <thead>
            <tr>
                <th>Metric</th>
                <th>Target</th>
                <th>Achieved</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Response Time</td>
                <td>&lt; 200ms</td>
                <td>150ms</td>
                <td>✅ Exceeded</td>
            </tr>
            <tr>
                <td>Uptime</td>
                <td>99.9%</td>
                <td>99.95%</td>
                <td>✅ Exceeded</td>
            </tr>
            <tr>
                <td>User Satisfaction</td>
                <td>85%</td>
                <td>92%</td>
                <td>✅ Exceeded</td>
            </tr>
        </tbody>
    </table>
    
    <h2>Code Example</h2>
    <div class="code">
function generateReport(data) {
    const processed = data.map(item => ({
        ...item,
        timestamp: new Date().toISOString()
    }));
    
    return {
        status: 'success',
        data: processed,
        count: processed.length
    };
}
    </div>
    
    <h2>Conclusion</h2>
    <p>The project has been a resounding success, demonstrating our team's ability to deliver high-quality solutions on time and within budget. We look forward to the next phase of development.</p>
    
    <div class="footer">
        Generated with Helpful Developer Tools - HTML to PDF Converter
    </div>
</body>
</html>`;
    
    setInput(sample);
    setFileName('project-report');
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">HTML to PDF Converter</h1>
          <p className="text-gray-600">
            Convert HTML documents to PDF files with support for CSS styling and complex layouts.
          </p>
        </div>

        {/* Settings Panel */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-6">
          <div className="p-4 bg-gray-50 border-b rounded-t-lg">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-800">PDF Generation Settings</h3>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File Name
                  </label>
                  <input
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="document"
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Conversion Method
                  </label>
                  <select
                    value={conversionMethod}
                    onChange={(e) => setConversionMethod(e.target.value as 'html' | 'canvas')}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="html">HTML (Better for text)</option>
                    <option value="canvas">Canvas (Better for complex layouts)</option>
                  </select>
                </div>
                
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setPreviewMode('code')}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      previewMode === 'code'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Code className="h-4 w-4" />
                    <span>Code</span>
                  </button>
                  <button
                    onClick={() => setPreviewMode('preview')}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      previewMode === 'preview'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Eye className="h-4 w-4" />
                    <span>Preview</span>
                  </button>
                </div>
              </div>
              
              <button
                onClick={generatePdf}
                disabled={!input.trim() || processing}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  input.trim() && !processing
                    ? 'bg-orange-600 text-white hover:bg-orange-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Download className="h-5 w-5" />
                <span>{processing ? 'Generating PDF...' : 'Download PDF'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-400px)]">
          {/* Input Panel */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-800">HTML Input</h3>
              <div className="flex items-center space-x-2">
                <label className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                  <Upload className="h-4 w-4" />
                  <span className="text-sm font-medium">Upload HTML</span>
                  <input
                    type="file"
                    accept=".html,.htm,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={loadSampleData}
                  className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  Load Sample
                </button>
                <button
                  onClick={handleCopy}
                  disabled={!input}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                    input
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleClear}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                  title="Clear input"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 p-4">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter HTML content here or upload a file..."
                className="w-full h-full resize-none border-0 outline-none font-mono text-sm leading-relaxed"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Preview Panel */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col">
            <div className="flex items-center space-x-2 p-4 bg-gray-50 border-b rounded-t-lg">
              {previewMode === 'code' ? (
                <Code className="h-5 w-5 text-blue-600" />
              ) : (
                <Eye className="h-5 w-5 text-green-600" />
              )}
              <h3 className="text-lg font-semibold text-gray-800">
                {previewMode === 'code' ? 'HTML Source' : 'Live Preview'}
              </h3>
            </div>
            
            <div className="flex-1 p-4 overflow-auto">
              {previewMode === 'code' ? (
                <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                  {input || 'HTML content will appear here...'}
                </pre>
              ) : (
                <div className="border border-gray-200 rounded-lg p-4 bg-white">
                  {input ? (
                    <div dangerouslySetInnerHTML={{ __html: input }} />
                  ) : (
                    <p className="text-gray-500">HTML preview will appear here...</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 bg-orange-50 rounded-lg p-4">
          <h4 className="font-semibold text-orange-900 mb-2">HTML to PDF Features</h4>
          <div className="text-sm text-orange-800 space-y-1">
            <p><strong>CSS Support:</strong> Inline styles, internal stylesheets, and most CSS properties</p>
            <p><strong>HTML Method:</strong> Better for text-heavy documents with good typography</p>
            <p><strong>Canvas Method:</strong> Better for complex layouts and visual elements</p>
            <p><strong>File Upload:</strong> Upload HTML files directly or paste content</p>
            <p><strong>Live Preview:</strong> See how your HTML will render before generating PDF</p>
            <p><strong>Professional Output:</strong> A4 format with proper margins and page breaks</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HtmlPdfConverter;