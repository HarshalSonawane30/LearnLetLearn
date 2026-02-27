const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  profile: {
    photo: { type: String, default: null },
    bio: { type: String, default: null }
  },
  skillsKnown: [{ type: String }],
  skillsToLearn: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

// Create text indexes for efficient search
userSchema.index({ name: 'text', skillsKnown: 'text', skillsToLearn: 'text' });
// Index for skill queries
userSchema.index({ skillsKnown: 1, skillsToLearn: 1 });

module.exports = mongoose.model('User', userSchema);
