import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '../services/apiClient';
import { API_ENDPOINTS } from '../constants/api';
import { LoadingSpinner, ErrorMessage, SuccessMessage } from '../components/ui';

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [respondingId, setRespondingId] = useState(null);

  // Fetch requests
  const fetchRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await apiClient.get(API_ENDPOINTS.REQUESTS_GET);
      setRequests(response.data.requests || []);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to load requests';
      setError(errorMsg);
      console.error('Request fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load requests on mount
  useEffect(() => {
    fetchRequests();
  }, []); // Run once on mount only

  // Handle accept/reject
  const handleRespond = async (requestId, action) => {
    setRespondingId(requestId);
    try {
      await apiClient.post(API_ENDPOINTS.REQUESTS_UPDATE, {
        requestId,
        action,
      });
      
      setSuccess(`Request ${action}ed successfully!`);
      setError('');
      
      // Remove request from list
      setRequests((prev) => prev.filter((r) => r._id !== requestId));
      
      // Clear success message after 3s
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to respond';
      setError(errorMsg);
      setSuccess('');
    } finally {
      setRespondingId(null);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-2 text-gray-800">Skill Requests</h2>
        <p className="text-gray-600 mb-6">Manage requests from people wanting to learn from or teach you</p>

        {error && (
          <ErrorMessage
            message={error}
            onDismiss={() => setError('')}
          />
        )}

        {success && (
          <SuccessMessage
            message={success}
            onDismiss={() => setSuccess('')}
          />
        )}

        {requests.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-600 text-lg">No requests yet</p>
            <p className="text-gray-500 text-sm mt-2">
              People will appear here when they request to learn from or teach you.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request._id}
                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
              >
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    {request.sender?.name || 'Unknown User'}
                  </h3>
                  <p className="text-sm text-gray-600">{request.sender?.email || 'N/A'}</p>
                </div>

                {request.skill && (
                  <div className="mb-4 p-3 bg-blue-50 rounded">
                    <p className="text-sm font-semibold text-gray-700">Requested Skill:</p>
                    <p className="text-blue-600 font-medium">{request.skill}</p>
                  </div>
                )}

                {request.message && (
                  <div className="mb-4 p-3 bg-gray-50 rounded">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Message:</p>
                    <p className="text-gray-700">{request.message}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => handleRespond(request._id, 'accept')}
                    disabled={respondingId === request._id}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50"
                  >
                    {respondingId === request._id ? 'Accepting...' : 'Accept'}
                  </button>
                  <button
                    onClick={() => handleRespond(request._id, 'reject')}
                    disabled={respondingId === request._id}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50"
                  >
                    {respondingId === request._id ? 'Rejecting...' : 'Reject'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Requests;
