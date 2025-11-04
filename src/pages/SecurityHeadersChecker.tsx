import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import InfoSection from '../components/InfoSection';
import { Shield, AlertTriangle, CheckCircle, XCircle, Info, Globe } from 'lucide-react';

interface HeaderCheck {
  name: string;
  present: boolean;
  value?: string;
  status: 'pass' | 'warn' | 'fail';
  recommendation: string;
  description: string;
}

const SecurityHeadersChecker: React.FC = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<HeaderCheck[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [corsNote, setCorsNote] = useState(false);

  const securityHeaders = [
    {
      name: 'Strict-Transport-Security',
      description: 'Enforces HTTPS connections to prevent protocol downgrade attacks',
      goodValue: 'max-age=31536000; includeSubDomains',
      recommendation: 'Set max-age to at least 1 year (31536000 seconds) and include subdomains'
    },
    {
      name: 'Content-Security-Policy',
      description: 'Prevents XSS, clickjacking, and other code injection attacks',
      goodValue: "default-src 'self'",
      recommendation: 'Define a strict policy that allows only trusted sources'
    },
    {
      name: 'X-Content-Type-Options',
      description: 'Prevents MIME type sniffing',
      goodValue: 'nosniff',
      recommendation: 'Set to "nosniff" to prevent browsers from MIME-sniffing'
    },
    {
      name: 'X-Frame-Options',
      description: 'Protects against clickjacking attacks',
      goodValue: 'DENY or SAMEORIGIN',
      recommendation: 'Set to DENY or SAMEORIGIN to prevent framing'
    },
    {
      name: 'X-XSS-Protection',
      description: 'Enables browser XSS filtering (deprecated but still useful)',
      goodValue: '1; mode=block',
      recommendation: 'Set to "1; mode=block" for maximum protection'
    },
    {
      name: 'Referrer-Policy',
      description: 'Controls how much referrer information is sent',
      goodValue: 'no-referrer or strict-origin-when-cross-origin',
      recommendation: 'Use strict-origin-when-cross-origin or no-referrer for privacy'
    },
    {
      name: 'Permissions-Policy',
      description: 'Controls which browser features can be used',
      goodValue: 'geolocation=(), microphone=(), camera=()',
      recommendation: 'Disable unused features to reduce attack surface'
    }
  ];

  const checkHeaders = async (targetUrl: string) => {
    setLoading(true);
    setError(null);
    setCorsNote(false);
    setResults(null);

    try {
      // Validate URL
      new URL(targetUrl);

      // Try to fetch headers
      const response = await fetch(targetUrl, {
        method: 'HEAD',
        mode: 'cors',
        cache: 'no-cache'
      });

      const headerChecks: HeaderCheck[] = securityHeaders.map(header => {
        const value = response.headers.get(header.name);
        const present = value !== null;

        let status: 'pass' | 'warn' | 'fail' = 'fail';
        if (present) {
          // Basic validation of header values
          if (header.name === 'X-Content-Type-Options' && value === 'nosniff') {
            status = 'pass';
          } else if (header.name === 'X-Frame-Options' && ['DENY', 'SAMEORIGIN'].includes(value.toUpperCase())) {
            status = 'pass';
          } else if (header.name === 'X-XSS-Protection' && value.startsWith('1')) {
            status = 'pass';
          } else if (header.name === 'Strict-Transport-Security' && value.includes('max-age')) {
            const maxAge = parseInt(value.match(/max-age=(\d+)/)?.[1] || '0');
            status = maxAge >= 31536000 ? 'pass' : 'warn';
          } else if (present) {
            status = 'warn'; // Present but value not validated
          }
        }

        return {
          name: header.name,
          present,
          value,
          status,
          recommendation: header.recommendation,
          description: header.description
        };
      });

      setResults(headerChecks);
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('CORS')) {
        setCorsNote(true);
        setError('CORS policy prevented checking this URL. Use the manual analysis mode below.');
      } else if (err instanceof TypeError) {
        setError('Invalid URL or network error. Please check the URL and try again.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to check headers');
      }

      // Show manual checking mode
      showManualMode();
    } finally {
      setLoading(false);
    }
  };

  const showManualMode = () => {
    // Show all headers as "not checked"
    const headerChecks: HeaderCheck[] = securityHeaders.map(header => ({
      name: header.name,
      present: false,
      status: 'fail',
      recommendation: header.recommendation,
      description: header.description
    }));
    setResults(headerChecks);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      checkHeaders(url.trim());
    }
  };

  const getStatusIcon = (status: 'pass' | 'warn' | 'fail') => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warn':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const getStatusColor = (status: 'pass' | 'warn' | 'fail') => {
    switch (status) {
      case 'pass':
        return 'bg-green-50 border-green-200';
      case 'warn':
        return 'bg-yellow-50 border-yellow-200';
      case 'fail':
        return 'bg-red-50 border-red-200';
    }
  };

  const calculateScore = () => {
    if (!results) return 0;
    const passCount = results.filter(r => r.status === 'pass').length;
    const warnCount = results.filter(r => r.status === 'warn').length;
    return Math.round(((passCount + warnCount * 0.5) / results.length) * 100);
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Security Headers Checker"
          description="Analyze HTTP security headers for websites and get recommendations for improving web security."
        />

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg border border-gray-200 mb-6">
          <div className="p-4 bg-gray-50 border-b rounded-t-lg">
            <div className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">Website URL</h3>
            </div>
          </div>

          <div className="p-4">
            <div className="flex space-x-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {loading ? 'Checking...' : 'Check Headers'}
              </button>
            </div>
          </div>
        </form>

        {/* CORS Notice */}
        {corsNote && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-900 mb-2">CORS Limitation</h4>
                <div className="text-sm text-yellow-800 space-y-1">
                  <p>Due to browser security policies (CORS), this tool cannot directly fetch headers from most websites.</p>
                  <p><strong>Alternative methods:</strong></p>
                  <ul className="list-disc ml-5 mt-2 space-y-1">
                    <li>Use browser DevTools (Network tab) to view response headers</li>
                    <li>Use command-line tools like <code className="bg-yellow-100 px-1 rounded">curl -I https://example.com</code></li>
                    <li>Use online services like securityheaders.com</li>
                    <li>Install a browser extension for header inspection</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && !corsNote && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <span className="font-medium text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="space-y-6">
            {/* Score Summary */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="p-4 bg-gray-50 border-b rounded-t-lg">
                <h3 className="text-lg font-semibold text-gray-800">Security Score</h3>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-center space-x-4">
                  <div className="relative">
                    <svg className="w-32 h-32">
                      <circle
                        className="text-gray-200"
                        strokeWidth="8"
                        stroke="currentColor"
                        fill="transparent"
                        r="56"
                        cx="64"
                        cy="64"
                      />
                      <circle
                        className={calculateScore() >= 70 ? 'text-green-600' : calculateScore() >= 40 ? 'text-yellow-600' : 'text-red-600'}
                        strokeWidth="8"
                        strokeDasharray={`${calculateScore() * 3.52} 352`}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="56"
                        cx="64"
                        cy="64"
                        transform="rotate(-90 64 64)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold text-gray-900">{calculateScore()}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900 mb-1">
                      {calculateScore() >= 70 ? 'Good Security' : calculateScore() >= 40 ? 'Needs Improvement' : 'Poor Security'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {results.filter(r => r.status === 'pass').length} of {results.length} headers properly configured
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Header Details */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="p-4 bg-gray-50 border-b rounded-t-lg">
                <h3 className="text-lg font-semibold text-gray-800">Header Analysis</h3>
              </div>
              <div className="p-4 space-y-4">
                {results.map((header, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${getStatusColor(header.status)}`}
                  >
                    <div className="flex items-start space-x-3">
                      {getStatusIcon(header.status)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{header.name}</h4>
                          <span className={`text-xs font-medium px-2 py-1 rounded ${
                            header.status === 'pass' ? 'bg-green-100 text-green-800' :
                            header.status === 'warn' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {header.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{header.description}</p>
                        {header.present && header.value && (
                          <div className="mb-2">
                            <p className="text-xs text-gray-600 font-semibold mb-1">Current Value:</p>
                            <code className="text-xs bg-white px-2 py-1 rounded border border-gray-300 break-all block">
                              {header.value}
                            </code>
                          </div>
                        )}
                        <div className="bg-white bg-opacity-50 p-2 rounded text-sm">
                          <p className="text-xs text-gray-600 font-semibold mb-1">
                            <Info className="h-3 w-3 inline mr-1" />
                            Recommendation:
                          </p>
                          <p className="text-xs text-gray-700">{header.recommendation}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Best Practices */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-start space-x-2">
                <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">Security Best Practices</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p><strong>CSP:</strong> Implement a Content Security Policy to prevent XSS attacks</p>
                    <p><strong>HSTS:</strong> Use HTTP Strict Transport Security to enforce HTTPS</p>
                    <p><strong>Frame Protection:</strong> Set X-Frame-Options to prevent clickjacking</p>
                    <p><strong>MIME Sniffing:</strong> Use X-Content-Type-Options to prevent MIME attacks</p>
                    <p><strong>Regular Updates:</strong> Keep security headers updated as standards evolve</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <InfoSection
          title="Security Headers Explained"
          items={[
            {
              label: "Content-Security-Policy (CSP)",
              description: "Prevents XSS attacks by controlling which resources can be loaded"
            },
            {
              label: "Strict-Transport-Security (HSTS)",
              description: "Forces browsers to only use HTTPS connections"
            },
            {
              label: "X-Frame-Options",
              description: "Protects against clickjacking by controlling iframe embedding"
            },
            {
              label: "X-Content-Type-Options",
              description: "Prevents MIME type sniffing attacks"
            }
          ]}
          useCases="Web security audits, compliance checking, penetration testing, security hardening"
        />
      </div>
    </div>
  );
};

export default SecurityHeadersChecker;
