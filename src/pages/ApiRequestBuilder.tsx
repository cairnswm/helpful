import React, { useState } from 'react';
import InfoSection from '../components/InfoSection';
import PageHeader from '../components/PageHeader';
import { Copy, Check, Send, Plus, Trash2, Globe } from 'lucide-react';

interface Header {
  key: string;
  value: string;
}

interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  time: number;
}

const ApiRequestBuilder: React.FC = () => {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [headers, setHeaders] = useState<Header[]>([{ key: '', value: '' }]);
  const [body, setBody] = useState('');
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const updateHeader = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const removeHeader = (index: number) => {
    if (headers.length > 1) {
      setHeaders(headers.filter((_, i) => i !== index));
    }
  };

  const sendRequest = async () => {
    if (!url.trim()) return;

    setLoading(true);
    const startTime = Date.now();

    try {
      const requestHeaders: Record<string, string> = {};
      headers.forEach(header => {
        if (header.key.trim() && header.value.trim()) {
          requestHeaders[header.key.trim()] = header.value.trim();
        }
      });

      const requestOptions: RequestInit = {
        method,
        headers: requestHeaders,
      };

      if (['POST', 'PUT', 'PATCH'].includes(method) && body.trim()) {
        requestOptions.body = body;
        if (!requestHeaders['Content-Type']) {
          requestHeaders['Content-Type'] = 'application/json';
        }
      }

      const response = await fetch(url, requestOptions);
      const endTime = Date.now();
      
      let responseData;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      setResponse({
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        data: responseData,
        time: endTime - startTime
      });
    } catch (error) {
      setResponse({
        status: 0,
        statusText: 'Network Error',
        headers: {},
        data: error instanceof Error ? error.message : 'Request failed',
        time: Date.now() - startTime
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (content: string, type: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const generateCurlCommand = () => {
    let curl = `curl -X ${method}`;
    
    headers.forEach(header => {
      if (header.key.trim() && header.value.trim()) {
        curl += ` -H "${header.key}: ${header.value}"`;
      }
    });

    if (['POST', 'PUT', 'PATCH'].includes(method) && body.trim()) {
      curl += ` -d '${body}'`;
    }

    curl += ` "${url}"`;
    return curl;
  };

  const loadSampleRequest = () => {
    setMethod('POST');
    setUrl('https://jsonplaceholder.typicode.com/posts');
    setHeaders([
      { key: 'Content-Type', value: 'application/json' },
      { key: 'Accept', value: 'application/json' }
    ]);
    setBody(JSON.stringify({
      title: 'Sample Post',
      body: 'This is a sample post body',
      userId: 1
    }, null, 2));
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="API Request Builder"
          description="Build and test HTTP requests with custom headers, body, and methods."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Request Builder */}
          <div className="space-y-6">
            {/* URL and Method */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="p-4 bg-gray-50 border-b rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Request</h3>
                  </div>
                  <button
                    onClick={loadSampleRequest}
                    className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
                  >
                    Load Sample
                  </button>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex space-x-2">
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {methods.map(m => (
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
                  <button
                    onClick={sendRequest}
                    disabled={!url.trim() || loading}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      url.trim() && !loading
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Send className="h-4 w-4" />
                    <span>{loading ? 'Sending...' : 'Send'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Headers */}
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
                      disabled={headers.length === 1}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Request Body */}
            {['POST', 'PUT', 'PATCH'].includes(method) && (
              <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                <div className="p-4 bg-gray-50 border-b rounded-t-lg">
                  <h3 className="text-lg font-semibold text-gray-800">Request Body</h3>
                </div>
                <div className="p-4">
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Enter request body (JSON, XML, etc.)"
                    className="w-full h-32 resize-none border border-gray-300 rounded-lg p-3 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    spellCheck={false}
                  />
                </div>
              </div>
            )}

            {/* cURL Command */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
                <h3 className="text-lg font-semibold text-gray-800">cURL Command</h3>
                <button
                  onClick={() => handleCopy(generateCurlCommand(), 'curl')}
                  className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                >
                  {copied === 'curl' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  <span>{copied === 'curl' ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-4">
                <pre className="text-sm font-mono text-gray-800 bg-gray-50 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
                  {generateCurlCommand()}
                </pre>
              </div>
            </div>
          </div>

          {/* Response */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-800">Response</h3>
              {response && (
                <div className="flex items-center space-x-4">
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    response.status >= 200 && response.status < 300
                      ? 'bg-green-100 text-green-800'
                      : response.status >= 400
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {response.status} {response.statusText}
                  </span>
                  <span className="text-sm text-gray-600">
                    {response.time}ms
                  </span>
                  <button
                    onClick={() => handleCopy(JSON.stringify(response.data, null, 2), 'response')}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    {copied === 'response' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copied === 'response' ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              )}
            </div>
            
            <div className="p-4 h-96 overflow-auto">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-gray-500">Sending request...</div>
                </div>
              ) : response ? (
                <div className="space-y-4">
                  {/* Response Headers */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Headers</h4>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <pre className="text-xs font-mono text-gray-700">
                        {Object.entries(response.headers).map(([key, value]) => 
                          `${key}: ${value}`
                        ).join('\n')}
                      </pre>
                    </div>
                  </div>
                  
                  {/* Response Body */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Body</h4>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                        {typeof response.data === 'string' 
                          ? response.data 
                          : JSON.stringify(response.data, null, 2)
                        }
                      </pre>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Send a request to see the response here...
                </div>
              )}
            </div>
          </div>
        </div>

        <InfoSection 
          title="API Request Building"
          items={[
            {
              label: "HTTP Methods",
              description: "Support for GET, POST, PUT, DELETE, and other HTTP methods"
            },
            {
              label: "Custom Headers",
              description: "Add authentication tokens, content types, and other headers"
            },
            {
              label: "Request Body",
              description: "Send JSON, form data, or raw text in request body"
            },
            {
              label: "Response Analysis",
              description: "View status codes, headers, and formatted response data"
            }
          ]}
          useCases="API testing, development, debugging, integration testing, authentication verification"
        />
      </div>
    </div>
  );
};

export default ApiRequestBuilder;