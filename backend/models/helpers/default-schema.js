const mongoose = require.main.require('mongoose');

const defaultDates = require('./default-dates');
const defaultJSONOptions = require('./default-json-options');

const customValidators = require('./custom-validators');
const { schemaValidator: boundFieldSchemaValidator } = require('./fields/bound');

// Plugins
const softDelete = require('mongoose-soft-deleting');
const beautifyUnique = require('../plugins/mongoose-unique-validation');

// Requiring model name
const referencesIntegrityChecker = require('mongoose-references-integrity-checker');
const subReferencesIntegrityChecker = require('mongoose-sub-references-integrity-checker');
const progressiveId = require('./progressive-id');

const subReferences = require('mongoose-sub-references-populate');
const oldValuesPlugin = require('mongoose-old-values');

/**
 * @param {String} modelName
 * @param {mongoose.Schema.SchemaDefinition} schemaObject
 * @returns {mongoose.Schema}
 */
module.exports = function (
  schemaObject,
  {
    modelName,
    defaultDates: dD = true,
    softDelete: sD = true,
    customValidators: cV = true,
    subReferences: sR = true,
    referencesIntegrityChecker: rIC = true,
    subReferencesIntegrityChecker: sRIC = true,
    progressiveId: pI = false,
  } = {},
  schemaOptions
) {
  let _schemaObject = schemaObject;

  if (dD) _schemaObject = defaultDates(_schemaObject);

  let schema = new mongoose.Schema(
    _schemaObject,
    // Always disable virtual id
    { ...schemaOptions, id: false }
  );

  if (sD)
    schema.plugin(softDelete, {
      deleted: {
        kind: 'Boolean',
        description: 'Deleted',
      },
      deletedAt: {
        kind: 'Date',
        readOnly: true,
        description: 'Deleted at',
      },
      deletedBy: {
        type: Number,
        ref: 'User',
        readOnly: true,
        description: 'Deleted by',
      },
    });

  // Always required
  schema.plugin(oldValuesPlugin);

  defaultJSONOptions(schema);

  // This middleware will be used for final operations after validation of the document
  schema.post('validate', async function () {
    if (this.$locals.afterValidation) await Promise.all(this.$locals.afterValidation);
  });

  // Custom validators for all fields
  if (cV) customValidators(schema);

  // Validator for all boundTo fields
  boundFieldSchemaValidator(schema);

  // Makes a ValidationError for unique fields
  schema.plugin(beautifyUnique);

  // Enable subPopulate to this schema
  if (sR) schema.plugin(subReferences);

  if (modelName) {
    // Checks existing references on documents' delete
    if (rIC) referencesIntegrityChecker(modelName, schema);

    // Checks existing sub references on documents' or sub-documents' delete
    if (sRIC) subReferencesIntegrityChecker(modelName, schema);

    // Progressive numeric ID
    if (pI) progressiveId(modelName, schema);
  }

  return schema;
};
