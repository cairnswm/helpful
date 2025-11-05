import React, { useState, useCallback } from 'react';
import PageHeader from '../components/PageHeader';
import InfoSection from '../components/InfoSection';
import { Copy, Check, RotateCcw, Minimize2, Maximize2 } from 'lucide-react';

const JavaScriptMinifier: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'minify' | 'beautify'>('minify');
  const [copied, setCopied] = useState(false);

  const minifyJavaScript = (code: string): string => {
    if (!code.trim()) return '';
    
    try {
      return code
        // Remove single-line comments
        .replace(/\/\/.*$/gm, '')
        // Remove multi-line comments
        .replace(/\/\*[\s\S]*?\*\//g, '')
        // Remove extra whitespace
        .replace(/\s+/g, ' ')
        // Remove spaces around operators and punctuation
        .replace(/\s*([+\-*/%=<>!&|^~?:,;{}()[\]])\s*/g, '$1')
        // Remove spaces after keywords
        .replace(/\b(return|var|let|const|if|else|for|while|do|switch|case|break|continue|function|class|new|typeof|instanceof|in|of|throw|try|catch|finally|import|export|from|default|async|await)\s+/g, '$1 ')
        // Clean up
        .trim();
    } catch {
      return 'Error minifying JavaScript';
    }
  };

  const beautifyJavaScript = (code: string): string => {
    if (!code.trim()) return '';
    
    try {
      const formatted = code;
      let indentLevel = 0;
      const indentStr = '  ';
      let result = '';
      let inString = false;
      let stringChar = '';
      
      for (let i = 0; i < formatted.length; i++) {
        const char = formatted[i];
        const prevChar = i > 0 ? formatted[i - 1] : '';
        const nextChar = i < formatted.length - 1 ? formatted[i + 1] : '';
        
        // Track if we're inside a string
        if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
          if (!inString) {
            inString = true;
            stringChar = char;
          } else if (char === stringChar) {
            inString = false;
          }
        }
        
        if (inString) {
          result += char;
          continue;
        }
        
        // Handle opening braces
        if (char === '{') {
          result += ' {\n';
          indentLevel++;
          result += indentStr.repeat(indentLevel);
          continue;
        }
        
        // Handle closing braces
        if (char === '}') {
          indentLevel = Math.max(0, indentLevel - 1);
          result += '\n' + indentStr.repeat(indentLevel) + '}';
          if (nextChar && nextChar !== ';' && nextChar !== ',' && nextChar !== ')') {
            result += '\n' + indentStr.repeat(indentLevel);
          }
          continue;
        }
        
        // Handle semicolons
        if (char === ';') {
          result += ';\n' + indentStr.repeat(indentLevel);
          continue;
        }
        
        result += char;
      }
      
      // Clean up extra whitespace and newlines
      return result
        .split('\n')
        .map(line => line.trimEnd())
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
    } catch (error) {
      return 'Error beautifying JavaScript';
    }
  };

  const processInput = useCallback((value: string, currentMode: 'minify' | 'beautify') => {
    if (!value.trim()) {
      setOutput('');
      return;
    }

    const result = currentMode === 'minify' 
      ? minifyJavaScript(value) 
      : beautifyJavaScript(value);
    setOutput(result);
  }, []);

  const handleInputChange = (value: string) => {
    setInput(value);
    processInput(value, mode);
  };

  const handleModeChange = (newMode: 'minify' | 'beautify') => {
    setMode(newMode);
    processInput(input, newMode);
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
  };

  const loadSample = () => {
    const sample = `// Sample JavaScript code
function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price * items[i].quantity;
  }
  return total;
}

const cart = [
  { name: 'Product 1', price: 29.99, quantity: 2 },
  { name: 'Product 2', price: 49.99, quantity: 1 }
];

const total = calculateTotal(cart);
console.log('Total: $' + total.toFixed(2));`;
    
    setInput(sample);
    processInput(sample, mode);
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="JavaScript Minifier/Beautifier"
          description="Minify JavaScript code for production deployment or beautify compressed code for readability."
        />

        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex bg-gray-100 rounded-lg p-1" role="group" aria-label="JavaScript formatting mode">
              <button
                onClick={() => handleModeChange('minify')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === 'minify'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                aria-pressed={mode === 'minify'}
                aria-label="Minify JavaScript"
              >
                <Minimize2 className="h-4 w-4" aria-hidden="true" />
                <span>Minify</span>
              </button>
              <button
                onClick={() => handleModeChange('beautify')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === 'beautify'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                aria-pressed={mode === 'beautify'}
                aria-label="Beautify JavaScript"
              >
                <Maximize2 className="h-4 w-4" aria-hidden="true" />
                <span>Beautify</span>
              </button>
            </div>
          </div>
          
          <button
            onClick={loadSample}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            aria-label="Load sample JavaScript"
          >
            Load Sample
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[calc(100vh-320px)]">
          {/* Input Panel */}
          <section className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col" aria-labelledby="js-input-heading">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
              <h2 id="js-input-heading" className="text-lg font-semibold text-gray-800">JavaScript Input</h2>
              <button
                onClick={handleClear}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                aria-label="Clear input"
                title="Clear input"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            
            <div className="flex-1 p-4">
              <label htmlFor="js-input" className="sr-only">JavaScript code to {mode === 'minify' ? 'minify' : 'beautify'}</label>
              <textarea
                id="js-input"
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Paste your JavaScript code here..."
                className="w-full h-full resize-none border-0 outline-none font-mono text-sm leading-relaxed"
                spellCheck={false}
                aria-label="JavaScript input"
              />
            </div>
          </section>

          {/* Output Panel */}
          <section className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col" aria-labelledby="js-output-heading">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
              <h2 id="js-output-heading" className="text-lg font-semibold text-gray-800">
                {mode === 'minify' ? 'Minified' : 'Beautified'} JavaScript
              </h2>
              <button
                onClick={handleCopy}
                disabled={!output}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                  output
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                aria-label={copied ? 'JavaScript copied to clipboard' : 'Copy JavaScript to clipboard'}
                title="Copy output"
              >
                {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                <span className="text-sm font-medium">
                  {copied ? 'Copied!' : 'Copy'}
                </span>
              </button>
            </div>
            
            <div className="flex-1 p-4 overflow-auto">
              <pre className="text-sm leading-relaxed font-mono whitespace-pre-wrap text-gray-800">
                {output || `${mode === 'minify' ? 'Minified' : 'Beautified'} JavaScript will appear here...`}
              </pre>
            </div>
          </section>
        </div>

        <InfoSection 
          title="JavaScript Processing"
          items={[
            {
              label: "Minify",
              description: "Removes comments, whitespace, and unnecessary characters to reduce file size"
            },
            {
              label: "Beautify",
              description: "Adds proper indentation and formatting for better code readability"
            },
            {
              label: "Note",
              description: "This is a basic minifier. For production use, consider tools like UglifyJS, Terser, or build tools like webpack"
            },
            {
              label: "Limitations",
              description: "Does not perform variable renaming or advanced optimizations"
            }
          ]}
          useCases="production deployment, code obfuscation, file size reduction, code readability"
        />
      </div>
    </div>
  );
};

export default JavaScriptMinifier;
