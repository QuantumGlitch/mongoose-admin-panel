const assert = require('assert');

// Components
const Component = require('./Component');
const DataTable = require('../data/DataTable');

// Errors
const { formatErrors } = require('../errors/validation-errors-formatter');
const { RefConstraintError, SubRefConstraintError } = require('../errors/error-type-formatters');

const Action = {
  New: {
    icon: 'PlusCircle',
    color: 'primary',
    label: 'New',
    action: 'new',
  },
  Save: {
    icon: 'Save',
    color: 'secondary',
    label: 'Save',
    action: 'save',
  },
  Delete: {
    icon: 'Delete',
    color: 'secondary',
    label: 'Delete',
    action: 'delete',
    askConfirm: true,
  },
  Copy: {
    icon: 'Copy',
    color: 'secondary',
    label: 'Copy',
    action: 'copy',
  },
};

class Detail extends Component {
  /**
   * @param {Object} constructorParameters
   * @param {DataTable} constructorParameters.dataTable
   */
  constructor({ dataTable, auth, initialization }) {
    super({ auth, initialization });
    assert(dataTable, 'DataTable (dataTable) is needed for Detail.');

    /**
     * @type {DataTable}
     */
    this.dataTable = dataTable;

    this.currentDocument = null;

    this.warnings = [];
    this.actions = [];

    this.fieldsBehaviours = {};

    // Before loading detail, the component needs the dataTable loaded
    this.loadWaiters = this.dataTable.waitEvent('load');

    // On document change, update the current document
    this.dataTable.onEvent('currentDocumentChanged', async (sender) => {
      // If this component sent the event, it can ignore it
      if (sender === this) return;
      this.currentDocument = await this.dataTable.getCurrentDocument();
      await this.load();
    });
  }

  //#region Fields
  get visibleFields() {
    if (!this._visibleFields)
      this._visibleFields = this.dataTable
        .getFields()
        // Exclude hidden fields
        .filter((c) => !c.name.startsWith('__'))
        .map((c) => c.name);

    return this._visibleFields ? this._visibleFields : (this._visibleFields = []);
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

  /**
   * @typedef {Object} FieldVisibilityOptions
   * @prop  {Boolean} first Must be inserted in first position or last position
   * @prop  {String} after Must be inserted after this field
   * @prop  {String} before Must be inserted before this field
   */

  /**
   * Make a field visible in a certain position.
   * @param  {String} name Name of the field to make visible
   * @param {FieldVisibilityOptions} [options]
   */
  showField(name, { first, after, before } = {}) {
    if (this.visibleFields.indexOf(name) === -1) {
      if (after) {
        // place field 'name' after field 'after'
        const index = this.visibleFields.indexOf(after);
        this.visibleFields.splice(index + 1, 0, name);
      } else if (before) {
        // place field 'name' before field 'before'
        const index = this.visibleFields.indexOf(beforeField);
        this.visibleFields.splice(index, 0, name);
      }
      // else if want to be first
      else if (first) this.visibleFields.unshift(name);
      // else push at end of visibles
      else this.visibleFields.push(name);
    }
  }

  /**
   * Virtual fields
   */
  get visibleVirtualFields() {
    return this._visibleVirtualFields || (this._visibleVirtualFields = []);
  }

  set visibleVirtualFields(v) {
    this._visibleVirtualFields = v;
  }

  /**
   * Make a virtual field visible in a certain position.
   * @param {String} name Name of the field to make visible
   * @param {FieldVisibilityOptions} [options]
   */
  showVirtualField(name, options) {
    if (this.visibleVirtualFields.indexOf(name) === -1) this.visibleVirtualFields.push(name);
    this.showField(name, options);
  }

  hideVirtualField(name) {
    this.visibleVirtualFields = this.visibleVirtualFields.filter(
      (virtualField) => virtualField !== name
    );
    this.hideField(name);
  }

  /**
   * This data structure will communicate to the front-end how to handle a specific field
   * @typedef {Object} FieldBehaviours
   * @property {String|String[]} validators - When changing the value of the field on the frontend, a custom script (or scripts) will try to validate it
   */

  /**
   * Set front-end options for fieldName
   * @param {String} fieldName
   * @param {FieldBehaviours} fieldBehaviours
   */
  setFieldBehaviour(fieldName, fieldBehaviours) {
    this.fieldsBehaviours = { ...this.fieldsBehaviours, [fieldName]: fieldBehaviours };
  }
  //#endregion

  //#region Actions
  async new() {
    this.currentDocument = new this.dataTable.entityInfo.model();

    // Deselect on the dataTable the current document
    this.dataTable.setCurrentDocument(null, this);
  }

  async copy() {
    this.currentDocument._id = null;

    // Deselect on the dataTable the current document
    this.dataTable.setCurrentDocument(null, this);
  }

  /**
   * Action for saving the current record
   * Returns true if all operations succeded
   * @returns {Boolean}
   */
  async save() {
    const docToSave = await this.dataTable.objectToDocument(this.currentDocument, {
      populate: false,
    });

    try {
      this.assert(this.currentDocument, 'Can save only when document data is defined');
      this.currentDocument = await this.dataTable.save(this.currentDocument, docToSave);

      // Reload
      await this.dataTable.load();
      await this.load();

      // If the user added a new document, then select it on the DataTable
      this.dataTable.setCurrentDocument(this.currentDocument, this);

      return true;
    } catch (err) {
      // Pass to client the validation errors
      if (err.name === 'ValidationError') {
        this.validationErrors = formatErrors(
          this.dataTable.entityInfo.model.schema.obj,
          err.errors
        );

        // Update the current document with the one we were trying to save
        // This is needed, because some validators could change document's fields
        this.currentDocument = await this.dataTable.objectToDocument(docToSave, {
          populate: true,
        });
      } else throw err;
    }

    return false;
  }

  /**
   * Action for deleting the current record
   */
  async delete() {
    this.assert(this.currentDocument, 'Can delete only when document data is defined');

    this.currentDocument = await this.dataTable.delete(this.currentDocument);

    // Reload
    await this.dataTable.load();
    await this.load();

    // Deselect currentDocument on dataTable
    this.dataTable.setCurrentDocument(this.currentDocument, this);
  }

  setActions() {
    this.actions = [];

    // Handle actions permissions
    if (this.dataTable.canAdd) {
      this.actions.push(Action.New);
      if (this.currentDocument) this.actions.push(Action.Copy);
    }

    if (this.currentDocument) {
      // Existing document
      if (this.currentDocument._id) {
        if (this.dataTable.canEdit) this.actions.push(Action.Save);
        if (this.dataTable.canDelete) this.actions.push(Action.Delete);
      }
      // New one
      else {
        if (this.dataTable.canAdd) this.actions.push(Action.Save);
      }
    }
  }
  //#endregion

  // #region Life Cycle
  async parse(config) {
    await super.parse(config);
    this.currentDocument = config.currentDocument;
    this.action = config.action;
  }

  async load() {
    await this.loadWaiters;

    this.setActions();
    this.emitEvent('load');
  }

  async execute() {
    return this.try(async () => {
      switch (this.action) {
        case 'new':
          await this.new();
          // Now we have more actions
          this.setActions();
          break;
        case 'copy':
          await this.copy();
          // Now we have more actions
          this.setActions();
          break;
        case 'save':
          await this.save();
          break;
        case 'delete':
          await this.delete();
          break;
      }
    }, [RefConstraintError, SubRefConstraintError]);
  }

  async serialize() {
    return {
      ...(await super.serialize()),
      refs: { dataTable: this.dataTable.refId },
      visibleFields: this.visibleFields,
      warnings: this.warnings,
      validationErrors: this.validationErrors || [],
      currentDocument: await this.dataTable.documentToObject(this.currentDocument, {
        virtuals: this.visibleVirtualFields,
      }),
      actions: this.actions,

      /**
       * This is used for custom modifies on fields
       */
      ...(this.fieldsBehaviours ? { fieldsBehaviours: this.fieldsBehaviours } : {}),
    };
  }
  //#endregion
}

module.exports = Detail;
