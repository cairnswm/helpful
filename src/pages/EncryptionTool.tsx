import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import InfoSection from '../components/InfoSection';
import { Lock, Unlock, Key, Copy, Check, AlertCircle, RotateCcw } from 'lucide-react';

type Mode = 'encrypt' | 'decrypt';
type Algorithm = 'AES-GCM' | 'AES-CBC';

const EncryptionTool: React.FC = () => {
  const [mode, setMode] = useState<Mode>('encrypt');
  const [algorithm, setAlgorithm] = useState<Algorithm>('AES-GCM');
  const [input, setInput] = useState('');
  const [password, setPassword] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Convert password to cryptographic key
  const deriveKey = async (password: string, salt: Uint8Array): Promise<CryptoKey> => {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);

    // Import password as key material
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    // Derive a key from the password
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: algorithm, length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  };

  // Encrypt text
  const encryptText = async (text: string, password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);

    // Generate random salt and IV
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Derive key from password
    const key = await deriveKey(password, salt);

    // Encrypt data
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: algorithm,
        iv: iv,
      },
      key,
      data
    );

    // Combine salt + iv + encrypted data
    const resultArray = new Uint8Array(salt.length + iv.length + encryptedData.byteLength);
    resultArray.set(salt, 0);
    resultArray.set(iv, salt.length);
    resultArray.set(new Uint8Array(encryptedData), salt.length + iv.length);

    // Convert to base64
    return btoa(String.fromCharCode(...resultArray));
  };

  // Decrypt text
  const decryptText = async (encryptedText: string, password: string): Promise<string> => {
    // Decode from base64
    const encryptedData = Uint8Array.from(atob(encryptedText), c => c.charCodeAt(0));

    // Extract salt, iv, and ciphertext
    const salt = encryptedData.slice(0, 16);
    const iv = encryptedData.slice(16, 28);
    const ciphertext = encryptedData.slice(28);

    // Derive key from password
    const key = await deriveKey(password, salt);

    // Decrypt data
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: algorithm,
        iv: iv,
      },
      key,
      ciphertext
    );

    // Convert back to text
    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);
  };

  const handleProcess = async () => {
    setError(null);
    setOutput('');

    if (!input.trim()) {
      setError('Please enter text to process');
      return;
    }

    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }

    if (password.length < 8) {
      setError('Password should be at least 8 characters for security');
      return;
    }

    setProcessing(true);

    try {
      if (mode === 'encrypt') {
        const encrypted = await encryptText(input, password);
        setOutput(encrypted);
      } else {
        const decrypted = await decryptText(input, password);
        setOutput(decrypted);
      }
    } catch (err) {
      setError(
        mode === 'decrypt'
          ? 'Decryption failed. Check your password and encrypted text.'
          : 'Encryption failed. Please try again.'
      );
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const handleCopy = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silently fail
    }
  };

  const handleClear = () => {
    setInput('');
    setPassword('');
    setOutput('');
    setError(null);
  };

  const loadSample = () => {
    if (mode === 'encrypt') {
      setInput('This is a secret message that needs to be encrypted.');
      setPassword('MySecurePassword123');
    } else {
      setInput('Sample encrypted text - encrypt something first to get real encrypted data');
      setPassword('MySecurePassword123');
    }
  };

  const generateRandomPassword = () => {
    const length = 16;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    const randomValues = crypto.getRandomValues(new Uint8Array(length));
    for (let i = 0; i < length; i++) {
      password += charset[randomValues[i] % charset.length];
    }
    setPassword(password);
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Encryption/Decryption Tool"
          description="Encrypt and decrypt text using AES encryption with password-based key derivation."
        />

        {/* Mode and Algorithm Selection */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-6">
          <div className="p-4 bg-gray-50 border-b rounded-t-lg">
            <h3 className="text-lg font-semibold text-gray-800">Configuration</h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setMode('encrypt');
                      setOutput('');
                      setError(null);
                    }}
                    className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      mode === 'encrypt'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Lock className="h-4 w-4" />
                    <span>Encrypt</span>
                  </button>
                  <button
                    onClick={() => {
                      setMode('decrypt');
                      setOutput('');
                      setError(null);
                    }}
                    className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      mode === 'decrypt'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Unlock className="h-4 w-4" />
                    <span>Decrypt</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Algorithm</label>
                <select
                  value={algorithm}
                  onChange={(e) => {
                    setAlgorithm(e.target.value as Algorithm);
                    setOutput('');
                    setError(null);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="AES-GCM">AES-GCM (Recommended)</option>
                  <option value="AES-CBC">AES-CBC</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Password Input */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-6">
          <div className="p-4 bg-gray-50 border-b rounded-t-lg">
            <div className="flex items-center space-x-2">
              <Key className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">Password</h3>
            </div>
          </div>
          <div className="p-4">
            <div className="flex space-x-2">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a strong password (min 8 characters)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={generateRandomPassword}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors whitespace-nowrap"
                title="Generate random password"
              >
                Generate
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Use a strong password with at least 8 characters. The same password must be used for encryption and decryption.
            </p>
          </div>
        </div>

        {/* Input Panel */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
            <h3 className="text-lg font-semibold text-gray-800">
              {mode === 'encrypt' ? 'Text to Encrypt' : 'Encrypted Text'}
            </h3>
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
                title="Clear all"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="p-4">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === 'encrypt'
                  ? 'Enter text to encrypt...'
                  : 'Paste encrypted text here...'
              }
              className="w-full h-32 resize-none border border-gray-300 rounded-lg p-3 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Process Button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={handleProcess}
            disabled={processing}
            className={`flex items-center space-x-2 px-8 py-3 rounded-lg font-medium transition-colors ${
              processing
                ? 'bg-gray-400 cursor-not-allowed'
                : mode === 'encrypt'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {mode === 'encrypt' ? <Lock className="h-5 w-5" /> : <Unlock className="h-5 w-5" />}
            <span>{processing ? 'Processing...' : mode === 'encrypt' ? 'Encrypt' : 'Decrypt'}</span>
          </button>
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

        {/* Output Panel */}
        {output && (
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-800">
                {mode === 'encrypt' ? 'Encrypted Result' : 'Decrypted Result'}
              </h3>
              <button
                onClick={handleCopy}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span className="text-sm font-medium">{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <div className="p-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap break-all">
                  {output}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Security Information */}
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200 mb-6">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-900 mb-2">Security Notes</h4>
              <div className="text-sm text-yellow-800 space-y-1">
                <p><strong>Password Security:</strong> Use a strong, unique password for encryption</p>
                <p><strong>Key Derivation:</strong> Uses PBKDF2 with 100,000 iterations for password-based key derivation</p>
                <p><strong>AES-GCM:</strong> Recommended for most use cases - provides both encryption and authentication</p>
                <p><strong>Client-Side:</strong> All encryption/decryption happens in your browser - data is not sent to any server</p>
                <p><strong>Storage:</strong> Store encrypted data and passwords securely - losing the password means losing access to the data</p>
              </div>
            </div>
          </div>
        </div>

        <InfoSection
          title="Encryption Features"
          items={[
            {
              label: "AES-256 Encryption",
              description: "Industry-standard Advanced Encryption Standard with 256-bit keys"
            },
            {
              label: "Password-Based Encryption",
              description: "Uses PBKDF2 to derive cryptographic keys from passwords"
            },
            {
              label: "Random Salt & IV",
              description: "Generates random salt and initialization vector for each encryption"
            },
            {
              label: "AES-GCM Mode",
              description: "Galois/Counter Mode provides both encryption and authentication"
            }
          ]}
          useCases="Secure messaging, data protection, password storage, file encryption, confidential communications"
        />
      </div>
    </div>
  );
};

export default EncryptionTool;
