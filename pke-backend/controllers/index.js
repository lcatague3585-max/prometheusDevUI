/**
 * Controllers Index
 */

const authController = require('./authController');
const courseController = require('./courseController');
const invocationController = require('./invocationController');
const pkeController = require('./pkeController');
const adminController = require('./adminController');

module.exports = {
  authController,
  courseController,
  invocationController,
  pkeController,
  adminController,
};
