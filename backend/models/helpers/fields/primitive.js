module.exports = {
  /**
   * @param  {Object} options
   * @returns {Object}
   */
  string(options) {
    return {
      kind: 'String',
      type: String,
      ...options,
    };
  },
  /**
   * @param  {Object} options
   * @returns {Object}
   */
  integer(options) {
    return {
      kind: 'Integer',
      type: Number,
      fixed: 0,
      ...options,
    };
  },
  /**
   * @param  {Object} options
   * @returns {Object}
   */
  decimal(options) {
    return {
      kind: 'Decimal',
      type: Number,
      ...options,
    };
  },
  /**
   * @param  {Object} options
   * @returns {Object}
   */
  boolean(options) {
    return {
      kind: 'Boolean',
      type: Boolean,
      ...options,
    };
  },
  /**
   * @param  {Object} options
   * @returns {Object}
   */
  date(options) {
    return {
      kind: 'Date',
      type: Date,
      ...options,
    };
  },
};
