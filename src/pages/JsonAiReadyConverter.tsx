import React, { useState, useCallback } from 'react';
import InfoSection from '../components/InfoSection';
import PageHeader from '../components/PageHeader';
import { Copy, Check, RotateCcw, ArrowRightLeft, Download } from 'lucide-react';
import { parseAndCleanJson } from '../utils/jsonCleaner';
import { parseCSVWithPaths, generateCSVWithPaths } from '../utils/csvWithPaths';

const JsonAiReadyConverter: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'jsonToAi' | 'aiToJson'>('jsonToAi');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [wasCleaned, setWasCleaned] = useState(false);

  const jsonToAi = useCallback((jsonString: string): { result: string; wasCleaned: boolean } => {
    try {
      const parseResult = parseAndCleanJson(jsonString);
      if (!parseResult.isValid) {
        throw new Error('Invalid JSON');
      }
      const data = JSON.parse(parseResult.cleanedJson);
      
      const aiReady = generateCSVWithPaths(data);
      return { result: aiReady, wasCleaned: parseResult.wasCleaned };
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to convert JSON to AI Ready format');
    }
  }, []);

  const aiToJson = useCallback((aiString: string): string => {
    try {
      const data = parseCSVWithPaths(aiString);
      return JSON.stringify(data, null, 2);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to convert AI Ready format to JSON');
    }
  }, []);

  const processInput = useCallback((value: string, currentMode: 'jsonToAi' | 'aiToJson') => {
    if (!value.trim()) {
      setOutput('');
      setError('');
      setWasCleaned(false);
      return;
    }

    try {
      if (currentMode === 'jsonToAi') {
        const { result, wasCleaned: cleaned } = jsonToAi(value);
        setOutput(result);
        setWasCleaned(cleaned);
        setError('');
      } else {
        const result = aiToJson(value);
        setOutput(result);
        setWasCleaned(false);
        setError('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed');
      setOutput('');
      setWasCleaned(false);
    }
  }, [jsonToAi, aiToJson]);

  const handleInputChange = (value: string) => {
    setInput(value);
    processInput(value, mode);
  };

  const handleModeToggle = () => {
    const newMode = mode === 'jsonToAi' ? 'aiToJson' : 'jsonToAi';
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
      type: mode === 'jsonToAi' ? 'text/csv' : 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = mode === 'jsonToAi' ? 'ai-ready-data.csv' : 'data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
    setWasCleaned(false);
  };

  const sampleJson = `{
  "users": [
    {
      "id": 1,
      "name": "william",
      "phones": [
        {
          "type": "mobile",
          "number": "+27-82-000-0000"
        },
        {
          "type": "home",
          "number": "+27-12-000-0000"
        }
      ]
    },
    {
      "id": 2,
      "name": "yolande",
      "phones": [
        {
          "type": "mobile",
          "number": "+27-83-000-0000"
        }
      ]
    }
  ]
}`;

  const sampleAiReady = `users[1],id,name
1,william
2,yolande

users[1].phones[1],users_id,type,number
1,mobile,+27-82-000-0000
1,home,+27-12-000-0000
2,mobile,+27-83-000-0000`;

  const handleLoadSample = () => {
    const sample = mode === 'jsonToAi' ? sampleJson : sampleAiReady;
    setInput(sample);
    processInput(sample, mode);
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="JSON / AI Ready Data Converter"
          description="Transform JSON data to AI Ready CSV-with-paths format and vice versa for AI/LLM tooling and data processing."
        />

        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex bg-gray-100 rounded-lg p-1" role="group" aria-label="Conversion mode selection">
              <button
                onClick={() => {
                  setMode('jsonToAi');
                  processInput(input, 'jsonToAi');
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === 'jsonToAi'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                aria-pressed={mode === 'jsonToAi'}
                aria-label="Convert JSON to AI Ready format"
              >
                JSON to AI Ready
              </button>
              <button
                onClick={() => {
                  setMode('aiToJson');
                  processInput(input, 'aiToJson');
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === 'aiToJson'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                aria-pressed={mode === 'aiToJson'}
                aria-label="Convert AI Ready format to JSON"
              >
                AI Ready to JSON
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[calc(100vh-400px)]">
          {/* Input Panel */}
          <section className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col" aria-labelledby="input-heading">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
              <h2 id="input-heading" className="text-lg font-semibold text-gray-800">
                {mode === 'jsonToAi' ? 'JSON Input' : 'AI Ready Data Input'}
              </h2>
              <button
                onClick={handleClear}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                aria-label="Clear input"
                title="Clear input"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            
            <div className="flex-1 p-4">
              <label htmlFor="input-textarea" className="sr-only">
                {mode === 'jsonToAi' ? 'JSON Input' : 'AI Ready Data Input'}
              </label>
              <textarea
                id="input-textarea"
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={
                  mode === 'jsonToAi' 
                    ? 'Enter JSON to convert to AI Ready format...\n\nExample:\n{\n  "users": [\n    {"id": 1, "name": "william"},\n    {"id": 2, "name": "yolande"}\n  ]\n}'
                    : 'Enter AI Ready CSV-with-paths data...\n\nExample:\nusers[1],id,name\n1,william\n2,yolande'
                }
                className="w-full h-full resize-none border-0 outline-none font-mono text-sm leading-relaxed"
                spellCheck={false}
                aria-describedby={error ? 'error-message' : undefined}
              />
            </div>
          </section>

          {/* Output Panel */}
          <section className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col" aria-labelledby="output-heading">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
              <div className="flex items-center space-x-2">
                <h2 id="output-heading" className="text-lg font-semibold text-gray-800">
                  {mode === 'jsonToAi' ? 'AI Ready Data Output' : 'JSON Output'}
                </h2>
                {wasCleaned && mode === 'jsonToAi' && output && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800" role="status">
                    Auto-cleaned
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleDownload}
                  disabled={!output}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    output
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  aria-label="Download file"
                  title="Download file"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
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
                  aria-label="Copy output"
                  title="Copy output"
                >
                  {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                  <span className="text-sm font-medium">
                    {copied ? 'Copied!' : 'Copy'}
                  </span>
                </button>
              </div>
            </div>
            
            <div className="flex-1 p-4">
              {error ? (
                <div id="error-message" className="text-red-600 text-sm font-medium bg-red-50 p-3 rounded-lg" role="alert">
                  {error}
                </div>
              ) : (
                <>
                  <label htmlFor="output-textarea" className="sr-only">
                    {mode === 'jsonToAi' ? 'AI Ready Data Output' : 'JSON Output'}
                  </label>
                  <textarea
                    id="output-textarea"
                    value={output}
                    readOnly
                    placeholder={`${mode === 'jsonToAi' ? 'AI Ready data' : 'JSON'} output will appear here...`}
                    className="w-full h-full resize-none border-0 outline-none font-mono text-sm leading-relaxed bg-gray-50"
                    aria-live="polite"
                  />
                </>
              )}
            </div>
          </section>
        </div>

        <InfoSection 
          title="About AI Ready Data (CSV-with-paths)"
          items={[
            {
              label: "Path-based headers",
              description: "Headers use JSON-style paths with array indexes (e.g., users[1],id,name)"
            },
            {
              label: "Nested structures",
              description: "Supports nested objects and arrays using dot notation (e.g., profile.address.city)"
            },
            {
              label: "Array indexing",
              description: "Uses 1-based indexing in notation (users[1] targets users[0] in JSON)"
            },
            {
              label: "Child blocks",
              description: "Child arrays use separate blocks with join keys to link parent-child relationships"
            },
            {
              label: "Type inference",
              description: "Automatically detects and converts numbers, booleans, and null values"
            },
            {
              label: "Block separation",
              description: "Multiple data blocks separated by blank lines for organizing complex data"
            },
            {
              label: "AI/LLM ready",
              description: "Optimized format for AI tooling, ETL bridges, and batch API ingestion"
            }
          ]}
          useCases="AI/LLM data preparation, ETL pipelines, batch API ingestion, configuration data, seed data with readable diffs"
        />
      </div>
    </div>
  );
};

export default JsonAiReadyConverter;
