const Grid = require('./Grid');
const DataTable = require('../../../core/data/DataTable');

const { ʖɁ } = require('../../../utilities/global');

function getFullPath(path, name) {
  return (path ? path + '.' : '') + name;
}

const Operators = {
  EQUALS: {
    id: 'EQUALS',
    description: '=',
    toQueryObj: ({ fieldInfo, value, path, queryObj }) => {
      if (value) {
        if (fieldInfo.type === Date) {
          const dateGte = new Date(value);
          dateGte.setDate(dateGte.getDate() - 1);

          const dateLte = new Date(value);
          dateLte.setDate(dateLte.getDate() + 1);

          return {
            $and: [
              // Mantains previous $and conditions
              ...(queryObj['$and'] ? queryObj['$and'] : []),
              { [getFullPath(path, fieldInfo.name)]: { $gte: dateGte } },
              { [getFullPath(path, fieldInfo.name)]: { $lte: dateLte } },
            ],
          };
        }
      }

      return { [getFullPath(path, fieldInfo.name)]: value };
    },
  },
  UNLIKE: {
    id: 'UNLIKE',
    description: '<>',
    toQueryObj: ({ fieldInfo, value, path, queryObj }) => {
      if (value) {
        if (fieldInfo.type === Date) {
          const dateGte = new Date(value);
          dateGte.setDate(dateGte.getDate() + 1);

          const dateLte = new Date(value);
          dateLte.setDate(dateLte.getDate() - 1);

          return {
            $or: [
              // Mantains previous $or conditions
              ...(queryObj['$or'] ? queryObj['$or'] : []),
              { [getFullPath(path, fieldInfo.name)]: { $gte: dateGte } },
              { [getFullPath(path, fieldInfo.name)]: { $lte: dateLte } },
            ],
          };
        }
      }

      return { [getFullPath(path, fieldInfo.name)]: { $ne: value } };
    },
  },
  CONTAINS: {
    id: 'CONTAINS',
    description: 'Contains',
    toQueryObj: ({ fieldInfo, value, path }) => {
      if (value)
        return {
          [getFullPath(path, fieldInfo.name)]: { $regex: '.*' + value.escapeRegExp() + '.*' },
        };
      else return {};
    },
  },
  GREATER: {
    id: 'GREATER',
    description: '>',
    toQueryObj: ({ fieldInfo, value, path }) => {
      return { [getFullPath(path, fieldInfo.name)]: { $gt: value } };
    },
  },
  LOWER: {
    id: 'LOWER',
    description: '<',
    toQueryObj: ({ fieldInfo, value, path }) => {
      return { [getFullPath(path, fieldInfo.name)]: { $lt: value } };
    },
  },

  /**
   * List operators
   */
  CONTAINS_AT_LEAST_ONE: {
    id: 'CONTAINS_AT_LEAST_ONE',
    description: 'Contains at least one element',
    toQueryObj: ({ fieldInfo, value, path, queryObj }) => {
      if (fieldInfo.type instanceof Array) {
        if (fieldInfo.type[0].type)
          return {
            $or: [
              // Mantains previous $or conditions
              ...(queryObj['$or'] ? queryObj['$or'] : []),
              ...value.map((el) => ({
                [getFullPath(path, fieldInfo.name)]: {
                  $elemMatch: {
                    $eq: fieldInfo.type[0].ref || fieldInfo.type[0].subRef ? el._id || el : el,
                  },
                },
              })),
            ],
          };
        // Array of objects, we can't compare the whole record but we must compare by fields
        else
          return {
            $or: [
              // Mantains previous $or conditions
              ...(queryObj['$or'] ? queryObj['$or'] : []),
              ...value.map((el) => {
                const match = {};

                /*
                  Just evaluate fields with a value
                  (
                    nully fields will be ignored, so we can search
                    for match just by some fields and not all
                  )
                */
                Object.keys(el).forEach(
                  (key) =>
                    el[key] !== undefined &&
                    el[key] !== null &&
                    el[key] !== '' &&
                    (match[key] = el[key])
                );

                return {
                  [getFullPath(path, fieldInfo.name)]: {
                    $elemMatch: match,
                  },
                };
              }),
            ],
          };
      } else return {};
    },
  },
  CONTAINS_ALL: {
    id: 'CONTAINS_ALL',
    description: 'Contains all the elements',
    toQueryObj: ({ fieldInfo, value, path }) => {
      if (fieldInfo.type instanceof Array) {
        if (fieldInfo.type[0].type)
          return {
            [getFullPath(path, fieldInfo.name)]: {
              $all: value.map((el) =>
                fieldInfo.type[0].ref || fieldInfo.type[0].subRef ? el._id || el : el
              ),
            },
          };
        // Array of objects, we can't compare the whole record but we must compare by fields
        else
          return {
            [getFullPath(path, fieldInfo.name)]: {
              $all: value.map((el) => {
                const match = {};

                /*
                Just evaluate fields with a value
                (
                  nully fields will be ignored, so we can search
                  for match just by some fields and not all
                )
              */
                Object.keys(el).forEach(
                  (key) =>
                    el[key] !== undefined &&
                    el[key] !== null &&
                    el[key] !== '' &&
                    (match[key] = el[key])
                );

                return { $elemMatch: match };
              }),
            },
          };
      } else return {};
    },
  },
};

function getOperatorsFromField({ kind, type }) {
  let operators = [Operators.EQUALS, Operators.UNLIKE];

  switch (type) {
    case String:
      operators = [...operators, Operators.CONTAINS];
      break;
    case Number:
      operators = [...operators, Operators.GREATER, Operators.LOWER];
      break;
  }

  if (kind === 'Array')
    // Array of complex will have operators on subFields
    // These are operators only for primitive array
    operators = [Operators.CONTAINS_AT_LEAST_ONE, Operators.CONTAINS_ALL];

  // if (kind === 'Object')
  //   Object will have operators on subFields
  //   operators = [Operators.EQUALS_AT_LEAST_ONE_FIELD, Operators.EQUALS_ALL_FIELDS];

  return operators;
}

function getFieldOperatorByInfo(field) {
  function getSubPaths(type) {
    const subPaths = {};
    Object.keys(type).forEach(
      (subPath) => (subPaths[subPath] = getFieldOperatorByInfo(type[subPath]))
    );
    return subPaths;
  }

  // Array of Objects
  if (field.kind === 'Array' && !field.type[0].type) return getSubPaths(ʖɁ(field.type[0], 'obj'));
  if (field.kind === 'Object') return getSubPaths(ʖɁ(field.type, 'obj'));

  return getOperatorsFromField(field);
}

class AdvancedGrid extends Grid {
  constructor(...args) {
    super(...args);

    /**
     * Fields to exclude from filtering
     */
    this.fieldsToExclude = [];
  }

  // Info on pagination
  get paginationOptions() {
    if (!this._paginationOptions)
      this._paginationOptions = {
        itemsPerPage: 10,
        currentPage: 0,
      };

    return this._paginationOptions;
  }

  set paginationOptions(value) {
    this._paginationOptions = value;
  }

  // Info on search
  get filterOptions() {
    return this._filterOptions ? this._filterOptions : (this._filterOptions = []);
  }

  set filterOptions(value) {
    this._filterOptions = value;
  }

  get fieldsFiltersOperators() {
    if (!this._fieldsFiltersOperators) {
      this._fieldsFiltersOperators = {};
      this.dataTable
        .getFields()
        // Exclude fields not allowed for filtering
        .filter(({ name }) => this.fieldsToExclude.indexOf(name) === -1)
        .forEach(
          (field) => (this._fieldsFiltersOperators[field.name] = getFieldOperatorByInfo(field))
        );
    }

    return this._fieldsFiltersOperators;
  }

  // New Methods
  convertFilterOptionsToQueryObj(fields, filterOptions, path, descriptionPath) {
    let queryObj = {};

    // For each filter option build a queryObj for filtering on mongoose query
    filterOptions.forEach(({ name, operator, value, nestedFilterOptions }) => {
      const fieldInfo = fields.find((field) => field.name === name);

      this.assert(
        fieldInfo,
        `The field '${
          (descriptionPath ? descriptionPath + ' - > ' : '') + (name ? name : '# Undefined')
        }' is not valid`
      );

      const fullDescriptionPath =
        (descriptionPath ? descriptionPath + ' -> ' : '') + fieldInfo.description;

      if (fieldInfo.kind === 'Object' || (fieldInfo.kind === 'Array' && !fieldInfo.type[0].type))
        queryObj = {
          ...queryObj,
          ...this.convertFilterOptionsToQueryObj(
            DataTable.formatSchemaObject(
              fieldInfo.kind === 'Object' ? ʖɁ(fieldInfo.type, 'obj') : ʖɁ(fieldInfo.type[0], 'obj')
            ),
            nestedFilterOptions,
            getFullPath(path, name),
            fullDescriptionPath
          ),
        };
      else {
        this.assert(
          Operators[operator],
          `The operator '${
            operator ? operator : '# Undefined'
          }' for '${fullDescriptionPath}' is not valid`
        );

        queryObj = {
          ...queryObj,
          ...Operators[operator].toQueryObj({ fieldInfo, value, path, queryObj }),
        };
      }
    });

    return queryObj;
  }

  // Load
  async load() {
    await this.try(() => {
      if (this.filterOptions && this.filterOptions.length > 0)
        this.dataTable.findOptions = {
          ...this.dataTable.findOptions,
          // Extends default findOptions
          ...this.convertFilterOptionsToQueryObj(
            this.dataTable
              .getFields()
              // Exclude fields not allowed for filtering
              .filter(({ name }) => this.fieldsToExclude.indexOf(name) === -1),
            this.filterOptions
          ),
        };
    });

    // Calculation on pagination
    this.itemsCount = await this.dataTable.entityInfo.model.countDocuments(
      this.dataTable.findOptions
    );

    // Pages count
    this.pagesCount =
      Math.floor(this.itemsCount / this.paginationOptions.itemsPerPage) +
      (this.itemsCount % this.paginationOptions.itemsPerPage === 0 ? 0 : 1);

    // Add pagination to fill query
    this.dataTable.additionalBuildQuery = (query) => {
      return query
        .skip(this.paginationOptions.itemsPerPage * this.paginationOptions.currentPage)
        .limit(this.paginationOptions.itemsPerPage);
    };

    await this.dataTable.load();
    this.emitEvent('load');
  }

  async parse(config) {
    await super.parse(config);

    if (config.paginationOptions) this.paginationOptions = config.paginationOptions;
    if (config.filterOptions) this.filterOptions = config.filterOptions;
  }

  async serialize() {
    return {
      ...(await super.serialize()),
      fieldsFiltersOperators: this.fieldsFiltersOperators,
      filterOptions: this.filterOptions,
      paginationOptions: this.paginationOptions,
      pagesCount: this.pagesCount,
      itemsCount: this.itemsCount,
    };
  }
}

module.exports = AdvancedGrid;
