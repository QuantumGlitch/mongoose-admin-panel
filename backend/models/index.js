// Mongoose models bootstrap
const MODELS_PATHS = [`${__dirname}`, ...require('../configuration').customModelPaths];

MODELS_PATHS.forEach((path) =>
  require('fs')
    .readdirSync(path)
    .forEach((file) => {
      if (file.endsWith('.js')) require(`${path}/${file}`);
    })
);
