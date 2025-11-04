import React, { useState, useCallback } from 'react';
import { Copy, Check, RotateCcw } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import InfoSection from '../components/InfoSection';

type DiffType = 'added' | 'removed' | 'changed' | 'unchanged';
type OutputFormat = 'unified' | 'structured';

interface DiffItem {
  path: string;
  type: DiffType;
  oldValue?: unknown;
  newValue?: unknown;
}

const JsonDiff: React.FC = () => {
  const [leftJson, setLeftJson] = useState('');
  const [rightJson, setRightJson] = useState('');
  const [leftValid, setLeftValid] = useState(false);
  const [rightValid, setRightValid] = useState(false);
  const [diffs, setDiffs] = useState<DiffItem[]>([]);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('structured');
  const [copied, setCopied] = useState(false);

  const generateDiff = useCallback((obj1: unknown, obj2: unknown, path = ''): DiffItem[] => {
    const differences: DiffItem[] = [];

    // Handle null/undefined cases
    if (obj1 === null || obj1 === undefined) {
      if (obj2 !== null && obj2 !== undefined) {
        differences.push({
          path: path || 'root',
          type: 'added',
          newValue: obj2
        });
      }
      return differences;
    }

    if (obj2 === null || obj2 === undefined) {
      differences.push({
        path: path || 'root',
        type: 'removed',
        oldValue: obj1
      });
      return differences;
    }

    // Handle primitive types
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
      if (obj1 !== obj2) {
        differences.push({
          path: path || 'root',
          type: 'changed',
          oldValue: obj1,
          newValue: obj2
        });
      }
      return differences;
    }

    // Handle arrays
    if (Array.isArray(obj1) && Array.isArray(obj2)) {
      const maxLength = Math.max(obj1.length, obj2.length);
      for (let i = 0; i < maxLength; i++) {
        const itemPath = `${path}[${i}]`;
        if (i >= obj1.length) {
          differences.push({
            path: itemPath,
            type: 'added',
            newValue: obj2[i]
          });
        } else if (i >= obj2.length) {
          differences.push({
            path: itemPath,
            type: 'removed',
            oldValue: obj1[i]
          });
        } else if (JSON.stringify(obj1[i]) !== JSON.stringify(obj2[i])) {
          const nested = generateDiff(obj1[i], obj2[i], itemPath);
          differences.push(...nested);
        }
      }
      return differences;
    }

    // Handle array vs non-array
    if (Array.isArray(obj1) !== Array.isArray(obj2)) {
      differences.push({
        path: path || 'root',
        type: 'changed',
        oldValue: obj1,
        newValue: obj2
      });
      return differences;
    }

    // Handle objects
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    const allKeys = new Set([...keys1, ...keys2]);

    for (const key of allKeys) {
      const newPath = path ? `${path}.${key}` : key;
      
      if (!(key in obj1)) {
        differences.push({
          path: newPath,
          type: 'added',
          newValue: obj2[key]
        });
      } else if (!(key in obj2)) {
        differences.push({
          path: newPath,
          type: 'removed',
          oldValue: obj1[key]
        });
      } else if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
        // Check if both are objects for recursive diff
        if (typeof obj1[key] === 'object' && obj1[key] !== null &&
            typeof obj2[key] === 'object' && obj2[key] !== null) {
          const nested = generateDiff(obj1[key], obj2[key], newPath);
          differences.push(...nested);
        } else {
          differences.push({
            path: newPath,
            type: 'changed',
            oldValue: obj1[key],
            newValue: obj2[key]
          });
        }
      }
    }

    return differences;
  }, []);

  const handleLeftChange = (value: string) => {
    setLeftJson(value);
    let isValid = false;
    try {
      if (value.trim()) {
        JSON.parse(value);
        isValid = true;
      }
    } catch {
      isValid = false;
    }
    setLeftValid(isValid);
  };

  const handleRightChange = (value: string) => {
    setRightJson(value);
    let isValid = false;
    try {
      if (value.trim()) {
        JSON.parse(value);
        isValid = true;
      }
    } catch {
      isValid = false;
    }
    setRightValid(isValid);
  };

  const computeDiff = useCallback(() => {
    if (!leftValid || !rightValid) {
      setDiffs([]);
      return;
    }

    try {
      const obj1 = JSON.parse(leftJson);
      const obj2 = JSON.parse(rightJson);
      const differences = generateDiff(obj1, obj2);
      setDiffs(differences);
    } catch (error) {
      console.error('Error computing diff:', error);
      setDiffs([]);
    }
  }, [leftJson, rightJson, leftValid, rightValid, generateDiff]);

  React.useEffect(() => {
    computeDiff();
  }, [computeDiff]);

  const formatValue = (value: unknown): string => {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return `"${value}"`;
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const generateUnifiedDiff = (): string => {
    return diffs.map(diff => {
      switch (diff.type) {
        case 'added':
          return `+ ${diff.path}: ${formatValue(diff.newValue)}`;
        case 'removed':
          return `- ${diff.path}: ${formatValue(diff.oldValue)}`;
        case 'changed':
          return `~ ${diff.path}:\n  - ${formatValue(diff.oldValue)}\n  + ${formatValue(diff.newValue)}`;
        default:
          return '';
      }
    }).filter(Boolean).join('\n');
  };

  const generateStructuredDiff = (): string => {
    const structured = {
      summary: {
        added: diffs.filter(d => d.type === 'added').length,
        removed: diffs.filter(d => d.type === 'removed').length,
        changed: diffs.filter(d => d.type === 'changed').length,
        total: diffs.length
      },
      differences: diffs.map(diff => ({
        path: diff.path,
        type: diff.type,
        ...(diff.oldValue !== undefined && { oldValue: diff.oldValue }),
        ...(diff.newValue !== undefined && { newValue: diff.newValue })
      }))
    };
    return JSON.stringify(structured, null, 2);
  };

  const handleCopy = async () => {
    const output = outputFormat === 'unified' ? generateUnifiedDiff() : generateStructuredDiff();
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
    setLeftJson('');
    setRightJson('');
    setLeftValid(false);
    setRightValid(false);
    setDiffs([]);
  };

  const stats = {
    added: diffs.filter(d => d.type === 'added').length,
    removed: diffs.filter(d => d.type === 'removed').length,
    changed: diffs.filter(d => d.type === 'changed').length
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="JSON Diff Tool"
          description="Compare two JSON objects and visualize their differences with detailed change tracking."
        />

        {/* Stats and Controls */}
        {diffs.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-6">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">
                      {stats.added} added
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">
                      {stats.removed} removed
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">
                      {stats.changed} changed
                    </span>
                  </div>
                  <div className="ml-4">
                    <select
                      value={outputFormat}
                      onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="structured">Structured Format</option>
                      <option value="unified">Unified Diff</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleClear}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                    title="Clear all"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    title="Copy diff"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    <span className="text-sm font-medium">
                      {copied ? 'Copied!' : 'Copy Diff'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Left JSON */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col h-[500px]">
            <div className="p-4 bg-gray-50 border-b rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-800">Original JSON</h3>
              {leftJson && (
                <span className={`text-xs font-medium ${leftValid ? 'text-green-600' : 'text-red-600'}`}>
                  {leftValid ? 'Valid JSON' : 'Invalid JSON'}
                </span>
              )}
            </div>
            <div className="flex-1 p-4 overflow-auto">
              <textarea
                value={leftJson}
                onChange={(e) => handleLeftChange(e.target.value)}
                placeholder='{"key": "value"}'
                className="w-full h-full resize-none border-0 outline-none font-mono text-sm leading-relaxed"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Right JSON */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col h-[500px]">
            <div className="p-4 bg-gray-50 border-b rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-800">Modified JSON</h3>
              {rightJson && (
                <span className={`text-xs font-medium ${rightValid ? 'text-green-600' : 'text-red-600'}`}>
                  {rightValid ? 'Valid JSON' : 'Invalid JSON'}
                </span>
              )}
            </div>
            <div className="flex-1 p-4 overflow-auto">
              <textarea
                value={rightJson}
                onChange={(e) => handleRightChange(e.target.value)}
                placeholder='{"key": "value"}'
                className="w-full h-full resize-none border-0 outline-none font-mono text-sm leading-relaxed"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Diff Output */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col h-[500px]">
            <div className="p-4 bg-gray-50 border-b rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-800">Differences</h3>
            </div>
            <div className="flex-1 p-4 overflow-auto">
              {diffs.length > 0 ? (
                outputFormat === 'unified' ? (
                  <pre className="font-mono text-sm leading-relaxed whitespace-pre-wrap">
                    {generateUnifiedDiff()}
                  </pre>
                ) : (
                  <div className="space-y-2">
                    {diffs.map((diff, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${
                          diff.type === 'added'
                            ? 'bg-green-50 border-green-200'
                            : diff.type === 'removed'
                            ? 'bg-red-50 border-red-200'
                            : 'bg-yellow-50 border-yellow-200'
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            diff.type === 'added'
                              ? 'bg-green-200 text-green-800'
                              : diff.type === 'removed'
                              ? 'bg-red-200 text-red-800'
                              : 'bg-yellow-200 text-yellow-800'
                          }`}>
                            {diff.type.toUpperCase()}
                          </span>
                          <div className="flex-1">
                            <div className="font-mono text-sm font-semibold text-gray-800 break-all">
                              {diff.path}
                            </div>
                            {diff.type === 'changed' && (
                              <div className="mt-2 space-y-1">
                                <div className="text-xs">
                                  <span className="text-red-600 font-semibold">- Old: </span>
                                  <span className="font-mono text-gray-700">{formatValue(diff.oldValue)}</span>
                                </div>
                                <div className="text-xs">
                                  <span className="text-green-600 font-semibold">+ New: </span>
                                  <span className="font-mono text-gray-700">{formatValue(diff.newValue)}</span>
                                </div>
                              </div>
                            )}
                            {diff.type === 'added' && (
                              <div className="text-xs mt-1">
                                <span className="font-mono text-gray-700">{formatValue(diff.newValue)}</span>
                              </div>
                            )}
                            {diff.type === 'removed' && (
                              <div className="text-xs mt-1">
                                <span className="font-mono text-gray-700">{formatValue(diff.oldValue)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className="text-gray-500 text-sm">
                  {!leftValid || !rightValid
                    ? 'Enter valid JSON in both panels to see differences...'
                    : 'No differences found. The JSON objects are identical.'}
                </div>
              )}
            </div>
          </div>
        </div>

        <InfoSection 
          title="JSON Diff Tool Features"
          items={[
            {
              label: "Deep Comparison",
              description: "Recursively compares nested objects and arrays at all levels"
            },
            {
              label: "Visual Highlighting",
              description: "Color-coded visualization showing additions (green), deletions (red), and changes (yellow)"
            },
            {
              label: "Path Tracking",
              description: "Shows the exact path to each difference for easy identification"
            },
            {
              label: "Multiple Output Formats",
              description: "View differences as structured JSON or unified diff format"
            },
            {
              label: "Real-time Comparison",
              description: "Differences update automatically as you edit the JSON inputs"
            },
            {
              label: "Statistics Summary",
              description: "Quick overview of total additions, deletions, and changes"
            }
          ]}
          useCases="API response comparison, configuration validation, debugging, version control, data integrity checks"
        />
      </div>
    </div>
  );
};

export default JsonDiff;
