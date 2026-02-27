import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '../services/apiClient';
import { API_ENDPOINTS } from '../constants/api';
import { LoadingSpinner, ErrorMessage } from '../components/ui';

const Match = () => {
  const [matches, setMatches] = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [skillFilter, setSkillFilter] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchMatches = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await apiClient.get(API_ENDPOINTS.MATCH_GET);
      const matchList = response.data.matches || [];
      setMatches(matchList);
      // Don't set filteredMatches here - let the filter useEffect handle it
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to load matches';
      setError(errorMsg);
      console.error('Match fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Filter matches by skill (only search when filter has value)
  useEffect(() => {
    if (skillFilter.trim()) {
      // Only filter when there's a search criteria
      const searchLower = skillFilter.toLowerCase();
      const filtered = matches.filter((match) => {
        const matchSkills = [
          ...(match.learnFromOther || []),
          ...(match.teachToOther || []),
        ]
          .map((s) => s.toLowerCase())
          .join(' ');
        return matchSkills.includes(searchLower);
      });
      setFilteredMatches(filtered);
    } else {
      // Clear results if no filter
      setFilteredMatches([]);
    }
  }, [skillFilter, matches]);

  // Fetch matches when filter is applied
  useEffect(() => {
    if (skillFilter.trim()) {
      fetchMatches();
    } else {
      // Clear matches if no filter
      setMatches([]);
      setFilteredMatches([]);
    }
  }, [skillFilter, fetchMatches]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Find Skill Matches</h2>
          <p className="text-gray-600">Discover people to learn from and teach to</p>
        </div>

        {error && (
          <ErrorMessage
            message={error}
            onDismiss={() => setError('')}
          />
        )}

        {/* Filter Section */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <input
            type="text"
            placeholder="Filter by skill (e.g., React, Python, Design)..."
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
          {skillFilter && (
            <p className="text-sm text-gray-600 mt-2">
              Found {filteredMatches.length} match{filteredMatches.length !== 1 ? 'es' : ''}
            </p>
          )}
        </div>

        {/* Matches Grid */}
        {isLoading ? (
          <LoadingSpinner fullScreen />
        ) : !skillFilter.trim() ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-600 text-lg">
              Start filtering by skill to see matches
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Use the filter above to find users who share your interests.
            </p>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-600 text-lg">
              No matches found for "{skillFilter}"
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Try a different skill filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMatches.map((match) => (
              <div key={match.userId} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900">{match.name}</h3>
                  <p className="text-sm text-gray-600 truncate">{match.email}</p>
                </div>

                {match.matchScore !== undefined && (
                  <div className="mb-4 p-2 bg-blue-50 rounded">
                    <p className="text-sm text-gray-600">Match Score</p>
                    <p className="text-lg font-bold text-blue-600">{match.matchScore}%</p>
                  </div>
                )}

                {match.learnFromOther && match.learnFromOther.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Can teach you:</p>
                    <div className="flex flex-wrap gap-2">
                      {match.learnFromOther.map((skill, idx) => (
                        <span
                          key={idx}
                          className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {match.teachToOther && match.teachToOther.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Wants to learn:</p>
                    <div className="flex flex-wrap gap-2">
                      {match.teachToOther.map((skill, idx) => (
                        <span
                          key={idx}
                          className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition font-medium">
                  View Profile
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Match;
