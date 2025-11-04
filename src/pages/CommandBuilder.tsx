import React, { useState } from 'react';
import InfoSection from '../components/InfoSection';
import PageHeader from '../components/PageHeader';
import { Copy, Check, Terminal, Plus, Trash2 } from 'lucide-react';

interface CurlOption {
  flag: string;
  value: string;
  description: string;
}

const CommandBuilder: React.FC = () => {
  const [commandType, setCommandType] = useState('curl');
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('GET');
  const [headers, setHeaders] = useState<Array<{key: string, value: string}>>([]);
  const [data, setData] = useState('');
  const [options, setOptions] = useState<CurlOption[]>([]);
  const [copied, setCopied] = useState(false);

  const curlMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
  
  const commonCurlOptions = [
    { flag: '-v', value: '', description: 'Verbose output' },
    { flag: '-i', value: '', description: 'Include response headers' },
    { flag: '-L', value: '', description: 'Follow redirects' },
    { flag: '-k', value: '', description: 'Ignore SSL certificate errors' },
    { flag: '-s', value: '', description: 'Silent mode' },
    { flag: '-o', value: 'output.txt', description: 'Write output to file' },
    { flag: '--connect-timeout', value: '30', description: 'Connection timeout in seconds' },
    { flag: '--max-time', value: '300', description: 'Maximum time for request' },
    { flag: '--user-agent', value: 'MyApp/1.0', description: 'Set User-Agent header' },
    { flag: '--cookie', value: 'name=value', description: 'Send cookies' },
    { flag: '--referer', value: 'https://example.com', description: 'Set Referer header' }
  ];

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const updateHeader = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const addOption = (option: CurlOption) => {
    if (!options.find(opt => opt.flag === option.flag)) {
      setOptions([...options, { ...option }]);
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index].value = value;
    setOptions(newOptions);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const generateCurlCommand = (): string => {
    let command = 'curl';
    
    // Add method
    if (method !== 'GET') {
      command += ` -X ${method}`;
    }
    
    // Add headers
    headers.forEach(header => {
      if (header.key.trim() && header.value.trim()) {
        command += ` -H "${header.key}: ${header.value}"`;
      }
    });
    
    // Add data for POST/PUT/PATCH
    if (['POST', 'PUT', 'PATCH'].includes(method) && data.trim()) {
      command += ` -d '${data}'`;
    }
    
    // Add custom options
    options.forEach(option => {
      if (option.value.trim()) {
        command += ` ${option.flag} "${option.value}"`;
      } else {
        command += ` ${option.flag}`;
      }
    });
    
    // Add URL
    if (url.trim()) {
      command += ` "${url}"`;
    }
    
    return command;
  };

  const generateDockerCommand = (): string => {
    // Simple Docker run command builder
    let command = 'docker run';
    
    if (options.find(opt => opt.flag === '-d')) {
      command += ' -d';
    }
    
    if (options.find(opt => opt.flag === '-it')) {
      command += ' -it';
    }
    
    const portOption = options.find(opt => opt.flag === '-p');
    if (portOption && portOption.value) {
      command += ` -p ${portOption.value}`;
    }
    
    const volumeOption = options.find(opt => opt.flag === '-v');
    if (volumeOption && volumeOption.value) {
      command += ` -v ${volumeOption.value}`;
    }
    
    const nameOption = options.find(opt => opt.flag === '--name');
    if (nameOption && nameOption.value) {
      command += ` --name ${nameOption.value}`;
    }
    
    if (url.trim()) {
      command += ` ${url}`;
    }
    
    return command;
  };

  const generateCommand = (): string => {
    switch (commandType) {
      case 'curl':
        return generateCurlCommand();
      case 'docker':
        return generateDockerCommand();
      default:
        return '';
    }
  };

  const handleCopy = async () => {
    const command = generateCommand();
    if (!command) return;
    
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const loadSampleCurl = () => {
    setCommandType('curl');
    setUrl('https://api.example.com/users');
    setMethod('POST');
    setHeaders([
      { key: 'Content-Type', value: 'application/json' },
      { key: 'Authorization', value: 'Bearer your-token-here' }
    ]);
    setData('{"name": "John Doe", "email": "john@example.com"}');
    setOptions([
      { flag: '-v', value: '', description: 'Verbose output' }
    ]);
  };

  const loadSampleDocker = () => {
    setCommandType('docker');
    setUrl('nginx:latest');
    setMethod('GET');
    setHeaders([]);
    setData('');
    setOptions([
      { flag: '-d', value: '', description: 'Run in background' },
      { flag: '-p', value: '8080:80', description: 'Port mapping' },
      { flag: '--name', value: 'my-nginx', description: 'Container name' }
    ]);
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="Command Builder"
          description="Build common command line commands interactively with a visual interface."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Command Builder */}
          <div className="space-y-6">
            {/* Command Type */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="p-4 bg-gray-50 border-b rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Terminal className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Command Type</h3>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={loadSampleCurl}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      Sample cURL
                    </button>
                    <button
                      onClick={loadSampleDocker}
                      className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition-colors"
                    >
                      Sample Docker
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCommandType('curl')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      commandType === 'curl'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    cURL
                  </button>
                  <button
                    onClick={() => setCommandType('docker')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      commandType === 'docker'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Docker
                  </button>
                </div>
              </div>
            </div>

            {/* URL/Image */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="p-4 bg-gray-50 border-b rounded-t-lg">
                <h3 className="text-lg font-semibold text-gray-800">
                  {commandType === 'curl' ? 'URL' : 'Image/Command'}
                </h3>
              </div>
              <div className="p-4 space-y-4">
                {commandType === 'curl' && (
                  <div className="flex space-x-2">
                    <select
                      value={method}
                      onChange={(e) => setMethod(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {curlMethods.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://api.example.com/endpoint"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}
                
                {commandType === 'docker' && (
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="nginx:latest"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}
              </div>
            </div>

            {/* Headers (cURL only) */}
            {commandType === 'curl' && (
              <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
                  <h3 className="text-lg font-semibold text-gray-800">Headers</h3>
                  <button
                    onClick={addHeader}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add</span>
                  </button>
                </div>
                <div className="p-4 space-y-2">
                  {headers.map((header, index) => (
                    <div key={index} className="flex space-x-2">
                      <input
                        type="text"
                        value={header.key}
                        onChange={(e) => updateHeader(index, 'key', e.target.value)}
                        placeholder="Header name"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        value={header.value}
                        onChange={(e) => updateHeader(index, 'value', e.target.value)}
                        placeholder="Header value"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => removeHeader(index)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Request Body (cURL POST/PUT/PATCH only) */}
            {commandType === 'curl' && ['POST', 'PUT', 'PATCH'].includes(method) && (
              <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                <div className="p-4 bg-gray-50 border-b rounded-t-lg">
                  <h3 className="text-lg font-semibold text-gray-800">Request Body</h3>
                </div>
                <div className="p-4">
                  <textarea
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    placeholder="Enter request body (JSON, XML, etc.)"
                    className="w-full h-24 resize-none border border-gray-300 rounded-lg p-3 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    spellCheck={false}
                  />
                </div>
              </div>
            )}

            {/* Options */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="p-4 bg-gray-50 border-b rounded-t-lg">
                <h3 className="text-lg font-semibold text-gray-800">Options</h3>
              </div>
              <div className="p-4 space-y-4">
                {/* Current Options */}
                {options.length > 0 && (
                  <div className="space-y-2">
                    {options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                        <code className="text-sm font-mono text-blue-600 min-w-0 flex-shrink-0">
                          {option.flag}
                        </code>
                        {option.flag !== '-v' && option.flag !== '-i' && option.flag !== '-L' && option.flag !== '-k' && option.flag !== '-s' && option.flag !== '-d' && option.flag !== '-it' ? (
                          <input
                            type="text"
                            value={option.value}
                            onChange={(e) => updateOption(index, e.target.value)}
                            placeholder="Value"
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <span className="flex-1 text-sm text-gray-600">{option.description}</span>
                        )}
                        <button
                          onClick={() => removeOption(index)}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Add Options */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Add Common Options:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(commandType === 'curl' ? commonCurlOptions : [
                      { flag: '-d', value: '', description: 'Run in background' },
                      { flag: '-it', value: '', description: 'Interactive terminal' },
                      { flag: '-p', value: '8080:80', description: 'Port mapping' },
                      { flag: '-v', value: '/host/path:/container/path', description: 'Volume mount' },
                      { flag: '--name', value: 'container-name', description: 'Container name' },
                      { flag: '--rm', value: '', description: 'Remove container when it exits' },
                      { flag: '-e', value: 'ENV_VAR=value', description: 'Environment variable' }
                    ]).map((option) => (
                      <button
                        key={option.flag}
                        onClick={() => addOption(option)}
                        disabled={options.some(opt => opt.flag === option.flag)}
                        className={`text-left p-2 rounded-lg text-sm transition-colors ${
                          options.some(opt => opt.flag === option.flag)
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                        }`}
                      >
                        <code className="font-mono">{option.flag}</code>
                        <div className="text-xs text-gray-600">{option.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Generated Command */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-800">Generated Command</h3>
              <button
                onClick={handleCopy}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span className="text-sm font-medium">
                  {copied ? 'Copied!' : 'Copy'}
                </span>
              </button>
            </div>
            
            <div className="p-4">
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <pre className="whitespace-pre-wrap break-all">
                  {generateCommand() || `Enter ${commandType} parameters to generate command...`}
                </pre>
              </div>
            </div>
          </div>
        </div>

        <InfoSection 
          title="Command Builder Features"
          items={[
            {
              label: "cURL",
              description: "Build HTTP requests with headers, data, and common options"
            },
            {
              label: "Docker",
              description: "Generate Docker run commands with ports, volumes, and environment variables"
            },
            {
              label: "Interactive",
              description: "Visual interface makes it easy to construct complex commands"
            },
            {
              label: "Copy & Paste",
              description: "Generated commands are ready to use in your terminal"
            }
          ]}
          useCases="API testing, containerization, DevOps automation, command line learning"
        />
      </div>
    </div>
  );
};

export default CommandBuilder;