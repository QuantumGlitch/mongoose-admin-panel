const auth = require('./auth');
const user = require('./user');
const menu = require('./menu');
const form = require('./form');
const file = require('./file');

const { Router } = require('express');
const { makeRoute } = require('../../services/error-handler');

// Transform controller structure to an express' handled structure
function mapController(controller) {
  const router = new Router();

  controller.forEach(({ method, url, handlers }) =>
    router[method].call(
      router,
      url,
      handlers.map((h) => makeRoute(h))
    )
  );

  return router;
}

module.exports = {
  map: mapController,
  default: function (
    router,
    { user: u, auth: a, menu: m, form: f, file: f2 } = {
      user: true,
      auth: true,
      menu: true,
      form: true,
      file: true,
    }
  ) {
    if (u) router.use('/user', mapController(user));
    if (a) router.use('/auth', mapController(auth));
    if (m) router.use('/menu', mapController(menu));
    if (f) router.use('/form', mapController(form));
    if (f2) router.use('/file', mapController(file));
  },
};
