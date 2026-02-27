const authRoutes = require('./auth');
const skillsRoutes = require('./skills');
const matchRoutes = require('./match');
const requestRoutes = require('./request');
const usersRoutes = require('./users');
// ...existing code...
module.exports = (app) => {
  app.use('/api/auth', authRoutes);
  app.use('/api/skills', skillsRoutes);
  app.use('/api/match', matchRoutes);
  app.use('/api/request', requestRoutes);
  app.use('/api/users', usersRoutes);
  // ...add other routes here...
};
