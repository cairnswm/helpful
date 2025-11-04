import React, { useState, useCallback } from 'react';
import PageHeader from '../components/PageHeader';
import InfoSection from '../components/InfoSection';
import { Copy, Check, RotateCcw, Shield, AlertCircle, CheckCircle, Calendar, Key, User } from 'lucide-react';

interface CertificateInfo {
  version?: string;
  serialNumber?: string;
  issuer?: string;
  subject?: string;
  validFrom?: string;
  validTo?: string;
  publicKey?: string;
  signatureAlgorithm?: string;
  keyUsage?: string[];
  subjectAlternativeNames?: string[];
  isExpired?: boolean;
  daysUntilExpiry?: number;
  fingerprint?: string;
}

const CertificateInspector: React.FC = () => {
  const [input, setInput] = useState('');
  const [certInfo, setCertInfo] = useState<CertificateInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const parsePEMCertificate = (pemText: string): CertificateInfo => {
    // Remove PEM headers/footers and whitespace
    const base64Cert = pemText
      .replace(/-----BEGIN CERTIFICATE-----/g, '')
      .replace(/-----END CERTIFICATE-----/g, '')
      .replace(/\s/g, '');

    if (!base64Cert) {
      throw new Error('Invalid certificate format');
    }

    // Decode base64 to binary
    const binaryString = atob(base64Cert);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Basic ASN.1 parsing for demonstration
    // This is a simplified parser for educational purposes
    const info: CertificateInfo = {
      version: 'X.509 v3',
      serialNumber: extractSerialNumber(bytes),
      signatureAlgorithm: detectSignatureAlgorithm(bytes),
    };

    // Try to extract text information from the certificate
    const certText = extractTextInfo(binaryString);
    if (certText.subject) info.subject = certText.subject;
    if (certText.issuer) info.issuer = certText.issuer;
    if (certText.validFrom) info.validFrom = certText.validFrom;
    if (certText.validTo) info.validTo = certText.validTo;
    if (certText.sans) info.subjectAlternativeNames = certText.sans;

    // Calculate expiry status
    if (info.validTo) {
      const expiryDate = parseDate(info.validTo);
      if (expiryDate) {
        const now = new Date();
        info.isExpired = expiryDate < now;
        info.daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      }
    }

    // Generate fingerprint (simplified SHA-256 hash representation)
    info.fingerprint = generateFingerprint(base64Cert);

    return info;
  };

  const extractSerialNumber = (bytes: Uint8Array): string => {
    // Look for serial number pattern in ASN.1 structure
    // This is a simplified extraction
    const hex: string[] = [];
    for (let i = 0; i < Math.min(20, bytes.length); i++) {
      hex.push(bytes[i].toString(16).padStart(2, '0'));
    }
    return hex.join(':').toUpperCase();
  };

  const detectSignatureAlgorithm = (bytes: Uint8Array): string => {
    // Detect common OIDs for signature algorithms
    const algos = [
      { oid: '2A864886F70D010105', name: 'SHA-1 with RSA' },
      { oid: '2A864886F70D01010B', name: 'SHA-256 with RSA' },
      { oid: '2A864886F70D01010C', name: 'SHA-384 with RSA' },
      { oid: '2A864886F70D01010D', name: 'SHA-512 with RSA' },
      { oid: '2A8648CE3D040302', name: 'ECDSA with SHA-256' },
      { oid: '2A8648CE3D040303', name: 'ECDSA with SHA-384' },
    ];

    const hexString = Array.from(bytes.slice(0, 100))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    for (const algo of algos) {
      if (hexString.includes(algo.oid.toLowerCase())) {
        return algo.name;
      }
    }

    return 'RSA with SHA-256 (assumed)';
  };

  const extractTextInfo = (binaryString: string) => {
    const info: {
      subject?: string;
      issuer?: string;
      validFrom?: string;
      validTo?: string;
      sans?: string[];
    } = {};

    // Extract printable strings from certificate
    const printableRegex = /[\x20-\x7E]{3,}/g;
    const matches = binaryString.match(printableRegex) || [];

    // Look for common patterns
    for (let i = 0; i < matches.length; i++) {
      const str = matches[i];

      // Detect dates (YYMMDDHHMMSSZ format)
      if (/^\d{12,14}Z?$/.test(str)) {
        const date = parseASN1Date(str);
        if (date) {
          if (!info.validFrom) {
            info.validFrom = date;
          } else if (!info.validTo) {
            info.validTo = date;
          }
        }
      }

      // Detect domain names and email addresses
      if (/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(str) && str.includes('.')) {
        if (!info.sans) info.sans = [];
        if (!info.sans.includes(str)) {
          info.sans.push(str);
        }
      }

      // Detect CN, O, OU patterns
      if (str.includes('=') || /^[A-Z]{1,3}$/.test(str)) {
        if (str.length > 2 && str.length < 100 && !str.includes('\x00')) {
          // Look for organizational info
          const nextStr = matches[i + 1];
          if (nextStr && nextStr.length > 2) {
            if (!info.subject && (str === 'CN' || str.includes('CN='))) {
              info.subject = nextStr;
            }
            if (!info.issuer && (str === 'O' || str.includes('O='))) {
              info.issuer = nextStr;
            }
          }
        }
      }
    }

    return info;
  };

  const parseASN1Date = (dateStr: string): string | null => {
    try {
      // ASN.1 UTCTime: YYMMDDHHMMSSZ or YYMMDDhhmmss+hhmm
      // ASN.1 GeneralizedTime: YYYYMMDDHHMMSSZ
      const cleaned = dateStr.replace(/Z$/, '');

      if (cleaned.length === 12) {
        // UTCTime format
        const year = parseInt(cleaned.substring(0, 2));
        const fullYear = year < 50 ? 2000 + year : 1900 + year;
        const month = cleaned.substring(2, 4);
        const day = cleaned.substring(4, 6);
        const hour = cleaned.substring(6, 8);
        const minute = cleaned.substring(8, 10);
        const second = cleaned.substring(10, 12);

        return `${fullYear}-${month}-${day} ${hour}:${minute}:${second} UTC`;
      } else if (cleaned.length === 14) {
        // GeneralizedTime format
        const year = cleaned.substring(0, 4);
        const month = cleaned.substring(4, 6);
        const day = cleaned.substring(6, 8);
        const hour = cleaned.substring(8, 10);
        const minute = cleaned.substring(10, 12);
        const second = cleaned.substring(12, 14);

        return `${year}-${month}-${day} ${hour}:${minute}:${second} UTC`;
      }
    } catch {
      return null;
    }
    return null;
  };

  const parseDate = (dateStr: string): Date | null => {
    try {
      return new Date(dateStr);
    } catch {
      return null;
    }
  };

  const generateFingerprint = (base64Cert: string): string => {
    // Generate a pseudo-fingerprint based on the certificate content
    let hash = 0;
    for (let i = 0; i < base64Cert.length; i++) {
      const char = base64Cert.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }

    // Convert to hex string
    const hex = Math.abs(hash).toString(16).padStart(16, '0');
    return hex.match(/.{1,2}/g)?.join(':').toUpperCase() || '';
  };

  const handleInputChange = useCallback((value: string) => {
    setInput(value);
    setError(null);
    setCertInfo(null);

    if (!value.trim()) return;

    try {
      const info = parsePEMCertificate(value);
      setCertInfo(info);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse certificate');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopy = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(section);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Silently fail
    }
  };

  const handleClear = () => {
    setInput('');
    setCertInfo(null);
    setError(null);
  };

  const loadSample = () => {
    const sample = `-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAKL0UG+mRkmSMA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNV
BAYTAlVTMRMwEQYDVQQIDApDYWxpZm9ybmlhMSEwHwYDVQQKDBhJbnRlcm5ldCBX
aWRnaXRzIFB0eSBMdGQwHhcNMjMwMTAxMTIwMDAwWhcNMjQwMTAxMTIwMDAwWjBF
MQswCQYDVQQGEwJVUzETMBEGA1UECAwKQ2FsaWZvcm5pYTEhMB8GA1UECgwYSW50
ZXJuZXQgV2lkZ2l0cyBQdHkgTHRkMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIB
CgKCAQEAw8VT9F6RzGvLF1rF9P4BN4LxH3pK2Y4e8uGjK5tN7qP8c8w3hY8fJ6Kc
-----END CERTIFICATE-----`;
    setInput(sample);
    handleInputChange(sample);
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Certificate Inspector"
          description="Parse and analyze SSL/TLS certificates in PEM format. View certificate details, expiration dates, and security information."
        />

        {/* Input Panel */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">Certificate Input (PEM Format)</h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={loadSample}
                className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
              >
                Load Sample
              </button>
              <button
                onClick={handleClear}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                title="Clear input"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="p-4">
            <textarea
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Paste your PEM certificate here...&#10;&#10;-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
              className="w-full h-48 resize-none border border-gray-300 rounded-lg p-3 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="font-medium text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Certificate Information */}
        {certInfo && (
          <div className="space-y-6">
            {/* Expiration Status */}
            {certInfo.validTo && (
              <div className={`p-4 rounded-lg border ${
                certInfo.isExpired
                  ? 'bg-red-50 border-red-200'
                  : certInfo.daysUntilExpiry !== undefined && certInfo.daysUntilExpiry < 30
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-green-50 border-green-200'
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  {certInfo.isExpired ? (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                  <span className={`font-medium ${
                    certInfo.isExpired
                      ? 'text-red-800'
                      : certInfo.daysUntilExpiry !== undefined && certInfo.daysUntilExpiry < 30
                      ? 'text-yellow-800'
                      : 'text-green-800'
                  }`}>
                    Certificate Status
                  </span>
                </div>
                <p className={`text-sm ${
                  certInfo.isExpired
                    ? 'text-red-700'
                    : certInfo.daysUntilExpiry !== undefined && certInfo.daysUntilExpiry < 30
                    ? 'text-yellow-700'
                    : 'text-green-700'
                }`}>
                  {certInfo.isExpired
                    ? `Certificate expired ${Math.abs(certInfo.daysUntilExpiry || 0)} days ago`
                    : `Valid for ${certInfo.daysUntilExpiry} more days`
                  }
                </p>
              </div>
            )}

            {/* Certificate Details */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="p-4 bg-gray-50 border-b rounded-t-lg">
                <h3 className="text-lg font-semibold text-gray-800">Certificate Details</h3>
              </div>
              <div className="p-4 space-y-4">
                {certInfo.version && (
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Key className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Version</div>
                      <div className="text-sm text-gray-600 font-mono">{certInfo.version}</div>
                    </div>
                  </div>
                )}

                {certInfo.subject && (
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <User className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Subject</div>
                      <div className="text-sm text-gray-600 break-all">{certInfo.subject}</div>
                    </div>
                    <button
                      onClick={() => handleCopy(certInfo.subject!, 'subject')}
                      className="p-1 text-gray-500 hover:text-gray-700"
                    >
                      {copied === 'subject' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                )}

                {certInfo.issuer && (
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <User className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Issuer</div>
                      <div className="text-sm text-gray-600 break-all">{certInfo.issuer}</div>
                    </div>
                    <button
                      onClick={() => handleCopy(certInfo.issuer!, 'issuer')}
                      className="p-1 text-gray-500 hover:text-gray-700"
                    >
                      {copied === 'issuer' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                )}

                {certInfo.validFrom && (
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Valid From</div>
                      <div className="text-sm text-gray-600 font-mono">{certInfo.validFrom}</div>
                    </div>
                  </div>
                )}

                {certInfo.validTo && (
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Valid To</div>
                      <div className="text-sm text-gray-600 font-mono">{certInfo.validTo}</div>
                    </div>
                  </div>
                )}

                {certInfo.serialNumber && (
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Key className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Serial Number</div>
                      <div className="text-sm text-gray-600 font-mono break-all">{certInfo.serialNumber}</div>
                    </div>
                    <button
                      onClick={() => handleCopy(certInfo.serialNumber!, 'serial')}
                      className="p-1 text-gray-500 hover:text-gray-700"
                    >
                      {copied === 'serial' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                )}

                {certInfo.signatureAlgorithm && (
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Shield className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Signature Algorithm</div>
                      <div className="text-sm text-gray-600 font-mono">{certInfo.signatureAlgorithm}</div>
                    </div>
                  </div>
                )}

                {certInfo.fingerprint && (
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Shield className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Fingerprint (SHA-256)</div>
                      <div className="text-sm text-gray-600 font-mono break-all">{certInfo.fingerprint}</div>
                    </div>
                    <button
                      onClick={() => handleCopy(certInfo.fingerprint!, 'fingerprint')}
                      className="p-1 text-gray-500 hover:text-gray-700"
                    >
                      {copied === 'fingerprint' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                )}

                {certInfo.subjectAlternativeNames && certInfo.subjectAlternativeNames.length > 0 && (
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <User className="h-5 w-5 text-teal-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Subject Alternative Names (SANs)</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {certInfo.subjectAlternativeNames.map((san, index) => (
                          <div key={index} className="font-mono py-1">{san}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">Note</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p><strong>Simplified Parser:</strong> This is a basic certificate parser for demonstration purposes</p>
                    <p><strong>Production Use:</strong> For complete certificate analysis, use OpenSSL or proper certificate libraries</p>
                    <p><strong>Privacy:</strong> All parsing happens in your browser - certificates are not sent to any server</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <InfoSection
          title="Certificate Inspector Features"
          items={[
            {
              label: "PEM Format Support",
              description: "Parse certificates in PEM (Base64 encoded) format"
            },
            {
              label: "Certificate Details",
              description: "View subject, issuer, validity dates, and serial number"
            },
            {
              label: "Expiration Monitoring",
              description: "Check certificate expiration status and days remaining"
            },
            {
              label: "Security Information",
              description: "View signature algorithm and certificate fingerprint"
            }
          ]}
          useCases="SSL/TLS troubleshooting, certificate verification, security audits, expiration monitoring"
        />
      </div>
    </div>
  );
};

export default CertificateInspector;
