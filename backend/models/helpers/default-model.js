const mongoose = require.main.require('mongoose');
const { allPopulationOptions, toPath } = require('./utilities');

const Entity = require('../entity');

module.exports = function (modelName, modelSchema, entityOptions = {}) {
  // Generate mongoose model
  const model = mongoose.model(modelName, modelSchema);

  /*
   *  Entity
   */
  Entity.register(
    {
      id: modelName,
      path: entityOptions.path || toPath(modelName),
      description: entityOptions.description || modelName,
      populationOptions: entityOptions.populationOptions || allPopulationOptions(modelSchema),
    },
    model
  );

  return model;
};
