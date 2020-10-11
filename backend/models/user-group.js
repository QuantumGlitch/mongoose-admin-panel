const mongoose = require.main.require('mongoose');

/**
 * Helpers
 */
const defaultSchema = require('./helpers/default-schema');
const defaultModel = require('./helpers/default-model');

/*
 * Schema
 */
const modelName = 'UserGroup';
const UserGroupSchema = defaultSchema(
  {
    _id: {
      type: Number,
      kind: 'Number',
      readOnly: true,
      description: 'Id',
      default: 0,
    },

    code: {
      type: String,
      kind: 'String',
      trim: true,
      required: true,
      unique: true,
      description: 'Code',
      maxlength: 20,
    },

    description: {
      type: String,
      kind: 'String',
      trim: true,
      required: true,
      description: 'Description',
      maxlength: 50,
    },

    permissions: {
      kind: 'Array',
      type: [
        new mongoose.Schema({
          _read: {
            type: Boolean,
            kind: 'Boolean',
            required: true,
            default: false,
            description: 'Read',
          },
          _edit: {
            type: Boolean,
            kind: 'Boolean',
            required: true,
            default: false,
            description: 'Edit',
          },
          _add: {
            type: Boolean,
            kind: 'Boolean',
            required: true,
            default: false,
            description: 'Add',
          },
          _delete: {
            type: Boolean,
            kind: 'Boolean',
            required: true,
            default: false,
            description: 'Delete',
          },
          entity: {
            required: true,
            type: String,
            kind: 'String',
            ref: 'Entity',
            description: 'Entity',
          },
        }),
      ],
      description: 'Permissions',
      required: true,
    },
  },
  {
    modelName,
    progressiveId: true,
  }
);

const UserGroup = defaultModel(modelName, UserGroupSchema, {
  description: 'Groups',
});

UserGroup.SpecialGroup = {
  Administrator: 'ADMIN',
};

module.exports = UserGroup;
