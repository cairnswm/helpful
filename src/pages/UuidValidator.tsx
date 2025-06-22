import React, { useState, useCallback } from 'react';
import { Copy, Check, RotateCcw, CheckCircle, XCircle, Info } from 'lucide-react';

interface ValidationResult {
  isValid: boolean;
  version?: number;
  variant?: string;
  timestamp?: string;
  node?: string;
  clockSequence?: string;
  details: string[];
}

const UuidValidator: React.FC = () => {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [copied, setCopied] = useState(false);

  const validateUuid = (uuid: string): ValidationResult => {
    const cleanUuid = uuid.trim();
    
    if (!cleanUuid) {
      return {
        isValid: false,
        details: ['Empty input']
      };
    }

    // Basic format check
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(cleanUuid)) {
      const details = [];
      
      if (cleanUuid.length !== 36) {
        details.push(`Invalid length: ${cleanUuid.length} (expected 36)`);
      }
      
      if (!cleanUuid.includes('-')) {
        details.push('Missing hyphens');
      } else {
        const parts = cleanUuid.split('-');
        if (parts.length !== 5) {
          details.push(`Invalid number of parts: ${parts.length} (expected 5)`);
        } else {
          const expectedLengths = [8, 4, 4, 4, 12];
          parts.forEach((part, index) => {
            if (part.length !== expectedLengths[index]) {
              details.push(`Part ${index + 1} has invalid length: ${part.length} (expected ${expectedLengths[index]})`);
            }
          });
        }
      }
      
      if (!/^[0-9a-f-]+$/i.test(cleanUuid)) {
        details.push('Contains invalid characters (only 0-9, a-f, and hyphens allowed)');
      }
      
      return {
        isValid: false,
        details: details.length > 0 ? details : ['Invalid UUID format']
      };
    }

    // Extract version and variant
    const versionChar = cleanUuid[14];
    const variantChar = cleanUuid[19];
    
    const version = parseInt(versionChar, 16);
    const variantBits = parseInt(variantChar, 16);
    
    let variant = 'Unknown';
    if ((variantBits & 0x8) === 0) {
      variant = 'NCS backward compatibility';
    } else if ((variantBits & 0xC) === 0x8) {
      variant = 'RFC 4122';
    } else if ((variantBits & 0xE) === 0xC) {
      variant = 'Microsoft GUID';
    } else {
      variant = 'Reserved for future use';
    }

    const details = [
      `Valid UUID format`,
      `Version: ${version}`,
      `Variant: ${variant}`
    ];

    const result: ValidationResult = {
      isValid: true,
      version,
      variant,
      details
    };

    // Version-specific analysis
    if (version === 1) {
      // Time-based UUID
      const timeLow = cleanUuid.substring(0, 8);
      const timeMid = cleanUuid.substring(9, 13);
      const timeHigh = cleanUuid.substring(14, 18);
      const clockSeq = cleanUuid.substring(19, 23);
      const node = cleanUuid.substring(24);
      
      // Reconstruct timestamp (simplified)
      const timeHighAndVersion = parseInt(timeHigh, 16) & 0x0FFF;
      const timestamp = (timeHighAndVersion * Math.pow(2, 48)) + 
                       (parseInt(timeMid, 16) * Math.pow(2, 32)) + 
                       parseInt(timeLow, 16);
      
      // Convert to date (UUID timestamp is 100-nanosecond intervals since Oct 15, 1582)
      const uuidEpoch = new Date('1582-10-15T00:00:00Z').getTime();
      const unixTimestamp = (timestamp / 10000) + uuidEpoch;
      
      result.timestamp = new Date(unixTimestamp).toISOString();
      result.node = node;
      result.clockSequence = clockSeq;
      
      details.push(`Timestamp: ${result.timestamp}`);
      details.push(`Node: ${node}`);
      details.push(`Clock sequence: ${clockSeq}`);
    } else if (version === 4) {
      details.push('Random/pseudo-random UUID');
    } else if (version === 3 || version === 5) {
      details.push(`Name-based UUID (${version === 3 ? 'MD5' : 'SHA-1'} hash)`);
    } else {
      details.push(`Version ${version} UUID`);
    }

    return result;
  };

  const handleInputChange = useCallback((value: string) => {
    setInput(value);
    
    if (!value.trim()) {
      setResults([]);
      return;
    }

    // Split by lines and validate each UUID
    const uuids = value.split('\n').filter(line => line.trim());
    const validationResults = uuids.map(uuid => validateUuid(uuid));
    setResults(validationResults);
  }, []);

  const handleCopy = async () => {
    const validUuids = input.split('\n')
      .filter((line, index) => line.trim() && results[index]?.isValid)
      .join('\n');
    
    if (!validUuids) return;
    
    try {
      await navigator.clipboard.writeText(validUuids);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleClear = () => {
    setInput('');
    setResults([]);
  };

  const generateSampleUuids = () => {
    const samples = [
      '550e8400-e29b-41d4-a716-446655440000', // Valid v4
      '6ba7b810-9dad-11d1-80b4-00c04fd430c8', // Valid v1
      '6ba7b811-9dad-11d1-80b4-00c04fd430c8', // Valid v1
      '550e8400-e29b-41d4-a716-44665544000',  // Invalid (too short)
      'not-a-uuid-at-all',                     // Invalid format
      '550e8400-e29b-71d4-a716-446655440000'  // Invalid version
    ];
    
    setInput(samples.join('\n'));
    handleInputChange(samples.join('\n'));
  };

  const validCount = results.filter(r => r.isValid).length;
  const totalCount = results.length;

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">UUID Validator</h1>
          <p className="text-gray-600">
            Check if given strings are valid UUIDs and identify their version and properties.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col h-96">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-800">UUID Input</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={generateSampleUuids}
                  className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
                >
                  Load Samples
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
            
            <div className="flex-1 p-4">
              <textarea
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Enter UUIDs to validate (one per line)...&#10;&#10;Examples:&#10;550e8400-e29b-41d4-a716-446655440000&#10;6ba7b810-9dad-11d1-80b4-00c04fd430c8&#10;invalid-uuid-format"
                className="w-full h-full resize-none border-0 outline-none font-mono text-sm leading-relaxed"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Results Summary */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-800">Validation Summary</h3>
              {totalCount > 0 && (
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    validCount === totalCount
                      ? 'bg-green-100 text-green-800'
                      : validCount > 0
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {validCount}/{totalCount} valid
                  </span>
                  <button
                    onClick={handleCopy}
                    disabled={validCount === 0}
                    className={`flex items-center space-x-2 px-3 py-1 rounded-lg transition-all duration-200 text-sm ${
                      validCount > 0
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                    title="Copy valid UUIDs"
                  >
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copied ? 'Copied!' : 'Copy Valid'}</span>
                  </button>
                </div>
              )}
            </div>
            
            <div className="p-4 h-80 overflow-auto">
              {results.length > 0 ? (
                <div className="space-y-3">
                  {results.map((result, index) => {
                    const uuid = input.split('\n')[index]?.trim();
                    return (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${
                          result.isValid
                            ? 'bg-green-50 border-green-200'
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          {result.isValid ? (
                            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-mono text-sm text-gray-800 break-all mb-2">
                              {uuid}
                            </div>
                            <div className="space-y-1">
                              {result.details.map((detail, detailIndex) => (
                                <div
                                  key={detailIndex}
                                  className={`text-xs ${
                                    result.isValid ? 'text-green-700' : 'text-red-700'
                                  }`}
                                >
                                  {detail}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Enter UUIDs above to see validation results...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* UUID Information */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">UUID Information</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Format:</strong> 8-4-4-4-12 hexadecimal digits (36 characters total including hyphens)</p>
                <p><strong>Version 1:</strong> Time-based UUIDs with timestamp and node information</p>
                <p><strong>Version 3:</strong> Name-based UUIDs using MD5 hash</p>
                <p><strong>Version 4:</strong> Random or pseudo-random UUIDs (most common)</p>
                <p><strong>Version 5:</strong> Name-based UUIDs using SHA-1 hash</p>
                <p><strong>Variant:</strong> Indicates the layout of the UUID (RFC 4122, Microsoft GUID, etc.)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UuidValidator;