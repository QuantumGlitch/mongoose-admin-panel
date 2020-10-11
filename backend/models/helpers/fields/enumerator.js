module.exports = {
  /**
   * @param {Object} enumeratorObj
   * @param {Object} options
   */
  enumerator(enumeratorObj, options) {
    return {
      ...(options || {}),
      enum: Object.keys(enumeratorObj).map((k) => enumeratorObj[k].code),
      enumDescription: Object.keys(enumeratorObj).map((k) => enumeratorObj[k].description),
    };
  },
};
