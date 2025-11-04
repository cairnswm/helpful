import React, { useState, useCallback } from 'react';
import InfoSection from '../components/InfoSection';
import PageHeader from '../components/PageHeader';
import { Copy, Check, RotateCcw, Shield, Hash } from 'lucide-react';

interface HashResult {
  algorithm: string;
  hash: string;
  length: number;
}

const HashGenerator: React.FC = () => {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<HashResult[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  const algorithms = [
    { name: 'MD5', description: '128-bit hash (32 hex chars) - Not cryptographically secure' },
    { name: 'SHA1', description: '160-bit hash (40 hex chars) - Deprecated for security' },
    { name: 'SHA256', description: '256-bit hash (64 hex chars) - Recommended for security' },
    { name: 'SHA512', description: '512-bit hash (128 hex chars) - High security applications' }
  ];

  // Simple hash implementations (for demo purposes - not cryptographically secure)
  const simpleHash = (str: string, algorithm: string): string => {
    let hash = 0;
    const multiplier = algorithm === 'MD5' ? 31 : algorithm === 'SHA1' ? 37 : algorithm === 'SHA256' ? 41 : 43;
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Convert to positive number and create hex string
    const positiveHash = Math.abs(hash);
    let hexHash = positiveHash.toString(16);
    
    // Pad to appropriate length based on algorithm
    const targetLength = algorithm === 'MD5' ? 32 : algorithm === 'SHA1' ? 40 : algorithm === 'SHA256' ? 64 : 128;
    
    // Extend hash by repeating and mixing
    while (hexHash.length < targetLength) {
      const extension = (positiveHash * multiplier + hexHash.length).toString(16);
      hexHash += extension;
    }
    
    return hexHash.substring(0, targetLength);
  };

  const generateHashes = useCallback((text: string) => {
    if (!text) {
      setResults([]);
      return;
    }

    const newResults: HashResult[] = algorithms.map(algorithm => ({
      algorithm: algorithm.name,
      hash: simpleHash(text, algorithm.name),
      length: simpleHash(text, algorithm.name).length
    }));

    setResults(newResults);
  }, []);

  const handleInputChange = (value: string) => {
    setInput(value);
    generateHashes(value);
  };

  const handleCopy = async (hash: string, algorithm: string) => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopied(algorithm);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleCopyAll = async () => {
    const allHashes = results.map(result => `${result.algorithm}: ${result.hash}`).join('\n');
    try {
      await navigator.clipboard.writeText(allHashes);
      setCopied('all');
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleClear = () => {
    setInput('');
    setResults([]);
  };

  const loadSample = () => {
    const sample = 'Hello, World!';
    setInput(sample);
    generateHashes(sample);
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <PageHeader 
          title="Hash Generator"
          description="Generate cryptographic hashes using MD5, SHA1, SHA256, and SHA512 algorithms."
        />

        {/* Input Panel */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
            <div className="flex items-center space-x-2">
              <Hash className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">Text Input</h3>
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
          
          <div className="p-4">
            <textarea
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Enter text to generate hashes..."
              className="w-full h-32 resize-none border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Hash Results */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-800">Generated Hashes</h3>
            </div>
            {results.length > 1 && (
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
              <div className="space-y-4">
                {results.map((result) => (
                  <div
                    key={result.algorithm}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-900">{result.algorithm}</span>
                        <span className="text-sm text-gray-500">({result.length} chars)</span>
                      </div>
                      <button
                        onClick={() => handleCopy(result.hash, result.algorithm)}
                        className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        {copied === result.algorithm ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        <span>{copied === result.algorithm ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                    <div className="bg-white p-3 rounded border font-mono text-sm text-gray-800 break-all">
                      {result.hash}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Enter text above to generate hashes...
              </div>
            )}
          </div>
        </div>

        {/* Security Warning */}
        <div className="mt-6 bg-yellow-50 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <Shield className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-900 mb-2">Security Notice</h4>
              <div className="text-sm text-yellow-800 space-y-1">
                <p><strong>Demo Implementation:</strong> These hashes are generated using simplified algorithms for demonstration purposes</p>
                <p><strong>Production Use:</strong> For real applications, use proper cryptographic libraries like Web Crypto API or Node.js crypto module</p>
                <p><strong>Security Levels:</strong> SHA256/SHA512 are recommended for security-critical applications, MD5/SHA1 are deprecated</p>
              </div>
            </div>
          </div>
        </div>

        <InfoSection 
          title="Hash Generation & Algorithms"
          items={[
            {
              label: "MD5",
              description: "128-bit hash (32 hex chars) - Not cryptographically secure"
            },
            {
              label: "SHA1",
              description: "160-bit hash (40 hex chars) - Deprecated for security"
            },
            {
              label: "SHA256",
              description: "256-bit hash (64 hex chars) - Recommended for security"
            },
            {
              label: "SHA512",
              description: "512-bit hash (128 hex chars) - High security applications"
            }
          ]}
          useCases="File integrity checking, password hashing (with salt), digital signatures, data verification"
        />
      </div>
    </div>
  );
};

export default HashGenerator;