import React, { useState, useMemo } from 'react';
import { Search, Info, AlertCircle, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import InfoSection from '../components/InfoSection';

interface StatusCode {
  code: number;
  name: string;
  description: string;
  category: string;
  details: string;
  examples?: string[];
}

const HttpStatusReference: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const statusCodes: StatusCode[] = [
    // 1xx Informational
    { code: 100, name: 'Continue', category: 'informational', description: 'The server has received the request headers and the client should proceed to send the request body.', details: 'Used with Expect: 100-continue header.' },
    { code: 101, name: 'Switching Protocols', category: 'informational', description: 'The requester has asked the server to switch protocols and the server has agreed to do so.', details: 'Common with WebSocket upgrades.' },
    { code: 102, name: 'Processing', category: 'informational', description: 'The server has received and is processing the request, but no response is available yet.', details: 'WebDAV extension.' },

    // 2xx Success
    { code: 200, name: 'OK', category: 'success', description: 'The request has succeeded.', details: 'The most common success status code.', examples: ['GET request successful', 'POST request processed'] },
    { code: 201, name: 'Created', category: 'success', description: 'The request has been fulfilled and resulted in a new resource being created.', details: 'Typically returned after POST requests that create resources.' },
    { code: 202, name: 'Accepted', category: 'success', description: 'The request has been accepted for processing, but the processing has not been completed.', details: 'Used for asynchronous processing.' },
    { code: 204, name: 'No Content', category: 'success', description: 'The server successfully processed the request and is not returning any content.', details: 'Common with DELETE requests.' },
    { code: 206, name: 'Partial Content', category: 'success', description: 'The server is delivering only part of the resource due to a range header sent by the client.', details: 'Used for resumable downloads and video streaming.' },

    // 3xx Redirection
    { code: 301, name: 'Moved Permanently', category: 'redirection', description: 'The resource has been permanently moved to a new URL.', details: 'Search engines will update their indexes.' },
    { code: 302, name: 'Found', category: 'redirection', description: 'The resource temporarily resides under a different URL.', details: 'Temporary redirect, original URL should be used for future requests.' },
    { code: 304, name: 'Not Modified', category: 'redirection', description: 'The resource has not been modified since the last request.', details: 'Used with conditional requests and caching.' },
    { code: 307, name: 'Temporary Redirect', category: 'redirection', description: 'The request should be repeated with another URL but future requests should still use the original URL.', details: 'Similar to 302 but method must not change.' },
    { code: 308, name: 'Permanent Redirect', category: 'redirection', description: 'The request and all future requests should be repeated using another URL.', details: 'Similar to 301 but method must not change.' },

    // 4xx Client Error
    { code: 400, name: 'Bad Request', category: 'client-error', description: 'The server cannot or will not process the request due to a client error.', details: 'Invalid syntax, malformed request, or invalid parameters.', examples: ['Invalid JSON', 'Missing required fields'] },
    { code: 401, name: 'Unauthorized', category: 'client-error', description: 'The request has not been applied because it lacks valid authentication credentials.', details: 'Authentication is required and has failed or not been provided.' },
    { code: 403, name: 'Forbidden', category: 'client-error', description: 'The server understood the request but refuses to authorize it.', details: 'User is authenticated but lacks permission for the resource.' },
    { code: 404, name: 'Not Found', category: 'client-error', description: 'The server can not find the requested resource.', details: 'The most common error status code.' },
    { code: 405, name: 'Method Not Allowed', category: 'client-error', description: 'The request method is known by the server but is not supported by the target resource.', details: 'E.g., POST request to a read-only resource.' },
    { code: 409, name: 'Conflict', category: 'client-error', description: 'The request could not be completed due to a conflict with the current state of the resource.', details: 'Common with concurrent modifications.' },
    { code: 410, name: 'Gone', category: 'client-error', description: 'The resource requested is no longer available and will not be available again.', details: 'Permanent removal, unlike 404.' },
    { code: 422, name: 'Unprocessable Entity', category: 'client-error', description: 'The request was well-formed but was unable to be followed due to semantic errors.', details: 'Validation errors in request data.' },
    { code: 429, name: 'Too Many Requests', category: 'client-error', description: 'The user has sent too many requests in a given amount of time.', details: 'Rate limiting is in effect.' },

    // 5xx Server Error
    { code: 500, name: 'Internal Server Error', category: 'server-error', description: 'The server has encountered a situation it doesn\'t know how to handle.', details: 'Generic server error message.' },
    { code: 501, name: 'Not Implemented', category: 'server-error', description: 'The request method is not supported by the server and cannot be handled.', details: 'Server doesn\'t support the functionality required.' },
    { code: 502, name: 'Bad Gateway', category: 'server-error', description: 'The server, while working as a gateway, received an invalid response from the upstream server.', details: 'Common with proxy servers and load balancers.' },
    { code: 503, name: 'Service Unavailable', category: 'server-error', description: 'The server is not ready to handle the request.', details: 'Temporary condition due to overload or maintenance.' },
    { code: 504, name: 'Gateway Timeout', category: 'server-error', description: 'The server, while acting as a gateway, did not receive a timely response from the upstream server.', details: 'Timeout occurred while waiting for upstream server.' },
    { code: 505, name: 'HTTP Version Not Supported', category: 'server-error', description: 'The HTTP version used in the request is not supported by the server.', details: 'Server doesn\'t support the HTTP protocol version.' }
  ];

  const categories = [
    { value: 'all', label: 'All Categories', icon: Info },
    { value: 'informational', label: '1xx Informational', icon: Info },
    { value: 'success', label: '2xx Success', icon: CheckCircle },
    { value: 'redirection', label: '3xx Redirection', icon: AlertTriangle },
    { value: 'client-error', label: '4xx Client Error', icon: AlertCircle },
    { value: 'server-error', label: '5xx Server Error', icon: XCircle }
  ];

  const filteredStatusCodes = useMemo(() => {
    return statusCodes.filter(status => {
      const matchesSearch = searchTerm === '' || 
        status.code.toString().includes(searchTerm) ||
        status.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        status.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || status.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const getStatusColor = (category: string) => {
    switch (category) {
      case 'informational': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      case 'redirection': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'client-error': return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'server-error': return 'bg-red-50 border-red-200 text-red-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getStatusIcon = (category: string) => {
    switch (category) {
      case 'informational': return <Info className="h-5 w-5 text-blue-600" />;
      case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'redirection': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'client-error': return <AlertCircle className="h-5 w-5 text-orange-600" />;
      case 'server-error': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <PageHeader 
          title="HTTP Status Code Reference"
          description="Comprehensive reference for HTTP status codes with descriptions and usage examples."
        />

        {/* Search and Filter */}
        <section aria-labelledby="search-filter-heading" className="bg-white rounded-lg shadow-lg border border-gray-200 mb-6">
          <h2 id="search-filter-heading" className="sr-only">Search and Filter Status Codes</h2>
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
                  <label htmlFor="search-input" className="sr-only">Search status codes</label>
                  <input
                    id="search-input"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Search by code, name, or description"
                    placeholder="Search by code, name, or description..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="md:w-64">
                <label htmlFor="category-filter" className="sr-only">Filter by category</label>
                <select
                  id="category-filter"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  aria-label="Filter status codes by category"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Category Tabs */}
        <div role="group" aria-label="Category filter buttons" className="flex flex-wrap gap-2 mb-6">
          {categories.map(category => {
            const Icon = category.icon;
            const isActive = selectedCategory === category.value;
            return (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                aria-pressed={isActive}
                aria-label={`Filter by ${category.label}`}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span className="text-sm">{category.label}</span>
              </button>
            );
          })}
        </div>

        {/* Status Codes Grid */}
        <section aria-labelledby="status-codes-heading">
          <h2 id="status-codes-heading" className="sr-only">HTTP Status Codes</h2>
          <div role="list" aria-label="HTTP status code results" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStatusCodes.map(status => (
              <article
                key={status.code}
                role="listitem"
                className={`p-4 rounded-lg border ${getStatusColor(status.category)}`}
              >
                <div className="flex items-start space-x-3 mb-3">
                  {getStatusIcon(status.category)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-2xl font-bold">{status.code}</span>
                      <span className="text-lg font-semibold">{status.name}</span>
                    </div>
                    <p className="text-sm opacity-90 mb-2">
                      {status.description}
                    </p>
                  </div>
                </div>
                
                <div className="text-sm opacity-80 mb-3">
                  {status.details}
                </div>
                
                {status.examples && (
                  <div className="text-xs opacity-70">
                    <div className="font-medium mb-1">Examples:</div>
                    <ul className="list-disc list-inside space-y-1">
                      {status.examples.map((example, index) => (
                        <li key={index}>{example}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            ))}
          </div>

          {filteredStatusCodes.length === 0 && (
            <div role="status" className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="h-12 w-12 mx-auto" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No status codes found</h3>
              <p className="text-gray-600">Try adjusting your search terms or category filter.</p>
            </div>
          )}
        </section>

        {/* Quick Reference */}
        <section aria-labelledby="quick-reference-heading" className="mt-8 bg-gray-50 rounded-lg p-6">
          <h2 id="quick-reference-heading" className="text-lg font-semibold text-gray-900 mb-4">Quick Reference</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
            <div>
              <div className="font-medium text-blue-700 mb-2">1xx Informational</div>
              <p className="text-gray-600">Request received, continuing process</p>
            </div>
            <div>
              <div className="font-medium text-green-700 mb-2">2xx Success</div>
              <p className="text-gray-600">Request successfully received, understood, and accepted</p>
            </div>
            <div>
              <div className="font-medium text-yellow-700 mb-2">3xx Redirection</div>
              <p className="text-gray-600">Further action needs to be taken to complete the request</p>
            </div>
            <div>
              <div className="font-medium text-orange-700 mb-2">4xx Client Error</div>
              <p className="text-gray-600">Request contains bad syntax or cannot be fulfilled</p>
            </div>
            <div>
              <div className="font-medium text-red-700 mb-2">5xx Server Error</div>
              <p className="text-gray-600">Server failed to fulfill an apparently valid request</p>
            </div>
          </div>
        </section>

        <InfoSection 
          title="HTTP Status Code Categories"
          items={[
            {
              label: "1xx Informational",
              description: "Request received, continuing process"
            },
            {
              label: "2xx Success",
              description: "Request successfully received, understood, and accepted"
            },
            {
              label: "3xx Redirection",
              description: "Further action needs to be taken to complete the request"
            },
            {
              label: "4xx Client Error",
              description: "Request contains bad syntax or cannot be fulfilled"
            },
            {
              label: "5xx Server Error",
              description: "Server failed to fulfill an apparently valid request"
            }
          ]}
          useCases="API debugging, web development, HTTP troubleshooting, status code lookup"
        />
      </div>
    </div>
  );
};

export default HttpStatusReference;