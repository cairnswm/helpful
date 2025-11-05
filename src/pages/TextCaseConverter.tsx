import React, { useState } from 'react';
import InfoSection from '../components/InfoSection';
import PageHeader from '../components/PageHeader';
import { Copy, Check, RotateCcw, Type } from 'lucide-react';

interface CaseConversion {
  name: string;
  description: string;
  convert: (text: string) => string;
  example: string;
}

const TextCaseConverter: React.FC = () => {
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const conversions: CaseConversion[] = [
    {
      name: 'camelCase',
      description: 'First word lowercase, subsequent words capitalized, no spaces',
      convert: (text: string) => {
        return text
          .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
            return index === 0 ? word.toLowerCase() : word.toUpperCase();
          })
          .replace(/\s+/g, '');
      },
      example: 'helloWorldExample'
    },
    {
      name: 'PascalCase',
      description: 'All words capitalized, no spaces',
      convert: (text: string) => {
        return text
          .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
          .replace(/\s+/g, '');
      },
      example: 'HelloWorldExample'
    },
    {
      name: 'snake_case',
      description: 'All lowercase with underscores between words',
      convert: (text: string) => {
        return text
          .replace(/\W+/g, ' ')
          .split(/ |\B(?=[A-Z])/)
          .map(word => word.toLowerCase())
          .join('_');
      },
      example: 'hello_world_example'
    },
    {
      name: 'kebab-case',
      description: 'All lowercase with hyphens between words',
      convert: (text: string) => {
        return text
          .replace(/\W+/g, ' ')
          .split(/ |\B(?=[A-Z])/)
          .map(word => word.toLowerCase())
          .join('-');
      },
      example: 'hello-world-example'
    },
    {
      name: 'SCREAMING_SNAKE_CASE',
      description: 'All uppercase with underscores between words',
      convert: (text: string) => {
        return text
          .replace(/\W+/g, ' ')
          .split(/ |\B(?=[A-Z])/)
          .map(word => word.toUpperCase())
          .join('_');
      },
      example: 'HELLO_WORLD_EXAMPLE'
    },
    {
      name: 'SCREAMING-KEBAB-CASE',
      description: 'All uppercase with hyphens between words',
      convert: (text: string) => {
        return text
          .replace(/\W+/g, ' ')
          .split(/ |\B(?=[A-Z])/)
          .map(word => word.toUpperCase())
          .join('-');
      },
      example: 'HELLO-WORLD-EXAMPLE'
    },
    {
      name: 'Title Case',
      description: 'First letter of each word capitalized',
      convert: (text: string) => {
        return text.replace(/\w\S*/g, (txt) => 
          txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
      },
      example: 'Hello World Example'
    },
    {
      name: 'Sentence case',
      description: 'First letter capitalized, rest lowercase',
      convert: (text: string) => {
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
      },
      example: 'Hello world example'
    },
    {
      name: 'lowercase',
      description: 'All characters in lowercase',
      convert: (text: string) => text.toLowerCase(),
      example: 'hello world example'
    },
    {
      name: 'UPPERCASE',
      description: 'All characters in uppercase',
      convert: (text: string) => text.toUpperCase(),
      example: 'HELLO WORLD EXAMPLE'
    },
    {
      name: 'aLtErNaTiNg CaSe',
      description: 'Alternating uppercase and lowercase characters',
      convert: (text: string) => {
        return text
          .split('')
          .map((char, index) => 
            index % 2 === 0 ? char.toLowerCase() : char.toUpperCase()
          )
          .join('');
      },
      example: 'hElLo WoRlD eXaMpLe'
    },
    {
      name: 'iNVERSE cASE',
      description: 'Inverts the case of each character',
      convert: (text: string) => {
        return text
          .split('')
          .map(char => 
            char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase()
          )
          .join('');
      },
      example: 'hELLO wORLD eXAMPLE'
    }
  ];

  const handleCopy = async (text: string, conversionName: string) => {
    if (!text) return;
    
    try {
      await navigator.clipboard.writeText(text);
      setCopied(conversionName);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleClear = () => {
    setInput('');
  };

  const loadSample = () => {
    setInput('Hello World Example Text');
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <PageHeader 
          title="Text Case Converter"
          description="Convert text between different case formats: camelCase, snake_case, kebab-case, PascalCase, and more."
        />

        {/* Input Panel */}
        <section className="bg-white rounded-lg shadow-lg border border-gray-200 mb-6" aria-labelledby="text-input-heading">
          <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
            <div className="flex items-center space-x-2">
              <Type className="h-5 w-5 text-blue-600" aria-hidden="true" />
              <h2 id="text-input-heading" className="text-lg font-semibold text-gray-800">Text Input</h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={loadSample}
                className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
                aria-label="Load sample text"
              >
                Load Sample
              </button>
              <button
                onClick={handleClear}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                aria-label="Clear input"
                title="Clear input"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
          
          <div className="p-4">
            <label htmlFor="text-case-input" className="sr-only">Text to convert to different cases</label>
            <textarea
              id="text-case-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text to convert between different cases..."
              className="w-full h-24 resize-none border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              spellCheck={false}
              aria-label="Text input for case conversion"
            />
          </div>
        </section>

        {/* Conversions Grid */}
        <section aria-label="Case conversion results">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {conversions.map((conversion) => {
              const convertedText = input ? conversion.convert(input) : '';
              
              return (
                <article
                  key={conversion.name}
                  className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
                  aria-labelledby={`conversion-${conversion.name.replace(/\s+/g, '-')}`}
                >
                  <div className="p-4 bg-gray-50 border-b">
                    <div className="flex items-center justify-between mb-2">
                      <h3 id={`conversion-${conversion.name.replace(/\s+/g, '-')}`} className="font-semibold text-gray-900">{conversion.name}</h3>
                      <button
                        onClick={() => handleCopy(convertedText, conversion.name)}
                        disabled={!convertedText}
                        className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors ${
                          convertedText
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                        aria-label={copied === conversion.name ? `${conversion.name} copied to clipboard` : `Copy ${conversion.name} conversion to clipboard`}
                        title="Copy converted text"
                      >
                        {copied === conversion.name ? <Check className="h-3 w-3" aria-hidden="true" /> : <Copy className="h-3 w-3" aria-hidden="true" />}
                        <span>{copied === conversion.name ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                    <p className="text-xs text-gray-600">{conversion.description}</p>
                  </div>
                  
                  <div className="p-4">
                    <div className="mb-3">
                      <div className="text-xs text-gray-500 mb-1">Example:</div>
                      <code className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {conversion.example}
                      </code>
                    </div>
                    
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Result:</div>
                      <div className="bg-gray-50 p-3 rounded-lg min-h-[3rem] flex items-center" role="status" aria-live="polite">
                        <code className="text-sm text-gray-800 font-mono break-all">
                          {convertedText || 'Enter text above to see conversion...'}
                        </code>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Usage Examples */}
        <section className="mt-8 bg-blue-50 rounded-lg p-6" aria-labelledby="use-cases-heading">
          <h3 id="use-cases-heading" className="text-lg font-semibold text-blue-900 mb-4">Common Use Cases</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-medium text-blue-800 mb-2">Programming</div>
              <ul className="text-blue-700 space-y-1">
                <li>• camelCase: JavaScript variables</li>
                <li>• PascalCase: Class names</li>
                <li>• snake_case: Python variables</li>
                <li>• kebab-case: CSS classes</li>
              </ul>
            </div>
            <div>
              <div className="font-medium text-blue-800 mb-2">Constants</div>
              <ul className="text-blue-700 space-y-1">
                <li>• SCREAMING_SNAKE_CASE: Constants</li>
                <li>• SCREAMING-KEBAB-CASE: Environment variables</li>
              </ul>
            </div>
            <div>
              <div className="font-medium text-blue-800 mb-2">Text Formatting</div>
              <ul className="text-blue-700 space-y-1">
                <li>• Title Case: Headings</li>
                <li>• Sentence case: Regular text</li>
                <li>• UPPERCASE: Emphasis</li>
              </ul>
            </div>
          </div>
        </div>

        <InfoSection 
          title="Text Case Conversion"
          items={[
            {
              label: "camelCase",
              description: "First word lowercase, subsequent words capitalized, no spaces"
            },
            {
              label: "PascalCase", 
              description: "All words capitalized, no spaces"
            },
            {
              label: "snake_case",
              description: "All lowercase words separated by underscores"
            },
            {
              label: "kebab-case",
              description: "All lowercase words separated by hyphens"
            },
            {
              label: "Title Case",
              description: "Each word capitalized with spaces preserved"
            }
          ]}
          useCases="Programming conventions, API naming, variable naming, documentation formatting"
        />
      </div>
    </div>
  );
};

export default TextCaseConverter;