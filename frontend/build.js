const fs = require('fs');
const glob = require('glob');
const path = require('path');

// copy assets from src to lib
function copy(src, dest, pattern) {
  const entries = {};

  glob.sync(path.join(src, pattern)).forEach((file) => {
    const newDirName = path.dirname(file).replace(src, dest);
    fs.mkdirSync(newDirName, { recursive: true });
    fs.copyFileSync(file, path.join(newDirName, path.basename(file)));
  });

  return entries;
}

// Delete lib
fs.rmdirSync(`${__dirname}/lib`, { recursive: true });

// Copy all css
copy(`${__dirname}/src`, `${__dirname}/lib`, `**/*.css`);

// Copy all svg
copy(`${__dirname}/src`, `${__dirname}/lib`, `**/*.svg`);
