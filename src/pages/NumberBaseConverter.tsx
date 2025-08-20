import React, { useState, useCallback } from 'react';
import { Copy, Check, RotateCcw, Calculator, AlertCircle } from 'lucide-react';

interface ConversionResult {
  base: string;
  value: string;
  name: string;
  description: string;
}

const NumberBaseConverter: React.FC = () => {
  const [input, setInput] = useState('');
  const [inputBase, setInputBase] = useState<number>(10);
  const [results, setResults] = useState<ConversionResult[]>([]);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const bases = [
    { value: 2, name: 'Binary', description: 'Base 2 (0-1)', prefix: '0b' },
    { value: 8, name: 'Octal', description: 'Base 8 (0-7)', prefix: '0o' },
    { value: 10, name: 'Decimal', description: 'Base 10 (0-9)', prefix: '' },
    { value: 16, name: 'Hexadecimal', description: 'Base 16 (0-9, A-F)', prefix: '0x' }
  ];

  const isValidForBase = (value: string, base: number): boolean => {
    if (!value.trim()) return false;
    
    // Remove common prefixes
    let cleanValue = value.toLowerCase().trim();
    if (cleanValue.startsWith('0x')) cleanValue = cleanValue.slice(2);
    if (cleanValue.startsWith('0b')) cleanValue = cleanValue.slice(2);
    if (cleanValue.startsWith('0o')) cleanValue = cleanValue.slice(2);
    
    const validChars = '0123456789abcdefghijklmnopqrstuvwxyz'.slice(0, base);
    return cleanValue.split('').every(char => validChars.includes(char));
  };

  const convertToDecimal = (value: string, fromBase: number): number => {
    // Remove common prefixes
    let cleanValue = value.toLowerCase().trim();
    if (cleanValue.startsWith('0x')) cleanValue = cleanValue.slice(2);
    if (cleanValue.startsWith('0b')) cleanValue = cleanValue.slice(2);
    if (cleanValue.startsWith('0o')) cleanValue = cleanValue.slice(2);
    
    return parseInt(cleanValue, fromBase);
  };

  const convertFromDecimal = (decimal: number, toBase: number): string => {
    if (decimal === 0) return '0';
    
    const digits = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    let num = Math.abs(decimal);
    
    while (num > 0) {
      result = digits[num % toBase] + result;
      num = Math.floor(num / toBase);
    }
    
    return decimal < 0 ? '-' + result : result;
  };

  const convertNumber = useCallback((value: string, fromBase: number) => {
    if (!value.trim()) {
      setResults([]);
      setError('');
      return;
    }

    if (!isValidForBase(value, fromBase)) {
      setError(`Invalid characters for base ${fromBase}. ${bases.find(b => b.value === fromBase)?.description}`);
      setResults([]);
      return;
    }

    try {
      const decimal = convertToDecimal(value, fromBase);
      
      if (!isFinite(decimal)) {
        setError('Number is too large to convert');
        setResults([]);
        return;
      }

      const newResults: ConversionResult[] = bases.map(base => ({
        base: base.value.toString(),
        value: base.value === 10 ? decimal.toString() : convertFromDecimal(decimal, base.value),
        name: base.name,
        description: base.description
      }));

      setResults(newResults);
      setError('');
    } catch (err) {
      setError('Invalid number format');
      setResults([]);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setInput(value);
    convertNumber(value, inputBase);
  };

  const handleBaseChange = (base: number) => {
    setInputBase(base);
    if (input) {
      convertNumber(input, base);
    }
  };

  const handleCopy = async (value: string, base: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(base);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleCopyAll = async () => {
    const allResults = results.map(result => `${result.name}: ${result.value}`).join('\n');
    try {
      await navigator.clipboard.writeText(allResults);
      setCopied('all');
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleClear = () => {
    setInput('');
    setResults([]);
    setError('');
  };

  const loadSample = () => {
    setInputBase(10);
    const sample = '255';
    setInput(sample);
    convertNumber(sample, 10);
  };

  const getValidCharsForBase = (base: number): string => {
    return '0123456789ABCDEF'.slice(0, base);
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Number Base Converter</h1>
          <p className="text-gray-600">
            Convert numbers between Binary, Decimal, Hexadecimal, and Octal number systems.
          </p>
        </div>

        {/* Input Panel */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
            <div className="flex items-center space-x-2">
              <Calculator className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">Number Input</h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={loadSample}
                className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
              >
                Load Sample
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
          
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Input Base
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {bases.map((base) => (
                    <button
                      key={base.value}
                      onClick={() => handleBaseChange(base.value)}
                      className={`p-3 text-left border rounded-lg transition-colors ${
                        inputBase === base.value
                          ? 'bg-blue-50 border-blue-300 text-blue-900'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium">{base.name}</div>
                      <div className="text-xs text-gray-500">{base.description}</div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number Value
                </label>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder={`Enter ${bases.find(b => b.value === inputBase)?.name.toLowerCase()} number...`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="mt-2 text-xs text-gray-500">
                  Valid characters for base {inputBase}: {getValidCharsForBase(inputBase)}
                </div>
              </div>
            </div>
            
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Conversion Results */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
            <h3 className="text-lg font-semibold text-gray-800">Conversion Results</h3>
            {results.length > 0 && (
              <button
                onClick={handleCopyAll}
                className="flex items-center space-x-2 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                {copied === 'all' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copied === 'all' ? 'Copied!' : 'Copy All'}</span>
              </button>
            )}
          </div>
          
          <div className="p-4">
            {results.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.map((result) => {
                  const baseInfo = bases.find(b => b.value.toString() === result.base);
                  const isInputBase = parseInt(result.base) === inputBase;
                  
                  return (
                    <div
                      key={result.base}
                      className={`p-4 rounded-lg border ${
                        isInputBase 
                          ? 'bg-blue-50 border-blue-200' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className={`font-semibold ${isInputBase ? 'text-blue-900' : 'text-gray-900'}`}>
                            {result.name}
                            {isInputBase && (
                              <span className="text-xs ml-2 bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">
                                Input
                              </span>
                            )}
                          </h4>
                          <p className="text-sm text-gray-600">{result.description}</p>
                        </div>
                        <button
                          onClick={() => handleCopy(result.value, result.base)}
                          className="flex items-center space-x-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                        >
                          {copied === result.base ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          <span>{copied === result.base ? 'Copied!' : 'Copy'}</span>
                        </button>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="bg-white p-3 rounded border">
                          <div className="font-mono text-lg text-gray-800 break-all">
                            {baseInfo?.prefix}{result.value}
                          </div>
                        </div>
                        
                        {/* Additional info for specific bases */}
                        {parseInt(result.base) === 2 && result.value.length > 8 && (
                          <div className="text-xs text-gray-500">
                            Grouped: {result.value.match(/.{1,4}/g)?.join(' ')}
                          </div>
                        )}
                        
                        {parseInt(result.base) === 16 && result.value.length > 2 && (
                          <div className="text-xs text-gray-500">
                            Bytes: {result.value.match(/.{1,2}/g)?.join(' ')}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Enter a number above to see conversions...
              </div>
            )}
          </div>
        </div>

        {/* Quick Examples */}
        <div className="mt-6 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Quick Examples</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { input: '255', base: 10, label: 'Common byte value' },
              { input: 'FF', base: 16, label: 'Max byte in hex' },
              { input: '11111111', base: 2, label: 'Max byte in binary' },
              { input: '377', base: 8, label: 'Max byte in octal' }
            ].map((example, index) => (
              <button
                key={index}
                onClick={() => {
                  setInputBase(example.base);
                  setInput(example.input);
                  convertNumber(example.input, example.base);
                }}
                className="p-3 text-left bg-white rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
              >
                <div className="font-mono text-sm text-blue-800">{example.input}</div>
                <div className="text-xs text-blue-600 mt-1">{example.label}</div>
                <div className="text-xs text-gray-500">Base {example.base}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Number System Information */}
        <div className="mt-6 bg-green-50 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-2">Number System Information</h4>
          <div className="text-sm text-green-800 space-y-1">
            <p><strong>Binary (Base 2):</strong> Used in computer systems, only digits 0 and 1</p>
            <p><strong>Octal (Base 8):</strong> Uses digits 0-7, common in Unix file permissions</p>
            <p><strong>Decimal (Base 10):</strong> Standard human counting system, digits 0-9</p>
            <p><strong>Hexadecimal (Base 16):</strong> Uses 0-9 and A-F, common in programming and color codes</p>
            <p><strong>Prefixes:</strong> 0b for binary, 0o for octal, 0x for hexadecimal</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NumberBaseConverter;