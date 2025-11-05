import React, { useState, useCallback } from 'react';
import PageHeader from '../components/PageHeader';
import InfoSection from '../components/InfoSection';
import { Copy, Check, RotateCcw } from 'lucide-react';

type EnvFormat = 'env' | 'docker' | 'kubernetes' | 'json' | 'yaml';

const EnvVariableManager: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [sourceFormat, setSourceFormat] = useState<EnvFormat>('env');
  const [targetFormat, setTargetFormat] = useState<EnvFormat>('docker');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const parseEnvFile = (text: string): Record<string, string> => {
    const vars: Record<string, string> = {};
    const lines = text.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      
      const equalIndex = trimmed.indexOf('=');
      if (equalIndex === -1) continue;
      
      const key = trimmed.substring(0, equalIndex).trim();
      let value = trimmed.substring(equalIndex + 1).trim();
      
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      vars[key] = value;
    }
    
    return vars;
  };

  const parseDockerFormat = (text: string): Record<string, string> => {
    const vars: Record<string, string> = {};
    const lines = text.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      
      // Docker format: -e KEY=VALUE or --env KEY=VALUE
      const match = trimmed.match(/(?:-e|--env)\s+([^=]+)=(.+)/);
      if (match) {
        vars[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
      }
    }
    
    return vars;
  };

  const parseKubernetesFormat = (text: string): Record<string, string> => {
    const vars: Record<string, string> = {};
    const lines = text.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      
      // Kubernetes format: - name: KEY\n  value: VALUE
      const nameMatch = trimmed.match(/- name:\s*(.+)/);
      if (nameMatch) {
        const key = nameMatch[1].trim();
        // Look for value on next line (this is simplified)
        const valueMatch = text.match(new RegExp(`- name:\\s*${key}\\s*\\n\\s*value:\\s*(.+)`));
        if (valueMatch) {
          vars[key] = valueMatch[1].trim().replace(/^["']|["']$/g, '');
        }
      }
    }
    
    return vars;
  };

  const parseJson = (text: string): Record<string, string> => {
    try {
      return JSON.parse(text);
    } catch {
      throw new Error('Invalid JSON format');
    }
  };

  const parseYaml = (text: string): Record<string, string> => {
    const vars: Record<string, string> = {};
    const lines = text.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      
      const colonIndex = trimmed.indexOf(':');
      if (colonIndex === -1) continue;
      
      const key = trimmed.substring(0, colonIndex).trim();
      let value = trimmed.substring(colonIndex + 1).trim();
      
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      vars[key] = value;
    }
    
    return vars;
  };

  const toEnvFormat = (vars: Record<string, string>): string => {
    return Object.entries(vars)
      .map(([key, value]) => {
        // Quote value if it contains spaces or special characters
        const needsQuotes = /[\s#$]/.test(value);
        return `${key}=${needsQuotes ? `"${value}"` : value}`;
      })
      .join('\n');
  };

  const toDockerFormat = (vars: Record<string, string>): string => {
    return Object.entries(vars)
      .map(([key, value]) => {
        const needsQuotes = /[\s#$]/.test(value);
        return `-e ${key}=${needsQuotes ? `"${value}"` : value}`;
      })
      .join(' \\\n');
  };

  const toKubernetesFormat = (vars: Record<string, string>): string => {
    return Object.entries(vars)
      .map(([key, value]) => `- name: ${key}\n  value: "${value}"`)
      .join('\n');
  };

  const toJsonFormat = (vars: Record<string, string>): string => {
    return JSON.stringify(vars, null, 2);
  };

  const toYamlFormat = (vars: Record<string, string>): string => {
    return Object.entries(vars)
      .map(([key, value]) => {
        const needsQuotes = /[\s#:]/.test(value);
        return `${key}: ${needsQuotes ? `"${value}"` : value}`;
      })
      .join('\n');
  };

  const processInput = useCallback((text: string, source: EnvFormat, target: EnvFormat) => {
    if (!text.trim()) {
      setOutput('');
      setError('');
      return;
    }

    try {
      let vars: Record<string, string> = {};

      // Parse input based on source format
      switch (source) {
        case 'env':
          vars = parseEnvFile(text);
          break;
        case 'docker':
          vars = parseDockerFormat(text);
          break;
        case 'kubernetes':
          vars = parseKubernetesFormat(text);
          break;
        case 'json':
          vars = parseJson(text);
          break;
        case 'yaml':
          vars = parseYaml(text);
          break;
      }

      // Convert to target format
      let result = '';
      switch (target) {
        case 'env':
          result = toEnvFormat(vars);
          break;
        case 'docker':
          result = toDockerFormat(vars);
          break;
        case 'kubernetes':
          result = toKubernetesFormat(vars);
          break;
        case 'json':
          result = toJsonFormat(vars);
          break;
        case 'yaml':
          result = toYamlFormat(vars);
          break;
      }

      setOutput(result);
      setError('');
    } catch (err) {
      setError((err as Error).message || 'Error processing input');
      setOutput('');
    }
  }, []);

  const handleInputChange = (value: string) => {
    setInput(value);
    processInput(value, sourceFormat, targetFormat);
  };

  const handleSourceFormatChange = (format: EnvFormat) => {
    setSourceFormat(format);
    processInput(input, format, targetFormat);
  };

  const handleTargetFormatChange = (format: EnvFormat) => {
    setTargetFormat(format);
    processInput(input, sourceFormat, format);
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
    setError('');
  };

  const loadSample = () => {
    const sample = `# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
DATABASE_POOL_SIZE=10

# API Settings
API_KEY=your-secret-key-here
API_TIMEOUT=30000
API_BASE_URL=https://api.example.com

# Feature Flags
ENABLE_ANALYTICS=true
DEBUG_MODE=false`;
    
    setInput(sample);
    processInput(sample, sourceFormat, targetFormat);
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="Environment Variable Manager"
          description="Format and convert between different environment file formats (.env, Docker, Kubernetes, etc.) with validation."
        />

        <section aria-labelledby="format-options-heading">
          <div className="mb-6 bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <h2 id="format-options-heading" className="sr-only">Format Conversion Options</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="source-format" className="block text-sm font-medium text-gray-700 mb-2">
                  Source Format
                </label>
                <select
                  id="source-format"
                  value={sourceFormat}
                  onChange={(e) => handleSourceFormatChange(e.target.value as EnvFormat)}
                  aria-label="Select source format for environment variables"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                <option value="env">.env File</option>
                <option value="docker">Docker (-e flags)</option>
                <option value="kubernetes">Kubernetes (YAML)</option>
                <option value="json">JSON</option>
                <option value="yaml">YAML</option>
              </select>
            </div>

            <div>
              <label htmlFor="target-format" className="block text-sm font-medium text-gray-700 mb-2">
                Target Format
              </label>
              <select
                id="target-format"
                value={targetFormat}
                onChange={(e) => handleTargetFormatChange(e.target.value as EnvFormat)}
                aria-label="Select target format for environment variables"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="env">.env File</option>
                <option value="docker">Docker (-e flags)</option>
                <option value="kubernetes">Kubernetes (YAML)</option>
                <option value="json">JSON</option>
                <option value="yaml">YAML</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={loadSample}
              aria-label="Load sample environment variables"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Load Sample
            </button>
          </div>
        </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[calc(100vh-400px)]">
          {/* Input Panel */}
          <section aria-labelledby="input-heading">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col">
              <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
                <h2 id="input-heading" className="text-lg font-semibold text-gray-800">Input</h2>
                <button
                  onClick={handleClear}
                  aria-label="Clear all input and output"
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                  title="Clear input"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              
              <div className="flex-1 p-4">
                <label htmlFor="input-textarea" className="sr-only">Environment variables input</label>
                <textarea
                  id="input-textarea"
                  value={input}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder={`Enter environment variables in ${sourceFormat} format...`}
                  aria-label={`Environment variables in ${sourceFormat} format`}
                  className="w-full h-full resize-none border-0 outline-none font-mono text-sm leading-relaxed"
                  spellCheck={false}
                />
              </div>
            </div>
          </section>

          {/* Output Panel */}
          <section aria-labelledby="output-heading">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col">
              <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
                <h2 id="output-heading" className="text-lg font-semibold text-gray-800">Output</h2>
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
              
              <div className="flex-1 p-4">
                {error ? (
                  <div role="alert" aria-live="assertive" className="text-red-600 text-sm font-medium">{error}</div>
                ) : (
                  <>
                    <label htmlFor="output-textarea" className="sr-only">Converted environment variables output</label>
                    <textarea
                      id="output-textarea"
                      value={output}
                      readOnly
                      placeholder={`Converted to ${targetFormat} format will appear here...`}
                      aria-label={`Converted output in ${targetFormat} format`}
                      aria-live="polite"
                      className="w-full h-full resize-none border-0 outline-none font-mono text-sm leading-relaxed bg-gray-50"
                    />
                  </>
                )}
              </div>
            </div>
          </section>
        </div>

        <InfoSection 
          title="Environment Variable Format Conversion"
          items={[
            {
              label: ".env File",
              description: "Standard environment variable format: KEY=value"
            },
            {
              label: "Docker",
              description: "Docker run command format with -e flags"
            },
            {
              label: "Kubernetes",
              description: "Kubernetes ConfigMap/Secret YAML format"
            },
            {
              label: "JSON",
              description: "JSON object with key-value pairs"
            },
            {
              label: "YAML",
              description: "YAML format for configuration files"
            }
          ]}
          useCases="DevOps, containerization, deployment, configuration management, CI/CD pipelines"
        />
      </div>
    </div>
  );
};

export default EnvVariableManager;
