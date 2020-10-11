const mongoose = require.main.require('mongoose');
const Entity = require('../../models/entity');

// Errors
const { RefConstraintError } = require('mongoose-references-integrity-checker');
const { SubRefConstraintError } = require('mongoose-sub-references-integrity-checker');

// Transform a mongoose model's path into a descriptive path
function getPathDescription(model, path) {
  const splitted = path.split('.');
  const result = [];

  for (let i = 0; i < splitted.length; i++) {
    const schemaType = model.schema.path(splitted.filter((_, i2) => i >= i2).join('.'));
    result.push(schemaType.options.description || splitted[i]);
  }

  return result.join(' -> ');
}

module.exports = {
  RefConstraintError: {
    type: RefConstraintError,
    message: ({ options }) => {
      const { modelName, modelRef, pathRef, whoIsBlocking } = options;

      const mainE = Entity.getById(modelName);
      const refE = Entity.getById(modelRef);

      // Cannot remove if exists at least one referencing this document
      return `You can't remove a record from the entity '${
        (mainE && mainE.entity && (mainE.entity.description || mainE.entity._id)) || modelName
      }' on which depends at least one another record of the entity '${
        (refE && refE.entity && (refE.entity.description || refE.entity._id)) || modelRef
      }' -> (${getPathDescription(
        mongoose.model(modelRef),
        pathRef
      )}). Id of who is blocking: ${whoIsBlocking}.`;
    },
  },
  SubRefConstraintError: {
    type: SubRefConstraintError,
    message: ({ options }) => {
      const { modelSubRef, pathSubRef, modelRef, pathRef, whoIsBlocking } = options;

      const mainE = Entity.getById(modelSubRef);
      const refE = Entity.getById(modelRef);

      // Cannot remove if exists at least one referencing this document
      throw new RefConstraintError(
        `You can't remove a record from the entity '${
          (mainE && mainE.entity && (mainE.entity.description || mainE.entity._id)) || modelSubRef
        } -> (${getPathDescription(
          mongoose.model(modelSubRef),
          pathSubRef
        )})' on which depends at least one another record of the entity '${
          (refE && refE.entity && (refE.entity.description || refE.entity._id)) || modelRef
        } -> (${getPathDescription(
          mongoose.model(modelRef),
          pathRef
        )})'. Id of who is blocking: ${whoIsBlocking}.`
      );
    },
  },
};
