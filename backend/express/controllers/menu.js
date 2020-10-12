const Menu = require('../../models/menu');
const { assertUserAuthenticated } = require('../../services/auth');

// Calculate visible menus for user
function calculateMenu(menu, permissions) {
  const visible = menu.permissions.every(
    (entity) => !!permissions.find((p) => p.entity === entity && p._read)
  );

  if (visible) {
    const mO = menu.toObject ? menu.toObject() : menu;
    const children = menu.children
      ? menu.children.map((m) => calculateMenu(m, permissions)).filter((m) => !!m)
      : null;

    return {
      ...mO,
      ...{ children },
    };
  } else return null;
}

module.exports = [
  {
    method: 'get',
    url: '/all',
    handlers: [
      assertUserAuthenticated,
      async (req, res) => {
        const permissions = await req.auth.getAllPermissions();
        const menus = await Menu.find().sort({ _id: 1 });

        res.json({
          ok: true,
          menus: menus.map((m) => calculateMenu(m, permissions)).filter((m) => !!m),
        });
      },
    ],
  },
];
