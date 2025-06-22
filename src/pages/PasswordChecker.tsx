import React, { useState, useCallback } from 'react';
import { Copy, Check, RotateCcw, Lock, Eye, EyeOff, Shield, AlertTriangle } from 'lucide-react';

interface PasswordAnalysis {
  score: number;
  strength: 'Very Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong' | 'Very Strong';
  entropy: number;
  timeToCrack: string;
  feedback: string[];
  checks: {
    length: boolean;
    lowercase: boolean;
    uppercase: boolean;
    numbers: boolean;
    symbols: boolean;
    commonPatterns: boolean;
    dictionary: boolean;
  };
}

const PasswordChecker: React.FC = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [analysis, setAnalysis] = useState<PasswordAnalysis | null>(null);
  const [copied, setCopied] = useState(false);

  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
    'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'dragon',
    'master', 'login', 'princess', 'solo', 'sunshine', 'iloveyou'
  ];

  const calculateEntropy = (pwd: string): number => {
    let charsetSize = 0;
    
    if (/[a-z]/.test(pwd)) charsetSize += 26;
    if (/[A-Z]/.test(pwd)) charsetSize += 26;
    if (/[0-9]/.test(pwd)) charsetSize += 10;
    if (/[^a-zA-Z0-9]/.test(pwd)) charsetSize += 32;
    
    return pwd.length * Math.log2(charsetSize);
  };

  const estimateTimeToCrack = (entropy: number): string => {
    const guessesPerSecond = 1e9; // 1 billion guesses per second
    const totalCombinations = Math.pow(2, entropy);
    const averageGuesses = totalCombinations / 2;
    const seconds = averageGuesses / guessesPerSecond;
    
    if (seconds < 1) return 'Instantly';
    if (seconds < 60) return `${Math.round(seconds)} seconds`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
    if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
    if (seconds < 31536000000) return `${Math.round(seconds / 31536000)} years`;
    return 'Centuries';
  };

  const analyzePassword = useCallback((pwd: string): PasswordAnalysis => {
    if (!pwd) {
      return {
        score: 0,
        strength: 'Very Weak',
        entropy: 0,
        timeToCrack: 'Instantly',
        feedback: ['Enter a password to analyze'],
        checks: {
          length: false,
          lowercase: false,
          uppercase: false,
          numbers: false,
          symbols: false,
          commonPatterns: false,
          dictionary: false
        }
      };
    }

    const checks = {
      length: pwd.length >= 12,
      lowercase: /[a-z]/.test(pwd),
      uppercase: /[A-Z]/.test(pwd),
      numbers: /[0-9]/.test(pwd),
      symbols: /[^a-zA-Z0-9]/.test(pwd),
      commonPatterns: !/(.)\1{2,}|123|abc|qwe|asd|zxc/i.test(pwd),
      dictionary: !commonPasswords.some(common => 
        pwd.toLowerCase().includes(common) || common.includes(pwd.toLowerCase())
      )
    };

    let score = 0;
    const feedback: string[] = [];

    // Length scoring
    if (pwd.length >= 12) score += 25;
    else if (pwd.length >= 8) score += 15;
    else if (pwd.length >= 6) score += 5;
    else feedback.push('Use at least 8 characters (12+ recommended)');

    // Character variety
    if (checks.lowercase) score += 5;
    else feedback.push('Add lowercase letters');
    
    if (checks.uppercase) score += 5;
    else feedback.push('Add uppercase letters');
    
    if (checks.numbers) score += 5;
    else feedback.push('Add numbers');
    
    if (checks.symbols) score += 10;
    else feedback.push('Add special characters (!@#$%^&*)');

    // Pattern checks
    if (checks.commonPatterns) score += 15;
    else feedback.push('Avoid common patterns (123, abc, repeated characters)');

    if (checks.dictionary) score += 15;
    else feedback.push('Avoid common words and passwords');

    // Bonus points for length
    if (pwd.length >= 16) score += 10;
    if (pwd.length >= 20) score += 10;

    // Determine strength
    let strength: PasswordAnalysis['strength'];
    if (score >= 85) strength = 'Very Strong';
    else if (score >= 70) strength = 'Strong';
    else if (score >= 50) strength = 'Good';
    else if (score >= 30) strength = 'Fair';
    else if (score >= 15) strength = 'Weak';
    else strength = 'Very Weak';

    const entropy = calculateEntropy(pwd);
    const timeToCrack = estimateTimeToCrack(entropy);

    if (feedback.length === 0) {
      feedback.push('Excellent! This is a strong password.');
    }

    return {
      score: Math.min(score, 100),
      strength,
      entropy,
      timeToCrack,
      feedback,
      checks
    };
  }, []);

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setAnalysis(analyzePassword(value));
  };

  const generatePassword = () => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = lowercase + uppercase + numbers + symbols;
    let password = '';
    
    // Ensure at least one character from each category
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill the rest randomly
    for (let i = 4; i < 16; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    const shuffled = password.split('').sort(() => Math.random() - 0.5).join('');
    
    setPassword(shuffled);
    setAnalysis(analyzePassword(shuffled));
  };

  const handleCopy = async () => {
    if (!password) return;
    
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleClear = () => {
    setPassword('');
    setAnalysis(null);
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'Very Strong': return 'text-green-700 bg-green-100';
      case 'Strong': return 'text-green-600 bg-green-50';
      case 'Good': return 'text-blue-600 bg-blue-50';
      case 'Fair': return 'text-yellow-600 bg-yellow-50';
      case 'Weak': return 'text-orange-600 bg-orange-50';
      case 'Very Weak': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getProgressColor = (score: number) => {
    if (score >= 85) return 'bg-green-500';
    if (score >= 70) return 'bg-green-400';
    if (score >= 50) return 'bg-blue-500';
    if (score >= 30) return 'bg-yellow-500';
    if (score >= 15) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Password Strength Checker</h1>
          <p className="text-gray-600">
            Evaluate the strength and entropy of passwords with detailed security analysis.
          </p>
        </div>

        {/* Password Input */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 border-b rounded-t-lg">
            <div className="flex items-center space-x-2">
              <Lock className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">Password Input</h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={generatePassword}
                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
              >
                Generate Strong Password
              </button>
              <button
                onClick={handleClear}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                title="Clear password"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="p-4">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  placeholder="Enter password to analyze..."
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <button
                onClick={handleCopy}
                disabled={!password}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                  password
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                title="Copy password"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span className="text-sm font-medium">
                  {copied ? 'Copied!' : 'Copy'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-6">
            {/* Strength Overview */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Password Strength</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStrengthColor(analysis.strength)}`}>
                    {analysis.strength}
                  </span>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Strength Score</span>
                    <span>{analysis.score}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(analysis.score)}`}
                      style={{ width: `${analysis.score}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Entropy:</span>
                    <span className="ml-2 font-medium">{analysis.entropy.toFixed(1)} bits</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Time to crack:</span>
                    <span className="ml-2 font-medium">{analysis.timeToCrack}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Checks */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="p-4 bg-gray-50 border-b rounded-t-lg">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Security Checks</h3>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(analysis.checks).map(([check, passed]) => {
                    const labels = {
                      length: 'At least 12 characters',
                      lowercase: 'Contains lowercase letters',
                      uppercase: 'Contains uppercase letters',
                      numbers: 'Contains numbers',
                      symbols: 'Contains special characters',
                      commonPatterns: 'Avoids common patterns',
                      dictionary: 'Not a common password'
                    };
                    
                    return (
                      <div key={check} className="flex items-center space-x-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {passed ? '✓' : '✗'}
                        </div>
                        <span className={`text-sm ${passed ? 'text-gray-700' : 'text-red-600'}`}>
                          {labels[check as keyof typeof labels]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Feedback */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="p-4 bg-gray-50 border-b rounded-t-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Recommendations</h3>
                </div>
              </div>
              
              <div className="p-6">
                <ul className="space-y-2">
                  {analysis.feedback.map((item, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm">
                      <span className="text-blue-500 mt-1">•</span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Password Tips */}
        <div className="mt-6 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Password Security Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <div className="font-medium mb-2">Strong Password Guidelines</div>
              <ul className="space-y-1">
                <li>• Use at least 12 characters (longer is better)</li>
                <li>• Mix uppercase and lowercase letters</li>
                <li>• Include numbers and special characters</li>
                <li>• Avoid common words and patterns</li>
              </ul>
            </div>
            <div>
              <div className="font-medium mb-2">Best Practices</div>
              <ul className="space-y-1">
                <li>• Use unique passwords for each account</li>
                <li>• Consider using a password manager</li>
                <li>• Enable two-factor authentication</li>
                <li>• Update passwords regularly</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordChecker;