const DataTable = require('./DataTable');
const ComponentError = require('../errors/ComponentError');

/**
 * This class is dependent from another DataTable (the primary one)
 * the two are connected by a foreign key
 */
class ForeignDataTable extends DataTable {
  /**
   * @param {Object} constructorParams
   * @param {String} constructorParams.foreignEntityName
   * @param {String} constructorParams.foreignKey Key field on entity that is connected to the primaryDataTable.entity by primaryKey
   * @param {DataTable} constructorParams.primaryDataTable
   * @param {String} constructorParams.primaryKey
   */
  constructor({ auth, foreignEntityName, foreignKey, primaryDataTable, primaryKey = '_id' }) {
    super({ auth, entityName: foreignEntityName });

    this.foreignKey = foreignKey;
    this.primaryDataTable = primaryDataTable;
    this.primaryKey = primaryKey;

    // Before this component's load, we need the primaryDataTable loaded
    this.loadWaiters = this.primaryDataTable.waitEvent('load');

    /*
      If another component change the currentDocument of the primaryDataTable
      the component must reload itself, because the loading is based
      on this information. 

      N.B. This will work only if another component triggers this event during
      a loading state (because of this.synchronizer)
    */
    this.primaryDataTable.onEvent('currentDocumentChanged', this.load.bind(this));

    // After deleting the a document on the primary data table
    this.primaryDataTable.onEvent('documentDeleted', async (sender, document) => {
      // If the primary DataTable's current document has been deleted
      if (document._id === this.primaryDataTable.currentDocumentId) {
        // Re-fill this DataTable, because the delete could have deleted all secondary documents
        await this.fill();

        if (this.currentDocumentId) {
          const updatedCurrentDoc = await this.objectToDocument({ _id: this.currentDocumentId });

          // Update the current document
          this.setCurrentDocument(updatedCurrentDoc, this);
        }
      }
    });
  }

  async buildQuery() {
    this.findOptions = {
      ...this.findOptions,
      [this.foreignKey]: this.primaryDataTable.currentDocument[this.primaryKey],
    };

    return await super.buildQuery();
  }

  async fill() {
    // Load the document to which is locked this datatable now
    if (await this.primaryDataTable.getCurrentDocument())
      // If it is defined then fill this datatable
      await super.fill();
  }

  async load() {
    await this.loadWaiters;
    await super.load();
  }

  // We need to constraint the foreign key of the document, on save
  async save(document, documentToSave) {
    // Load the document to which is locked this datatable now
    if (!(await this.primaryDataTable.getCurrentDocument()))
      throw new ComponentError(
        `No record has been loaded from the main entity '${this.primaryDataTable.entityInfo.entity.description}'.`
      );

    // Lock the foreign key to the primaryKey of the primaryDataTable's current document
    for (const doc of [document, documentToSave])
      if (doc) doc[this.foreignKey] = this.primaryDataTable.currentDocument[this.primaryKey];

    return await super.save(document, documentToSave);
  }

  getFields() {
    // The foreignKey's field is locked, so there is no way that can be accessed outside
    if (!this._fields)
      this._fields = super.getFields().filter(({ name }) => name !== this.foreignKey);

    return this._fields;
  }
}

module.exports = ForeignDataTable;
