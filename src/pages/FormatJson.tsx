import React, { useState, useCallback } from 'react';
import JsonDisplay from '../components/JsonDisplay';
import InfoSection from '../components/InfoSection';
import PageHeader from '../components/PageHeader';
import { Copy, Check, RotateCcw } from 'lucide-react';
import { parseAndCleanJson } from '../utils/jsonCleaner';

const FormatJson: React.FC = () => {
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [cleanedJson, setCleanedJson] = useState('');
  const [wasCleaned, setWasCleaned] = useState(false);

  const handleInputChange = useCallback((value: string) => {
    setInput(value);
    
    const result = parseAndCleanJson(value);
    setIsValid(result.isValid);
    setCleanedJson(result.cleanedJson);
    setWasCleaned(result.wasCleaned);
  }, []);

  const handleCopy = async () => {
    if (!input.trim() || !isValid) return;
    
    try {
      const formatted = JSON.stringify(JSON.parse(cleanedJson), null, 2);
      await navigator.clipboard.writeText(formatted);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleClear = () => {
    setInput('');
    setIsValid(false);
    setCleanedJson('');
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="Format JSON"
          description="Paste your JSON data below to format and validate it."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[calc(100vh-280px)]">
          {/* Input Panel */}
          <section className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col" aria-labelledby="json-input-heading">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
              <h2 id="json-input-heading" className="text-lg font-semibold text-gray-800">JSON Input</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleClear}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                  aria-label="Clear JSON input"
                  title="Clear input"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  onClick={handleCopy}
                  disabled={!isValid || !input.trim()}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isValid && input.trim()
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  aria-label={copied ? 'JSON copied to clipboard' : 'Copy formatted JSON to clipboard'}
                  title="Copy formatted JSON"
                >
                  {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                  <span className="text-sm font-medium">
                    {copied ? 'Copied!' : 'Copy'}
                  </span>
                </button>
              </div>
            </div>
            
            <div className="flex-1 p-4">
              <label htmlFor="json-input" className="sr-only">JSON input field</label>
              <textarea
                id="json-input"
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Paste your JSON data here..."
                className="w-full h-full resize-none border-0 outline-none font-mono text-sm leading-relaxed"
                spellCheck={false}
                aria-describedby="json-input-help"
                aria-invalid={input.trim() && !isValid ? 'true' : 'false'}
              />
              <span id="json-input-help" className="sr-only">
                Enter or paste JSON data to format and validate. The output will update automatically.
              </span>
            </div>
          </section>

          {/* Output Panel */}
          <section className="bg-white rounded-lg shadow-lg border border-gray-200" aria-labelledby="json-output-heading">
            <h2 id="json-output-heading" className="sr-only">JSON Output</h2>
            <JsonDisplay 
              json={cleanedJson} 
              isValid={isValid} 
              wasCleaned={wasCleaned}
            />
          </section>
        </div>

        <InfoSection 
          title="JSON Formatting & Validation"
          items={[
            {
              label: "Format & Validate",
              description: "Automatically formats and validates JSON with proper indentation"
            },
            {
              label: "Error Detection",
              description: "Identifies and highlights JSON syntax errors with helpful messages"
            },
            {
              label: "Auto-clean",
              description: "Fixes common issues like trailing commas, unquoted keys, and mixed quotes"
            },
            {
              label: "Copy formatted",
              description: "Easily copy the properly formatted JSON to clipboard"
            }
          ]}
          useCases="API testing, configuration files, debugging, code review, data analysis"
        />
      </div>
    </div>
  );
};

export default FormatJson;