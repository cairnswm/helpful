import React, { useState, useCallback } from 'react';
import { Copy, Check, RotateCcw, FileX, AlertCircle, CheckCircle } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import InfoSection from '../components/InfoSection';

const XmlFormatter: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [indentSize, setIndentSize] = useState(2);

  const formatXml = (xmlString: string, indent: number = 2): string => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
      
      // Check for parsing errors
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        throw new Error('Invalid XML: ' + parserError.textContent);
      }

      // Format the XML
      const serializer = new XMLSerializer();
      const formatted = serializer.serializeToString(xmlDoc);
      
      // Add proper indentation
      return formatXmlString(formatted, indent);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to format XML');
    }
  };

  const formatXmlString = (xml: string, indent: number): string => {
    const PADDING = ' '.repeat(indent);
    const reg = /(>)(<)(\/*)/g;
    let formatted = xml.replace(reg, '$1\n$2$3');
    
    let pad = 0;
    return formatted.split('\n').map(line => {
      let indent = 0;
      if (line.match(/.+<\/\w[^>]*>$/)) {
        indent = 0;
      } else if (line.match(/^<\/\w/) && pad !== 0) {
        pad -= 1;
      } else if (line.match(/^<\w[^>]*[^\/]>.*$/)) {
        indent = 1;
      } else {
        indent = 0;
      }
      
      const padding = PADDING.repeat(pad);
      pad += indent;
      
      return padding + line;
    }).join('\n');
  };

  const validateXml = (xmlString: string): boolean => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
      const parserError = xmlDoc.querySelector('parsererror');
      return !parserError;
    } catch {
      return false;
    }
  };

  const minifyXml = (xmlString: string): string => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
      
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        throw new Error('Invalid XML: ' + parserError.textContent);
      }

      const serializer = new XMLSerializer();
      return serializer.serializeToString(xmlDoc)
        .replace(/>\s+</g, '><')
        .replace(/\s+/g, ' ')
        .trim();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to minify XML');
    }
  };

  const processInput = useCallback((value: string, format: boolean = true) => {
    if (!value.trim()) {
      setOutput('');
      setIsValid(null);
      setError('');
      return;
    }

    try {
      const isValidXml = validateXml(value);
      setIsValid(isValidXml);
      
      if (isValidXml) {
        const result = format ? formatXml(value, indentSize) : minifyXml(value);
        setOutput(result);
        setError('');
      } else {
        setOutput('');
        setError('Invalid XML format');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Processing failed');
      setOutput('');
      setIsValid(false);
    }
  }, [indentSize]);

  const handleInputChange = (value: string) => {
    setInput(value);
    processInput(value);
  };

  const handleFormat = () => {
    processInput(input, true);
  };

  const handleMinify = () => {
    processInput(input, false);
  };

  const handleCopy = async () => {
    if (!output) return;
    
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setIsValid(null);
    setError('');
  };

  const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<bookstore><book id="1"><title>The Great Gatsby</title><author>F. Scott Fitzgerald</author><price currency="USD">12.99</price><category>Fiction</category></book><book id="2"><title>To Kill a Mockingbird</title><author>Harper Lee</author><price currency="USD">14.99</price><category>Fiction</category></book></bookstore>`;

  const handleLoadSample = () => {
    setInput(sampleXml);
    processInput(sampleXml);
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="XML Formatter & Validator"
          description="Format, validate, and minify XML documents with syntax highlighting and error detection."
        />

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-6">
          <div className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Indent Size:</label>
                <select
                  value={indentSize}
                  onChange={(e) => {
                    setIndentSize(parseInt(e.target.value));
                    if (input) processInput(input, true);
                  }}
                  className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={2}>2 spaces</option>
                  <option value={4}>4 spaces</option>
                  <option value={8}>8 spaces</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleFormat}
                  disabled={!input.trim()}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    input.trim()
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Format
                </button>
                <button
                  onClick={handleMinify}
                  disabled={!input.trim()}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    input.trim()
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Minify
                </button>
                <button
                  onClick={handleLoadSample}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  Load Sample
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Validation Status */}
        {isValid !== null && (
          <div className="mb-6">
            <div className={`flex items-center space-x-2 p-3 rounded-lg ${
              isValid 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {isValid ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <span className="font-medium">
                {isValid ? 'Valid XML Document' : `Invalid XML: ${error}`}
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-400px)]">
          {/* Input Panel */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
              <div className="flex items-center space-x-2">
                <FileX className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">XML Input</h3>
              </div>
              <button
                onClick={handleClear}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                title="Clear input"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            
            <div className="flex-1 p-4">
              <textarea
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Paste your XML document here..."
                className="w-full h-full resize-none border-0 outline-none font-mono text-sm leading-relaxed"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Output Panel */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-800">Formatted XML</h3>
              <button
                onClick={handleCopy}
                disabled={!output}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                  output
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                title="Copy output"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span className="text-sm font-medium">
                  {copied ? 'Copied!' : 'Copy'}
                </span>
              </button>
            </div>
            
            <div className="flex-1 p-4 overflow-auto">
              <pre className="text-sm leading-relaxed font-mono whitespace-pre-wrap text-gray-800">
                {output || 'Formatted XML will appear here...'}
              </pre>
            </div>
          </div>
        </div>

        {/* XML Information */}
        <InfoSection 
          title="XML Processing Features"
          items={[
            {
              label: "Validation",
              description: "Checks XML syntax and structure for errors"
            },
            {
              label: "Formatting",
              description: "Adds proper indentation and line breaks for readability"
            },
            {
              label: "Minification",
              description: "Removes unnecessary whitespace to reduce file size"
            },
            {
              label: "Error Detection",
              description: "Identifies and reports XML parsing errors"
            },
            {
              label: "Customization",
              description: "Adjustable indentation size for formatting preferences"
            }
          ]}
          useCases="XML validation, configuration files, data exchange, API responses"
        />
      </div>
    </div>
  );
};

export default XmlFormatter;