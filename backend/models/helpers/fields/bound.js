const assert = require('assert');
const mongoose = require.main.require('mongoose');

module.exports = {
  /**
   * @param  {String|Array} {ref
   * @param  {String} field}
   * @param  {Object} options
   * @returns {Object}
   */
  boundTo({ ref, field }, options) {
    let subPath, modelRef;

    if (ref instanceof Array) {
      modelRef = ref[0];
      subPath = ref[1];
    } else {
      // ref is a string
      const [rootRef, _subPath] = ref.split('.');
      subPath = _subPath;
      modelRef = model || mongoose.model(rootRef);
    }

    const subPathSchemaType = modelRef.schema.path(subPath);

    let type, kind, directRef;

    // Array of sub documents
    if (subPathSchemaType.constructor.name === 'DocumentArrayPath') {
      // This (boundTo)field will reference the _id of a subDocument
      const idSchemaType = subPathSchemaType.schema.path('_id');

      type = idSchemaType.options.type;
      kind =
        subPathSchemaType.schema.path('_id').options.kind ||
        subPathSchemaType.schema.path('_id').options.schemaName;
    }
    // Array of primitives
    else if (subPathSchemaType.constructor.name === 'SchemaArray') {
      // This (boundTo)field will reference the exact value of an element of the array
      type = subPathSchemaType.options.type[0].type;
      kind = subPathSchemaType.options.type[0].kind;

      // This is a subRef referencing a refs array
      if (subPathSchemaType.options.type[0].ref)
        // This will be useful for deducing the final resulting ref
        directRef = subPathSchemaType.options.type[0].ref;
    }

    return {
      type,
      kind,
      subRef: `${modelRef.modelName}.${subPath}`,
      ...(directRef ? { directRef } : {}),
      boundTo: field,
      ...options,
    };
  },

  schemaValidator(schema) {
    schema.eachPath((path, schemaType) => {
      // Check if field is bound
      if (schemaType.options.boundTo)
        schemaType.validate({
          validator: async function (fieldValue) {
            // Always a ref
            const boundValue = this.get(schemaType.options.boundTo);
            const boundSchemaType = schema.path(schemaType.options.boundTo);

            // The bound field must have a value, if this field is required
            if (schemaType.options.required && (boundValue === null || boundValue === undefined))
              throw `Devi valorizzare il campo '${
                boundSchemaType.description || schemaType.options.boundTo
              }'`;

            // Check subRef's validity
            const [rootRef, subPathRef] = schemaType.options.subRef.split('.');

            // These must be the same
            assert(
              boundSchemaType.options.ref,
              rootRef,
              "Bound field's ref must be the same as subRef's root"
            );

            // Search for bound document
            const boundDocument = await mongoose
              .model(boundSchemaType.options.ref)
              .findById(boundValue);

            if (!boundDocument)
              throw `Devi scegliere un riferimento valido per il campo '${
                boundSchemaType.description || schemaType.options.boundTo
              }'`;

            return boundDocument.get(subPathRef).some(
              (d) =>
                // boundDocument.get(subPathRef) is an array of ObjectIds or an array of SubDocuments
                d === fieldValue ||
                (d.equals && d.equals(fieldValue)) ||
                (d._id && d._id.equals(fieldValue))
            );
          },
          type: 'boundTo',
        });
    });
  },
};
