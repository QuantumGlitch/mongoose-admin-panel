const mongoose = require.main.require('mongoose');

const LogSchema = new mongoose.Schema({
  date: { type: Date, default: new Date(), required: true },
  message: { type: String, required: true },
  stackTrace: { type: String, required: false },
  optional: { type: mongoose.Schema.Types.Mixed },
});

const Log = mongoose.model('Log', LogSchema);

function logError(e, optional) {
  console.error(e);
  Log.create({ message: e.message ? e.message : e, stackTrace: e.stack, optional });
}

tryLogError = async function (fn) {
  try {
    await fn();
  } catch (e) {
    this.logError(e);
    throw { ...e, logged: true };
  }
};

module.exports = {
  logError,
  tryLogError,
};
