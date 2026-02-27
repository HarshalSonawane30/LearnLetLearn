const User = require('../models/User');

/**
 * SCORING ENGINE
 *
 * +5: Exact skill match (their skillsOffered ∩ my skillsWanted)
 * +3: Reverse match (their skillsWanted ∩ my skillsOffered)
 * +2: Related skill category match
 * +1: Partial keyword match
 *
 * Formula: (totalScore / maxPossibleScore) * 100
 */

const computeSkillScore = (currentUser, candidateUser) => {
  let score = 0;
  const maxPossibleScore = 100;

  // Normalize skills to lowercase for comparison
  const currentKnown = currentUser.skillsKnown?.map((s) =>
    s.toLowerCase().trim()
  ) || [];
  const currentWanted = currentUser.skillsToLearn?.map((s) =>
    s.toLowerCase().trim()
  ) || [];
  const candidateKnown = (candidateUser.skillsKnown || []).map((s) =>
    s.toLowerCase().trim()
  );
  const candidateWanted = (candidateUser.skillsToLearn || []).map((s) =>
    s.toLowerCase().trim()
  );

  // 1. Exact matches: What they offer that I want
  const exactMatches = candidateKnown.filter((skill) =>
    currentWanted.includes(skill)
  );
  score += exactMatches.length * 5;

  // 2. Reverse matches: What they want that I offer
  const reverseMatches = candidateWanted.filter((skill) =>
    currentKnown.includes(skill)
  );
  score += reverseMatches.length * 3;

  // 3. Partial keyword matches (substring matching for broader categories)
  const partialMatches = new Set();
  [...candidateKnown, ...candidateWanted].forEach((skill) => {
    [...currentWanted, ...currentKnown].forEach((mySkill) => {
      if (
        skill.includes(mySkill) ||
        mySkill.includes(skill)
      ) {
        partialMatches.add(skill);
      }
    });
  });
  score += Math.min(partialMatches.size * 1, 15); // Cap partial matches at 15

  // Compute match percentage
  const matchPercentage = Math.round((score / maxPossibleScore) * 100);

  // Mutual skills: skills both can benefit from
  const mutualSkills = [
    ...new Set([...exactMatches, ...reverseMatches])
  ];

  return {
    score,
    matchPercentage: Math.min(matchPercentage, 100),
    mutualSkills,
    exactMatches,
    reverseMatches
  };
};

/**
 * GET /api/users/recommendations
 * Fetch top 20 recommended users based on skill matching
 */
exports.getRecommendations = async (req, res) => {
  try {
    // Validate authentication
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Unauthorized - Invalid token' });
    }

    const currentUserId = req.user.userId;
    const currentUser = await User.findById(currentUserId).lean();

    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Use aggregation pipeline for efficient data retrieval
    const recommendations = await User.aggregate([
      // Exclude current user
      { $match: { _id: { $ne: currentUser._id } } },

      // Project only necessary fields
      {
        $project: {
          _id: 1,
          name: 1,
          skillsKnown: 1,
          skillsToLearn: 1,
          profile: 1,
          createdAt: 1
        }
      },

      // Limit to reasonable dataset before computing scores in application
      { $limit: 100 }
    ]);

    // Compute scores for each candidate (done in app for flexibility)
    const scoredRecommendations = recommendations
      .map((candidate) => {
        const scoreData = computeSkillScore(currentUser, candidate);
        return {
          userId: candidate._id,
          name: candidate.name,
          skillsOffered: candidate.skillsKnown || [],
          skillsWanted: candidate.skillsToLearn || [],
          profile: candidate.profile || {},
          matchScore: scoreData.score,
          matchPercentage: scoreData.matchPercentage,
          mutualSkills: scoreData.mutualSkills,
          exactMatches: scoreData.exactMatches,
          reverseMatches: scoreData.reverseMatches
        };
      })
      // Sort by match percentage (highest first)
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      // Limit to top 20
      .slice(0, 20);

    res.json({
      total: scoredRecommendations.length,
      recommendations: scoredRecommendations
    });
  } catch (err) {
    console.error('Recommendations error:', err.message);
    res.status(500).json({
      message: 'Failed to fetch recommendations',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

/**
 * GET /api/users/search
 * Search for users with pagination and filters
 *
 * Query params:
 * - q: search query (name, skills)
 * - skillOffered: filter by offered skill
 * - skillWanted: filter by wanted skill
 * - page: pagination (default 1)
 */
exports.searchUsers = async (req, res) => {
  try {
    // Validate authentication
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Unauthorized - Invalid token' });
    }

    const currentUserId = req.user.userId;
    const { q = '', skillOffered, skillWanted, page = '1' } = req.query;

    // Validate page number
    const pageNum = Math.max(1, parseInt(page) || 1);
    const pageSize = 20;
    const skip = (pageNum - 1) * pageSize;

    // Build match stage with safe operators
    const matchStage = {
      _id: { $ne: currentUserId }
    };

    // Add text search only if q is provided and non-empty
    if (q && typeof q === 'string' && q.trim()) {
      matchStage.$text = { $search: q.trim() };
    }

    // Add skill offered filter - safely construct regex
    if (skillOffered && typeof skillOffered === 'string' && skillOffered.trim()) {
      matchStage.skillsKnown = {
        $elemMatch: {
          $regex: skillOffered.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
          $options: 'i'
        }
      };
    }

    // Add skill wanted filter - safely construct regex
    if (skillWanted && typeof skillWanted === 'string' && skillWanted.trim()) {
      matchStage.skillsToLearn = {
        $elemMatch: {
          $regex: skillWanted.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
          $options: 'i'
        }
      };
    }

    // Build aggregation pipeline
    const pipeline = [
      { $match: matchStage },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          skillsKnown: 1,
          skillsToLearn: 1,
          profile: 1,
          ...(q && { score: { $meta: 'textScore' } })
        }
      },
      // Sort by text score if search was performed, else by creation date
      ...(q
        ? [{ $sort: { score: { $meta: 'textScore' }, createdAt: -1 } }]
        : [{ $sort: { createdAt: -1 } }]),
      { $skip: skip },
      { $limit: pageSize }
    ];

    // Execute search aggregation
    const results = await User.aggregate(pipeline).allowDiskUse(true);

    // Get total count for pagination (count before pagination)
    const countPipeline = [
      { $match: matchStage },
      { $count: 'total' }
    ];
    const countResult = await User.aggregate(countPipeline);
    const totalCount = countResult.length > 0 ? countResult[0].total : 0;

    res.json({
      total: totalCount,
      page: pageNum,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
      results: results.map((user) => ({
        userId: user._id,
        name: user.name,
        email: user.email,
        skillsOffered: user.skillsKnown || [],
        skillsWanted: user.skillsToLearn || [],
        profile: user.profile || {}
      }))
    });
  } catch (err) {
    console.error('Search error:', err.message);
    res.status(500).json({
      message: 'Search failed',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

/**
 * PUT /api/users/profile-photo
 * Update user profile photo
 */
exports.updateProfilePhoto = async (req, res) => {
  try {
    const { photoUrl } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { 'profile.photo': photoUrl },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile photo updated', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
