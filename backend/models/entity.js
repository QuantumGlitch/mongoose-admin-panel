const mongoose = require.main.require('mongoose');

const EntitySchema = new mongoose.Schema({
  _id: { type: String, kind: 'String', description: 'Name', readOnly: true },
  __path: { type: String, kind: 'String', required: true, description: 'Path', readOnly: true },
  description: { type: String, kind: 'String', required: true, description: 'Description' },
});

const Entity = mongoose.model('Entity', EntitySchema);

const registered = [];
const registeringPromises = [];

/**
 * @typedef EntityInfo
 * @param {Document} entity
 * @param {mongoose.Model<Document, {}>} model
 */

/**
 * Get Entity by id
 * @param {String} id
 * @return {EntityInfo}
 */
Entity.getById = function (id) {
  return registered.find((e) => e.entity._id === id);
};

/**
 * Get Entity by path
 * @param {String} path
 * @return {EntityInfo}
 */
Entity.getByPath = function (path) {
  return registered.find((e) => e.entity.__path === path);
};

Entity.registered = registered;
Entity.registeringPromises = registeringPromises;

/**
 * Associate mongoose model with entity and create/update the entity
 */
Entity.register = function ({ id, path, description, populationOptions = [] }, modelClass) {
  registeringPromises.push(
    new Promise(async (resolve) => {
      let entity = await Entity.findById(id);

      if (entity) {
        entity.description = description;
        entity.__path = path;
      } else
        entity = await new Entity({
          _id: id,
          __path: path,
          description,
        }).save();

      const entityInfo = { entity, populationOptions, model: modelClass };
      registered.push(entityInfo);
      resolve();
    }).catch(console.error)
  );
};

Entity.register({ id: 'Entity', path: 'entity', description: "Database's Entity" }, Entity);

module.exports = Entity;
