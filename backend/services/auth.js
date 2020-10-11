// Modules
const date = require('date-and-time');
const assert = require('assert');

// Models
const User = require('../models/user');
const UserPermission = require('../models/user-permission');
const { SpecialGroup } = require('../models/user-group');
const UserAccessToken = require('../models/user-access-token');
const Entity = require('../models/entity');

// Constants
const TOKEN_LENGTH = 128;
const TOKEN_CHARSET = '0123456789QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm';
const TOKEN_EXPIRATION_SECONDS = 60 * 60 * 24;

function generateToken() {
  let token = '';
  while (token.length < TOKEN_LENGTH)
    token += TOKEN_CHARSET[Math.round(Math.random() * (TOKEN_CHARSET.length - 1))];
  return token;
}

/**
 * This service will handle user authentication and handle all the user info
 * It is based on the middleware express-bearer-token
 */
class Auth {
  /**
   * Try to authenticate user
   * @param {String} username
   * @param {String} password
   * @returns {Auth|null} access token if user is logged
   */
  static async login({ username, password }) {
    let user = await User.findOne({ username, password });
    if (user) {
      const token = generateToken();
      await new UserAccessToken({
        token,
        user: user._id,
        // access token is valid for 1 day
        expiration: date.addSeconds(new Date(), TOKEN_EXPIRATION_SECONDS),
      }).save();

      // remove expired tokens
      await UserAccessToken.deleteMany({
        user: user._id,
        expiration: { $lte: date.addSeconds(new Date(), -TOKEN_EXPIRATION_SECONDS) },
      });

      const auth = new Auth(token);
      await auth.init();
      return auth;
    } else return false;
  }

  /**
   * @param {String} token - Identifier of the UserAccessToken
   */
  constructor(token) {
    if (token.length != TOKEN_LENGTH) throw 'INVALID_TOKEN_LENGTH';
    this.token = token;
  }

  /**
   * Try to authenticate the user associated with the provided token
   */
  async init() {
    this.userAccessToken = await UserAccessToken.findOne({ token: this.token });

    if (!this.userAccessToken) throw 'INVALID_TOKEN';
    if (new Date() > this.userAccessToken.expiration) throw 'EXPIRED_TOKEN';

    this.user = await User.findById(this.userAccessToken.user);

    // this could be usefull
    await User.populate(this.user, 'groups');

    this.is = {};

    // Assign fast reading properties
    for (const { code } of this.user.groups)
      for (const key in SpecialGroup) if (code === SpecialGroup[key]) this.is[key] = true;
  }

  /**
   * Deauthenticate user for current session
   */
  async logout() {
    await this.userAccessToken.deleteOne();
  }

  /**
   * Check if user has a specific permission on entity
   * @param {String} entityName
   * @param {UserPermission.PermissionType} permissionType
   * @returns {Boolean}
   */
  async checkPermission(entityName, permissionType) {
    const entityInfo = Entity.getById(entityName);
    assert(entityInfo, `Can't check permission against an unregistered Entity.`);

    // First of all check for user's groups
    await this.getGroupsPermissions();

    if (this.groupsPermissions.find((p) => p.entity === entityInfo.entity._id && p[permissionType]))
      return true;

    // Couldn't find permission in group, then see for specific user's permissions
    await this.getPermissions();

    if (this.permissions.find((p) => p.entity === entityInfo.entity._id && p[permissionType]))
      return true;
    else return false;
  }

  async getPermissions() {
    // If requested, load the permissions, for all the session's time
    if (!this.permissions) this.permissions = await UserPermission.find({ user: this.user._id });

    return this.permissions;
  }

  async getGroupsPermissions() {
    if (!this.groupsPermissions)
      this.groupsPermissions = this.user.groups.map((g) => g.permissions).flat();

    return this.groupsPermissions;
  }

  async getAllPermissions() {
    return [...(await this.getPermissions()), ...(await this.getGroupsPermissions())];
  }
}

// Middleware for authenticating user via token
module.exports = (app) =>
  app.use(async (req, res, next) => {
    try {
      // If user is trying to authenticate
      if (req.headers.authorization) {
        const [type, token] = req.headers.authorization.split(' ');
        // Bearer type is the only valid
        if (type === 'Bearer') {
          req.auth = new Auth(token);
          await req.auth.init();
          next();
        } else return next('TOKEN_TYPE_MISMATCH');
      }
      // Continue like anonymous
      else next();
    } catch (e) {
      next(e);
    }
  });

// Middleware for run routes only for authenticated users
module.exports.assertUserAuthenticated = (req, res, next) =>
  next(...(req.auth ? [] : ['USER_NOT_AUTHENTICATED']));

module.exports.Auth = Auth;
