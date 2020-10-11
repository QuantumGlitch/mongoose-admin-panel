/**
 * @param {@import('mongoose').Schema} schema
 */
module.exports = function (schema) {
  function setValidatorForEachPath(path, schemaType) {
    // Email validator
    if (schemaType.options.email)
      schemaType.validate({
        validator: (v) => v.match(/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/),
        type: 'email',
      });

    // Telephone validator
    if (schemaType.options.telephone)
      schemaType.validate({
        validator: (v) => v.match(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im),
        type: 'telephone',
      });

    // Check if array contains at least X elements
    if (schemaType.options.atLeastElementsCount)
      schemaType.validate({
        validator: (v) => v && v.length >= schemaType.options.atLeastElementsCount,
        type: 'atLeastElementsCount',
      });
  }

  schema.eachPath(setValidatorForEachPath);

  return schema;
};
