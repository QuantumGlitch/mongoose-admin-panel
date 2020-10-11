const { ɁɁ } = require('../../utilities/global');

const Form = require('./Form');

const { getById } = require('../../models/entity');

const DataTable = require('../data/DataTable');
const SubDataTable = require('../data/SubDataTable');

const AdvancedGrid = require('../components/Grid/Advanced');

/**
 * This is used for the RefInput (on client-side) to navigate "foreign keys"
 *                      or BoundRefInput
 */
class RefForm extends Form {
  constructor({ auth, entityName, initialization, parameters }) {
    // Did we provide a path for reaching subDocuments from entity ?
    const nested = ɁɁ(parameters, 'constraint', 'path') && parameters.constraint.document;

    // Title like a descriptive path
    const entityInfo = getById(entityName);
    let title = entityInfo.entity.description || entityInfo.entity._id;

    if (nested)
      title +=
        ' ( ' +
        (parameters.constraint.document.description || parameters.constraint.document._id) +
        ' ) - ' +
        entityInfo.model.schema.obj[parameters.constraint.path].description;

    // Super constructor
    super({
      auth,
      title,
      initialization,
    });

    let dataTable;

    // Form for a nested path
    if (ɁɁ(parameters, 'constraint', 'path') && parameters.constraint.document)
      dataTable = new SubDataTable({
        auth,
        entityName,
        subPath: parameters.constraint.path,
        constraintDocument: parameters.constraint.document,
      });
    // Default form
    else {
      dataTable = new DataTable({ auth, entityName });

      if (ɁɁ(parameters, 'constraint', 'filters'))
        dataTable.findOptions = parameters.constraint.filters;
    }

    const grid = new AdvancedGrid({ dataTable, initialization });

    if (ɁɁ(parameters, 'constraint', 'filters')) {
      // Exclude fields from AdvancedGrid's filters
      grid.fieldsToExclude = Object.keys(parameters.constraint.filters);
    }

    this.children = [grid, dataTable];
  }

  async serialize() {
    return { ...(await super.serialize()), refs: { grid: this.children[0].refId } };
  }
}

module.exports = RefForm;
