import React, { useState, useCallback } from 'react';
import JsonDisplay from '../components/JsonDisplay';
import InfoSection from '../components/InfoSection';
import PageHeader from '../components/PageHeader';
import { Copy, Check, RotateCcw, ArrowUpDown } from 'lucide-react';

const StringToJson: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'stringToJson' | 'jsonToString'>('stringToJson');
  const [copied, setCopied] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState('');

  const parseStringToJson = (str: string): string => {
    if (!str.trim()) return '';
    
    try {
      // Remove surrounding quotes if present
      let cleaned = str.trim();
      if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || 
          (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
        cleaned = cleaned.slice(1, -1);
      }
      
      // Unescape common escape sequences
      cleaned = cleaned
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'")
        .replace(/\\\\/g, '\\');
      
      // Try to parse as JSON
      const parsed = JSON.parse(cleaned);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return '';
    }
  };

  const jsonToEscapedString = (jsonStr: string): string => {
    if (!jsonStr.trim()) return '';
    
    try {
      // First validate it's valid JSON
      JSON.parse(jsonStr);
      
      // Escape the JSON string
      const escaped = jsonStr
        .replace(/\\/g, '\\\\')  // Escape backslashes first
        .replace(/"/g, '\\"')    // Escape quotes
        .replace(/\n/g, '\\n')   // Escape newlines
        .replace(/\r/g, '\\r')   // Escape carriage returns
        .replace(/\t/g, '\\t');  // Escape tabs
      
      return `"${escaped}"`;
    } catch {
      return '';
    }
  };

  const processInput = useCallback((value: string, currentMode: 'stringToJson' | 'jsonToString') => {
    if (!value.trim()) {
      setOutput('');
      setIsValid(false);
      setError('');
      return;
    }

    try {
      if (currentMode === 'stringToJson') {
        const result = parseStringToJson(value);
        setOutput(result);
        setIsValid(!!result);
        setError('');
      } else {
        const result = jsonToEscapedString(value);
        setOutput(result);
        setIsValid(!!result);
        setError('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed');
      setOutput('');
      setIsValid(false);
    }
  }, []);
  const handleInputChange = useCallback((value: string) => {
    setInput(value);
    processInput(value, mode);
  }, []);

  const handleModeToggle = () => {
    const newMode = mode === 'stringToJson' ? 'jsonToString' : 'stringToJson';
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

  const handleClear = () => {
    setInput('');
    setOutput('');
    setIsValid(false);
    setError('');
  };

  const loadSample = () => {
    if (mode === 'stringToJson') {
      const sample = '"{\"name\":\"John Doe\",\"age\":30,\"message\":\"Hello\\nWorld!\"}"';
      setInput(sample);
      processInput(sample, mode);
    } else {
      const sample = `{
  "name": "John Doe",
  "age": 30,
  "message": "Hello\\nWorld!"
}`;
      setInput(sample);
      processInput(sample, mode);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="String ↔ JSON Converter"
          description="Convert between escaped JSON strings and formatted JSON. Handles escape sequences and formatting."
        />

        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex bg-gray-100 rounded-lg p-1" role="group" aria-label="Conversion mode selection">
              <button
                onClick={() => {
                  setMode('stringToJson');
                  processInput(input, 'stringToJson');
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === 'stringToJson'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                aria-pressed={mode === 'stringToJson'}
                aria-label="Convert string to JSON"
              >
                String to JSON
              </button>
              <button
                onClick={() => {
                  setMode('jsonToString');
                  processInput(input, 'jsonToString');
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === 'jsonToString'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                aria-pressed={mode === 'jsonToString'}
                aria-label="Convert JSON to string"
              >
                JSON to String
              </button>
            </div>
            
            <button
              onClick={handleModeToggle}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              aria-label="Swap input and output"
              title="Swap input and output"
            >
              <ArrowUpDown className="h-4 w-4" aria-hidden="true" />
              <span className="text-sm font-medium">Swap</span>
            </button>
          </div>
          
          <button
            onClick={loadSample}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            aria-label="Load sample data"
          >
            Load Sample
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-280px)]">
          {/* Input Panel */}
          <section className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col" aria-labelledby="string-json-input-heading">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
              <h2 id="string-json-input-heading" className="text-lg font-semibold text-gray-800">
                {mode === 'stringToJson' ? 'String Input' : 'JSON Input'}
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleClear}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                  title="Clear input"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button
                  onClick={handleCopy}
                  disabled={!isValid || !output}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isValid && output
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
              <textarea
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={
                  mode === 'stringToJson'
                    ? `Paste your escaped JSON string here...\n\nExample:\n"{\"name\":\"John\",\"age\":30}"\n\nor\n\n"{\\"name\\":\\"John\\",\\"message\\":\\"Hello\\nWorld\\"}"`
                    : `Paste your JSON here to convert to escaped string...\n\nExample:\n{\n  "name": "John",\n  "age": 30,\n  "message": "Hello\\nWorld!"\n}`
                }
                className="w-full h-full resize-none border-0 outline-none font-mono text-sm leading-relaxed"
                spellCheck={false}
              />
            </div>
          </section>

          {/* Output Panel */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-800">
                {mode === 'stringToJson' ? 'JSON Output' : 'Escaped String Output'}
              </h3>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                error
                  ? 'bg-red-100 text-red-800'
                  : isValid 
                    ? 'bg-green-100 text-green-800' 
                    : input.trim() ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'
              }`}>
                {error ? 'Error' : !input.trim() ? 'No input' : isValid ? 'Valid' : 'Invalid'}
              </div>
            </div>
            
            <div className="flex-1 p-4 overflow-auto">
              {error ? (
                <div className="text-red-600 text-sm font-medium bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              ) : mode === 'stringToJson' ? (
                <pre 
                  className="text-sm leading-relaxed font-mono whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ 
                    __html: output ? output.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
                      let cls = 'text-blue-600';
                      if (/^"/.test(match)) {
                        if (/:$/.test(match)) {
                          cls = 'text-purple-600 font-medium';
                        } else {
                          cls = 'text-green-600';
                        }
                      } else if (/true|false/.test(match)) {
                        cls = 'text-orange-600';
                      } else if (/null/.test(match)) {
                        cls = 'text-red-500';
                      } else {
                        cls = 'text-blue-600';
                      }
                      return `<span class="${cls}">${match}</span>`;
                    }) : 'Enter JSON string to see formatted output...'
                  }}
                />
              ) : (
                <pre className="text-sm leading-relaxed font-mono whitespace-pre-wrap text-gray-800">
                  {output || 'Enter JSON to see escaped string output...'}
                </pre>
              )}
            </div>
          </div>
        </div>

        <InfoSection 
          title="String ↔ JSON Conversion"
          items={[
            {
              label: "String to JSON",
              description: "Converts escaped JSON strings to properly formatted JSON objects"
            },
            {
              label: "JSON to String",
              description: "Converts JSON objects to escaped string format for embedding in code"
            },
            {
              label: "Escape sequences",
              description: "Handles \\n (newline), \\t (tab), \\\" (quote), \\\\ (backslash), etc."
            }
          ]}
          useCases="API responses, configuration files, code generation, data serialization"
        />
      </div>
    </div>
  );
};

export default StringToJson;