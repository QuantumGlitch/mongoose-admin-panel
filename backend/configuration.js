// Standard forms for generating actions
const standardForms = [];

// Paths in which can be found custom forms
const customFormPaths = [];

// Paths in which can be found custom models
const customModelPaths = [];

// In the case we would like to extends UserSchema
const userSchemaExtension = {};

module.exports = {
  standardForms,
  customFormPaths,
  customModelPaths,
  userSchemaExtension,
  setUserSchemaExtension(obj) {
    Object.assign(userSchemaExtension, obj);
  },
};
