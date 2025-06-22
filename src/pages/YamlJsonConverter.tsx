import React, { useState, useCallback } from 'react';
import { Copy, Check, RotateCcw, ArrowRightLeft, Download } from 'lucide-react';
import * as yaml from 'js-yaml';

const YamlJsonConverter: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'yamlToJson' | 'jsonToYaml'>('yamlToJson');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const yamlToJson = (yamlString: string): string => {
    try {
      const parsed = yaml.load(yamlString);
      return JSON.stringify(parsed, null, 2);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to parse YAML');
    }
  };

  const jsonToYaml = (jsonString: string): string => {
    try {
      const parsed = JSON.parse(jsonString);
      return yaml.dump(parsed, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
        sortKeys: false
      });
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to parse JSON');
    }
  };

  const processInput = useCallback((value: string, currentMode: 'yamlToJson' | 'jsonToYaml') => {
    if (!value.trim()) {
      setOutput('');
      setError('');
      return;
    }

    try {
      if (currentMode === 'yamlToJson') {
        const result = yamlToJson(value);
        setOutput(result);
        setError('');
      } else {
        const result = jsonToYaml(value);
        setOutput(result);
        setError('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed');
      setOutput('');
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">YAML ↔ JSON Converter</h1>
          <p className="text-gray-600">
            Convert between YAML and JSON formats with syntax validation and error detection.
          </p>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => {
                  setMode('yamlToJson');
                  processInput(input, 'yamlToJson');
                }}
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
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              title="Swap input and output"
            >
              <ArrowRightLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Swap</span>
            </button>
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
              <h3 className="text-lg font-semibold text-gray-800">
                {mode === 'yamlToJson' ? 'YAML Input' : 'JSON Input'}
              </h3>
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
                placeholder={
                  mode === 'yamlToJson' 
                    ? 'Enter YAML data to convert to JSON...\n\nExample:\napp:\n  name: "My App"\n  version: "1.0.0"\n  debug: true'
                    : 'Enter JSON data to convert to YAML...\n\nExample:\n{\n  "app": {\n    "name": "My App",\n    "version": "1.0.0",\n    "debug": true\n  }\n}'
                }
                className="w-full h-full resize-none border-0 outline-none font-mono text-sm leading-relaxed"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Output Panel */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-800">
                {mode === 'yamlToJson' ? 'JSON Output' : 'YAML Output'}
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleDownload}
                  disabled={!output}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    output
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  title="Download file"
                >
                  <Download className="h-4 w-4" />
                  <span className="text-sm font-medium">Download</span>
                </button>
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
            </div>
            
            <div className="flex-1 p-4">
              {error ? (
                <div className="text-red-600 text-sm font-medium bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              ) : (
                <textarea
                  value={output}
                  readOnly
                  placeholder={`${mode === 'yamlToJson' ? 'JSON' : 'YAML'} output will appear here...`}
                  className="w-full h-full resize-none border-0 outline-none font-mono text-sm leading-relaxed bg-gray-50"
                />
              )}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 bg-purple-50 rounded-lg p-4">
          <h4 className="font-semibold text-purple-900 mb-2">YAML ↔ JSON Conversion</h4>
          <div className="text-sm text-purple-800 space-y-1">
            <p><strong>YAML:</strong> Human-readable data serialization standard, commonly used for configuration files</p>
            <p><strong>JSON:</strong> Lightweight data interchange format, widely used in APIs and web applications</p>
            <p><strong>Use cases:</strong> Configuration management, API data transformation, documentation</p>
            <p><strong>Features:</strong> Preserves data types, handles nested structures, validates syntax</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YamlJsonConverter;