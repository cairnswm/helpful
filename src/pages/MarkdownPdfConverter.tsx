import React, { useState, useCallback } from 'react';
import { Copy, Check, RotateCcw, Download, FileText, Upload, Eye } from 'lucide-react';
import { marked } from 'marked';
import jsPDF from 'jspdf';
import PageHeader from '../components/PageHeader';
import InfoSection from '../components/InfoSection';

const MarkdownPdfConverter: React.FC = () => {
  const [input, setInput] = useState('');
  const [fileName, setFileName] = useState('document');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [previewMode, setPreviewMode] = useState<'markdown' | 'html'>('html');

  // Configure marked options
  marked.setOptions({
    breaks: true,
    gfm: true,
    headerIds: false,
    mangle: false
  });

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

  const convertMarkdownToHtml = (markdown: string): string => {
    try {
      return marked(markdown);
    } catch (err) {
      throw new Error('Failed to convert Markdown to HTML');
    }
  };

  const generatePdf = async () => {
    if (!input.trim()) {
      setError('Please enter Markdown content or upload a file');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      // Convert markdown to HTML
      const html = convertMarkdownToHtml(input);
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Parse HTML and add to PDF
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      tempDiv.style.width = '190mm';
      tempDiv.style.padding = '10mm';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.style.fontSize = '12px';
      tempDiv.style.lineHeight = '1.6';
      tempDiv.style.color = '#333';
      
      // Style headers
      const headers = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
      headers.forEach((header, index) => {
        const element = header as HTMLElement;
        element.style.marginTop = index === 0 ? '0' : '20px';
        element.style.marginBottom = '10px';
        element.style.fontWeight = 'bold';
        
        switch (header.tagName) {
          case 'H1':
            element.style.fontSize = '30px';
            element.style.color = '#2563eb';
            break;
          case 'H2':
            element.style.fontSize = '24px';
            element.style.color = '#3b82f6';
            break;
          case 'H3':
            element.style.fontSize = '18px';
            element.style.color = '#60a5fa';
            break;
          default:
            element.style.fontSize = '16px';
            element.style.color = '#93c5fd';
        }
      });

      // Style paragraphs
      const paragraphs = tempDiv.querySelectorAll('p');
      paragraphs.forEach(p => {
        const element = p as HTMLElement;
        element.style.marginBottom = '10px';
        element.style.textAlign = 'justify';
      });

      // Style code blocks
      const codeBlocks = tempDiv.querySelectorAll('pre, code');
      codeBlocks.forEach(code => {
        const element = code as HTMLElement;
        element.style.backgroundColor = '#f3f4f6';
        element.style.padding = '8px';
        element.style.borderRadius = '4px';
        element.style.fontFamily = 'Courier, monospace';
        element.style.fontSize = '11px';
        element.style.border = '1px solid #d1d5db';
      });

      // Style lists
      const lists = tempDiv.querySelectorAll('ul, ol');
      lists.forEach(list => {
        const element = list as HTMLElement;
        element.style.marginBottom = '10px';
        element.style.paddingLeft = '20px';
      });

      // Style blockquotes
      const blockquotes = tempDiv.querySelectorAll('blockquote');
      blockquotes.forEach(quote => {
        const element = quote as HTMLElement;
        element.style.borderLeft = '4px solid #3b82f6';
        element.style.paddingLeft = '16px';
        element.style.marginLeft = '0';
        element.style.fontStyle = 'italic';
        element.style.color = '#6b7280';
      });

      // Add content to PDF using html method
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
      setError(err instanceof Error ? err.message : 'Failed to generate PDF');
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
    const sample = `# Project Documentation

## Overview

This is a **comprehensive** guide to our project. It includes various *formatting* examples and demonstrates the capabilities of our Markdown to PDF converter.

## Features

### Core Functionality

- **Bold text** and *italic text* support
- \`inline code\` formatting
- Code blocks with syntax highlighting
- Lists and nested items
- Tables and structured data

### Code Example

\`\`\`javascript
function generateReport() {
  const data = fetchData();
  const processed = processData(data);
  return createPDF(processed);
}
\`\`\`

### Task List

1. ✅ Implement Markdown parsing
2. ✅ Add PDF generation
3. 🔄 Style customization
4. ⏳ Advanced formatting

### Important Notes

> **Note:** This converter supports most standard Markdown syntax including headers, lists, code blocks, and basic formatting.

> **Warning:** Complex HTML elements may not render perfectly in the PDF output.

## Technical Details

| Feature | Status | Priority |
|---------|--------|----------|
| Headers | ✅ Complete | High |
| Lists | ✅ Complete | High |
| Code | ✅ Complete | Medium |
| Tables | 🔄 Partial | Low |

## Conclusion

This tool provides a simple way to convert Markdown documents to professional-looking PDF files suitable for documentation, reports, and presentations.

---

*Generated with Helpful Developer Tools*`;
    
    setInput(sample);
    setFileName('project-documentation');
  };

  const htmlPreview = input ? convertMarkdownToHtml(input) : '';

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <PageHeader 
          title="Markdown to PDF Converter"
          description="Convert Markdown documents to professional PDF files with styled formatting."
        />

        {/* Settings Panel */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-6">
          <div className="p-4 bg-gray-50 border-b rounded-t-lg">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-800">PDF Generation Settings</h3>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
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
                
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setPreviewMode('markdown')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      previewMode === 'markdown'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Markdown
                  </button>
                  <button
                    onClick={() => setPreviewMode('html')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      previewMode === 'html'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Preview
                  </button>
                </div>
              </div>
              
              <button
                onClick={generatePdf}
                disabled={!input.trim() || processing}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  input.trim() && !processing
                    ? 'bg-red-600 text-white hover:bg-red-700'
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-800">Markdown Input</h3>
              <div className="flex items-center space-x-2">
                <label className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                  <Upload className="h-4 w-4" />
                  <span className="text-sm font-medium">Upload MD</span>
                  <input
                    type="file"
                    accept=".md,.markdown,.txt"
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
            
            <div className="flex-1 p-4 overflow-auto" style={{ minHeight: "50vh", maxHeight: 'calc(100vh - 400px)' }}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter Markdown content here or upload a file..."
                className="w-full h-full resize-none border-0 outline-none font-mono text-sm leading-relaxed"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Preview Panel */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col">
            <div className="flex items-center space-x-2 p-4 bg-gray-50 border-b rounded-t-lg">
              <Eye className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-800">
                {previewMode === 'markdown' ? 'Markdown Source' : 'HTML Preview'}
              </h3>
            </div>
            
            <div className="flex-1 p-4 overflow-auto"  style={{ minHeight: "50vh", maxHeight: 'calc(100vh - 400px)'}}>
              {previewMode === 'markdown' ? (
                <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                  {input || 'Markdown content will appear here...'}
                </pre>
              ) : (
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: htmlPreview || '<p class="text-gray-500">HTML preview will appear here...</p>' 
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Info */}
        <InfoSection 
          title="Markdown to PDF Features"
          items={[
            {
              label: "Styled output",
              description: "Headers, paragraphs, and code blocks are professionally formatted"
            },
            {
              label: "Syntax support",
              description: "Bold, italic, code, lists, blockquotes, and tables"
            },
            {
              label: "Custom styling",
              description: "Headers are color-coded and properly spaced"
            },
            {
              label: "File upload",
              description: "Upload Markdown files directly or paste content"
            },
            {
              label: "Live preview",
              description: "See how your Markdown will look before generating PDF"
            },
            {
              label: "Professional output",
              description: "A4 format with proper margins and typography"
            }
          ]}
        />
      </div>
    </div>
  );
};

export default MarkdownPdfConverter;