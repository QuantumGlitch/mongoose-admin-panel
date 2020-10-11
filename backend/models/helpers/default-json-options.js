module.exports = function (schema) {
  const config = {
    virtuals: true,
    getters: true,
    transform: function (doc, ret) {
      // Hide sensible info
      Object.keys(schema.obj).forEach((field) => {
        // We can't send the information directly on the client, it can only be set
        if (schema.obj[field].sensible) delete ret[field];
      });

      // Remove this virtual before returning JSON
      delete ret.id;
    },
  };

  // With these we will remove sensible informations when transforming toJSON documents
  schema.set('toJSON', config);
  schema.set('toObject', config);
};
