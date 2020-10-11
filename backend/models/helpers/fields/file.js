module.exports = {
  /**
   * @param {Object} fileOptions
   * @param {String} fileOptions.uploadPath
   * @param {String|String[]} fileOptions.formats
   * @param  {Object} options
   * @returns {Object}
   */
  file({ uploadPath, formats }, options) {
    return {
      type: String,
      kind: 'File',
      ref: 'File',
      uploadPath,
      formats,
      ...options,
    };
  },
};
