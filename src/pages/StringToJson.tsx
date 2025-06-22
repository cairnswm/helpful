import React, { useState, useCallback } from 'react';
import JsonDisplay from '../components/JsonDisplay';
import { Copy, Check, RotateCcw } from 'lucide-react';

const StringToJson: React.FC = () => {
  const [input, setInput] = useState('');
  const [parsedJson, setParsedJson] = useState('');
  const [copied, setCopied] = useState(false);
  const [isValid, setIsValid] = useState(false);

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

  const handleInputChange = useCallback((value: string) => {
    setInput(value);
    const parsed = parseStringToJson(value);
    setParsedJson(parsed);
    setIsValid(!!parsed);
  }, []);

  const handleCopy = async () => {
    if (!parsedJson) return;
    
    try {
      await navigator.clipboard.writeText(parsedJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleClear = () => {
    setInput('');
    setParsedJson('');
    setIsValid(false);
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">String to JSON</h1>
          <p className="text-gray-600">
            Convert escaped JSON strings to formatted JSON. Handles escape sequences like \n, \t, \", etc.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-280px)]">
          {/* Input Panel */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-800">String Input</h3>
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
                  disabled={!isValid || !parsedJson}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isValid && parsedJson
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  title="Copy parsed JSON"
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
                placeholder={`Paste your escaped JSON string here...\n\nExample:\n"{\"name\":\"John\",\"age\":30}"\n\nor\n\n"{\\"name\\":\\"John\\",\\"message\\":\\"Hello\\nWorld\\"}"`}
                className="w-full h-full resize-none border-0 outline-none font-mono text-sm leading-relaxed"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Output Panel */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200">
            <JsonDisplay json={parsedJson} isValid={isValid} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StringToJson;