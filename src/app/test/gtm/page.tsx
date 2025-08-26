'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { pushToDataLayer } from '@/components/GoogleTagManager';

export default function GTMTestPage() {
  const [testResults, setTestResults] = useState<string[]>([]);

  const testGTMEvents = () => {
    const events = [
      {
        event: 'test_event',
        test_data: 'GTM is working!',
        timestamp: new Date().toISOString()
      },
      {
        event: 'form_submit',
        form_name: 'test_form',
        form_data: {
          test_field: 'test_value',
          email: 'test@example.com'
        }
      },
      {
        event: 'diagnostic_start',
        form_name: 'diagnostic_form'
      }
    ];

    events.forEach((eventData, index) => {
      pushToDataLayer(eventData);
      setTestResults(prev => [...prev, `Event ${index + 1} pushed: ${JSON.stringify(eventData)}`]);
    });
  };

  const checkDataLayer = () => {
    if (typeof window !== 'undefined' && window.dataLayer) {
      setTestResults(prev => [...prev, `Data layer length: ${window.dataLayer.length}`]);
      setTestResults(prev => [...prev, `Last 3 events: ${JSON.stringify(window.dataLayer.slice(-3))}`]);
    } else {
      setTestResults(prev => [...prev, 'Data layer not found or not accessible']);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl p-8">
      <h1 className="text-3xl font-bold mb-8">Google Tag Manager Test Page</h1>
      
      <div className="space-y-4 mb-8">
        <Button onClick={testGTMEvents} className="mr-4">
          Test GTM Events
        </Button>
        <Button onClick={checkDataLayer} variant="outline">
          Check Data Layer
        </Button>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Test Results:</h2>
        <div className="space-y-2">
          {testResults.map((result, index) => (
            <div key={index} className="bg-white p-2 rounded text-sm font-mono">
              {result}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Click "Test GTM Events" to push test events to the data layer</li>
          <li>Click "Check Data Layer" to see the current state of the data layer</li>
          <li>Open browser developer tools and check the Console tab for any errors</li>
          <li>Check Google Tag Manager preview mode to see if events are being received</li>
        </ol>
      </div>
    </div>
  );
}
