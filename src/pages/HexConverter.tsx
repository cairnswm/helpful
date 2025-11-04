import React, { useState, useCallback } from 'react';
import InfoSection from '../components/InfoSection';
import PageHeader from '../components/PageHeader';
import { Copy, Check, RotateCcw, ArrowUpDown } from 'lucide-react';

const HexConverter: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'toHex' | 'fromHex'>('toHex');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const stringToHex = (str: string): string => {
    if (!str) return '';
    
    try {
      return str
        .split('')
        .map(char => char.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(' ');
    } catch (err) {
      throw new Error('Failed to convert to hex');
    }
  };

  const hexToString = (hex: string): string => {
    if (!hex.trim()) return '';
    
    try {
      // Remove spaces and normalize
      const cleanHex = hex.replace(/\s+/g, '').replace(/0x/gi, '');
      
      // Validate hex string
      if (!/^[0-9a-fA-F]*$/.test(cleanHex)) {
        throw new Error('Invalid hex characters');
      }
      
      if (cleanHex.length % 2 !== 0) {
        throw new Error('Hex string must have even length');
      }
      
      let result = '';
      for (let i = 0; i < cleanHex.length; i += 2) {
        const hexPair = cleanHex.substr(i, 2);
        const charCode = parseInt(hexPair, 16);
        result += String.fromCharCode(charCode);
      }
      
      return result;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to convert from hex');
    }
  };

  const processInput = useCallback((value: string, currentMode: 'toHex' | 'fromHex') => {
    if (!value.trim()) {
      setOutput('');
      setError('');
      return;
    }

    try {
      if (currentMode === 'toHex') {
        const result = stringToHex(value);
        setOutput(result);
        setError('');
      } else {
        const result = hexToString(value);
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
    const newMode = mode === 'toHex' ? 'fromHex' : 'toHex';
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

  const sampleText = "Hello, World! 🌍";
  const sampleHex = "48 65 6c 6c 6f 2c 20 57 6f 72 6c 64 21 20 f0 9f 8c 8d";

  const handleLoadSample = () => {
    const sample = mode === 'toHex' ? sampleText : sampleHex;
    setInput(sample);
    processInput(sample, mode);
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="Hex Converter"
          description="Convert between text strings and hexadecimal representation."
        />

        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => {
                  setMode('toHex');
                  processInput(input, 'toHex');
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === 'toHex'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                String to Hex
              </button>
              <button
                onClick={() => {
                  setMode('fromHex');
                  processInput(input, 'fromHex');
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === 'fromHex'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Hex to String
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
                {mode === 'toHex' ? 'Text Input' : 'Hex Input'}
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
                  mode === 'toHex' 
                    ? 'Enter text to convert to hex...\n\nExample:\nHello, World!' 
                    : 'Enter hex values to convert to text...\n\nExample:\n48 65 6c 6c 6f 2c 20 57 6f 72 6c 64 21\n\nSupports spaces, 0x prefix, and continuous hex strings'
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
                {mode === 'toHex' ? 'Hex Output' : 'Text Output'}
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
              {error ? (
                <div className="text-red-600 text-sm font-medium bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              ) : (
                <textarea
                  value={output}
                  readOnly
                  placeholder={`${mode === 'toHex' ? 'Hex' : 'Text'} output will appear here...`}
                  className="w-full h-full resize-none border-0 outline-none font-mono text-sm leading-relaxed bg-gray-50"
                />
              )}
            </div>
          </div>
        </div>

        <InfoSection 
          title="Hexadecimal Conversion"
          items={[
            {
              label: "Hexadecimal",
              description: "Base-16 number system using digits 0-9 and letters A-F"
            },
            {
              label: "Character encoding",
              description: "Each character is converted to its ASCII/Unicode code point"
            },
            {
              label: "Format support",
              description: "Accepts hex with or without spaces, with or without 0x prefix"
            },
            {
              label: "Bidirectional",
              description: "Convert text to hex and hex back to readable text"
            }
          ]}
          useCases="Binary data representation, debugging, encoding issues, color codes"
        />
      </div>
    </div>
  );
};

export default HexConverter;