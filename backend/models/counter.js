const mongoose = require.main.require('mongoose');

const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  sequenceValue: { type: Number, default: 0 },
});

/**
 * Increment a counter and pass the new counter's value via callback
 * @param {String} counterId
 * @param {Function} callback
 */
CounterSchema.statics.increment = function (counterId, callback) {
  this.findByIdAndUpdate(
    { _id: counterId },
    { $inc: { sequenceValue: 1 } },
    { upsert: true, new: true },
    function (error, counter) {
      if (error) return callback(error);
      callback(null, counter.sequenceValue);
    }
  );
};

const Counter = mongoose.model('Counter', CounterSchema);

module.exports = Counter;
