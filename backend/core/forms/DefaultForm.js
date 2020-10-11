const Form = require('./Form');

const DataTable = require('../data/DataTable');

const Grid = require('../components/Grid/Advanced');
const Detail = require('../components/Detail');

/**
 * This is used for the classical visualization with a detail and a grid on a single datatable
 */
class DefaultForm extends Form {
  constructor({ auth, title, entityName, initialization }) {
    super({ auth, title, initialization });

    const dataTable = new DataTable({ auth, entityName });
    const grid = new Grid({ dataTable, initialization });
    const detail = new Detail({ dataTable, initialization });

    this.children = [detail, grid, dataTable];
  }
}

module.exports = DefaultForm;
