import React, { useState, useCallback } from 'react';
import { Copy, Check, RotateCcw, Download, FileSpreadsheet, Upload } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import InfoSection from '../components/InfoSection';
import * as XLSX from 'xlsx';

const JsonXlsxConverter: React.FC = () => {
  const [input, setInput] = useState('');
  const [fileName, setFileName] = useState('data');
  const [sheetName, setSheetName] = useState('Sheet1');
  const [flattenNested, setFlattenNested] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

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

  const flattenObject = (obj: any, prefix = ''): any => {
    const flattened: any = {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        
        if (obj[key] === null || obj[key] === undefined) {
          flattened[newKey] = '';
        } else if (Array.isArray(obj[key])) {
          flattened[newKey] = JSON.stringify(obj[key]);
        } else if (typeof obj[key] === 'object') {
          if (flattenNested) {
            Object.assign(flattened, flattenObject(obj[key], newKey));
          } else {
            flattened[newKey] = JSON.stringify(obj[key]);
          }
        } else {
          flattened[newKey] = obj[key];
        }
      }
    }
    
    return flattened;
  };

  const processJsonData = useCallback((jsonText: string) => {
    try {
      const parsed = JSON.parse(jsonText);
      
      if (!parsed) {
        throw new Error('No data to convert');
      }

      let data: any[];
      
      if (Array.isArray(parsed)) {
        data = parsed;
      } else if (typeof parsed === 'object') {
        // If it's a single object, wrap it in an array
        data = [parsed];
      } else {
        throw new Error('JSON must be an object or array of objects');
      }

      // Flatten nested objects if requested
      if (flattenNested) {
        data = data.map(item => flattenObject(item));
      } else {
        // Convert nested objects/arrays to JSON strings
        data = data.map(item => {
          const processed: any = {};
          for (const key in item) {
            if (item.hasOwnProperty(key)) {
              const value = item[key];
              if (value === null || value === undefined) {
                processed[key] = '';
              } else if (typeof value === 'object') {
                processed[key] = JSON.stringify(value);
              } else {
                processed[key] = value;
              }
            }
          }
          return processed;
        });
      }

      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to parse JSON');
    }
  }, [flattenNested]);

  const generateXlsx = async () => {
    if (!input.trim()) {
      setError('Please enter JSON data or upload a file');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const data = processJsonData(input);
      
      if (!data || data.length === 0) {
        throw new Error('No data to convert');
      }

      // Create a new workbook
      const workbook = XLSX.utils.book_new();
      
      // Convert data to worksheet
      const worksheet = XLSX.utils.json_to_sheet(data);

      // Auto-size columns
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
      const colWidths: number[] = [];
      
      for (let C = range.s.c; C <= range.e.c; ++C) {
        let maxWidth = 10;
        for (let R = range.s.r; R <= range.e.r; ++R) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          const cell = worksheet[cellAddress];
          if (cell && cell.v) {
            const cellLength = cell.v.toString().length;
            maxWidth = Math.max(maxWidth, cellLength);
          }
        }
        colWidths[C] = Math.min(maxWidth + 2, 50);
      }
      
      worksheet['!cols'] = colWidths.map(w => ({ width: w }));

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      // Generate and download file
      XLSX.writeFile(workbook, `${fileName}.xlsx`);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate XLSX file');
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
    setFileName('data');
    setSheetName('Sheet1');
  };

  const loadSampleData = () => {
    const sample = `[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "profile": {
      "age": 30,
      "department": "Engineering",
      "skills": ["JavaScript", "React", "Node.js"]
    },
    "salary": 75000,
    "active": true
  },
  {
    "id": 2,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "profile": {
      "age": 28,
      "department": "Marketing",
      "skills": ["SEO", "Content Marketing", "Analytics"]
    },
    "salary": 65000,
    "active": true
  },
  {
    "id": 3,
    "name": "Bob Johnson",
    "email": "bob@example.com",
    "profile": {
      "age": 35,
      "department": "Sales",
      "skills": ["CRM", "Lead Generation", "Negotiation"]
    },
    "salary": 70000,
    "active": false
  }
]`;
    
    setInput(sample);
    setFileName('employees');
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <PageHeader 
          title="JSON to XLSX Converter"
          description="Convert JSON data to Excel XLSX format with support for nested objects and arrays."
        />

        {/* Settings Panel */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-6">
          <div className="p-4 bg-gray-50 border-b rounded-t-lg">
            <div className="flex items-center space-x-2">
              <FileSpreadsheet className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">Conversion Settings</h3>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File Name
                </label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="output filename"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sheet Name
                </label>
                <input
                  type="text"
                  value={sheetName}
                  onChange={(e) => setSheetName(e.target.value)}
                  placeholder="Sheet1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="flattenNested"
                  checked={flattenNested}
                  onChange={(e) => setFlattenNested(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="flattenNested" className="ml-2 text-sm font-medium text-gray-700">
                  Flatten nested objects
                </label>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={generateXlsx}
                  disabled={!input.trim() || processing}
                  className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    input.trim() && !processing
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Download className="h-4 w-4" />
                  <span>{processing ? 'Converting...' : 'Download XLSX'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Input Panel */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
            <h3 className="text-lg font-semibold text-gray-800">JSON Data Input</h3>
            <div className="flex items-center space-x-2">
              <label className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                <Upload className="h-4 w-4" />
                <span className="text-sm font-medium">Upload JSON</span>
                <input
                  type="file"
                  accept=".json,.txt"
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
          
          <div className="p-4">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste JSON data here or upload a file..."
              className="w-full h-64 resize-none border border-gray-300 rounded-lg p-3 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              spellCheck={false}
            />
          </div>
        </div>

        <InfoSection 
          title="JSON to XLSX Conversion Features"
          items={[
            {
              label: "Nested object handling",
              description: "Option to flatten nested objects or convert to JSON strings"
            },
            {
              label: "Array support", 
              description: "Arrays are converted to JSON strings for Excel compatibility"
            },
            {
              label: "Auto-sizing",
              description: "Columns are automatically sized based on content"
            },
            {
              label: "Custom naming",
              description: "Set custom file and sheet names"
            },
            {
              label: "File upload",
              description: "Upload JSON files directly or paste data"
            },
            {
              label: "Excel compatibility",
              description: "Generated files work with Microsoft Excel and other spreadsheet applications"
            }
          ]}
        />
      </div>
    </div>
  );
};

export default JsonXlsxConverter;