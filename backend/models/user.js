const { userSchemaExtension } = require('../configuration');

/**
 * Helpers
 */
const defaultSchema = require('./helpers/default-schema');
const defaultModel = require('./helpers/default-model');

/**
 * Schema
 */
const modelName = 'User';
const UserSchema = defaultSchema(
  {
    _id: {
      type: Number,
      kind: 'Number',
      readOnly: true,
      description: 'Id',
      default: 0,
    },
    groups: {
      kind: 'Array',
      type: [
        {
          type: Number,
          kind: 'Number',
          required: true,
          ref: 'UserGroup',
          description: 'Group',
        },
      ],
      description: 'Groups',
    },
    username: {
      type: String,
      kind: 'String',
      required: true,
      minlength: 3,
      maxlength: 50,
      description: 'Username',
    },
    password: {
      type: String,
      kind: 'String',
      trim: true,
      sensible: true,
      required: true,
      minlength: 3,
      maxlength: 50,
      description: 'Password',
    },
    ...userSchemaExtension,
  },
  {
    modelName,
    progressiveId: true,
  }
);

// This will be used as description in RefInput
UserSchema.virtual('description').get(function () {
  return `${this.username}`;
});

module.exports = defaultModel(modelName, UserSchema, { description: 'Users' });
