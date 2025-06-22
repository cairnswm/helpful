import React, { useState, useCallback } from 'react';
import { Copy, Check, RotateCcw, Minimize2, Maximize2 } from 'lucide-react';

const CssFormatter: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'format' | 'minify'>('format');
  const [copied, setCopied] = useState(false);

  const formatCss = (css: string): string => {
    if (!css.trim()) return '';
    
    try {
      // Basic CSS formatting
      let formatted = css
        // Remove extra whitespace
        .replace(/\s+/g, ' ')
        // Add newlines after opening braces
        .replace(/\{/g, ' {\n  ')
        // Add newlines after semicolons
        .replace(/;/g, ';\n  ')
        // Add newlines before closing braces
        .replace(/\}/g, '\n}\n\n')
        // Clean up extra spaces
        .replace(/\s*{\s*/g, ' {\n  ')
        .replace(/;\s*/g, ';\n  ')
        .replace(/\s*}\s*/g, '\n}\n\n')
        // Fix selectors
        .replace(/,\s*/g, ',\n')
        // Clean up multiple newlines
        .replace(/\n\s*\n\s*\n/g, '\n\n')
        .trim();
      
      return formatted;
    } catch (error) {
      return 'Error formatting CSS';
    }
  };

  const minifyCss = (css: string): string => {
    if (!css.trim()) return '';
    
    try {
      return css
        // Remove comments
        .replace(/\/\*[\s\S]*?\*\//g, '')
        // Remove extra whitespace
        .replace(/\s+/g, ' ')
        // Remove spaces around certain characters
        .replace(/\s*{\s*/g, '{')
        .replace(/;\s*/g, ';')
        .replace(/\s*}\s*/g, '}')
        .replace(/,\s*/g, ',')
        .replace(/:\s*/g, ':')
        // Remove trailing semicolons before closing braces
        .replace(/;}/g, '}')
        .trim();
    } catch (error) {
      return 'Error minifying CSS';
    }
  };

  const processInput = useCallback((value: string, currentMode: 'format' | 'minify') => {
    if (!value.trim()) {
      setOutput('');
      return;
    }

    const result = currentMode === 'format' ? formatCss(value) : minifyCss(value);
    setOutput(result);
  }, []);

  const handleInputChange = (value: string) => {
    setInput(value);
    processInput(value, mode);
  };

  const handleModeChange = (newMode: 'format' | 'minify') => {
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

  const sampleCss = `/* Sample CSS */
.header{background-color:#333;color:white;padding:20px;margin:0;}
.nav ul{list-style:none;margin:0;padding:0;}
.nav li{display:inline-block;margin-right:20px;}
.nav a{color:white;text-decoration:none;font-weight:bold;}
.nav a:hover{color:#ccc;}`;

  const handleLoadSample = () => {
    setInput(sampleCss);
    processInput(sampleCss, mode);
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">CSS Formatter</h1>
          <p className="text-gray-600">
            Format or minify CSS code for better readability or smaller file sizes.
          </p>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => handleModeChange('format')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === 'format'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Maximize2 className="h-4 w-4" />
                <span>Format</span>
              </button>
              <button
                onClick={() => handleModeChange('minify')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === 'minify'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Minimize2 className="h-4 w-4" />
                <span>Minify</span>
              </button>
            </div>
          </div>
          
          <button
            onClick={handleLoadSample}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Load Sample
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-320px)]">
          {/* Input Panel */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-800">CSS Input</h3>
              <button
                onClick={handleClear}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                title="Clear input"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            
            <div className="flex-1 p-4">
              <textarea
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Paste your CSS code here..."
                className="w-full h-full resize-none border-0 outline-none font-mono text-sm leading-relaxed"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Output Panel */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-800">
                {mode === 'format' ? 'Formatted' : 'Minified'} CSS
              </h3>
              <button
                onClick={handleCopy}
                disabled={!output}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                  output
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                title="Copy output"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span className="text-sm font-medium">
                  {copied ? 'Copied!' : 'Copy'}
                </span>
              </button>
            </div>
            
            <div className="flex-1 p-4 overflow-auto">
              <pre className="text-sm leading-relaxed font-mono whitespace-pre-wrap text-gray-800">
                {output || `${mode === 'format' ? 'Formatted' : 'Minified'} CSS will appear here...`}
              </pre>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">CSS Processing</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>Format:</strong> Adds proper indentation, line breaks, and spacing for readability</p>
            <p><strong>Minify:</strong> Removes unnecessary whitespace and comments to reduce file size</p>
            <p><strong>Note:</strong> This is a basic formatter. For production use, consider tools like Prettier or cssnano</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CssFormatter;