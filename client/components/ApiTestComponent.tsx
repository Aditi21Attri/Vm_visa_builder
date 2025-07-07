import React, { useState, useEffect } from 'react';
import { api, ApiError } from '@shared/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface HealthData {
  status: string;
  uptime: number;
  environment: string;
  version: string;
}

/**
 * Example component showing how to use the API client
 * This component demonstrates:
 * - API calls with error handling
 * - Loading states
 * - Toast notifications
 * - TypeScript integration
 */
const ApiTestComponent: React.FC = () => {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  /**
   * Test API connection
   */
  const testApiConnection = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.test();
      console.log('API Test Response:', response);
      
      toast({
        title: "API Connection Successful",
        description: response.message,
        variant: "default",
      });
    } catch (err) {
      console.error('API Test Error:', err);
      
      if (err instanceof ApiError) {
        setError(err.message);
        toast({
          title: "API Connection Failed",
          description: err.message,
          variant: "destructive",
        });
      } else {
        setError('Unknown error occurred');
        toast({
          title: "API Connection Failed",
          description: "Unknown error occurred",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get health status
   */
  const getHealthStatus = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.health();
      setHealthData(response.data as HealthData);
      
      toast({
        title: "Health Check Successful",
        description: "Backend server is healthy",
        variant: "default",
      });
    } catch (err) {
      console.error('Health Check Error:', err);
      
      if (err instanceof ApiError) {
        setError(err.message);
        toast({
          title: "Health Check Failed",
          description: err.message,
          variant: "destructive",
        });
      } else {
        setError('Unknown error occurred');
        toast({
          title: "Health Check Failed",
          description: "Unknown error occurred",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Test authentication (example)
   */
  const testAuthentication = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.auth.login({
        email: 'john@example.com',
        password: 'password123'
      });
      
      console.log('Login Response:', response);
      
      toast({
        title: "Login Successful",
        description: response.message,
        variant: "default",
      });
    } catch (err) {
      console.error('Login Error:', err);
      
      if (err instanceof ApiError) {
        setError(err.message);
        toast({
          title: "Login Failed",
          description: err.message,
          variant: "destructive",
        });
      } else {
        setError('Unknown error occurred');
        toast({
          title: "Login Failed",
          description: "Unknown error occurred",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Format uptime in human readable format
   */
  const formatUptime = (uptime: number): string => {
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API Connection Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={testApiConnection}
              disabled={loading}
              variant="outline"
            >
              {loading ? 'Testing...' : 'Test API Connection'}
            </Button>
            
            <Button 
              onClick={getHealthStatus}
              disabled={loading}
              variant="outline"
            >
              {loading ? 'Checking...' : 'Check Health Status'}
            </Button>
            
            <Button 
              onClick={testAuthentication}
              disabled={loading}
              variant="outline"
            >
              {loading ? 'Testing...' : 'Test Authentication'}
            </Button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 font-medium">Error:</p>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {healthData && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <h3 className="text-green-800 font-medium mb-2">Server Health Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700">Status:</span>
                  <span className="text-green-800 font-medium">{healthData.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Uptime:</span>
                  <span className="text-green-800 font-medium">{formatUptime(healthData.uptime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Environment:</span>
                  <span className="text-green-800 font-medium">{healthData.environment}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Version:</span>
                  <span className="text-green-800 font-medium">{healthData.version}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Usage Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Basic API Call</h4>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`import { api } from '@shared/api';

// Simple GET request
const response = await api.test();
console.log(response.data);`}
              </pre>
            </div>

            <div>
              <h4 className="font-medium mb-2">With Error Handling</h4>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`import { api, ApiError } from '@shared/api';

try {
  const response = await api.auth.login({ email, password });
  // Handle success
} catch (err) {
  if (err instanceof ApiError) {
    console.error('API Error:', err.message);
  } else {
    console.error('Unknown error:', err);
  }
}`}
              </pre>
            </div>

            <div>
              <h4 className="font-medium mb-2">File Upload</h4>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`import { api } from '@shared/api';

const handleFileUpload = async (file: File) => {
  try {
    const response = await api.documents.upload(file, {
      category: 'passport',
      description: 'User passport document'
    });
    console.log('Upload successful:', response.data);
  } catch (err) {
    console.error('Upload failed:', err);
  }
};`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiTestComponent;
