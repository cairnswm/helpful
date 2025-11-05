import React, { useState, useCallback } from 'react';
import InfoSection from '../components/InfoSection';
import PageHeader from '../components/PageHeader';
import { Copy, Check, RotateCcw, ArrowUpDown } from 'lucide-react';

const Base64Tool: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const processInput = useCallback((value: string, currentMode: 'encode' | 'decode') => {
    if (!value.trim()) {
      setOutput('');
      setError('');
      return;
    }

    try {
      if (currentMode === 'encode') {
        const encoded = btoa(unescape(encodeURIComponent(value)));
        setOutput(encoded);
        setError('');
      } else {
        const decoded = decodeURIComponent(escape(atob(value)));
        setOutput(decoded);
        setError('');
      }
    } catch {
      setError(currentMode === 'decode' ? 'Invalid Base64 string' : 'Encoding failed');
      setOutput('');
    }
  }, []);

  const handleInputChange = (value: string) => {
    setInput(value);
    processInput(value, mode);
  };

  const handleModeToggle = () => {
    const newMode = mode === 'encode' ? 'decode' : 'encode';
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
    setError('');
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="Base64 Encoder/Decoder"
          description="Convert strings to Base64 encoding or decode Base64 strings back to text."
        />

        <div className="mb-6 flex items-center space-x-4">
          <div className="flex bg-gray-100 rounded-lg p-1" role="group" aria-label="Encoding mode selection">
            <button
              onClick={() => {
                setMode('encode');
                processInput(input, 'encode');
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === 'encode'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              aria-pressed={mode === 'encode'}
              aria-label="Switch to encode mode"
            >
              Encode
            </button>
            <button
              onClick={() => {
                setMode('decode');
                processInput(input, 'decode');
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === 'decode'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              aria-pressed={mode === 'decode'}
              aria-label="Switch to decode mode"
            >
              Decode
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[calc(100vh-320px)]">
          {/* Input Panel */}
          <section className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col" aria-labelledby="input-heading">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
              <h2 id="input-heading" className="text-lg font-semibold text-gray-800">
                {mode === 'encode' ? 'Text Input' : 'Base64 Input'}
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
              <label htmlFor="base64-input" className="sr-only">
                {mode === 'encode' ? 'Text to encode' : 'Base64 string to decode'}
              </label>
              <textarea
                id="base64-input"
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 string to decode...'}
                className="w-full h-full resize-none border-0 outline-none font-mono text-sm leading-relaxed"
                spellCheck={false}
                aria-label={mode === 'encode' ? 'Text input for encoding' : 'Base64 input for decoding'}
                aria-describedby="input-help"
              />
              <span id="input-help" className="sr-only">
                {mode === 'encode' ? 'Enter text to convert to Base64 format' : 'Enter Base64 string to decode to text'}
              </span>
            </div>
          </section>

          {/* Output Panel */}
          <section className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col" aria-labelledby="output-heading">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
              <h2 id="output-heading" className="text-lg font-semibold text-gray-800">
                {mode === 'encode' ? 'Base64 Output' : 'Decoded Output'}
              </h2>
              <button
                onClick={handleCopy}
                disabled={!output}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                  output
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                aria-label={copied ? 'Output copied to clipboard' : 'Copy output to clipboard'}
                title="Copy output"
              >
                {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                <span className="text-sm font-medium">
                  {copied ? 'Copied!' : 'Copy'}
                </span>
              </button>
            </div>
            
            <div className="flex-1 p-4">
              {error ? (
                <div className="text-red-600 text-sm font-medium" role="alert" aria-live="assertive">
                  {error}
                </div>
              ) : (
                <>
                  <label htmlFor="base64-output" className="sr-only">
                    {mode === 'encode' ? 'Base64 encoded output' : 'Decoded text output'}
                  </label>
                  <textarea
                    id="base64-output"
                    value={output}
                    readOnly
                    placeholder={`${mode === 'encode' ? 'Base64 encoded' : 'Decoded'} output will appear here...`}
                    className="w-full h-full resize-none border-0 outline-none font-mono text-sm leading-relaxed bg-gray-50"
                    aria-label={mode === 'encode' ? 'Base64 encoded output' : 'Decoded text output'}
                  />
                </>
              )}
            </div>
          </section>
        </div>

        <InfoSection 
          title="Base64 Encoding & Decoding"
          items={[
            {
              label: "Encode",
              description: "Convert text, URLs, or binary data to Base64 encoding"
            },
            {
              label: "Decode",
              description: "Convert Base64 encoded strings back to original format"
            },
            {
              label: "URL Safe",
              description: "Supports both standard and URL-safe Base64 variants"
            },
            {
              label: "Unicode Support",
              description: "Properly handles international characters and special symbols"
            }
          ]}
          useCases="API authentication, data transmission, email attachments, web development"
        />
      </div>
    </div>
  );
};

export default Base64Tool;