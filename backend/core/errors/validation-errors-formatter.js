const Kind = {
  required: ({ description }) => `The field '${description}' is required`,
  minlength: ({ description, minlength }) =>
    `The field '${description}' must be long at the least ${minlength} characters`,
  maxlength: ({ description, maxlength }) =>
    `The field '${description}' can be up to ${maxlength} characters long`,
  max: ({ description, max }) => `The field '${description}' can't be greater than ${max}`,
  min: ({ description, min }) => `The field '${description}' can't be smaller than ${min}`,
  regexp: ({ description }) => `The field '${description}' doesn't respect the right format`,
  email: ({ description }) => `The field '${description}' is not a valid email`,
  telephone: ({ description }) => `The field '${description}' is not a valid telephone number`,
  unique: ({ description }) => `The field '${description}' must be unique`,
  boundTo: ({ description }) => `The field '${description}' is not valid`,
  atLeastElementsCount: ({ description, atLeastElementsCount }) => {
    return `The field '${description}' must contains at the least ${
      atLeastElementsCount === 1 ? 'one element' : atLeastElementsCount + ' elements'
    }`;
  },
  Array: ({ description }) => {
    return `The field '${description}' contains a NULL element`;
  },
};

function formatError(name, fieldSchemaObject, error) {
  if (!name || !fieldSchemaObject || !error)
    return console.warn(
      'Partial inputs missing on formatError',
      '(' + name + ')',
      '(' + fieldSchemaObject + ')',
      error
    );

  return {
    name,
    message: Kind[error.kind] ? Kind[error.kind](fieldSchemaObject) : error.message,
  };
}

function formatErrors(schemaObject, errors) {
  const errorPaths = Object.keys(errors);

  /**
   * Transform the errors paths of subDocuments
   */
  const errorsSubPaths = {};
  errorPaths
    .filter((path) => path.indexOf('.') > -1)
    .forEach((pathString) => {
      const [rootPath, ...subPath] = pathString.split('.');
      const isRootArray = schemaObject[rootPath].type instanceof Array;

      if (!errorsSubPaths[rootPath])
        errorsSubPaths[rootPath] = {
          name: rootPath,
          message: isRootArray
            ? `Check the elements of the list '${schemaObject[rootPath].description}'`
            : `Check the fields of group '${schemaObject[rootPath].description}'`,
          isArray: isRootArray,
          children: isRootArray ? {} : { schemaObject: {}, errors: {} },
        };

      if (isRootArray) {
        let [elementIndex, property] = subPath;
        elementIndex = parseInt(elementIndex);

        if (!errorsSubPaths[rootPath].children[elementIndex])
          errorsSubPaths[rootPath].children[elementIndex] = { schemaObject: {}, errors: {} };

        errorsSubPaths[rootPath].children[elementIndex].schemaObject[property] = (schemaObject[
          rootPath
        ].type[0].obj || schemaObject[rootPath].type[0])[property];
        errorsSubPaths[rootPath].children[elementIndex].errors[property] = errors[pathString];
      } else {
        let [property] = subPath;

        if (!errorsSubPaths[rootPath].children.schemaObject[property])
          errorsSubPaths[rootPath].children.schemaObject[property] = {};

        if (!errorsSubPaths[rootPath].children.errors[property])
          errorsSubPaths[rootPath].children.errors[property] = {};

        errorsSubPaths[rootPath].children.schemaObject[property] =
          schemaObject[rootPath].type.obj[property];
        errorsSubPaths[rootPath].children.errors[property] = errors[pathString];
      }

      //formatError(path, schemaObject[path], errors[path]);
    });

  const finalErrorsSubPaths = Object.keys(errorsSubPaths).map((rootPath) => {
    if (errorsSubPaths[rootPath].isArray) {
      const children = errorsSubPaths[rootPath].children;

      errorsSubPaths[rootPath].children = {};

      Object.keys(children).forEach(
        (index) =>
          (errorsSubPaths[rootPath].children[index] = formatErrors(
            children[index].schemaObject,
            children[index].errors
          ))
      );
    } else
      errorsSubPaths[rootPath].children = formatErrors(
        errorsSubPaths[rootPath].children.schemaObject,
        errorsSubPaths[rootPath].children.errors
      );

    return errorsSubPaths[rootPath];
  });

  return [
    // errorPaths of root properties
    ...errorPaths
      .filter(
        (path) =>
          path.indexOf('.') === -1 &&
          // Avoid collisions
          !finalErrorsSubPaths.find(({ name }) => name.startsWith(path))
      )
      .map((path) => formatError(path, schemaObject[path], errors[path])),
    // errorPaths of subDocuments
    ...finalErrorsSubPaths,
  ].filter((v) => !!v);
}

module.exports = {
  formatError,
  formatErrors,
};
