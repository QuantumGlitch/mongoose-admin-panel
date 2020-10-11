const mongoose = require.main.require('mongoose');
const defaultModel = require('./helpers/default-model');

const FileSchema = new mongoose.Schema({
  _id: { type: String, kind: 'String', description: 'Identificativo', readOnly: true, trim: true },
  name: { type: String, kind: 'String', description: 'Nome', readOnly: true, trim: true },
  path: {
    type: String,
    kind: 'String',
    required: true,
    description: 'Percorso',
    readOnly: true,
    trim: true,
  },
  mimeType: { type: String, required: true, description: 'Mime/Type', readOnly: true, trim: true },
  size: { type: Number, required: true, description: 'Peso', readOnly: true },
  encoding: { type: String, description: 'Codifica', readOnly: true, trim: true },
});

module.exports = defaultModel('File', FileSchema, { description: 'Files' });
