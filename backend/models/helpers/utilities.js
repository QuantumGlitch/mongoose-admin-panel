/**
 * Process each path of the schema and each path of each subschema
 * @param {@import('mongoose').Schema} schema
 * @param {Function<String, @import('mongoose').SchemaType>} handler
 * @param {String[]} path root of the path
 */
function eachPathRecursive(schema, handler, path) {
  if (!path) path = [];

  schema.eachPath(function (pathName, schemaType) {
    path.push(pathName);

    if (schemaType.schema) eachPathRecursive(schemaType.schema, handler, path);
    else handler(path.join('.'), schemaType);

    path.pop();
  });
}

/**
 * @typedef {Object} PopulationOptions
 * @prop {import('mongoose').ModelPopulateOptions[]} normal Populate options for refs
 * @prop {import('mongoose').ModelPopulateOptions[]} sub  Populate options for subRefs
 */

/**
 * Returns all possibile population and subPopulation options for a given model's schema
 * iterating recursively over the schema
 * @param {@import('mongoose').Schema} schema
 * @param {PopulationOptions} populationOptionsToMerge
 * @returns {PopulationOptions}
 */
function allPopulationOptions(schema, populationOptionsToMerge) {
  const normal =
    populationOptionsToMerge &&
    populationOptionsToMerge.normal &&
    populationOptionsToMerge.normal.length > 0
      ? [...populationOptionsToMerge.normal]
      : [];
  const sub =
    populationOptionsToMerge &&
    populationOptionsToMerge.sub &&
    populationOptionsToMerge.sub.length > 0
      ? [...populationOptionsToMerge.sub]
      : [];

  eachPathRecursive(schema, (path, schemaType) => {
    // If this path is ref or an array of refs
    if (
      schemaType.options.ref ||
      (schemaType.options.type instanceof Array && schemaType.options.type[0].ref)
    ) {
      // If doesn't exist an option for the same path
      if (!normal.find((option) => option.path === path)) normal.push({ path });
    } else if (
      // If this path is subRef or an array of subRefs
      schemaType.options.subRef ||
      (schemaType.options.type instanceof Array && schemaType.options.type[0].subRef)
    ) {
      // If doesn't exist an option for the same path
      if (!sub.find((option) => option.path === path)) sub.push({ path });
    }
  });

  return { normal, sub };
}

/**
 * Converts a string into a valid path format
 * @param {String} string
 * @returns {String}
 */
function toPath(string) {
  return string
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .normalize('NFD') // Change diacritics
    .replace(/[\u0300-\u036f]/g, '') // Remove illegal characters
    .replace(/\s+/g, '-') // Change whitespace to dashes
    .toLowerCase() // Change to lowercase
    .replace(/&/g, '-and-') // Replace ampersand
    .replace(/[^a-z0-9\-]/g, '') // Remove anything that is not a letter, number or dash
    .replace(/-+/g, '-') // Remove duplicate dashes
    .replace(/^-*/, '') // Remove starting dashes
    .replace(/-*$/, '');
}

module.exports = {
  eachPathRecursive,
  allPopulationOptions,
  toPath,
};
