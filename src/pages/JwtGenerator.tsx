import React, { useState, useCallback } from 'react';
import InfoSection from '../components/InfoSection';
import PageHeader from '../components/PageHeader';
import { Copy, Check, RotateCcw, Plus, Key, User } from 'lucide-react';

interface JwtHeader {
  alg: string;
  typ: string;
}

interface JwtPayload {
  [key: string]: any;
}

const JwtGenerator: React.FC = () => {
  const [header, setHeader] = useState<JwtHeader>({ alg: 'HS256', typ: 'JWT' });
  const [payload, setPayload] = useState<JwtPayload>({});
  const [secret, setSecret] = useState('your-256-bit-secret');
  const [generatedJwt, setGeneratedJwt] = useState('');
  const [copied, setCopied] = useState(false);

  // Simplified JWT generation (for demo purposes - not cryptographically secure)
  const base64UrlEncode = (obj: any): string => {
    const jsonString = JSON.stringify(obj);
    const base64 = btoa(unescape(encodeURIComponent(jsonString)));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  };

  const generateSignature = (header: string, payload: string, secret: string): string => {
    // This is a simplified signature generation for demo purposes
    // In a real implementation, you would use proper HMAC-SHA256
    const data = header + '.' + payload + secret;
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return btoa(Math.abs(hash).toString()).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  };

  const generateJwt = useCallback(() => {
    try {
      const encodedHeader = base64UrlEncode(header);
      const encodedPayload = base64UrlEncode(payload);
      const signature = generateSignature(encodedHeader, encodedPayload, secret);
      
      const jwt = `${encodedHeader}.${encodedPayload}.${signature}`;
      setGeneratedJwt(jwt);
    } catch (error) {
      setGeneratedJwt('Error generating JWT');
    }
  }, [header, payload, secret]);

  // Auto-generate JWT when inputs change
  React.useEffect(() => {
    generateJwt();
  }, [generateJwt]);

  const handlePayloadChange = (key: string, value: any) => {
    setPayload(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const removePayloadField = (key: string) => {
    setPayload(prev => {
      const newPayload = { ...prev };
      delete newPayload[key];
      return newPayload;
    });
  };

  const addPayloadField = () => {
    const key = `field${Object.keys(payload).length + 1}`;
    handlePayloadChange(key, '');
  };

  const handleCopy = async () => {
    if (!generatedJwt) return;
    
    try {
      await navigator.clipboard.writeText(generatedJwt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleClear = () => {
    setPayload({});
    setSecret('your-256-bit-secret');
    setGeneratedJwt('');
  };

  const loadSamplePayload = () => {
    const now = Math.floor(Date.now() / 1000);
    setPayload({
      sub: '1234567890',
      name: 'John Doe',
      email: 'john@example.com',
      iat: now,
      exp: now + 3600, // 1 hour from now
      iss: 'your-app',
      aud: 'your-audience'
    });
  };

  const algorithms = ['HS256', 'HS384', 'HS512', 'RS256', 'RS384', 'RS512'];

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="JWT Generator"
          description="Generate JSON Web Tokens with custom headers, payloads, and secrets."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* JWT Configuration */}
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="p-4 bg-gray-50 border-b rounded-t-lg">
                <div className="flex items-center space-x-2">
                  <Key className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Header</h3>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Algorithm
                  </label>
                  <select
                    value={header.alg}
                    onChange={(e) => setHeader(prev => ({ ...prev, alg: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {algorithms.map(alg => (
                      <option key={alg} value={alg}>{alg}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <input
                    type="text"
                    value={header.typ}
                    onChange={(e) => setHeader(prev => ({ ...prev, typ: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Payload */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Payload</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={loadSamplePayload}
                    className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
                  >
                    Load Sample
                  </button>
                  <button
                    onClick={addPayloadField}
                    className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add Field</span>
                  </button>
                </div>
              </div>
              <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
                {Object.entries(payload).map(([key, value]) => (
                  <div key={key} className="flex space-x-2">
                    <input
                      type="text"
                      value={key}
                      onChange={(e) => {
                        const newKey = e.target.value;
                        const newPayload = { ...payload };
                        delete newPayload[key];
                        newPayload[newKey] = value;
                        setPayload(newPayload);
                      }}
                      placeholder="Key"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      value={typeof value === 'object' ? JSON.stringify(value) : value}
                      onChange={(e) => {
                        let newValue: any = e.target.value;
                        // Try to parse as number or boolean
                        if (newValue === 'true') newValue = true;
                        else if (newValue === 'false') newValue = false;
                        else if (!isNaN(Number(newValue)) && newValue !== '') newValue = Number(newValue);
                        else if (newValue.startsWith('{') || newValue.startsWith('[')) {
                          try {
                            newValue = JSON.parse(newValue);
                          } catch {
                            // Keep as string if JSON parsing fails
                          }
                        }
                        handlePayloadChange(key, newValue);
                      }}
                      placeholder="Value"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => removePayloadField(key)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {Object.keys(payload).length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    No payload fields. Click "Add Field" to add claims.
                  </div>
                )}
              </div>
            </div>

            {/* Secret */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="p-4 bg-gray-50 border-b rounded-t-lg">
                <h3 className="text-lg font-semibold text-gray-800">Secret Key</h3>
              </div>
              <div className="p-4">
                <textarea
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="Enter your secret key..."
                  className="w-full h-20 resize-none border border-gray-300 rounded-lg p-3 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  spellCheck={false}
                />
                <p className="text-xs text-gray-500 mt-2">
                  ⚠️ This is for demo purposes only. Use proper cryptographic libraries in production.
                </p>
              </div>
            </div>
          </div>

          {/* Generated JWT */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-800">Generated JWT</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleClear}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                  title="Clear payload"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button
                  onClick={handleCopy}
                  disabled={!generatedJwt || generatedJwt.includes('Error')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    generatedJwt && !generatedJwt.includes('Error')
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  title="Copy JWT"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span className="text-sm font-medium">
                    {copied ? 'Copied!' : 'Copy'}
                  </span>
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap break-all">
                  {generatedJwt || 'JWT will appear here...'}
                </pre>
              </div>

              {/* JWT Parts Breakdown */}
              {generatedJwt && !generatedJwt.includes('Error') && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Header (Base64 Encoded)</h4>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <pre className="text-sm font-mono text-blue-800">
                        {JSON.stringify(header, null, 2)}
                      </pre>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Payload (Base64 Encoded)</h4>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <pre className="text-sm font-mono text-green-800">
                        {JSON.stringify(payload, null, 2)}
                      </pre>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Signature</h4>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <code className="text-sm font-mono text-purple-800 break-all">
                        {generatedJwt.split('.')[2]}
                      </code>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Common Claims Info */}
        <div className="mt-6 bg-yellow-50 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-2">Common JWT Claims</h4>
          <div className="text-sm text-yellow-800 grid grid-cols-1 md:grid-cols-2 gap-2">
            <p><strong>iss:</strong> Issuer - who issued the token</p>
            <p><strong>sub:</strong> Subject - who the token is about</p>
            <p><strong>aud:</strong> Audience - who the token is for</p>
            <p><strong>exp:</strong> Expiration time (Unix timestamp)</p>
            <p><strong>iat:</strong> Issued at (Unix timestamp)</p>
            <p><strong>nbf:</strong> Not before (Unix timestamp)</p>
            <p><strong>jti:</strong> JWT ID - unique identifier</p>
            <p><strong>Note:</strong> This generator is for demo purposes only</p>
          </div>
        </div>

        <InfoSection 
          title="JWT Token Generation"
          items={[
            {
              label: "Header",
              description: "Specify algorithm (HS256, RS256) and token type"
            },
            {
              label: "Payload",
              description: "Add custom claims like user info, permissions, and expiration"
            },
            {
              label: "Secret Key",
              description: "Provide signing key for token verification and security"
            },
            {
              label: "Demo Purpose",
              description: "This generator is for development and testing purposes only"
            }
          ]}
          useCases="Authentication, API tokens, session management, microservices security"
        />
      </div>
    </div>
  );
};

export default JwtGenerator;