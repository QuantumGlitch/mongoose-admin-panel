const { assertUserAuthenticated, Auth } = require('../../services/auth');

module.exports = [
  {
    method: 'post',
    url: '/login',
    handlers: [
      async (req, res) => {
        if (
          (!req.body.username || typeof req.body.username !== 'string') &&
          (!req.body.password || typeof req.body.password !== 'string')
        )
          throw new Error('Invalid format');

        const auth = await Auth.login(req.body);

        if (auth) {
          res.json({
            ok: true,
            token: auth.token,
            type: 'Bearer',
          });
        } else res.json({ ok: false });
      },
    ],
  },
  {
    method: 'post',
    url: '/logout',
    handlers: [
      assertUserAuthenticated,
      async (req, res) => {
        try {
          await req.auth.logout();
        } catch {}
        res.json({ ok: true });
      },
    ],
  },
];
