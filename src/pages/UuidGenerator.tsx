import React, { useState, useCallback } from 'react';
import { Copy, Check, RefreshCw, Hash } from 'lucide-react';

const UuidGenerator: React.FC = () => {
  const [uuids, setUuids] = useState<string[]>([]);
  const [count, setCount] = useState(1);
  const [version, setVersion] = useState<'v4' | 'v1'>('v4');
  const [copied, setCopied] = useState<number | null>(null);

  const generateV4 = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const generateV1 = (): string => {
    // Simplified V1 UUID generation (not fully compliant but demonstrates the concept)
    const timestamp = Date.now();
    const random = Math.random().toString(16).substring(2, 15);
    const clockSeq = Math.random().toString(16).substring(2, 6);
    const node = Math.random().toString(16).substring(2, 14);
    
    const timeLow = (timestamp & 0xffffffff).toString(16).padStart(8, '0');
    const timeMid = ((timestamp >> 32) & 0xffff).toString(16).padStart(4, '0');
    const timeHigh = (((timestamp >> 48) & 0x0fff) | 0x1000).toString(16).padStart(4, '0');
    
    return `${timeLow}-${timeMid}-${timeHigh}-${clockSeq}-${node}`;
  };

  const generateUuids = useCallback(() => {
    const newUuids: string[] = [];
    for (let i = 0; i < count; i++) {
      newUuids.push(version === 'v4' ? generateV4() : generateV1());
    }
    setUuids(newUuids);
  }, [count, version]);

  const handleCopy = async (uuid: string, index: number) => {
    try {
      await navigator.clipboard.writeText(uuid);
      setCopied(index);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleCopyAll = async () => {
    if (uuids.length === 0) return;
    
    try {
      await navigator.clipboard.writeText(uuids.join('\n'));
      setCopied(-1);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Generate initial UUIDs on mount
  React.useEffect(() => {
    generateUuids();
  }, [generateUuids]);

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">UUID Generator</h1>
          <p className="text-gray-600">
            Generate universally unique identifiers (UUIDs) for your applications.
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-6">
          <div className="p-6">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  UUID Version
                </label>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setVersion('v4')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      version === 'v4'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Version 4 (Random)
                  </button>
                  <button
                    onClick={() => setVersion('v1')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      version === 'v1'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Version 1 (Timestamp)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Count
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={count}
                  onChange={(e) => setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-end space-x-2">
                <button
                  onClick={generateUuids}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span className="font-medium">Generate</span>
                </button>

                {uuids.length > 1 && (
                  <button
                    onClick={handleCopyAll}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    {copied === -1 ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    <span className="font-medium">
                      {copied === -1 ? 'Copied All!' : 'Copy All'}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Generated UUIDs */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="p-4 bg-gray-50 border-b rounded-t-lg">
            <div className="flex items-center space-x-2">
              <Hash className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">
                Generated UUIDs ({uuids.length})
              </h3>
            </div>
          </div>
          
          <div className="p-4">
            {uuids.length > 0 ? (
              <div className="space-y-3">
                {uuids.map((uuid, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                  >
                    <code className="font-mono text-sm text-gray-800 flex-1">
                      {uuid}
                    </code>
                    <button
                      onClick={() => handleCopy(uuid, index)}
                      className="ml-3 flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                    >
                      {copied === index ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      <span className="font-medium">
                        {copied === index ? 'Copied!' : 'Copy'}
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Click "Generate" to create UUIDs
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">UUID Information</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>Version 4:</strong> Random or pseudo-random UUIDs. Most commonly used.</p>
            <p><strong>Version 1:</strong> Time-based UUIDs that include timestamp and node information.</p>
            <p><strong>Format:</strong> 8-4-4-4-12 hexadecimal digits (36 characters total including hyphens)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UuidGenerator;