// autoIncrement _id field
module.exports = function (schemaObject) {
  return {
    ...schemaObject,
    _createdAt: {
      type: Date,
      kind: 'Date',
      default: Date.now,
      description: 'Created at',
      readOnly: true,
    },
    _createdBy: {
      type: Number,
      kind: 'Number',
      ref: 'User',
      default: null,
      description: 'Created by',
      readOnly: true,
      required: false,
    },
    _editedAt: {
      type: Date,
      kind: 'Date',
      default: Date.now,
      description: 'Edited at',
      readOnly: true,
    },
    _editedBy: {
      type: Number,
      kind: 'Number',
      ref: 'User',
      default: null,
      description: 'Edited by',
      readOnly: true,
      required: false,
    },
  };
};
