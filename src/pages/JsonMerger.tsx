import React, { useState, useCallback } from 'react';
import { Copy, Check, RotateCcw, Plus, Trash2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import InfoSection from '../components/InfoSection';

type MergeStrategy = 'deep' | 'shallow';
type ArrayHandling = 'replace' | 'concat' | 'unique';
type ConflictResolution = 'first' | 'last' | 'manual';

interface JsonInput {
  id: number;
  value: string;
  isValid: boolean;
}

const JsonMerger: React.FC = () => {
  const [inputs, setInputs] = useState<JsonInput[]>([
    { id: 1, value: '', isValid: false },
    { id: 2, value: '', isValid: false },
  ]);
  const [mergeStrategy, setMergeStrategy] = useState<MergeStrategy>('deep');
  const [arrayHandling, setArrayHandling] = useState<ArrayHandling>('replace');
  const [conflictResolution, setConflictResolution] = useState<ConflictResolution>('last');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const nextId = inputs.length > 0 ? Math.max(...inputs.map(i => i.id)) + 1 : 1;

  const deepMerge = (target: unknown, source: unknown, path = ''): unknown => {

    if (Array.isArray(target) && Array.isArray(source)) {
      if (arrayHandling === 'concat') {
        return [...target, ...source];
      } else if (arrayHandling === 'unique') {
        const combined = [...target, ...source];
        return Array.from(new Set(combined.map(item => JSON.stringify(item))))
          .map(item => JSON.parse(item));
      } else {
        // replace
        return source;
      }
    }

    if (typeof target === 'object' && target !== null && 
        typeof source === 'object' && source !== null && 
        !Array.isArray(target) && !Array.isArray(source)) {
      
      const result: Record<string, unknown> = { ...target as Record<string, unknown> };
      const sourceObj = source as Record<string, unknown>;
      const targetObj = target as Record<string, unknown>;
      
      for (const key in sourceObj) {
        const currentPath = path ? `${path}.${key}` : key;
        
        if (!(key in targetObj)) {
          result[key] = sourceObj[key];
        } else {
          if (conflictResolution === 'first') {
            // Keep target value
            result[key] = targetObj[key];
          } else if (conflictResolution === 'last') {
            // Use source value
            if (typeof targetObj[key] === 'object' && targetObj[key] !== null && 
                typeof sourceObj[key] === 'object' && sourceObj[key] !== null &&
                mergeStrategy === 'deep') {
              result[key] = deepMerge(targetObj[key], sourceObj[key], currentPath);
            } else {
              result[key] = sourceObj[key];
            }
          } else {
            // manual - for now, use last
            result[key] = sourceObj[key];
          }
        }
      }
      
      return result;
    }
    
    return conflictResolution === 'first' ? target : source;
  };

  const mergeJsonObjects = useCallback(() => {
    try {
      const validInputs = inputs.filter(input => input.isValid && input.value.trim());
      
      if (validInputs.length === 0) {
        setOutput('');
        return;
      }

      const parsedObjects = validInputs.map(input => JSON.parse(input.value));
      
      let result = parsedObjects[0];

      for (let i = 1; i < parsedObjects.length; i++) {
        if (mergeStrategy === 'shallow') {
          // Shallow merge - ensure both are objects
          if (typeof result === 'object' && result !== null && !Array.isArray(result) &&
              typeof parsedObjects[i] === 'object' && parsedObjects[i] !== null && !Array.isArray(parsedObjects[i])) {
            result = { ...result as Record<string, unknown>, ...parsedObjects[i] as Record<string, unknown> };
          } else {
            result = parsedObjects[i];
          }
        } else {
          // Deep merge
          result = deepMerge(result, parsedObjects[i]);
        }
      }

      setOutput(JSON.stringify(result, null, 2));
    } catch (error) {
      setOutput('Error: ' + (error instanceof Error ? error.message : 'Failed to merge JSON'));
    }
  }, [inputs, mergeStrategy, arrayHandling, conflictResolution, deepMerge]);

  const handleInputChange = (id: number, value: string) => {
    const updatedInputs = inputs.map(input => {
      if (input.id === id) {
        let isValid = false;
        try {
          if (value.trim()) {
            JSON.parse(value);
            isValid = true;
          }
        } catch {
          isValid = false;
        }
        return { ...input, value, isValid };
      }
      return input;
    });
    setInputs(updatedInputs);
  };

  const addInput = () => {
    setInputs([...inputs, { id: nextId, value: '', isValid: false }]);
  };

  const removeInput = (id: number) => {
    if (inputs.length > 2) {
      setInputs(inputs.filter(input => input.id !== id));
    }
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
    setInputs([
      { id: 1, value: '', isValid: false },
      { id: 2, value: '', isValid: false },
    ]);
    setOutput('');
  };

  // Merge when inputs or settings change
  React.useEffect(() => {
    mergeJsonObjects();
  }, [mergeJsonObjects]);

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="JSON Merger"
          description="Merge multiple JSON objects with customizable merge strategies and conflict resolution."
        />

        {/* Merge Options */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-6 p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Merge Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Merge Strategy */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Merge Strategy
              </label>
              <select
                value={mergeStrategy}
                onChange={(e) => setMergeStrategy(e.target.value as MergeStrategy)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="deep">Deep Merge</option>
                <option value="shallow">Shallow Merge</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {mergeStrategy === 'deep' 
                  ? 'Recursively merge nested objects' 
                  : 'Only merge top-level properties'}
              </p>
            </div>

            {/* Array Handling */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Array Handling
              </label>
              <select
                value={arrayHandling}
                onChange={(e) => setArrayHandling(e.target.value as ArrayHandling)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="replace">Replace</option>
                <option value="concat">Concatenate</option>
                <option value="unique">Unique Concatenate</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {arrayHandling === 'replace' && 'Use array from last source'}
                {arrayHandling === 'concat' && 'Combine all arrays'}
                {arrayHandling === 'unique' && 'Combine with unique values'}
              </p>
            </div>

            {/* Conflict Resolution */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conflict Resolution
              </label>
              <select
                value={conflictResolution}
                onChange={(e) => setConflictResolution(e.target.value as ConflictResolution)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="first">Keep First</option>
                <option value="last">Keep Last</option>
                <option value="manual">Manual (Keep Last)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {conflictResolution === 'first' && 'Keep value from first object'}
                {conflictResolution === 'last' && 'Keep value from last object'}
                {conflictResolution === 'manual' && 'Currently uses last value'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Input Panels */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">JSON Inputs</h3>
              <button
                onClick={addInput}
                className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                title="Add another JSON input"
              >
                <Plus className="h-4 w-4" />
                <span className="text-sm font-medium">Add Input</span>
              </button>
            </div>

            {inputs.map((input, index) => (
              <div key={input.id} className="bg-white rounded-lg shadow-lg border border-gray-200">
                <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
                  <h4 className="text-md font-semibold text-gray-800">JSON {index + 1}</h4>
                  <div className="flex items-center space-x-2">
                    {input.isValid && (
                      <span className="text-xs text-green-600 font-medium">Valid</span>
                    )}
                    {!input.isValid && input.value.trim() && (
                      <span className="text-xs text-red-600 font-medium">Invalid</span>
                    )}
                    {inputs.length > 2 && (
                      <button
                        onClick={() => removeInput(input.id)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove this input"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <textarea
                    value={input.value}
                    onChange={(e) => handleInputChange(input.id, e.target.value)}
                    placeholder='{"key": "value"}'
                    className="w-full h-40 resize-none border border-gray-300 rounded-lg p-2 font-mono text-sm leading-relaxed focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    spellCheck={false}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Output Panel */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-800">Merged Output</h3>
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
                  disabled={!output}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    output
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  title="Copy merged JSON"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span className="text-sm font-medium">
                    {copied ? 'Copied!' : 'Copy'}
                  </span>
                </button>
              </div>
            </div>
            <div className="flex-1 p-4 overflow-auto">
              {output ? (
                <pre className="font-mono text-sm leading-relaxed text-gray-800 whitespace-pre-wrap break-all">
                  {output}
                </pre>
              ) : (
                <div className="text-gray-500 text-sm">
                  Enter valid JSON in the input panels to see the merged result...
                </div>
              )}
            </div>
          </div>
        </div>

        <InfoSection 
          title="JSON Merger Features"
          items={[
            {
              label: "Multiple Inputs",
              description: "Merge 2 or more JSON objects together with dynamic input panels"
            },
            {
              label: "Deep Merge",
              description: "Recursively merge nested objects and arrays with customizable strategies"
            },
            {
              label: "Shallow Merge",
              description: "Merge only top-level properties for simple object combination"
            },
            {
              label: "Array Handling",
              description: "Choose to replace, concatenate, or create unique arrays when merging"
            },
            {
              label: "Conflict Resolution",
              description: "Control how conflicting values are handled - keep first or last"
            },
            {
              label: "Real-time Preview",
              description: "See the merged result update as you type"
            }
          ]}
          useCases="Configuration merging, API response combination, data aggregation, settings management"
        />
      </div>
    </div>
  );
};

export default JsonMerger;
