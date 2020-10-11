const mongoose = require.main.require('mongoose');

const UserAccessTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true, index: true },
  expiration: { type: Date, required: true },
  user: {
    type: Number,
    kind: 'Number',
    ref: 'User',
    required: true,
    index: true,
  },
});

module.exports = mongoose.model('UserAccessToken', UserAccessTokenSchema);
