import React, { useState, useCallback } from 'react';
import { Copy, Check, RotateCcw } from 'lucide-react';

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
  lineNumber: number;
}

const DiffChecker: React.FC = () => {
  const [leftText, setLeftText] = useState('');
  const [rightText, setRightText] = useState('');
  const [diff, setDiff] = useState<DiffLine[]>([]);
  const [copied, setCopied] = useState(false);

  const generateDiff = useCallback((text1: string, text2: string) => {
    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');
    const result: DiffLine[] = [];
    
    let i = 0, j = 0;
    let lineNumber = 1;
    
    while (i < lines1.length || j < lines2.length) {
      if (i >= lines1.length) {
        // Only lines2 remaining
        result.push({
          type: 'added',
          content: lines2[j],
          lineNumber: lineNumber++
        });
        j++;
      } else if (j >= lines2.length) {
        // Only lines1 remaining
        result.push({
          type: 'removed',
          content: lines1[i],
          lineNumber: lineNumber++
        });
        i++;
      } else if (lines1[i] === lines2[j]) {
        // Lines are the same
        result.push({
          type: 'unchanged',
          content: lines1[i],
          lineNumber: lineNumber++
        });
        i++;
        j++;
      } else {
        // Lines are different - simple approach
        result.push({
          type: 'removed',
          content: lines1[i],
          lineNumber: lineNumber++
        });
        result.push({
          type: 'added',
          content: lines2[j],
          lineNumber: lineNumber++
        });
        i++;
        j++;
      }
    }
    
    setDiff(result);
  }, []);

  const handleLeftChange = (value: string) => {
    setLeftText(value);
    generateDiff(value, rightText);
  };

  const handleRightChange = (value: string) => {
    setRightText(value);
    generateDiff(leftText, value);
  };

  const handleCopy = async () => {
    const diffText = diff.map(line => {
      const prefix = line.type === 'added' ? '+ ' : line.type === 'removed' ? '- ' : '  ';
      return prefix + line.content;
    }).join('\n');
    
    try {
      await navigator.clipboard.writeText(diffText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleClear = () => {
    setLeftText('');
    setRightText('');
    setDiff([]);
  };

  const stats = {
    added: diff.filter(line => line.type === 'added').length,
    removed: diff.filter(line => line.type === 'removed').length,
    unchanged: diff.filter(line => line.type === 'unchanged').length
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Diff Checker</h1>
          <p className="text-gray-600">
            Compare two text snippets to quickly see differences line by line.
          </p>
        </div>

        {/* Stats */}
        {diff.length > 0 && (
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
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">
                      {stats.unchanged} unchanged
                    </span>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-320px)]">
          {/* Left Text */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col">
            <div className="p-4 bg-gray-50 border-b rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-800">Original Text</h3>
            </div>
            <div className="flex-1 p-4">
              <textarea
                value={leftText}
                onChange={(e) => handleLeftChange(e.target.value)}
                placeholder="Paste original text here..."
                className="w-full h-full resize-none border-0 outline-none font-mono text-sm leading-relaxed"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Right Text */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col">
            <div className="p-4 bg-gray-50 border-b rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-800">Modified Text</h3>
            </div>
            <div className="flex-1 p-4">
              <textarea
                value={rightText}
                onChange={(e) => handleRightChange(e.target.value)}
                placeholder="Paste modified text here..."
                className="w-full h-full resize-none border-0 outline-none font-mono text-sm leading-relaxed"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Diff Output */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col">
            <div className="p-4 bg-gray-50 border-b rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-800">Differences</h3>
            </div>
            <div className="flex-1 p-4 overflow-auto">
              {diff.length > 0 ? (
                <div className="space-y-1">
                  {diff.map((line, index) => (
                    <div
                      key={index}
                      className={`flex items-start space-x-2 px-2 py-1 rounded text-sm font-mono ${
                        line.type === 'added'
                          ? 'bg-green-50 text-green-800'
                          : line.type === 'removed'
                          ? 'bg-red-50 text-red-800'
                          : 'bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span className="text-xs text-gray-500 w-8 flex-shrink-0 text-right">
                        {line.lineNumber}
                      </span>
                      <span className="w-4 flex-shrink-0">
                        {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                      </span>
                      <span className="flex-1 whitespace-pre-wrap break-all">
                        {line.content}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-sm">
                  Enter text in both panels to see differences...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiffChecker;