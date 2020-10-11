/**
 * Helpers
 */
const defaultSchema = require('./helpers/default-schema');
const defaultModel = require('./helpers/default-model');

/*
 * Schema
 */
const modelName = 'UserPermission';
const UserPermissionSchema = defaultSchema(
  {
    _id: {
      type: Number,
      kind: 'Number',
      readOnly: true,
      description: 'Id',
      default: 0,
    },
    user: {
      type: Number,
      kind: 'Number',
      required: true,
      cascade: true,
      ref: 'User',
      description: 'User',
    },
    entity: {
      type: String,
      required: true,
      kind: 'Number',
      ref: 'Entity',
      description: 'Entity',
    },
    _read: { type: Boolean, kind: 'Boolean', required: true, description: 'Read' },
    _edit: { type: Boolean, kind: 'Boolean', required: true, description: 'Edit' },
    _add: { type: Boolean, kind: 'Boolean', required: true, description: 'Add' },
    _delete: { type: Boolean, kind: 'Boolean', required: true, description: 'Delete' },
  },
  {
    modelName,
    progressiveId: true,
  }
);

module.exports = defaultModel(modelName, UserPermissionSchema, {
  description: 'Permissions',
});

/**
 * @enum {String}
 */
const PermissionType = {
  Read: '_read',
  Edit: '_edit',
  Add: '_add',
  Delete: '_delete',
};

module.exports.PermissionType = PermissionType;
