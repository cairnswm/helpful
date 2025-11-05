import React, { useState, useCallback } from 'react';
import InfoSection from '../components/InfoSection';
import PageHeader from '../components/PageHeader';
import { Copy, Check, RotateCcw, ArrowRightLeft, Download } from 'lucide-react';
import * as yaml from 'js-yaml';
import { parseAndCleanJson } from '../utils/jsonCleaner';

const YamlJsonConverter: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'yamlToJson' | 'jsonToYaml'>('yamlToJson');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [wasCleaned, setWasCleaned] = useState(false);

  const yamlToJson = (yamlString: string): string => {
    try {
      const parsed = yaml.load(yamlString);
      return JSON.stringify(parsed, null, 2);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to parse YAML');
    }
  };

  const jsonToYaml = (jsonString: string): { result: string; wasCleaned: boolean } => {
    try {
      const parseResult = parseAndCleanJson(jsonString);
      if (!parseResult.isValid) {
        throw new Error('Invalid JSON');
      }
      const parsed = JSON.parse(parseResult.cleanedJson);
      const result = yaml.dump(parsed, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
        sortKeys: false
      });
      return { result, wasCleaned: parseResult.wasCleaned };
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to parse JSON');
    }
  };

  const processInput = useCallback((value: string, currentMode: 'yamlToJson' | 'jsonToYaml') => {
    if (!value.trim()) {
      setOutput('');
      setError('');
      setWasCleaned(false);
      return;
    }

    try {
      if (currentMode === 'yamlToJson') {
        const result = yamlToJson(value);
        setOutput(result);
        setWasCleaned(false);
        setError('');
      } else {
        const { result, wasCleaned: cleaned } = jsonToYaml(value);
        setOutput(result);
        setWasCleaned(cleaned);
        setError('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed');
      setOutput('');
      setWasCleaned(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setInput(value);
    processInput(value, mode);
  };

  const handleModeToggle = () => {
    const newMode = mode === 'yamlToJson' ? 'jsonToYaml' : 'yamlToJson';
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

  const handleDownload = () => {
    if (!output) return;
    
    const blob = new Blob([output], { 
      type: mode === 'yamlToJson' ? 'application/json' : 'text/yaml' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = mode === 'yamlToJson' ? 'data.json' : 'data.yaml';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  const sampleYaml = `# Configuration file
app:
  name: "My Application"
  version: "1.0.0"
  debug: true
  
database:
  host: "localhost"
  port: 5432
  name: "myapp_db"
  credentials:
    username: "admin"
    password: "secret123"
    
features:
  - authentication
  - logging
  - caching
  
settings:
  max_connections: 100
  timeout: 30
  retry_attempts: 3`;

  const sampleJson = `{
  "app": {
    "name": "My Application",
    "version": "1.0.0",
    "debug": true
  },
  "database": {
    "host": "localhost",
    "port": 5432,
    "name": "myapp_db",
    "credentials": {
      "username": "admin",
      "password": "secret123"
    }
  },
  "features": [
    "authentication",
    "logging",
    "caching"
  ],
  "settings": {
    "max_connections": 100,
    "timeout": 30,
    "retry_attempts": 3
  }
}`;

  const handleLoadSample = () => {
    const sample = mode === 'yamlToJson' ? sampleYaml : sampleJson;
    setInput(sample);
    processInput(sample, mode);
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="YAML ↔ JSON Converter"
          description="Convert between YAML and JSON formats with syntax validation and error detection."
        />

        <section aria-labelledby="conversion-controls-heading" className="mb-6">
          <h2 id="conversion-controls-heading" className="sr-only">Conversion Controls</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div role="group" aria-label="Conversion mode selection" className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => {
                    setMode('yamlToJson');
                    processInput(input, 'yamlToJson');
                  }}
                  aria-pressed={mode === 'yamlToJson'}
                  aria-label="Convert YAML to JSON"
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    mode === 'yamlToJson'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  YAML to JSON
                </button>
                <button
                  onClick={() => {
                    setMode('jsonToYaml');
                    processInput(input, 'jsonToYaml');
                  }}
                  aria-pressed={mode === 'jsonToYaml'}
                  aria-label="Convert JSON to YAML"
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    mode === 'jsonToYaml'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  JSON to YAML
                </button>
              </div>
              
              <button
                onClick={handleModeToggle}
                aria-label="Swap input and output"
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                title="Swap input and output"
              >
                <ArrowRightLeft className="h-4 w-4" aria-hidden="true" />
                <span className="text-sm font-medium">Swap</span>
              </button>
            </div>
            
            <button
              onClick={handleLoadSample}
              aria-label="Load sample data"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Load Sample
            </button>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[calc(100vh-320px)]">
          {/* Input Panel */}
          <section aria-labelledby="input-panel-heading" className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
              <h2 id="input-panel-heading" className="text-lg font-semibold text-gray-800">
                {mode === 'yamlToJson' ? 'YAML Input' : 'JSON Input'}
              </h2>
              <button
                onClick={handleClear}
                aria-label="Clear input"
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                title="Clear input"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            
            <div className="flex-1 p-4">
              <label htmlFor="input-textarea" className="sr-only">
                {mode === 'yamlToJson' ? 'YAML input' : 'JSON input'}
              </label>
              <textarea
                id="input-textarea"
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                aria-label={mode === 'yamlToJson' ? 'YAML input field' : 'JSON input field'}
                placeholder={
                  mode === 'yamlToJson' 
                    ? 'Enter YAML data to convert to JSON...\n\nExample:\napp:\n  name: "My App"\n  version: "1.0.0"\n  debug: true'
                    : 'Enter JSON data to convert to YAML...\n\nExample:\n{\n  "app": {\n    "name": "My App",\n    "version": "1.0.0",\n    "debug": true\n  }\n}'
                }
                className="w-full h-full resize-none border-0 outline-none font-mono text-sm leading-relaxed"
                spellCheck={false}
              />
            </div>
          </section>

          {/* Output Panel */}
          <section aria-labelledby="output-panel-heading" className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
              <div className="flex items-center space-x-2">
                <h2 id="output-panel-heading" className="text-lg font-semibold text-gray-800">
                  {mode === 'yamlToJson' ? 'JSON Output' : 'YAML Output'}
                </h2>
                {wasCleaned && mode === 'jsonToYaml' && output && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Auto-cleaned
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleDownload}
                  disabled={!output}
                  aria-label={`Download ${mode === 'yamlToJson' ? 'JSON' : 'YAML'} file`}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    output
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  title="Download file"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  <span className="text-sm font-medium">Download</span>
                </button>
                <button
                  onClick={handleCopy}
                  disabled={!output}
                  aria-label={copied ? 'Output copied to clipboard' : 'Copy output to clipboard'}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    output
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  title="Copy output"
                >
                  {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                  <span className="text-sm font-medium">
                    {copied ? 'Copied!' : 'Copy'}
                  </span>
                </button>
              </div>
            </div>
            
            <div className="flex-1 p-4">
              {error ? (
                <div role="alert" aria-live="assertive" className="text-red-600 text-sm font-medium bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              ) : (
                <>
                  <label htmlFor="output-textarea" className="sr-only">
                    {mode === 'yamlToJson' ? 'JSON output' : 'YAML output'}
                  </label>
                  <textarea
                    id="output-textarea"
                    value={output}
                    readOnly
                    aria-label={mode === 'yamlToJson' ? 'JSON output field' : 'YAML output field'}
                    placeholder={`${mode === 'yamlToJson' ? 'JSON' : 'YAML'} output will appear here...`}
                    className="w-full h-full resize-none border-0 outline-none font-mono text-sm leading-relaxed bg-gray-50"
                  />
                </>
              )}
            </div>
          </section>
        </div>
        {copied && (
          <div role="status" aria-live="polite" className="sr-only">
            Output copied to clipboard
          </div>
        )}

        <InfoSection 
          title="YAML ↔ JSON Conversion"
          items={[
            {
              label: "YAML",
              description: "Human-readable data serialization standard, commonly used for configuration files"
            },
            {
              label: "JSON",
              description: "Lightweight data interchange format, widely used in APIs and web applications"
            },
            {
              label: "Features",
              description: "Preserves data types, handles nested structures, validates syntax"
            },
            {
              label: "Bidirectional",
              description: "Convert YAML to JSON and JSON to YAML with proper formatting"
            }
          ]}
          useCases="Configuration management, API data transformation, documentation, DevOps"
        />
      </div>
    </div>
  );
};

export default YamlJsonConverter;