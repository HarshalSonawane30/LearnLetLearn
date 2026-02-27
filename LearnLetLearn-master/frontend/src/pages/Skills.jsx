import React, { useEffect, useState, useMemo, useCallback } from 'react';
import apiClient from '../services/apiClient';
import { API_ENDPOINTS } from '../constants/api';
import { useAuth } from '../app/AuthContext';
import {
  FormInput,
  SubmitButton,
  ErrorMessage,
  SuccessMessage,
  LoadingSpinner,
  SkeletonList
} from '../components/ui';
import useDebounce from '../hooks/useDebounce';

const Skills = () => {
  const { user, updateUser } = useAuth();

  // ========================
  // TAB STATE
  // ========================
  const [activeTab, setActiveTab] = useState('manage');

  // ========================
  // SKILLS MANAGEMENT STATE
  // ========================
  const [skillsKnown, setSkillsKnown] = useState('');
  const [skillsToLearn, setSkillsToLearn] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // ========================
  // RECOMMENDATIONS & SEARCH STATE
  // ========================
  const [recommendations, setRecommendations] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);
  const [recError, setRecError] = useState('');

  // Search filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSkillOffered, setFilterSkillOffered] = useState('');
  const [filterSkillWanted, setFilterSkillWanted] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search query
  const debouncedSearch = useDebounce(searchQuery, 300);

  // ========================
  // LOAD INITIAL SKILLS
  // ========================
  useEffect(() => {
    const loadSkills = async () => {
      try {
        setIsFetching(true);
        if (user?.skillsKnown && user?.skillsToLearn) {
          setSkillsKnown(user.skillsKnown.join(', '));
          setSkillsToLearn(user.skillsToLearn.join(', '));
        }
      } catch (err) {
        setError('Failed to load skills');
      } finally {
        setIsFetching(false);
      }
    };
    loadSkills();
  }, []);

  // ========================
  // FETCH RECOMMENDATIONS
  // ========================
  const fetchRecommendations = useCallback(async () => {
    try {
      setIsLoadingRecs(true);
      setRecError('');
      const response = await apiClient.get(API_ENDPOINTS.RECOMMENDATIONS_GET);
      setRecommendations(response.data.recommendations || []);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch recommendations';
      setRecError(errorMsg);
      setRecommendations([]);
    } finally {
      setIsLoadingRecs(false);
    }
  }, []);

  // ========================
  // FETCH SEARCH RESULTS
  // ========================
  const fetchSearchResults = useCallback(async () => {
    try {
      setIsLoadingRecs(true);
      setRecError('');

      const params = {
        page: currentPage,
        ...(debouncedSearch && { q: debouncedSearch }),
        ...(filterSkillOffered && { skillOffered: filterSkillOffered }),
        ...(filterSkillWanted && { skillWanted: filterSkillWanted })
      };

      const response = await apiClient.get(API_ENDPOINTS.USERS_SEARCH, {
        params
      });

      setSearchResults(response.data.results || []);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Search failed';
      setRecError(errorMsg);
      setSearchResults([]);
    } finally {
      setIsLoadingRecs(false);
    }
  }, [debouncedSearch, filterSkillOffered, filterSkillWanted, currentPage]);

  // Load recommendations when recommendations tab is opened
  useEffect(() => {
    if (activeTab === 'recommendations') {
      fetchRecommendations();
    }
  }, [activeTab, fetchRecommendations]);

  // Perform search when any filter or debounced search changes
  useEffect(() => {
    if (activeTab === 'search') {
      setCurrentPage(1);
      
      // Only perform search if there's actual search criteria
      const hasSearchCriteria = debouncedSearch || filterSkillOffered || filterSkillWanted;
      
      if (hasSearchCriteria) {
        fetchSearchResults();
      } else {
        // Clear results if no search criteria
        setSearchResults([]);
        setRecError('');
      }
    }
  }, [debouncedSearch, filterSkillOffered, filterSkillWanted, activeTab, fetchSearchResults]);

  // ========================
  // HANDLE SKILL UPDATES
  // ========================
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError('');
      setSuccess('');

      try {
        setIsLoading(true);
        const skillsKnownArray = skillsKnown
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        const skillsToLearnArray = skillsToLearn
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

        await apiClient.put(API_ENDPOINTS.SKILLS_UPDATE, {
          skillsKnown: skillsKnownArray,
          skillsToLearn: skillsToLearnArray
        });

        updateUser({
          ...user,
          skillsKnown: skillsKnownArray,
          skillsToLearn: skillsToLearnArray
        });

        setSuccess('Skills updated successfully!');
      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Failed to update skills';
        setError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    },
    [skillsKnown, skillsToLearn, user, updateUser]
  );

  // ========================
  // DERIVED STATES (useMemo)
  // ========================

  // Get all unique skills from recommendations for filter suggestions
  const availableSkills = useMemo(() => {
    const skillSet = new Set();
    recommendations.forEach((rec) => {
      rec.skillsOffered?.forEach((s) => skillSet.add(s));
      rec.skillsWanted?.forEach((s) => skillSet.add(s));
    });
    return Array.from(skillSet).sort();
  }, [recommendations]);

  // Memoized recommendation cards
  const recommendationCards = useMemo(
    () =>
      recommendations.map((rec) => (
        <RecommendationCard key={rec.userId} recommendation={rec} />
      )),
    [recommendations]
  );

  // Memoized search result cards
  const searchResultCards = useMemo(
    () =>
      searchResults.map((result) => (
        <SearchResultCard key={result.userId} user={result} />
      )),
    [searchResults]
  );

  // ========================
  // RENDER FUNCTIONS
  // ========================

  if (isFetching) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-gray-800">Skills Hub</h1>
        <p className="text-gray-600 mb-8">
          Manage your skills and discover mentors with matching expertise
        </p>

        {/* TAB NAVIGATION */}
        <div className="flex gap-4 mb-8 border-b border-gray-300">
          <button
            onClick={() => setActiveTab('manage')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'manage'
                ? 'border-b-4 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Manage Skills
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'recommendations'
                ? 'border-b-4 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Recommendations
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'search'
                ? 'border-b-4 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Search Users
          </button>
        </div>

        {/* ===========================
             TAB 1: MANAGE SKILLS
             =========================== */}
        {activeTab === 'manage' && (
          <div className="bg-white p-8 rounded-lg shadow-lg">
            {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}
            {success && <SuccessMessage message={success} onDismiss={() => setSuccess('')} />}

            <form onSubmit={handleSubmit} className="space-y-6">
              <FormInput
                label="Skills Known"
                type="text"
                name="skillsKnown"
                value={skillsKnown}
                onChange={(e) => setSkillsKnown(e.target.value)}
                placeholder="e.g., React, JavaScript, Python, HTML/CSS"
              />
              <p className="text-sm text-gray-600 mb-6">
                Enter skills separated by commas. These are skills you can teach to others.
              </p>

              <FormInput
                label="Skills To Learn"
                type="text"
                name="skillsToLearn"
                value={skillsToLearn}
                onChange={(e) => setSkillsToLearn(e.target.value)}
                placeholder="e.g., Node.js, MongoDB, Vue.js, Design"
              />
              <p className="text-sm text-gray-600 mb-6">
                Enter skills separated by commas. These are skills you want to learn from others.
              </p>

              <SubmitButton
                label="Update Skills"
                isLoading={isLoading}
                className="mt-6"
              />
            </form>
          </div>
        )}

        {/* ===========================
             TAB 2: RECOMMENDATIONS
             =========================== */}
        {activeTab === 'recommendations' && (
          <div>
            {recError && (
              <ErrorMessage message={recError} onDismiss={() => setRecError('')} />
            )}

            {isLoadingRecs ? (
              <SkeletonList count={6} />
            ) : recommendations.length === 0 ? (
              <div className="bg-white p-12 rounded-lg shadow-lg text-center">
                <p className="text-gray-600 text-lg mb-4">
                  {user?.skillsToLearn?.length === 0
                    ? 'Add skills you want to learn to see recommendations'
                    : 'No recommendations found yet. Try updating your skills.'}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-6">
                  Found {recommendations.length} highly matched mentors
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendationCards}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===========================
             TAB 3: SEARCH USERS
             =========================== */}
        {activeTab === 'search' && (
          <div>
            {/* SEARCH FILTERS */}
            <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
              <h3 className="text-xl font-bold mb-6 text-gray-800">Search & Filter</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <FormInput
                  label="Search"
                  type="text"
                  name="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or skill..."
                />

                <FormInput
                  label="Skill They Offer"
                  type="text"
                  name="skillOffered"
                  value={filterSkillOffered}
                  onChange={(e) => setFilterSkillOffered(e.target.value)}
                  placeholder="e.g., Python, React"
                />

                <FormInput
                  label="Skill They Want to Learn"
                  type="text"
                  name="skillWanted"
                  value={filterSkillWanted}
                  onChange={(e) => setFilterSkillWanted(e.target.value)}
                  placeholder="e.g., Design, Marketing"
                />
              </div>

              {filterSkillOffered || filterSkillWanted ? (
                <button
                  onClick={() => {
                    setFilterSkillOffered('');
                    setFilterSkillWanted('');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                >
                  Clear Filters
                </button>
              ) : null}
            </div>

            {/* SEARCH RESULTS */}
            {recError && (
              <ErrorMessage message={recError} onDismiss={() => setRecError('')} />
            )}

            {isLoadingRecs ? (
              <SkeletonList count={6} />
            ) : searchResults.length === 0 ? (
              <div className="bg-white p-12 rounded-lg shadow-lg text-center">
                <p className="text-gray-600 text-lg">
                  {searchQuery || filterSkillOffered || filterSkillWanted
                    ? 'No users found matching your criteria'
                    : 'Start searching to find users'}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-6">
                  Found {searchResults.length} users
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchResultCards}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ========================
// RECOMMENDATION CARD COMPONENT
// ========================
const RecommendationCard = ({ recommendation }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition transform hover:scale-105 duration-300">
      {/* Profile Photo */}
      <div className="relative h-40 bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center">
        {recommendation.profile?.photo ? (
          <img
            src={recommendation.profile.photo}
            alt={recommendation.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-20 h-20 bg-blue-300 rounded-full flex items-center justify-center text-4xl text-white font-bold">
            {recommendation.name?.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="p-6">
        {/* Name & Match Badge */}
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">{recommendation.name}</h3>
          <div
            className={`px-3 py-1 rounded-full text-sm font-bold text-white ${
              recommendation.matchPercentage >= 80
                ? 'bg-green-500'
                : recommendation.matchPercentage >= 60
                  ? 'bg-yellow-500'
                  : 'bg-blue-500'
            }`}
          >
            {recommendation.matchPercentage}%
          </div>
        </div>

        {/* Skills Offered */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
            Can Teach
          </p>
          <div className="flex flex-wrap gap-2">
            {recommendation.skillsOffered.slice(0, 3).map((skill, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium"
              >
                {skill}
              </span>
            ))}
            {recommendation.skillsOffered.length > 3 && (
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{recommendation.skillsOffered.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Skills Wanted */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
            Wants to Learn
          </p>
          <div className="flex flex-wrap gap-2">
            {recommendation.skillsWanted.slice(0, 3).map((skill, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium"
              >
                {skill}
              </span>
            ))}
            {recommendation.skillsWanted.length > 3 && (
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{recommendation.skillsWanted.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Mutual Skills */}
        {recommendation.mutualSkills?.length > 0 && (
          <div className="mb-4 p-3 bg-purple-50 rounded-lg">
            <p className="text-xs font-semibold text-purple-700 mb-2 uppercase tracking-wide">
              Mutual Interest
            </p>
            <div className="flex flex-wrap gap-2">
              {recommendation.mutualSkills.slice(0, 4).map((skill, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-purple-200 text-purple-800 text-xs rounded font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Connect Button */}
        <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
          Connect
        </button>
      </div>
    </div>
  );
};

// ========================
// SEARCH RESULT CARD COMPONENT
// ========================
const SearchResultCard = ({ user }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
      {/* Profile Photo */}
      <div className="relative h-32 bg-gradient-to-r from-indigo-400 to-purple-500 flex items-center justify-center">
        {user.profile?.photo ? (
          <img
            src={user.profile.photo}
            alt={user.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 bg-indigo-300 rounded-full flex items-center justify-center text-3xl text-white font-bold">
            {user.name?.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="p-6">
        {/* Name */}
        <h3 className="text-lg font-bold text-gray-800 mb-3">{user.name}</h3>

        {/* Skills Offered */}
        {user.skillsOffered.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-gray-600 mb-1 uppercase">Teaches</p>
            <div className="flex flex-wrap gap-1">
              {user.skillsOffered.slice(0, 2).map((skill, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                >
                  {skill}
                </span>
              ))}
              {user.skillsOffered.length > 2 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{user.skillsOffered.length - 2}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Skills Wanted */}
        {user.skillsWanted.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-600 mb-1 uppercase">Learns</p>
            <div className="flex flex-wrap gap-1">
              {user.skillsWanted.slice(0, 2).map((skill, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {skill}
                </span>
              ))}
              {user.skillsWanted.length > 2 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{user.skillsWanted.length - 2}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Connect Button */}
        <button className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition">
          Connect
        </button>
      </div>
    </div>
  );
};

export default Skills;
