module.exports = async function boot() {
  // bootstrap models
  require('./models');

  const Entity = require('./models/entity');
  const User = require('./models/user');
  const UserGroup = require('./models/user-group');
  const Menu = require('./models/menu');

  // Wait for all entities to be registered
  await Promise.all(Entity.registeringPromises);

  // Admin user and group setted by default
  let adminGroup = await UserGroup.findOne({ code: UserGroup.SpecialGroup.Administrator });
  if (!adminGroup)
    adminGroup = await new UserGroup({
      code: UserGroup.SpecialGroup.Administrator,
      description: 'Administrator',
    }).save();

  await adminGroup.updateOne({
    // All permissions on each entity
    permissions: Entity.registered.map(({ entity }) => ({
      _add: true,
      _edit: true,
      _delete: true,
      _read: true,
      entity: entity._id,
    })),
  });

  let user = await User.findOne({ username: 'admin' });

  if (!user)
    user = await new User({
      username: 'admin',
      password: 'admin',
      groups: [adminGroup._id],
    }).save({ validateBeforeSave: false });

  // Users menu always exists
  await Menu.updateOne(
    { _id: 0 },
    {
      description: 'Users',
      permissions: ['User'],
      children: [
        { path: `/form/user`, permissions: [], description: 'Users', icon: 'User' },
        {
          path: '/form/default-form/user-group/',
          permissions: ['UserGroup', 'Entity'],
          description: 'Groups',
          icon: 'Users',
        },
      ],
    },
    { upsert: true }
  );
};
