import React, { useState, useCallback } from 'react';
import { Copy, Check, RotateCcw, AlertCircle, Clock, User, Key } from 'lucide-react';

interface JwtPayload {
  [key: string]: any;
}

interface DecodedJwt {
  header: JwtPayload;
  payload: JwtPayload;
  signature: string;
  isValid: boolean;
  error?: string;
}

const JwtDecoder: React.FC = () => {
  const [input, setInput] = useState('');
  const [decoded, setDecoded] = useState<DecodedJwt | null>(null);
  const [copied, setCopied] = useState<'header' | 'payload' | null>(null);

  const base64UrlDecode = (str: string): string => {
    // Add padding if needed
    const padding = '='.repeat((4 - (str.length % 4)) % 4);
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/') + padding;
    
    try {
      return atob(base64);
    } catch {
      throw new Error('Invalid base64 encoding');
    }
  };

  const decodeJwt = (token: string): DecodedJwt => {
    if (!token.trim()) {
      return { header: {}, payload: {}, signature: '', isValid: false, error: 'No token provided' };
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return { header: {}, payload: {}, signature: '', isValid: false, error: 'Invalid JWT format' };
    }

    try {
      const header = JSON.parse(base64UrlDecode(parts[0]));
      const payload = JSON.parse(base64UrlDecode(parts[1]));
      const signature = parts[2];

      return {
        header,
        payload,
        signature,
        isValid: true
      };
    } catch (error) {
      return {
        header: {},
        payload: {},
        signature: '',
        isValid: false,
        error: error instanceof Error ? error.message : 'Failed to decode JWT'
      };
    }
  };

  const handleInputChange = useCallback((value: string) => {
    setInput(value);
    const result = decodeJwt(value);
    setDecoded(result);
  }, []);

  const handleCopy = async (section: 'header' | 'payload') => {
    if (!decoded || !decoded.isValid) return;
    
    try {
      const data = section === 'header' ? decoded.header : decoded.payload;
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopied(section);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleClear = () => {
    setInput('');
    setDecoded(null);
  };

  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const renderJsonSection = (title: string, data: JwtPayload, icon: React.ReactNode, section: 'header' | 'payload') => (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
        <div className="flex items-center space-x-2">
          {icon}
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        <button
          onClick={() => handleCopy(section)}
          disabled={!decoded?.isValid}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
            decoded?.isValid
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          title={`Copy ${title.toLowerCase()}`}
        >
          {copied === section ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          <span className="text-sm font-medium">
            {copied === section ? 'Copied!' : 'Copy'}
          </span>
        </button>
      </div>
      
      <div className="p-4">
        <pre className="text-sm leading-relaxed font-mono whitespace-pre-wrap text-gray-800 bg-gray-50 p-4 rounded-lg overflow-auto max-h-64">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );

  const renderPayloadInfo = (payload: JwtPayload) => {
    const commonClaims = [
      { key: 'iss', label: 'Issuer', icon: <User className="h-4 w-4 text-blue-500" /> },
      { key: 'sub', label: 'Subject', icon: <User className="h-4 w-4 text-green-500" /> },
      { key: 'aud', label: 'Audience', icon: <User className="h-4 w-4 text-purple-500" /> },
      { key: 'exp', label: 'Expires At', icon: <Clock className="h-4 w-4 text-red-500" />, isTimestamp: true },
      { key: 'nbf', label: 'Not Before', icon: <Clock className="h-4 w-4 text-orange-500" />, isTimestamp: true },
      { key: 'iat', label: 'Issued At', icon: <Clock className="h-4 w-4 text-blue-500" />, isTimestamp: true },
      { key: 'jti', label: 'JWT ID', icon: <Key className="h-4 w-4 text-gray-500" /> }
    ];

    const presentClaims = commonClaims.filter(claim => payload[claim.key] !== undefined);

    if (presentClaims.length === 0) return null;

    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="p-4 bg-gray-50 border-b rounded-t-lg">
          <h3 className="text-lg font-semibold text-gray-800">Common Claims</h3>
        </div>
        <div className="p-4 space-y-3">
          {presentClaims.map((claim) => (
            <div key={claim.key} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              {claim.icon}
              <div className="flex-1">
                <div className="font-medium text-gray-900">{claim.label}</div>
                <div className="text-sm text-gray-600 font-mono">
                  {claim.isTimestamp && typeof payload[claim.key] === 'number'
                    ? `${formatTimestamp(payload[claim.key])} (${payload[claim.key]})`
                    : String(payload[claim.key])
                  }
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">JWT Decoder</h1>
          <p className="text-gray-600">
            Decode and inspect JWT tokens. View header, payload, and common claims information.
          </p>
        </div>

        {/* Input Panel */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
            <h3 className="text-lg font-semibold text-gray-800">JWT Token Input</h3>
            <button
              onClick={handleClear}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors duration-200"
              title="Clear input"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
          
          <div className="p-4">
            <textarea
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Paste your JWT token here..."
              className="w-full h-32 resize-none border border-gray-300 rounded-lg p-3 font-mono text-sm leading-relaxed focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Status */}
        {decoded && (
          <div className="mb-6">
            <div className={`flex items-center space-x-2 p-3 rounded-lg ${
              decoded.isValid 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">
                {decoded.isValid ? 'Valid JWT Token' : `Invalid JWT: ${decoded.error}`}
              </span>
            </div>
          </div>
        )}

        {/* Decoded Content */}
        {decoded?.isValid && (
          <div className="space-y-6">
            {/* Common Claims */}
            {renderPayloadInfo(decoded.payload)}
            
            {/* Header and Payload */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {renderJsonSection(
                'Header', 
                decoded.header, 
                <Key className="h-5 w-5 text-blue-600" />, 
                'header'
              )}
              {renderJsonSection(
                'Payload', 
                decoded.payload, 
                <User className="h-5 w-5 text-green-600" />, 
                'payload'
              )}
            </div>

            {/* Signature */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="p-4 bg-gray-50 border-b rounded-t-lg">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Signature</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <code className="text-sm font-mono text-gray-800 break-all">
                    {decoded.signature}
                  </code>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  The signature is used to verify that the token hasn't been tampered with.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JwtDecoder;