const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const authMiddleware = require('../utils/authMiddleware');

// Protected endpoints (require JWT authentication)
router.get('/recommendations', authMiddleware, usersController.getRecommendations);
router.get('/search', authMiddleware, usersController.searchUsers);
router.put('/profile-photo', authMiddleware, usersController.updateProfilePhoto);

module.exports = router;
