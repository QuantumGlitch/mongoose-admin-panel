const mongoose = require.main.require('mongoose');

const MenuSchema = new mongoose.Schema({
  _id: { type: Number },
  description: { type: String, required: true },
  permissions: { type: Array },
  children: { type: Array },
});

module.exports = mongoose.model('Menu', MenuSchema);
