const express = require('express');

// Plugin for files upload
const fileUpload = require('express-fileupload');

const controllers = require('./controllers');

/**
 * @param {String} baseUrl Base relative URL to which host the app
 * @param {Express} app
 * @param {Object} options
 * @param {Function} options.routes Function for adding middlewares, between authentication and error handler
 * @param {Object} defaultControllerOptions Options for default controllers, specify which one you need, which not
 * @returns {Express}
 */
module.exports = function (baseUrl, app, { routes, defaultControllerOptions } = {}) {
  if (!app) app = express();

  if (!baseUrl) baseUrl = '/';
  else if (!baseUrl.endsWith('/')) baseUrl += '/';

  // Middleware for handling file uploads
  app.use(fileUpload());

  // Handle users authentication via token
  require('../services/auth')(app);

  // Parse body if json
  app.use(express.json(app));

  const router = new express.Router();
  
  // Default controllers
  controllers.default(router, defaultControllerOptions);

  // Custom controllers or middlewares
  if (routes) routes(router);
  app.use(baseUrl, router);

  // Handle routes' errors
  require('../services/error-handler')(app);

  return app;
};
