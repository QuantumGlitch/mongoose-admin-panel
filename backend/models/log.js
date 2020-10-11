const mongoose = require.main.require('mongoose');

const LogSchema = new mongoose.Schema({
  date: { type: Date, default: new Date(), required: true },
  message: { type: String, required: true },
  stackTrace: { type: String, required: false },
  optional: { type: mongoose.Schema.Types.Mixed },
});

const Log = mongoose.model('Log', LogSchema);

function logError(e, optional) {
  if (process.env.ENV == 'local') console.error(e);
  else if (!e.logged)
    Log.create({ message: e.message ? e.message : e, stackTrace: e.stack, optional });
}

module.exports = Log;

let tryLogError = null;
if (process.env.ENV == 'local') {
  tryLogError = async function (fn) {
    try {
      await fn();
    } catch (e) {
      console.error(e);
      throw e;
    }
  };
}
// handle function and register errors on db
else
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
