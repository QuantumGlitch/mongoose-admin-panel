const { assertUserAuthenticated } = require('../../services/auth');

module.exports = [
  // Give to the authenticated user, his info
  {
    method: 'get',
    url: '/me',
    handlers: [
      assertUserAuthenticated,
      async (req, res) => {
        res.json({
          ok: true,
          user: {
            username: req.auth.user.username,
            name: req.auth.user.name,
            surname: req.auth.user.surname,
          },
        });
      },
    ],
  },
];
