import React, { useState, useCallback } from 'react';
import { Copy, Check, RotateCcw, Download, FileSpreadsheet, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

const CsvXlsxConverter: React.FC = () => {
  const [input, setInput] = useState('');
  const [fileName, setFileName] = useState('data');
  const [delimiter, setDelimiter] = useState(',');
  const [hasHeaders, setHasHeaders] = useState(true);
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

  const parseCsvData = useCallback((csvText: string) => {
    try {
      const result = Papa.parse(csvText, {
        delimiter: delimiter,
        header: hasHeaders,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
        transform: (value) => value.trim()
      });

      if (result.errors.length > 0) {
        throw new Error(`CSV parsing error: ${result.errors[0].message}`);
      }

      return result.data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to parse CSV');
    }
  }, [delimiter, hasHeaders]);

  const generateXlsx = async () => {
    if (!input.trim()) {
      setError('Please enter CSV data or upload a file');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const data = parseCsvData(input);
      
      if (!data || data.length === 0) {
        throw new Error('No data to convert');
      }

      // Create a new workbook
      const workbook = XLSX.utils.book_new();
      
      // Convert data to worksheet
      const worksheet = XLSX.utils.json_to_sheet(data, {
        skipHeader: !hasHeaders
      });

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
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

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
  };

  const loadSampleData = () => {
    const sample = `Name,Email,Age,Department,Salary
John Doe,john@example.com,30,Engineering,75000
Jane Smith,jane@example.com,28,Marketing,65000
Bob Johnson,bob@example.com,35,Sales,70000
Alice Brown,alice@example.com,32,Engineering,80000
Charlie Wilson,charlie@example.com,29,Marketing,62000`;
    
    setInput(sample);
    setFileName('employees');
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">CSV to XLSX Converter</h1>
          <p className="text-gray-600">
            Convert CSV files to Excel XLSX format with customizable formatting and auto-sized columns.
          </p>
        </div>

        {/* Settings Panel */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-6">
          <div className="p-4 bg-gray-50 border-b rounded-t-lg">
            <div className="flex items-center space-x-2">
              <FileSpreadsheet className="h-5 w-5 text-green-600" />
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
                  CSV Delimiter
                </label>
                <select
                  value={delimiter}
                  onChange={(e) => setDelimiter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  id="hasHeaders"
                  checked={hasHeaders}
                  onChange={(e) => setHasHeaders(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="hasHeaders" className="ml-2 text-sm font-medium text-gray-700">
                  First row contains headers
                </label>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={generateXlsx}
                  disabled={!input.trim() || processing}
                  className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    input.trim() && !processing
                      ? 'bg-green-600 text-white hover:bg-green-700'
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
            <h3 className="text-lg font-semibold text-gray-800">CSV Data Input</h3>
            <div className="flex items-center space-x-2">
              <label className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                <Upload className="h-4 w-4" />
                <span className="text-sm font-medium">Upload CSV</span>
                <input
                  type="file"
                  accept=".csv,.txt"
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
              placeholder="Paste CSV data here or upload a file..."
              className="w-full h-64 resize-none border border-gray-300 rounded-lg p-3 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 bg-green-50 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-2">CSV to XLSX Conversion Features</h4>
          <div className="text-sm text-green-800 space-y-1">
            <p><strong>Auto-sizing:</strong> Columns are automatically sized based on content</p>
            <p><strong>Header support:</strong> Option to treat first row as headers</p>
            <p><strong>Custom delimiters:</strong> Support for comma, semicolon, tab, and pipe delimiters</p>
            <p><strong>File upload:</strong> Upload CSV files directly or paste data</p>
            <p><strong>Excel compatibility:</strong> Generated files work with Microsoft Excel and other spreadsheet applications</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CsvXlsxConverter;