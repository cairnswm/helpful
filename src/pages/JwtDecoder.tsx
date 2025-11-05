import React, { useState, useCallback } from 'react';
import InfoSection from '../components/InfoSection';
import PageHeader from '../components/PageHeader';
import { Copy, Check, RotateCcw, AlertCircle, Clock, User, Key, Shield, CheckCircle, XCircle } from 'lucide-react';

interface JwtPayload {
  [key: string]: any;
}

interface DecodedJwt {
  header: JwtPayload;
  payload: JwtPayload;
  signature: string;
  isValid: boolean;
  isSignatureValid?: boolean;
  error?: string;
  isExpired?: boolean;
  expiresIn?: string;
  timeToExpiry?: number;
  securityIssues?: string[];
}

const JwtDecoder: React.FC = () => {
  const [input, setInput] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [decoded, setDecoded] = useState<DecodedJwt | null>(null);
  const [copied, setCopied] = useState<'header' | 'payload' | null>(null);
  const [validateSignature, setValidateSignature] = useState(false);

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

  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const getTimeToExpiry = (exp: number): { timeToExpiry: number; expiresIn: string; isExpired: boolean } => {
    const now = Math.floor(Date.now() / 1000);
    const timeToExpiry = exp - now;
    const isExpired = timeToExpiry <= 0;
    
    let expiresIn = '';
    if (isExpired) {
      const expiredTime = Math.abs(timeToExpiry);
      if (expiredTime < 60) {
        expiresIn = `Expired ${expiredTime} seconds ago`;
      } else if (expiredTime < 3600) {
        expiresIn = `Expired ${Math.floor(expiredTime / 60)} minutes ago`;
      } else if (expiredTime < 86400) {
        expiresIn = `Expired ${Math.floor(expiredTime / 3600)} hours ago`;
      } else {
        expiresIn = `Expired ${Math.floor(expiredTime / 86400)} days ago`;
      }
    } else {
      if (timeToExpiry < 60) {
        expiresIn = `Expires in ${timeToExpiry} seconds`;
      } else if (timeToExpiry < 3600) {
        expiresIn = `Expires in ${Math.floor(timeToExpiry / 60)} minutes`;
      } else if (timeToExpiry < 86400) {
        expiresIn = `Expires in ${Math.floor(timeToExpiry / 3600)} hours`;
      } else {
        expiresIn = `Expires in ${Math.floor(timeToExpiry / 86400)} days`;
      }
    }
    
    return { timeToExpiry, expiresIn, isExpired };
  };

  const validateJwtSignature = (token: string, secret: string): boolean => {
    if (!secret.trim()) return false;
    
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      // This is a simplified signature validation for demo purposes
      // In a real implementation, you would use proper HMAC-SHA256
      const header = parts[0];
      const payload = parts[1];
      const signature = parts[2];
      
      // Generate expected signature
      const data = header + '.' + payload + secret;
      let hash = 0;
      for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      const expectedSignature = btoa(Math.abs(hash).toString()).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
      
      return signature === expectedSignature;
    } catch {
      return false;
    }
  };

  const analyzeSecurityIssues = (payload: JwtPayload): string[] => {
    const issues: string[] = [];
    const now = Math.floor(Date.now() / 1000);
    
    // Check for missing standard claims
    if (!payload.exp) {
      issues.push('Missing expiration claim (exp) - token never expires');
    }
    
    if (!payload.iat) {
      issues.push('Missing issued at claim (iat) - cannot verify token age');
    }
    
    if (!payload.iss) {
      issues.push('Missing issuer claim (iss) - cannot verify token source');
    }
    
    // Check expiration timing
    if (payload.exp) {
      const timeToExpiry = payload.exp - now;
      if (timeToExpiry > 86400 * 365) { // More than 1 year
        issues.push('Token expires more than 1 year from now - consider shorter expiration');
      }
    }
    
    // Check issued at timing
    if (payload.iat) {
      const tokenAge = now - payload.iat;
      if (tokenAge < 0) {
        issues.push('Token issued in the future - possible clock skew');
      }
      if (tokenAge > 86400 * 30) { // More than 30 days old
        issues.push('Token is more than 30 days old - consider refresh');
      }
    }
    
    // Check not before
    if (payload.nbf && payload.nbf > now) {
      const timeUntilValid = payload.nbf - now;
      if (timeUntilValid > 3600) { // More than 1 hour
        issues.push('Token not valid for more than 1 hour - check nbf claim');
      }
    }
    
    // Check for sensitive data in payload
    const sensitiveKeys = ['password', 'secret', 'key', 'token', 'private'];
    Object.keys(payload).forEach(key => {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        issues.push(`Potentially sensitive data in payload: "${key}"`);
      }
    });
    
    return issues;
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
      
      // Analyze security issues
      const securityIssues = analyzeSecurityIssues(payload);
      const isSignatureValid = validateSignature ? validateJwtSignature(token, secretKey) : undefined;

      let isExpired = false;
      let expiresIn = '';
      let timeToExpiry = 0;

      // Check expiration
      if (payload.exp) {
        const expiryData = getTimeToExpiry(payload.exp);
        isExpired = expiryData.isExpired;
        expiresIn = expiryData.expiresIn;
        timeToExpiry = expiryData.timeToExpiry;
      }

      return {
        header,
        payload,
        signature,
        isValid: true,
        isSignatureValid,
        isExpired,
        securityIssues,
        expiresIn,
        timeToExpiry
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

  const handleSecretKeyChange = (value: string) => {
    setSecretKey(value);
    if (input) {
      setDecoded(decodeJwt(input));
    }
  };

  const renderJsonSection = (title: string, data: JwtPayload, icon: React.ReactNode, section: 'header' | 'payload') => (
    <section className="bg-white rounded-lg shadow-lg border border-gray-200" aria-labelledby={`${section}-heading`}>
      <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
        <div className="flex items-center space-x-2">
          {React.cloneElement(icon as React.ReactElement, { 'aria-hidden': 'true' })}
          <h2 id={`${section}-heading`} className="text-lg font-semibold text-gray-800">{title}</h2>
        </div>
        <button
          onClick={() => handleCopy(section)}
          disabled={!decoded?.isValid}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
            decoded?.isValid
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          aria-label={copied === section ? `${title} copied to clipboard` : `Copy ${title.toLowerCase()} to clipboard`}
          title={`Copy ${title.toLowerCase()}`}
        >
          {copied === section ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
          <span className="text-sm font-medium">
            {copied === section ? 'Copied!' : 'Copy'}
          </span>
        </button>
      </div>
      
      <div className="p-4">
        <pre className="text-sm leading-relaxed font-mono whitespace-pre-wrap text-gray-800 bg-gray-50 p-4 rounded-lg overflow-auto max-h-64" aria-label={`${title} JSON data`}>
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </section>
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
      <section className="bg-white rounded-lg shadow-lg border border-gray-200" aria-labelledby="common-claims-heading">
        <div className="p-4 bg-gray-50 border-b rounded-t-lg">
          <h2 id="common-claims-heading" className="text-lg font-semibold text-gray-800">Common Claims</h2>
        </div>
        <div className="p-4 space-y-3" role="list" aria-label="JWT common claims">
          {presentClaims.map((claim) => (
            <div key={claim.key} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg" role="listitem">
              {React.cloneElement(claim.icon as React.ReactElement, { 'aria-hidden': 'true' })}
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
      </section>
    );
  };

  const renderExpirationInfo = () => {
    if (!decoded?.isValid || !decoded.payload.exp) return null;

    return (
      <div className={`p-4 rounded-lg border ${
        decoded.isExpired 
          ? 'bg-red-50 border-red-200' 
          : decoded.timeToExpiry && decoded.timeToExpiry < 3600
          ? 'bg-yellow-50 border-yellow-200'
          : 'bg-green-50 border-green-200'
      }`} role={decoded.isExpired ? "alert" : "status"} aria-live="polite">
        <div className="flex items-center space-x-2 mb-2">
          <Clock className={`h-5 w-5 ${
            decoded.isExpired 
              ? 'text-red-600' 
              : decoded.timeToExpiry && decoded.timeToExpiry < 3600
              ? 'text-yellow-600'
              : 'text-green-600'
          }`} aria-hidden="true" />
          <span className={`font-medium ${
            decoded.isExpired 
              ? 'text-red-800' 
              : decoded.timeToExpiry && decoded.timeToExpiry < 3600
              ? 'text-yellow-800'
              : 'text-green-800'
          }`}>
            JWT Expiration Status
          </span>
        </div>
        <p className={`text-sm ${
          decoded.isExpired 
            ? 'text-red-700' 
            : decoded.timeToExpiry && decoded.timeToExpiry < 3600
            ? 'text-yellow-700'
            : 'text-green-700'
        }`}>
          {decoded.expiresIn}
        </p>
        {decoded.isExpired && (
          <p className="text-xs text-red-600 mt-1">
            ⚠️ This token has expired and should not be accepted by services.
          </p>
        )}
        {decoded.timeToExpiry && decoded.timeToExpiry < 3600 && decoded.timeToExpiry > 0 && (
          <p className="text-xs text-yellow-600 mt-1">
            ⚠️ This token will expire soon. Consider refreshing it.
          </p>
        )}
      </div>
    );
  };

  const renderSecurityIssues = () => {
    if (!decoded?.isValid || !decoded.securityIssues || decoded.securityIssues.length === 0) return null;

    return (
      <div className="p-4 rounded-lg border bg-yellow-50 border-yellow-200" role="status" aria-live="polite">
        <div className="flex items-center space-x-2 mb-2">
          <AlertCircle className="h-5 w-5 text-yellow-600" aria-hidden="true" />
          <span className="font-medium text-yellow-800">Security Recommendations</span>
        </div>
        <ul className="text-sm text-yellow-700 space-y-1" aria-label="JWT security recommendations">
          {decoded.securityIssues.map((issue, index) => (
            <li key={index} className="flex items-start space-x-2">
              <span className="text-yellow-600 mt-1" aria-hidden="true">•</span>
              <span>{issue}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="JWT Decoder"
          description="Decode and inspect JWT tokens. View header, payload, expiration information, and common claims."
        />

        {/* Input Panel */}
        <section className="bg-white rounded-lg shadow-lg border border-gray-200 mb-6" aria-labelledby="secret-key-heading">
          <div className="p-4 bg-gray-50 border-b rounded-t-lg">
            <h2 id="secret-key-heading" className="text-lg font-semibold text-gray-800">Secret Key Validation</h2>
            <p className="text-sm text-gray-600 mt-1">
              Enter your secret key to validate the JWT signature (optional)
            </p>
          </div>
          <div className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="validateSignature"
                  checked={validateSignature}
                  onChange={(e) => setValidateSignature(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  aria-describedby="validate-signature-help"
                />
                <label htmlFor="validateSignature" className="ml-2 text-sm font-medium text-gray-700">
                  Validate signature
                </label>
              </div>
              <label htmlFor="secret-key-input" className="sr-only">Secret key for JWT validation</label>
              <input
                id="secret-key-input"
                type="password"
                value={secretKey}
                onChange={(e) => handleSecretKeyChange(e.target.value)}
                placeholder="Enter your secret key..."
                disabled={!validateSignature}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400"
                aria-label="Secret key input"
              />
              <span id="validate-signature-help" className="sr-only">Check this box to enable signature validation</span>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-lg border border-gray-200 mb-6" aria-labelledby="jwt-input-heading">
          <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
            <h2 id="jwt-input-heading" className="text-lg font-semibold text-gray-800">JWT Token Input</h2>
            <button
              onClick={handleClear}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors duration-200"
              aria-label="Clear input"
              title="Clear input"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          
          <div className="p-4">
            <label htmlFor="jwt-token-input" className="sr-only">JWT token to decode</label>
            <textarea
              id="jwt-token-input"
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Paste your JWT token here..."
              className="w-full h-32 resize-none border border-gray-300 rounded-lg p-3 font-mono text-sm leading-relaxed focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              spellCheck={false}
              aria-label="JWT token input"
            />
          </div>
        </section>

        {/* Status */}
        {decoded && (
          <div className="mb-6 space-y-4">
            <div className={`flex items-center space-x-2 p-3 rounded-lg ${
              decoded.isValid 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`} role={decoded.isValid ? "status" : "alert"} aria-live="polite">
              {decoded.isValid ? <CheckCircle className="h-5 w-5" aria-hidden="true" /> : <AlertCircle className="h-5 w-5" aria-hidden="true" />}
              <span className="font-medium">
                {decoded.isValid ? 'Valid JWT Token' : `Invalid JWT: ${decoded.error}`}
              </span>
            </div>
            
            {/* Signature Validation Status */}
            {validateSignature && decoded.isValid && (
              <div className={`flex items-center space-x-2 p-3 rounded-lg ${
                decoded.isSignatureValid 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`} role="status" aria-live="polite">
                {decoded.isSignatureValid ? <CheckCircle className="h-5 w-5" aria-hidden="true" /> : <XCircle className="h-5 w-5" aria-hidden="true" />}
                <span className="font-medium">
                  {decoded.isSignatureValid 
                    ? 'Signature is valid' 
                    : 'Invalid signature - token may be tampered with or wrong secret key'
                  }
                </span>
              </div>
            )}
          </div>
        )}

        {/* Expiration Warning */}
        {decoded?.isValid && renderExpirationInfo()}

        {/* Security Issues */}
        {decoded?.isValid && renderSecurityIssues()}

        {/* Decoded Content */}
        {decoded?.isValid && (
          <div className="space-y-6 mt-6">
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
                  {validateSignature && secretKey && (
                    <span className={`ml-2 font-medium ${
                      decoded.isSignatureValid ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {decoded.isSignatureValid ? '✓ Valid' : '✗ Invalid'}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        <InfoSection 
          title="JWT Token Decoding"
          items={[
            {
              label: "Decode Header",
              description: "Extract and display JWT header information including algorithm"
            },
            {
              label: "Decode Payload",
              description: "View claims and user data stored in the JWT payload"
            },
            {
              label: "Verify Structure",
              description: "Validate JWT format and structure without signature verification"
            },
            {
              label: "Expiration Check",
              description: "Check token expiration and validity timestamps"
            }
          ]}
          useCases="API debugging, token inspection, authentication troubleshooting, security analysis"
        />
      </div>
    </div>
  );
};

export default JwtDecoder;