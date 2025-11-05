import React, { useState, useCallback } from 'react';
import InfoSection from '../components/InfoSection';
import PageHeader from '../components/PageHeader';
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
    // Proper V1 UUID generation following RFC 4122
    // Get current timestamp in 100-nanosecond intervals since UUID epoch (Oct 15, 1582)
    const uuidEpoch = new Date('1582-10-15T00:00:00Z').getTime();
    const now = Date.now();
    const timestamp = (now - uuidEpoch) * 10000; // Convert to 100-nanosecond intervals
    
    // Split timestamp into components
    const timeLow = Math.floor(timestamp) & 0xffffffff;
    const timeMid = Math.floor(timestamp / 0x100000000) & 0xffff;
    const timeHiAndVersion = (Math.floor(timestamp / 0x1000000000000) & 0x0fff) | 0x1000; // Version 1
    
    // Generate 14-bit clock sequence with variant bits
    const clockSeq = Math.floor(Math.random() * 0x3fff) | 0x8000; // Variant bits: 10
    
    // Generate 48-bit node (simulating MAC address)
    const node = Math.floor(Math.random() * 0x1000000000000);
    
    // Format as UUID string
    const timeLowHex = timeLow.toString(16).padStart(8, '0');
    const timeMidHex = timeMid.toString(16).padStart(4, '0');
    const timeHiAndVersionHex = timeHiAndVersion.toString(16).padStart(4, '0');
    const clockSeqHex = clockSeq.toString(16).padStart(4, '0');
    const nodeHex = Math.abs(node).toString(16).padStart(12, '0');

    console.log("timeLowHex", timeLowHex)
    
    return `${timeLowHex}-${timeMidHex}-${timeHiAndVersionHex}-${clockSeqHex}-${nodeHex}`;
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
        <PageHeader 
          title="UUID Generator"
          description="Generate universally unique identifiers (UUIDs) for your applications."
        />

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-6">
          <div className="p-6">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label id="uuid-version-label" className="block text-sm font-medium text-gray-700 mb-2">
                  UUID Version
                </label>
                <div className="flex bg-gray-100 rounded-lg p-1" role="group" aria-labelledby="uuid-version-label">
                  <button
                    onClick={() => setVersion('v4')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      version === 'v4'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    aria-pressed={version === 'v4'}
                    aria-label="Select UUID Version 4 (Random)"
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
                    aria-pressed={version === 'v1'}
                    aria-label="Select UUID Version 1 (Timestamp)"
                  >
                    Version 1 (Timestamp)
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="uuid-count" className="block text-sm font-medium text-gray-700 mb-2">
                  Count
                </label>
                <input
                  id="uuid-count"
                  type="number"
                  min="1"
                  max="100"
                  value={count}
                  onChange={(e) => setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Number of UUIDs to generate"
                  aria-describedby="uuid-count-help"
                />
                <span id="uuid-count-help" className="sr-only">Enter a number between 1 and 100</span>
              </div>

              <div className="flex items-end space-x-2">
                <button
                  onClick={generateUuids}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  aria-label="Generate new UUIDs"
                >
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  <span className="font-medium">Generate</span>
                </button>

                {uuids.length > 1 && (
                  <button
                    onClick={handleCopyAll}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    aria-label={copied === -1 ? 'All UUIDs copied to clipboard' : 'Copy all UUIDs to clipboard'}
                  >
                    {copied === -1 ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
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
        <section className="bg-white rounded-lg shadow-lg border border-gray-200" aria-labelledby="generated-uuids-heading">
          <div className="p-4 bg-gray-50 border-b rounded-t-lg">
            <div className="flex items-center space-x-2">
              <Hash className="h-5 w-5 text-blue-600" aria-hidden="true" />
              <h2 id="generated-uuids-heading" className="text-lg font-semibold text-gray-800">
                Generated UUIDs ({uuids.length})
              </h2>
            </div>
          </div>
          
          <div className="p-4">
            {uuids.length > 0 ? (
              <div className="space-y-3" role="list" aria-label="Generated UUIDs">
                {uuids.map((uuid, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                    role="listitem"
                  >
                    <code className="font-mono text-sm text-gray-800 flex-1" aria-label={`UUID ${index + 1}: ${uuid}`}>
                      {uuid}
                    </code>
                    <button
                      onClick={() => handleCopy(uuid, index)}
                      className="ml-3 flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                      aria-label={copied === index ? `UUID ${index + 1} copied to clipboard` : `Copy UUID ${index + 1} to clipboard`}
                    >
                      {copied === index ? <Check className="h-3 w-3" aria-hidden="true" /> : <Copy className="h-3 w-3" aria-hidden="true" />}
                      <span className="font-medium">
                        {copied === index ? 'Copied!' : 'Copy'}
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500" role="status">
                Click "Generate" to create UUIDs
              </div>
            )}
          </div>
        </section>

        <InfoSection 
          title="UUID Generation"
          items={[
            {
              label: "Version 4",
              description: "Random or pseudo-random UUIDs. Most commonly used."
            },
            {
              label: "Version 1",
              description: "Time-based UUIDs that include timestamp and node information."
            },
            {
              label: "Format",
              description: "8-4-4-4-12 hexadecimal digits (36 characters total including hyphens)"
            },
            {
              label: "Uniqueness",
              description: "Globally unique identifiers with extremely low collision probability"
            }
          ]}
          useCases="Database primary keys, API resources, session IDs, distributed systems"
        />
      </div>
    </div>
  );
};

export default UuidGenerator;