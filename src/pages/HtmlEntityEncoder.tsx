import React, { useState, useCallback } from 'react';
import PageHeader from '../components/PageHeader';
import InfoSection from '../components/InfoSection';
import { Copy, Check, RotateCcw, ArrowUpDown } from 'lucide-react';

const HtmlEntityEncoder: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [copied, setCopied] = useState(false);

  const encodeHtmlEntities = (text: string): string => {
    const textarea = document.createElement('textarea');
    textarea.textContent = text;
    const encoded = textarea.innerHTML;
    
    // Additional encoding for common entities
    return encoded
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/&/g, '&amp;')
      .replace(/&amp;lt;/g, '&lt;')
      .replace(/&amp;gt;/g, '&gt;')
      .replace(/&amp;quot;/g, '&quot;')
      .replace(/&amp;#39;/g, '&#39;')
      .replace(/©/g, '&copy;')
      .replace(/®/g, '&reg;')
      .replace(/™/g, '&trade;')
      .replace(/€/g, '&euro;')
      .replace(/£/g, '&pound;')
      .replace(/¥/g, '&yen;')
      .replace(/¢/g, '&cent;')
      .replace(/§/g, '&sect;')
      .replace(/¶/g, '&para;')
      .replace(/•/g, '&bull;')
      .replace(/…/g, '&hellip;')
      .replace(/′/g, '&prime;')
      .replace(/″/g, '&Prime;')
      .replace(/‹/g, '&lsaquo;')
      .replace(/›/g, '&rsaquo;')
      .replace(/«/g, '&laquo;')
      .replace(/»/g, '&raquo;')
      .replace(/'/g, '&lsquo;')
      .replace(/'/g, '&rsquo;')
      .replace(/"/g, '&ldquo;')
      .replace(/"/g, '&rdquo;')
      .replace(/–/g, '&ndash;')
      .replace(/—/g, '&mdash;')
      .replace(/ /g, '&nbsp;')
      .replace(/×/g, '&times;')
      .replace(/÷/g, '&divide;')
      .replace(/±/g, '&plusmn;')
      .replace(/≤/g, '&le;')
      .replace(/≥/g, '&ge;')
      .replace(/≠/g, '&ne;')
      .replace(/≈/g, '&asymp;')
      .replace(/∞/g, '&infin;')
      .replace(/√/g, '&radic;')
      .replace(/∑/g, '&sum;')
      .replace(/∏/g, '&prod;')
      .replace(/∂/g, '&part;')
      .replace(/∫/g, '&int;')
      .replace(/∆/g, '&Delta;')
      .replace(/π/g, '&pi;')
      .replace(/α/g, '&alpha;')
      .replace(/β/g, '&beta;')
      .replace(/γ/g, '&gamma;')
      .replace(/δ/g, '&delta;')
      .replace(/ε/g, '&epsilon;')
      .replace(/θ/g, '&theta;')
      .replace(/λ/g, '&lambda;')
      .replace(/μ/g, '&mu;')
      .replace(/σ/g, '&sigma;')
      .replace(/τ/g, '&tau;')
      .replace(/φ/g, '&phi;')
      .replace(/ω/g, '&omega;');
  };

  const decodeHtmlEntities = (text: string): string => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  };

  const processInput = useCallback((value: string, currentMode: 'encode' | 'decode') => {
    if (!value.trim()) {
      setOutput('');
      return;
    }

    try {
      const result = currentMode === 'encode' 
        ? encodeHtmlEntities(value)
        : decodeHtmlEntities(value);
      setOutput(result);
    } catch {
      setOutput('Error processing input');
    }
  }, []);

  const handleInputChange = (value: string) => {
    setInput(value);
    processInput(value, mode);
  };

  const handleModeToggle = () => {
    const newMode = mode === 'encode' ? 'decode' : 'encode';
    setMode(newMode);
    setInput(output);
    processInput(output, newMode);
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

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="HTML Entity Encoder/Decoder"
          description="Convert special characters to HTML entities and back - useful for web development and data sanitization."
        />

        <div className="mb-6 flex items-center space-x-4">
          <div className="flex bg-gray-100 rounded-lg p-1" role="group" aria-label="Encoding mode selection">
            <button
              onClick={() => {
                setMode('encode');
                processInput(input, 'encode');
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === 'encode'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              aria-pressed={mode === 'encode'}
              aria-label="Switch to encode mode"
            >
              Encode
            </button>
            <button
              onClick={() => {
                setMode('decode');
                processInput(input, 'decode');
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === 'decode'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              aria-pressed={mode === 'decode'}
              aria-label="Switch to decode mode"
            >
              Decode
            </button>
          </div>
          
          <button
            onClick={handleModeToggle}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            aria-label="Swap input and output"
            title="Swap input and output"
          >
            <ArrowUpDown className="h-4 w-4" aria-hidden="true" />
            <span className="text-sm font-medium">Swap</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-320px)]">
          {/* Input Panel */}
          <section className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col" aria-labelledby="html-input-heading">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
              <h2 id="html-input-heading" className="text-lg font-semibold text-gray-800">
                {mode === 'encode' ? 'Text Input' : 'HTML Entities Input'}
              </h2>
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
              <label htmlFor="html-entity-input" className="sr-only">
                {mode === 'encode' ? 'Text with special characters to encode' : 'HTML entities to decode'}
              </label>
              <textarea
                id="html-entity-input"
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={mode === 'encode' ? 'Enter text with special characters...' : 'Enter HTML entities...'}
                className="w-full h-full resize-none border-0 outline-none font-mono text-sm leading-relaxed"
                spellCheck={false}
                aria-label={mode === 'encode' ? 'Text input for encoding' : 'HTML entities input for decoding'}
              />
            </div>
          </section>

          {/* Output Panel */}
          <section className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col" aria-labelledby="html-output-heading">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
              <h2 id="html-output-heading" className="text-lg font-semibold text-gray-800">
                {mode === 'encode' ? 'HTML Entities Output' : 'Decoded Output'}
              </h2>
              <button
                onClick={handleCopy}
                disabled={!output}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                  output
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                aria-label={copied ? 'Output copied to clipboard' : 'Copy output to clipboard'}
                title="Copy output"
              >
                {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                <span className="text-sm font-medium">
                  {copied ? 'Copied!' : 'Copy'}
                </span>
              </button>
            </div>
            
            <div className="flex-1 p-4">
              <label htmlFor="html-entity-output" className="sr-only">
                {mode === 'encode' ? 'HTML entities encoded output' : 'Decoded text output'}
              </label>
              <textarea
                id="html-entity-output"
                value={output}
                readOnly
                placeholder={`${mode === 'encode' ? 'Encoded HTML entities' : 'Decoded text'} will appear here...`}
                className="w-full h-full resize-none border-0 outline-none font-mono text-sm leading-relaxed bg-gray-50"
                aria-label={mode === 'encode' ? 'HTML entities encoded output' : 'Decoded text output'}
              />
            </div>
          </section>
        </div>

        <InfoSection 
          title="HTML Entity Encoding & Decoding"
          items={[
            {
              label: "Encode",
              description: "Convert special characters like <, >, &, quotes to HTML entities (&lt;, &gt;, &amp;, etc.)"
            },
            {
              label: "Decode",
              description: "Convert HTML entities back to their original characters"
            },
            {
              label: "Common Entities",
              description: "Supports symbols like ©, ®, ™, €, mathematical symbols, Greek letters, and more"
            },
            {
              label: "Use Cases",
              description: "Essential for displaying HTML code, preventing XSS attacks, and handling special characters in web content"
            }
          ]}
          useCases="web development, data sanitization, security, displaying code snippets, email formatting"
        />
      </div>
    </div>
  );
};

export default HtmlEntityEncoder;
