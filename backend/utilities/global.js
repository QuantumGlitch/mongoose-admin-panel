/**
 * Make a string available to be used in a RegExp
 */
String.prototype.escapeRegExp = function () {
  return this.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
};

/**
 * Check if value is null or undefined
 * @prop {*} v
 * @returns {Boolean}
 */
function Ɂ(v) {
  return v === undefined || v === null;
}

/**
 * Take the value following the path, if any value is null or undefined then return null
 * @param {*} v
 * @param  {...any} path
 */
function ɁɁ(v, ...path) {
  if (Ɂ(v)) return null;
  let last = v;

  for (let property of path) {
    last = last[property];
    if (Ɂ(last)) return null;
  }

  return last;
}

/**
 * Take the value following the path, if a function is encountered then the last value
 * is passed through the function and the return value will continue the process,
 * if any value encountered is null or undefined then return null
 * @param {*} v
 * @param  {...any} path
 */
function ɁɁΩ(v, ...path) {
  if (Ɂ(v)) return null;
  let last = v;

  for (let property of path) {
    if (typeof property === 'function') last = property(last);
    else last = last[property];
    if (Ɂ(last)) return null;
  }

  return last;
}

/**
 * Take the value following the path, if any value is null or undefined then return the last defined value
 * @param {*} v
 * @param  {...any} path
 */
function ʖɁ(v, ...path) {
  if (Ɂ(v)) return null;
  let last = v;

  for (let property of path) {
    if (Ɂ(last[property])) return last;
    last = last[property];
  }

  return last;
}

/**
 * Strict compare values (with null and undefined matching)
 */
function equalsɁ(a, b) {
  return a === b || Ɂ(a) === $(b);
}

module.exports = {
  Ɂ,
  ɁɁ,
  ɁɁΩ,
  ʖɁ,
  equalsɁ,
};
