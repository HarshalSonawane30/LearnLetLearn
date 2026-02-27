import React, { useEffect, useState } from 'react';
import { useAuth } from '../app/AuthContext';
import { LoadingSpinner, ErrorMessage } from '../components/ui';

const Profile = () => {
  const { user, getProfile, isLoading: authLoading } = useAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        await getProfile();
      } catch (err) {
        setError('Failed to load profile. Please try again.');
        console.error('Profile fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch on mount, not on every getProfile change
    if (!user) {
      fetchProfile();
    } else {
      setIsLoading(false);
    }
  }, []); // Empty dependency array - run only once on mount

  if (isLoading || authLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (error) {
    return (
      <div className="p-8">
        <ErrorMessage message={error} onDismiss={() => setError('')} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8">
        <ErrorMessage message="No profile data available" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">My Profile</h2>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="space-y-4">
            <div className="border-b pb-4">
              <p className="text-gray-600 text-sm uppercase tracking-wide">Name</p>
              <p className="text-lg font-semibold text-gray-900">{user.name || 'N/A'}</p>
            </div>

            <div className="border-b pb-4">
              <p className="text-gray-600 text-sm uppercase tracking-wide">Email</p>
              <p className="text-lg font-semibold text-gray-900">{user.email || 'N/A'}</p>
            </div>

            {user.role && (
              <div className="border-b pb-4">
                <p className="text-gray-600 text-sm uppercase tracking-wide">Role</p>
                <p className="text-lg font-semibold text-gray-900">{user.role}</p>
              </div>
            )}

            {user.skillsKnown && user.skillsKnown.length > 0 && (
              <div className="border-b pb-4">
                <p className="text-gray-600 text-sm uppercase tracking-wide">Skills Known</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {user.skillsKnown.map((skill, idx) => (
                    <span
                      key={idx}
                      className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {user.skillsToLearn && user.skillsToLearn.length > 0 && (
              <div className="pb-4">
                <p className="text-gray-600 text-sm uppercase tracking-wide">Skills To Learn</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {user.skillsToLearn.map((skill, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
