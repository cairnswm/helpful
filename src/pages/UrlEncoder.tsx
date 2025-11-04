import React, { useState, useCallback } from 'react';
import InfoSection from '../components/InfoSection';
import PageHeader from '../components/PageHeader';
import { Copy, Check, RotateCcw, ArrowUpDown } from 'lucide-react';

const UrlEncoder: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [copied, setCopied] = useState(false);

  const processInput = useCallback((value: string, currentMode: 'encode' | 'decode') => {
    if (!value.trim()) {
      setOutput('');
      return;
    }

    try {
      if (currentMode === 'encode') {
        setOutput(encodeURIComponent(value));
      } else {
        setOutput(decodeURIComponent(value));
      }
    } catch (err) {
      setOutput('Invalid URL encoding');
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
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="URL Encoder/Decoder"
          description="Encode or decode URL components for safe transmission in web requests."
        />

        <div className="mb-6 flex items-center space-x-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
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
            >
              Decode
            </button>
          </div>
          
          <button
            onClick={handleModeToggle}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            title="Swap input and output"
          >
            <ArrowUpDown className="h-4 w-4" />
            <span className="text-sm font-medium">Swap</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-320px)]">
          {/* Input Panel */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-800">
                {mode === 'encode' ? 'URL Input' : 'Encoded URL Input'}
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
                placeholder={mode === 'encode' ? 'Enter URL or text to encode...\n\nExample:\nhttps://example.com/search?q=hello world&type=text' : 'Enter encoded URL to decode...\n\nExample:\nhttps%3A//example.com/search%3Fq%3Dhello%20world%26type%3Dtext'}
                className="w-full h-full resize-none border-0 outline-none font-mono text-sm leading-relaxed"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Output Panel */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-800">
                {mode === 'encode' ? 'Encoded Output' : 'Decoded Output'}
              </h3>
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
            
            <div className="flex-1 p-4">
              <textarea
                value={output}
                readOnly
                placeholder={`${mode === 'encode' ? 'URL encoded' : 'Decoded'} output will appear here...`}
                className="w-full h-full resize-none border-0 outline-none font-mono text-sm leading-relaxed bg-gray-50"
              />
            </div>
          </div>
        </div>

        <InfoSection 
          title="URL Encoding & Decoding"
          items={[
            {
              label: "URL Encode",
              description: "Convert special characters to percent-encoded format for URLs"
            },
            {
              label: "URL Decode",
              description: "Convert percent-encoded strings back to readable text"
            },
            {
              label: "Component Safe",
              description: "Properly encode query parameters and path components"
            },
            {
              label: "International Support",
              description: "Handle Unicode and international characters correctly"
            }
          ]}
          useCases="Web development, API requests, form data, SEO, internationalization"
        />
      </div>
    </div>
  );
};

export default UrlEncoder;