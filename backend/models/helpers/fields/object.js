const mongoose = require.main.require('mongoose');

module.exports = {
  /**
   * @param  {Object} options
   * @param  {Object} schemaOptions
   * @returns {Object}
   */
  file(options, schemaOptions) {
    return {
      kind: 'Object',
      ...options,
      type: new mongoose.Schema(schemaOptions),
    };
  },
};
