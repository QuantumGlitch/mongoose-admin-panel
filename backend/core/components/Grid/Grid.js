const assert = require('assert');
const Component = require('../Component');
const DataTable = require('../../../core/data/DataTable');

class Grid extends Component {
  /**
   * @param {DataTable} {dataTable}
   */
  constructor({ dataTable, initialization }) {
    super({ initialization });
    assert(dataTable, 'DataTable (dataTable) is needed for Grid.');

    /**
     * @type {DataTable}
     */
    this.dataTable = dataTable;
    this.currentDocumentId = undefined;

    // If the data table change the current document, then we have to do the same
    this.dataTable.onEvent('currentDocumentChanged', async (sender) => {
      // The component is the sender, it can ignore the event
      if (sender === this) return;
      this.currentDocumentId = this.dataTable.currentDocumentId;
    });

    // Show or hide on the frontend
    this.visible = true;
  }

  //#region Fields
  get visibleFields() {
    if (!this._visibleFields)
      this._visibleFields = this.dataTable
        .getFields()
        .filter((f) => !DataTable.isDefaultExcludedField(f))
        .map(({ name }) => name);

    return this._visibleFields;
  }

  /**
   * @param {String[]} value
   */
  set visibleFields(value) {
    this._visibleFields = value;
  }

  hideField(name) {
    this.visibleFields = this.visibleFields.filter((visibleField) => visibleField !== name);
  }

  showField(name) {
    if (this.visibleFields.indexOf(name) === -1) this.visibleFields.push(name);
  }
  //#endregion

  //#region Action
  async changeDocument() {
    this.dataTable.setCurrentDocument(
      await this.dataTable.objectToDocument({ _id: this.currentDocumentId }),
      this
    );
  }
  //#endregion

  //#region Life Cycle
  async parse(config) {
    await super.parse(config);

    this.currentDocumentId = config.currentDocumentId;

    // DataTable doesn't have a parse function, so by default the grid will set the currentDocumentId
    this.dataTable.currentDocumentId = this.currentDocumentId;

    this.action = config.action;
  }

  async load() {
    this.emitEvent('load');
  }

  async execute() {
    return this.try(async () => {
      switch (this.action) {
        case 'changeDocument':
          await this.changeDocument();
          break;
      }
    });
  }

  async serialize() {
    return {
      ...(await super.serialize()),
      refs: { dataTable: this.dataTable.refId },
      visibleFields: this.visibleFields,
      currentDocumentId: this.currentDocumentId,
      visible: this.visible,
    };
  }
  //#endregion
}

module.exports = Grid;
