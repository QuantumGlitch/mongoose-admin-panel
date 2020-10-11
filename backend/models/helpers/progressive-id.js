const mongoose = require.main.require('mongoose');

// autoIncrement _id field
module.exports = function (entityName, schema) {
  // document
  schema.pre('save', function (next) {
    const doc = this;
    const promises = [];

    if (doc.isNew || !doc._id || doc._id == 0)
      promises.push(
        new Promise((resolve, reject) => {
          mongoose.models.Counter.increment(entityName, function (error, value) {
            if (error) return reject(error);
            doc._id = value;
            resolve(doc._id);
          });
        })
      );

    Promise.all(promises).then(() => next());
  });
};
