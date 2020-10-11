const {
  Ɂ,
  ɁɁ,
  ʖɁ
} = require('../../global');
/**
 * Transform a populated field of a mongoose document to a string
 * @param  {FieldInfo} fieldInfo
 * @param  {Object} fieldValue
 * @returns {String}
 */


export function formatRef(fieldInfo, fieldValue) {
  // Most probably this ref is not populated
  if (typeof fieldValue !== 'object') return `｟ ${fieldValue} ｠ `;
  const subFields = Object.keys(fieldValue);
  if (subFields.length === 0) return 'Empty value'; // If is available a field 'description' return it

  if (fieldValue.description) return `${fieldValue.description}`;
  const candidateDescriptiveFields = subFields.filter(sF => typeof fieldValue[sF] === 'string' && // Exclude dates
  isNaN(Date.parse(fieldValue[sF])) && // Exclude Numbers
  isNaN(Number(fieldValue[sF])) && sF !== 'password' && (!fieldInfo.subRef || sF !== '_id'));

  if (candidateDescriptiveFields.length > 0) {
    // Is _id between descriptive fields ?
    const id = candidateDescriptiveFields.find(sF => sF === '_id'); // Is code between descriptive fields ?

    const code = candidateDescriptiveFields.find(sF => sF === 'code');
    return (// If _id exists, take it as first and underline it
      (id ? `｟ ${fieldValue._id} ｠ ` : '') + ( // If code exists, take it as first and underline it
      code ? `｟ ${fieldValue.code} ｠ ` : '') + // Take all strings subFields to create a description for the field
      candidateDescriptiveFields.filter(sF => sF !== 'code' && sF !== '_id').map(sF => fieldValue[sF]).join(' / ')
    );
  } else return fieldValue._id;
}
/**
 * Transform a enum field of a mongoose document to a string
 * @param  {FieldInfo} fieldInfo
 * @param  {Object} fieldValue
 * @returns {String}
 */

export function formatEnum(fieldInfo, fieldValue) {
  const index = fieldInfo.enum.findIndex(v => v === fieldValue);
  return (fieldInfo.enumDescription || fieldInfo.enum)[index];
}
/**
 * Transform an array field of a mongoose document to a string
 * @param  {FieldInfo} fieldInfo
 * @param  {Object} fieldValue
 * @returns {String}
 */

export function formatArray(fieldInfo, fieldValue) {
  return `[ ${fieldValue.length} elements ]`;
}
/**
 * Transform an object field of a mongoose document to a string
 * @param  {FieldInfo} fieldInfo
 * @param  {Object} fieldValue
 * @returns {String}
 */

export function formatObject(fieldInfo, fieldValue) {
  return `{ ${Object.keys(fieldValue).filter(k => k !== '_id').map(k => `(${formatField(fieldInfo.type.obj[k], fieldValue[k])})`).join(', ')} }`;
}
/**
 * Transform a field of a mongoose document to a string
 * @param  {FieldInfo} fieldInfo
 * @param  {Object} fieldValue
 * @returns {String}
 */

export function formatField(fieldInfo, fieldValue) {
  if (Ɂ(fieldInfo)) return "[ Field's info unknown ]";
  if (Ɂ(fieldValue)) return '[ NULL ]';
  if (fieldInfo.ref || fieldInfo.subRef) return formatRef(fieldInfo, fieldValue);else if (fieldInfo.enum) return formatEnum(fieldInfo, fieldValue);else if (fieldInfo.kind === 'Date') return new Date(fieldValue).toLocaleString();else if (fieldInfo.kind === 'Array') return formatArray(fieldInfo, fieldValue);else if (fieldInfo.kind === 'Object') return formatObject(fieldInfo, fieldValue);
  return fieldValue;
}
/**
 * Get field default value by fieldInfo
 * @param {FieldInfo} fieldInfo
 * @returns {*}
 */

export function getFieldDefaultValue(fieldInfo) {
  const {
    primitive,
    reference,
    object,
    enumerator,
    array
  } = getFieldType(fieldInfo);

  if (fieldInfo._default !== undefined) {
    const _default = eval(fieldInfo._default); // if is a function then return the execution of it


    if (typeof _default === 'function') return _default();
    return _default;
  }

  if (fieldInfo.default !== undefined) return fieldInfo.default;
  if (reference) return null;else if (enumerator) return null;else if (array) return [];else if (object) {
    // This is a single nested schema
    if (ɁɁ(fieldInfo, 'type', 'obj')) return getFieldDefaultValue(fieldInfo.type);else return {};
  } else if (primitive) {
    // Primitive
    if (fieldInfo.required) {
      if (enumerator) return fieldInfo.enum[0];

      switch (fieldInfo.kind) {
        case 'String':
          return '';

        case 'Number':
        case 'Decimal':
          return 0;

        case 'Boolean':
          return false;

        default:
          console.warn(`Can't find the default value for a primitive field '${fieldInfo.name}'`);
      }
    }

    return null;
  } // The only type remaining is a Schema type (list of fields)
  else if (fieldInfo.obj) {
      const res = {};
      Object.keys(fieldInfo.obj).forEach(k => res[k] = getFieldDefaultValue(fieldInfo.obj[k]));
      return res;
    } else {
      console.error("Unhandled field's type to default", fieldInfo);
      return null;
    }
}
/**
 * Determine of which type is the field
 * @param {FieldInfo} fieldInfo
 * @returns {Object}
 */

export function getFieldType(fieldInfo) {
  const enumerator = fieldInfo.enum && fieldInfo.enum.length > 0;
  const reference = !!fieldInfo.ref || !!fieldInfo.subRef;
  const array = fieldInfo.kind === 'Array' && fieldInfo.type instanceof Array;
  const arrayOfObjects = array && !fieldInfo.type[0].kind && !fieldInfo.type[0].ref && !fieldInfo.type[0].subRef;
  const object = fieldInfo.kind === 'Object' && fieldInfo.type instanceof Object;
  const primitive = !!fieldInfo.kind && !array && !object;
  return {
    primitive,
    enumerator,
    reference,
    array,
    arrayOfObjects,
    object,
    ...(object ? {
      subFieldsInfo: formatSchemaObject(ʖɁ(fieldInfo.type, 'obj'))
    } : arrayOfObjects ? {
      subFieldsInfo: formatSchemaObject(ʖɁ(fieldInfo.type[0], 'obj'))
    } : array ? {
      subFieldsInfo: fieldInfo.type[0]
    } : {})
  };
}
/**
 * Transform an Entity's schemaObject (model.schema.obj)
 * to the format of FieldInfo
 * (DataTable.fields is FieldInfo[])
 * @param {Object} schemaObject
 * @returns {FieldInfo[]}
 */

export function formatSchemaObject(schemaObject) {
  const fields = Object.keys(schemaObject);
  return fields.map(key => ({
    name: key,
    ...schemaObject[key]
  }));
}