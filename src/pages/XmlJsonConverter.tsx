import React, { useState, useCallback } from 'react';
import { Copy, Check, RotateCcw, ArrowRightLeft, Download } from 'lucide-react';

const XmlJsonConverter: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'xmlToJson' | 'jsonToXml'>('xmlToJson');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const xmlToJson = (xmlString: string): string => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
      
      // Check for parsing errors
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        throw new Error('Invalid XML: ' + parserError.textContent);
      }

      const xmlToObj = (node: Element | Document): any => {
        const obj: any = {};
        
        // Handle document node
        if (node.nodeType === Node.DOCUMENT_NODE) {
          const documentElement = (node as Document).documentElement;
          if (documentElement) {
            return { [documentElement.tagName]: xmlToObj(documentElement) };
          }
          return {};
        }
        
        const element = node as Element;
        
        // Handle attributes
        if (element.attributes && element.attributes.length > 0) {
          obj['@attributes'] = {};
          for (let i = 0; i < element.attributes.length; i++) {
            const attr = element.attributes[i];
            obj['@attributes'][attr.name] = attr.value;
          }
        }
        
        // Handle child nodes
        const children = Array.from(element.childNodes);
        const textContent = children
          .filter(child => child.nodeType === Node.TEXT_NODE)
          .map(child => child.textContent?.trim())
          .filter(text => text)
          .join(' ');
        
        const elementChildren = children.filter(child => child.nodeType === Node.ELEMENT_NODE) as Element[];
        
        if (elementChildren.length === 0) {
          // Leaf node with text content
          if (textContent) {
            return Object.keys(obj).length > 0 ? { ...obj, '#text': textContent } : textContent;
          }
          return Object.keys(obj).length > 0 ? obj : null;
        }
        
        // Group children by tag name
        const childGroups: { [key: string]: Element[] } = {};
        elementChildren.forEach(child => {
          const tagName = child.tagName;
          if (!childGroups[tagName]) {
            childGroups[tagName] = [];
          }
          childGroups[tagName].push(child);
        });
        
        // Convert child groups
        Object.keys(childGroups).forEach(tagName => {
          const group = childGroups[tagName];
          if (group.length === 1) {
            obj[tagName] = xmlToObj(group[0]);
          } else {
            obj[tagName] = group.map(child => xmlToObj(child));
          }
        });
        
        // Add text content if present alongside elements
        if (textContent && elementChildren.length > 0) {
          obj['#text'] = textContent;
        }
        
        return obj;
      };
      
      const result = xmlToObj(xmlDoc);
      return JSON.stringify(result, null, 2);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to convert XML to JSON');
    }
  };

  const jsonToXml = (jsonString: string): string => {
    try {
      const obj = JSON.parse(jsonString);
      
      const objToXml = (obj: any, rootName?: string): string => {
        if (typeof obj !== 'object' || obj === null) {
          return String(obj);
        }
        
        if (Array.isArray(obj)) {
          return obj.map(item => objToXml(item, rootName)).join('');
        }
        
        let xml = '';
        
        Object.keys(obj).forEach(key => {
          if (key === '@attributes') {
            return; // Handle attributes separately
          }
          
          if (key === '#text') {
            xml += obj[key];
            return;
          }
          
          const value = obj[key];
          const attributes = obj['@attributes'] || {};
          const attrString = Object.keys(attributes)
            .map(attr => ` ${attr}="${attributes[attr]}"`)
            .join('');
          
          if (Array.isArray(value)) {
            value.forEach(item => {
              xml += `<${key}${attrString}>${objToXml(item)}</${key}>`;
            });
          } else if (typeof value === 'object' && value !== null) {
            xml += `<${key}${attrString}>${objToXml(value)}</${key}>`;
          } else {
            xml += `<${key}${attrString}>${value}</${key}>`;
          }
        });
        
        return xml;
      };
      
      // Handle root element
      const rootKeys = Object.keys(obj);
      if (rootKeys.length === 1) {
        const rootKey = rootKeys[0];
        const rootValue = obj[rootKey];
        const attributes = rootValue['@attributes'] || {};
        const attrString = Object.keys(attributes)
          .map(attr => ` ${attr}="${attributes[attr]}"`)
          .join('');
        
        return `<?xml version="1.0" encoding="UTF-8"?>\n<${rootKey}${attrString}>${objToXml(rootValue)}</${rootKey}>`;
      } else {
        return `<?xml version="1.0" encoding="UTF-8"?>\n<root>${objToXml(obj)}</root>`;
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to convert JSON to XML');
    }
  };

  const processInput = useCallback((value: string, currentMode: 'xmlToJson' | 'jsonToXml') => {
    if (!value.trim()) {
      setOutput('');
      setError('');
      return;
    }

    try {
      if (currentMode === 'xmlToJson') {
        const result = xmlToJson(value);
        setOutput(result);
        setError('');
      } else {
        const result = jsonToXml(value);
        setOutput(result);
        setError('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed');
      setOutput('');
    }
  }, []);

  const handleInputChange = (value: string) => {
    setInput(value);
    processInput(value, mode);
  };

  const handleModeToggle = () => {
    const newMode = mode === 'xmlToJson' ? 'jsonToXml' : 'xmlToJson';
    setMode(newMode);
    setInput(output);
    processInput(output, newMode);
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

  const handleDownload = () => {
    if (!output) return;
    
    const blob = new Blob([output], { 
      type: mode === 'xmlToJson' ? 'application/json' : 'text/xml' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = mode === 'xmlToJson' ? 'data.json' : 'data.xml';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<bookstore>
  <book id="1" category="fiction">
    <title>The Great Gatsby</title>
    <author>F. Scott Fitzgerald</author>
    <price currency="USD">12.99</price>
    <published>1925</published>
  </book>
  <book id="2" category="fiction">
    <title>To Kill a Mockingbird</title>
    <author>Harper Lee</author>
    <price currency="USD">14.99</price>
    <published>1960</published>
  </book>
  <metadata>
    <total>2</total>
    <updated>2024-01-01</updated>
  </metadata>
</bookstore>`;

  const sampleJson = `{
  "bookstore": {
    "book": [
      {
        "@attributes": {
          "id": "1",
          "category": "fiction"
        },
        "title": "The Great Gatsby",
        "author": "F. Scott Fitzgerald",
        "price": {
          "@attributes": {
            "currency": "USD"
          },
          "#text": "12.99"
        },
        "published": "1925"
      },
      {
        "@attributes": {
          "id": "2",
          "category": "fiction"
        },
        "title": "To Kill a Mockingbird",
        "author": "Harper Lee",
        "price": {
          "@attributes": {
            "currency": "USD"
          },
          "#text": "14.99"
        },
        "published": "1960"
      }
    ],
    "metadata": {
      "total": "2",
      "updated": "2024-01-01"
    }
  }
}`;

  const handleLoadSample = () => {
    const sample = mode === 'xmlToJson' ? sampleXml : sampleJson;
    setInput(sample);
    processInput(sample, mode);
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">XML ↔ JSON Converter</h1>
          <p className="text-gray-600">
            Transform XML documents to JSON and vice versa with structure and attribute preservation.
          </p>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => {
                  setMode('xmlToJson');
                  processInput(input, 'xmlToJson');
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === 'xmlToJson'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                XML to JSON
              </button>
              <button
                onClick={() => {
                  setMode('jsonToXml');
                  processInput(input, 'jsonToXml');
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === 'jsonToXml'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                JSON to XML
              </button>
            </div>
            
            <button
              onClick={handleModeToggle}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              title="Swap input and output"
            >
              <ArrowRightLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Swap</span>
            </button>
          </div>
          
          <button
            onClick={handleLoadSample}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Load Sample
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-320px)]">
          {/* Input Panel */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-800">
                {mode === 'xmlToJson' ? 'XML Input' : 'JSON Input'}
              </h3>
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
                placeholder={
                  mode === 'xmlToJson' 
                    ? 'Enter XML to convert to JSON...\n\nExample:\n<?xml version="1.0"?>\n<root>\n  <item id="1">Value</item>\n</root>'
                    : 'Enter JSON to convert to XML...\n\nExample:\n{\n  "root": {\n    "item": {\n      "@attributes": {"id": "1"},\n      "#text": "Value"\n    }\n  }\n}'
                }
                className="w-full h-full resize-none border-0 outline-none font-mono text-sm leading-relaxed"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Output Panel */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-800">
                {mode === 'xmlToJson' ? 'JSON Output' : 'XML Output'}
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleDownload}
                  disabled={!output}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    output
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  title="Download file"
                >
                  <Download className="h-4 w-4" />
                  <span className="text-sm font-medium">Download</span>
                </button>
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
            </div>
            
            <div className="flex-1 p-4">
              {error ? (
                <div className="text-red-600 text-sm font-medium bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              ) : (
                <textarea
                  value={output}
                  readOnly
                  placeholder={`${mode === 'xmlToJson' ? 'JSON' : 'XML'} output will appear here...`}
                  className="w-full h-full resize-none border-0 outline-none font-mono text-sm leading-relaxed bg-gray-50"
                />
              )}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 bg-orange-50 rounded-lg p-4">
          <h4 className="font-semibold text-orange-900 mb-2">XML ↔ JSON Conversion</h4>
          <div className="text-sm text-orange-800 space-y-1">
            <p><strong>XML:</strong> Extensible Markup Language for structured data with attributes and namespaces</p>
            <p><strong>JSON:</strong> JavaScript Object Notation, lightweight data interchange format</p>
            <p><strong>Attributes:</strong> XML attributes are preserved as @attributes objects in JSON</p>
            <p><strong>Text content:</strong> Mixed content is preserved as #text properties</p>
            <p><strong>Use cases:</strong> API data transformation, configuration conversion, data migration</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default XmlJsonConverter;