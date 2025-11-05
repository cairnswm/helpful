import React, { useState, useCallback } from 'react';
import InfoSection from '../components/InfoSection';
import PageHeader from '../components/PageHeader';
import { Copy, Check, RotateCcw, ArrowRightLeft, Download } from 'lucide-react';

const JsonCsvConverter: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'jsonToCsv' | 'csvToJson'>('jsonToCsv');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [delimiter, setDelimiter] = useState(',');
  const [includeHeaders, setIncludeHeaders] = useState(true);

  const jsonToCsv = (jsonString: string): string => {
    try {
      const data = JSON.parse(jsonString);
      
      if (!Array.isArray(data)) {
        throw new Error('JSON must be an array of objects');
      }
      
      if (data.length === 0) {
        return '';
      }
      
      // Get all unique keys from all objects
      const allKeys = new Set<string>();
      data.forEach(item => {
        if (typeof item === 'object' && item !== null) {
          Object.keys(item).forEach(key => allKeys.add(key));
        }
      });
      
      const headers = Array.from(allKeys);
      const csvRows: string[] = [];
      
      // Add headers if enabled
      if (includeHeaders) {
        csvRows.push(headers.map(header => `"${header}"`).join(delimiter));
      }
      
      // Add data rows
      data.forEach(item => {
        const row = headers.map(header => {
          const value = item && typeof item === 'object' ? item[header] : '';
          const stringValue = value === null || value === undefined ? '' : String(value);
          return `"${stringValue.replace(/"/g, '""')}"`;
        });
        csvRows.push(row.join(delimiter));
      });
      
      return csvRows.join('\n');
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to convert JSON to CSV');
    }
  };

  const csvToJson = (csvString: string): string => {
    try {
      const lines = csvString.trim().split('\n');
      if (lines.length === 0) {
        return '[]';
      }
      
      const parseCSVLine = (line: string): string[] => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          
          if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
              current += '"';
              i++; // Skip next quote
            } else {
              inQuotes = !inQuotes;
            }
          } else if (char === delimiter && !inQuotes) {
            result.push(current);
            current = '';
          } else {
            current += char;
          }
        }
        
        result.push(current);
        return result;
      };
      
      const headers = parseCSVLine(lines[0]);
      const startIndex = includeHeaders ? 1 : 0;
      
      const data = lines.slice(startIndex).map((line, index) => {
        const values = parseCSVLine(line);
        const obj: Record<string, any> = {};
        
        headers.forEach((header, i) => {
          const key = includeHeaders ? header : `column_${i + 1}`;
          let value: any = values[i] || '';
          
          // Try to parse as number or boolean
          if (value === 'true') value = true;
          else if (value === 'false') value = false;
          else if (value === 'null') value = null;
          else if (value === '') value = null;
          else if (!isNaN(Number(value)) && value !== '') value = Number(value);
          
          obj[key] = value;
        });
        
        return obj;
      });
      
      return JSON.stringify(data, null, 2);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to convert CSV to JSON');
    }
  };

  const processInput = useCallback((value: string, currentMode: 'jsonToCsv' | 'csvToJson') => {
    if (!value.trim()) {
      setOutput('');
      setError('');
      return;
    }

    try {
      if (currentMode === 'jsonToCsv') {
        const result = jsonToCsv(value);
        setOutput(result);
        setError('');
      } else {
        const result = csvToJson(value);
        setOutput(result);
        setError('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed');
      setOutput('');
    }
  }, [delimiter, includeHeaders]);

  const handleInputChange = (value: string) => {
    setInput(value);
    processInput(value, mode);
  };

  const handleModeToggle = () => {
    const newMode = mode === 'jsonToCsv' ? 'csvToJson' : 'jsonToCsv';
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
    
    const blob = new Blob([output], { type: mode === 'jsonToCsv' ? 'text/csv' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = mode === 'jsonToCsv' ? 'data.csv' : 'data.json';
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

  const sampleJson = `[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "age": 30,
    "active": true
  },
  {
    "id": 2,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "age": 25,
    "active": false
  },
  {
    "id": 3,
    "name": "Bob Johnson",
    "email": "bob@example.com",
    "age": 35,
    "active": true
  }
]`;

  const sampleCsv = `"id","name","email","age","active"
"1","John Doe","john@example.com","30","true"
"2","Jane Smith","jane@example.com","25","false"
"3","Bob Johnson","bob@example.com","35","true"`;

  const handleLoadSample = () => {
    const sample = mode === 'jsonToCsv' ? sampleJson : sampleCsv;
    setInput(sample);
    processInput(sample, mode);
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="JSON/CSV Converter"
          description="Transform JSON data to CSV format and vice versa for data processing or reporting."
        />

        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex bg-gray-100 rounded-lg p-1" role="group" aria-label="Conversion mode selection">
              <button
                onClick={() => {
                  setMode('jsonToCsv');
                  processInput(input, 'jsonToCsv');
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === 'jsonToCsv'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                aria-pressed={mode === 'jsonToCsv'}
                aria-label="Convert JSON to CSV"
              >
                JSON to CSV
              </button>
              <button
                onClick={() => {
                  setMode('csvToJson');
                  processInput(input, 'csvToJson');
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === 'csvToJson'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                aria-pressed={mode === 'csvToJson'}
                aria-label="Convert CSV to JSON"
              >
                CSV to JSON
              </button>
            </div>
            
            <button
              onClick={handleModeToggle}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              aria-label="Swap input and output"
              title="Swap input and output"
            >
              <ArrowRightLeft className="h-4 w-4" aria-hidden="true" />
              <span className="text-sm font-medium">Swap</span>
            </button>
          </div>
          
          <button
            onClick={handleLoadSample}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            aria-label="Load sample data"
          >
            Load Sample
          </button>
        </div>

        {/* Settings */}
        <section className="bg-white rounded-lg shadow-lg border border-gray-200 mb-6" aria-labelledby="conversion-settings-heading">
          <div className="p-4 bg-gray-50 border-b rounded-t-lg">
            <h2 id="conversion-settings-heading" className="text-lg font-semibold text-gray-800">Conversion Settings</h2>
          </div>
          <div className="p-4">
            <div className="flex items-center space-x-6">
              <div>
                <label htmlFor="csv-delimiter" className="block text-sm font-medium text-gray-700 mb-2">
                  CSV Delimiter
                </label>
                <select
                  id="csv-delimiter"
                  value={delimiter}
                  onChange={(e) => {
                    setDelimiter(e.target.value);
                    processInput(input, mode);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Select CSV delimiter character"
                >
                  <option value=",">Comma (,)</option>
                  <option value=";">Semicolon (;)</option>
                  <option value="\t">Tab</option>
                  <option value="|">Pipe (|)</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeHeaders"
                  checked={includeHeaders}
                  onChange={(e) => {
                    setIncludeHeaders(e.target.checked);
                    processInput(input, mode);
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="includeHeaders" className="ml-2 text-sm font-medium text-gray-700">
                  Include headers
                </label>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-400px)]">
          {/* Input Panel */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-800">
                {mode === 'jsonToCsv' ? 'JSON Input' : 'CSV Input'}
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
                  mode === 'jsonToCsv' 
                    ? 'Enter JSON array to convert to CSV...\n\nExample:\n[\n  {"name": "John", "age": 30},\n  {"name": "Jane", "age": 25}\n]'
                    : 'Enter CSV data to convert to JSON...\n\nExample:\n"name","age"\n"John","30"\n"Jane","25"'
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
                {mode === 'jsonToCsv' ? 'CSV Output' : 'JSON Output'}
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
                  placeholder={`${mode === 'jsonToCsv' ? 'CSV' : 'JSON'} output will appear here...`}
                  className="w-full h-full resize-none border-0 outline-none font-mono text-sm leading-relaxed bg-gray-50"
                />
              )}
            </div>
          </div>
        </div>

        <InfoSection 
          title="JSON ↔ CSV Conversion"
          items={[
            {
              label: "JSON to CSV",
              description: "Converts JSON arrays to CSV format with customizable delimiters"
            },
            {
              label: "CSV to JSON",
              description: "Parses CSV data and converts to structured JSON arrays"
            },
            {
              label: "Data types",
              description: "Automatically detects and converts numbers, booleans, and null values"
            },
            {
              label: "Headers",
              description: "Option to include/exclude headers in CSV output"
            },
            {
              label: "Download",
              description: "Save converted data directly as CSV or JSON files"
            }
          ]}
          useCases="Data analysis, spreadsheet import/export, API integration, data migration"
        />
      </div>
    </div>
  );
};

export default JsonCsvConverter;