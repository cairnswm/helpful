import React, { useState, useCallback } from 'react';
import InfoSection from '../components/InfoSection';
import PageHeader from '../components/PageHeader';
import { Copy, Check, RotateCcw, AlertCircle, CheckCircle } from 'lucide-react';

interface Match {
  match: string;
  index: number;
  groups: string[];
}

const RegexTester: React.FC = () => {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [testString, setTestString] = useState('');
  const [matches, setMatches] = useState<Match[]>([]);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const testRegex = useCallback((regexPattern: string, regexFlags: string, text: string) => {
    if (!regexPattern || !text) {
      setMatches([]);
      setError('');
      return;
    }

    try {
      const regex = new RegExp(regexPattern, regexFlags);
      const foundMatches: Match[] = [];
      
      if (regexFlags.includes('g')) {
        let match;
        while ((match = regex.exec(text)) !== null) {
          foundMatches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1)
          });
          if (match.index === regex.lastIndex) break;
        }
      } else {
        const match = regex.exec(text);
        if (match) {
          foundMatches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1)
          });
        }
      }
      
      setMatches(foundMatches);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid regular expression');
      setMatches([]);
    }
  }, []);

  const handlePatternChange = (value: string) => {
    setPattern(value);
    testRegex(value, flags, testString);
  };

  const handleFlagsChange = (value: string) => {
    setFlags(value);
    testRegex(pattern, value, testString);
  };

  const handleTestStringChange = (value: string) => {
    setTestString(value);
    testRegex(pattern, flags, value);
  };

  const handleCopy = async () => {
    if (!pattern) return;
    
    try {
      await navigator.clipboard.writeText(`/${pattern}/${flags}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleClear = () => {
    setPattern('');
    setFlags('g');
    setTestString('');
    setMatches([]);
    setError('');
  };

  const highlightMatches = (text: string, matchList: Match[]): string => {
    if (matchList.length === 0) return text;
    
    let result = '';
    let lastIndex = 0;
    
    matchList.forEach((match, i) => {
      result += text.slice(lastIndex, match.index);
      result += `<mark class="bg-yellow-200 px-1 rounded">${match.match}</mark>`;
      lastIndex = match.index + match.match.length;
    });
    
    result += text.slice(lastIndex);
    return result;
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="Regex Tester"
          description="Build and test regular expressions interactively against sample text."
        />

        {/* Regex Input */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-6">
          <div className="p-4 bg-gray-50 border-b rounded-t-lg">
            <h3 className="text-lg font-semibold text-gray-800">Regular Expression</h3>
          </div>
          <div className="p-4">
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Pattern</label>
                <div className="flex items-center">
                  <span className="text-gray-500 font-mono text-lg mr-2">/</span>
                  <input
                    type="text"
                    value={pattern}
                    onChange={(e) => handlePatternChange(e.target.value)}
                    placeholder="Enter regex pattern..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="text-gray-500 font-mono text-lg mx-2">/</span>
                  <input
                    type="text"
                    value={flags}
                    onChange={(e) => handleFlagsChange(e.target.value)}
                    placeholder="flags"
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
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
                  disabled={!pattern}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    pattern
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  title="Copy regex"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span className="text-sm font-medium">
                    {copied ? 'Copied!' : 'Copy'}
                  </span>
                </button>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              <p className="mb-2"><strong>Common flags:</strong></p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <span><code className="bg-gray-100 px-1 rounded">g</code> - Global</span>
                <span><code className="bg-gray-100 px-1 rounded">i</code> - Ignore case</span>
                <span><code className="bg-gray-100 px-1 rounded">m</code> - Multiline</span>
                <span><code className="bg-gray-100 px-1 rounded">s</code> - Dot all</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Test String */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="p-4 bg-gray-50 border-b rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-800">Test String</h3>
            </div>
            <div className="p-4">
              <textarea
                value={testString}
                onChange={(e) => handleTestStringChange(e.target.value)}
                placeholder="Enter text to test against your regex..."
                className="w-full h-64 resize-none border border-gray-300 rounded-lg p-3 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Results */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-800">Results</h3>
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                error 
                  ? 'bg-red-100 text-red-800' 
                  : matches.length > 0 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600'
              }`}>
                {error ? (
                  <>
                    <AlertCircle className="h-4 w-4" />
                    <span>Error</span>
                  </>
                ) : matches.length > 0 ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>{matches.length} match{matches.length !== 1 ? 'es' : ''}</span>
                  </>
                ) : (
                  <span>No matches</span>
                )}
              </div>
            </div>
            
            <div className="p-4 h-64 overflow-auto">
              {error ? (
                <div className="text-red-600 text-sm font-medium">{error}</div>
              ) : testString && pattern ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Highlighted Text:</h4>
                    <div 
                      className="bg-gray-50 p-3 rounded-lg font-mono text-sm leading-relaxed whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: highlightMatches(testString, matches) }}
                    />
                  </div>
                  
                  {matches.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Matches:</h4>
                      <div className="space-y-2">
                        {matches.map((match, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded-lg">
                            <div className="font-mono text-sm">
                              <span className="text-blue-600">Match {index + 1}:</span> "{match.match}"
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              Position: {match.index}-{match.index + match.match.length}
                              {match.groups.length > 0 && (
                                <span className="ml-4">
                                  Groups: [{match.groups.map(g => `"${g}"`).join(', ')}]
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-500 text-sm">
                  Enter a regex pattern and test string to see results...
                </div>
              )}
            </div>
          </div>
        </div>

        <InfoSection 
          title="Regular Expression Testing"
          items={[
            {
              label: "Pattern Testing",
              description: "Test regex patterns against sample text in real-time"
            },
            {
              label: "Match Highlighting",
              description: "Visual highlighting of matches and capture groups"
            },
            {
              label: "Flag Support",
              description: "Global (g), case-insensitive (i), multiline (m), and more"
            },
            {
              label: "Group Capture",
              description: "Display captured groups and their positions"
            }
          ]}
          useCases="Data validation, text parsing, search and replace, input sanitization"
        />
      </div>
    </div>
  );
};

export default RegexTester;