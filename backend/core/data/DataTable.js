const mongoose = require.main.require('mongoose');
const { Ɂ } = require('../../utilities/global');

const Entity = require('../../models/entity');
const UserPermission = require('../../models/user-permission');

const Component = require('../components/Component');

const ADMIN_FIELDS = [
  '_createdAt',
  '_createdBy',
  '_editedAt',
  '_editedBy',
  '_deleted',
  '_deletedAt',
  '_deletedBy',
];

/**
 * Connecting this class with an entity, allow to handle a
 * bucket of data without downloading all the entity's records
 */
class DataTable extends Component {
  /**
   * Transform an Entity's schemaObject (model.schema.obj)
   * to the format of FieldInfo
   * (DataTable.fields is FieldInfo[])
   * @param {Object} schemaObject
   * @returns {FieldInfo[]}
   */
  static formatSchemaObject(schemaObject) {
    const fields = Object.keys(schemaObject);

    return (
      fields
        // double scores is for always hidden field
        .filter((key) => !key.startsWith('__'))
        .map((key) => ({
          name: key,
          ...schemaObject[key],
        }))
    );
  }

  /**
   * Transform an Entity's schema (model.schema)
   * to the format of FieldInfo
   * (DataTable.fields is FieldInfo[])
   * @param {mongoose.Schema} schemaObject
   * @returns {FieldInfo[]}
   */
  static formatSchema(schema) {
    const fields = Object.keys(schema.paths);

    return (
      fields
        // double scores is for always hidden field
        .filter((key) => !key.startsWith('__'))
        .map((key) => ({
          name: key,
          ...schema.paths[key].options,
        }))
    );
  }

  /**
   * Returns true if this must be a field that shouldn't bee included in queries
   * @param {Object} field
   * @returns {Boolean}
   */
  static isDefaultExcludedField({ sensible, name, type, kind }) {
    return (
      // sensible information (like password)
      sensible ||
      // boolean
      // N.B: _deleted is useful for highlight in frontend's Grid Component, so keep it
      (type === Boolean && name !== '_deleted') ||
      // heavy fields
      kind === 'LongText' ||
      kind === 'Object'
    );
  }

  /**
   * @param {Object} constructorParams
   * @param {String} constructorParams.entityName
   */
  constructor({ auth, entityName }) {
    super({ auth });

    this.entityInfo = Entity.getById(entityName);
    this.documents = [];

    /* 
      This props will be setted by other components
      because this class is not parsable
    */
    this.currentDocument = null;
    this.currentDocumentId = null;
  }

  //#region Getter / Setter
  /**
   * Get fill options for this DataTable
   * (Conditions for data retrievement)
   */
  get findOptions() {
    // Default options
    if (!this._findOptions)
      if (!this.auth.is['Administrator'])
        // If user is not Admin then select only not soft-deleted documents
        this._findOptions = { _deleted: { $in: [false, null] } };

    return this._findOptions;
  }

  set findOptions(value) {
    this._findOptions = value;
  }

  /**
   * Get selection options for this DataTable
   * (Conditions for data retrievement projection)
   */
  get selectionOptions() {
    // Default options
    if (!this._selectionOptions) {
      this._selectionOptions = {};

      if (!this.auth.is['Administrator'])
        // Don't select fields only for Admin
        ADMIN_FIELDS.forEach((f) => (this._selectionOptions[f] = 0));

      // Exclude heavy fields, so the loading will be faster
      this.getFields()
        .filter((f) => DataTable.isDefaultExcludedField(f))
        .forEach(({ name }) => (this._selectionOptions[name] = 0));
    }

    return this._selectionOptions;
  }

  set selectionOptions(value) {
    this._selectionOptions = value;
  }

  /**
   * Get popualte options for this DataTable
   * (
   *  Conditions for populating ref of each documents
   *  By default it will take all the refs.
   * )
   */
  get populationOptions() {
    // Default options
    if (!this._populationOptions)
      this._populationOptions = [...(this.entityInfo.populationOptions.normal || [])];

    return this._populationOptions || [];
  }

  set populationOptions(value) {
    this._populationOptions = value;
  }

  get subPopulationOptions() {
    if (!this._subPopulationOptions)
      this._subPopulationOptions = this.entityInfo.populationOptions.sub;

    return this._subPopulationOptions || [];
  }

  set subPopulationOptions(value) {
    this._subPopulationOptions = value;
  }
  //#endregion

  //#region Fields
  /**
   * Get the fields of this dataTable's entity
   * @param {Boolean} [reset=false] Reset this._fields and recalculate the original value
   */
  getFields(reset = false) {
    if (this._fields && !reset) return this._fields;

    this._fields = DataTable.formatSchema(this.entityInfo.model.schema);

    // Exclude fields for admin
    if (!this.auth.is['Administrator'])
      this._fields = this._fields.filter(
        ({ name }) => !ADMIN_FIELDS.find((name2) => name === name2)
      );

    return this._fields;
  }

  getVirtualFields() {
    if (this._virtualFields) return this._virtualFields;

    this._virtualFields = [];
    for (let virtual in this.entityInfo.model.schema.virtuals)
      this._virtualFields.push({
        name: virtual,
        ...this.entityInfo.model.schema.virtual(virtual).options,
      });

    return this._virtualFields;
  }

  /**
   * Merge or override the passed props to the specified 'name' field on this._fields
   * N.B. Better call getFields() before this one if you are not sure that this._fields exists
   * @param {String} name
   * @param {Object} props
   */
  mergeField(name, props) {
    const field = this._fields.find((f) => f.name === name);
    if (field) for (let propName in props) field[propName] = props[propName];
  }
  //#endregion

  //#region CRUD
  /**
   * Save document for the entity
   * @param  {Object} document document as raw object
   * @param  {Document|null} documentToSave mongoose model instance of the raw object (can be used as out reference)
   */
  async save(document, documentToSave) {
    // This is used as external reference
    if (!documentToSave)
      documentToSave = await this.objectToDocument(document, { populate: false });

    // Id is specified so this is an editing of a document
    if (document._id) {
      this.assert(
        this.canEdit,
        `The user hasn't got the privilege to edit on the entity '${
          this.entityInfo.entity.description || this.entityInfo.entity._id
        }'`
      );

      // Update only for defined fields of document
      for (const { name, readOnly } of this.getFields())
        if (document[name] !== undefined && !readOnly) documentToSave[name] = document[name];

      if (documentToSave.isModified()) {
        documentToSave._editedAt = Date.now();
        documentToSave._editedBy = this.auth.user;
      }
    }
    // Id is not specified so this is an adding of a new document
    // Has user permission for adding ?
    else {
      this.assert(
        this.canAdd,
        `The user hasn't got the privilege to add a new record on the entity  '${
          this.entityInfo.entity.description || this.entityInfo.entity._id
        }'`
      );

      documentToSave._createdAt = Date.now();
      documentToSave._createdBy = this.auth.user;
      documentToSave._editedAt = Date.now();
      documentToSave._editedBy = this.auth.user;
    }

    // update or create
    await documentToSave.save();

    // populate refs
    if (this.populationOptions.length > 0)
      await this.entityInfo.model.populate(documentToSave, this.populationOptions);
    if (this.subPopulationOptions.length > 0)
      await documentToSave.subPopulate(this.subPopulationOptions);

    return documentToSave;
  }

  /**
   * Delete document for the entity
   * @param  {Object} document document as raw object
   * @param {Object} [options] execute the deleting ignoring the document's state
   */
  async delete(document) {
    this.assert(document._id, `You need to specify a valid _id for the document.`);
    this.assert(
      this.canDelete,
      `The user hasn't got the privilege to delete on the entity  '${
        this.entityInfo.entity.description || this.entityInfo.entity._id
      }'.`
    );

    const canSoftDelete = !!this.entityInfo.model.schema.paths['_deleted'];
    const doc = canSoftDelete ? await this.entityInfo.model.findById({ _id: document._id }) : null;
    const alreadySoftDeleted = canSoftDelete ? !!doc._deleted : null;

    if (canSoftDelete && !alreadySoftDeleted) {
      // We can operate soft delete on this Entity
      // We can soft delete if is not already soft deleted
      await doc.softDelete(true, this.auth.user._id);
      this.emitEvent('documentDeleted', this, doc);
      return doc;
    }

    // If can't soft delete then delete
    await this.entityInfo.model.deleteOne({ _id: document._id });
    this.emitEvent('documentDeleted', this, document);
  }
  //#endregion

  //#region Utilities

  /**
   * Utility for transforming raw object to mongoose document (of the entity of this datatable)
   * @param {Object|Document} obj
   * @param {Object} options
   * @param {Boolean} options.populate If setted to true, will populate and subPopulate the returned document
   * @returns {Document}
   */
  async objectToDocument(obj, { populate = true } = {}) {
    let doc =
      // We already have a document of this model
      obj instanceof this.entityInfo.model
        ? obj
        : obj._id
        ? // If obj has an id, then load the doc from db
          await this.entityInfo.model.findById(
            // Cast _id to correct type
            this.entityInfo.model.schema.path('_id').options.type(obj._id)
          )
        : // else just instantiate a new one
          new this.entityInfo.model(obj);

    // If id has not been found then this must be a new model
    doc = doc || new this.entityInfo.model(obj);

    if (populate) {
      if (this.populationOptions.length > 0)
        await this.entityInfo.model.populate(doc, this.populationOptions);
      if (this.subPopulationOptions.length > 0) await doc.subPopulate(this.subPopulationOptions);
    }

    return doc;
  }

  /**
   * Default mongoose document toJSON doesn't support async, so this custom method will have the same purpose.
   * Transform mongoose document to raw object.
   * @param {Document} document
   * @param {Object} options
   * @param {String[]} options.virtuals the list of virtuals that must be included (by default, all are included)
   * @returns {Object}
   */
  async documentToObject(document, { virtuals } = { virtuals: null }) {
    if (!document) return null;
    if (!(document instanceof this.entityInfo.model))
      document = await this.objectToDocument(new this.entityInfo.model(document), {
        populate: true,
      });

    // Mongoose base toObject method
    const obj = document.toObject({
      transform: (_, ret) => {
        // Hide sensible info
        Object.keys(this.entityInfo.model.schema.obj).forEach((field) => {
          // We can't send the information directly on the client, it can only be set
          if (this.entityInfo.model.schema.obj[field].sensible) delete ret[field];
        });

        // Remove this virtual (_id will be always used)
        delete ret.id;
      },
    });

    // Support for async virtuals
    for (let virtual in this.entityInfo.model.schema.virtuals) {
      if (virtuals === null || virtuals.indexOf(virtual) > -1) {
        let value = document.get(virtual);
        // If is an async virtual then await for its value
        if (value instanceof Promise) value = await value;
        // Set value to the resulting
        obj[virtual] = value;
      }
    }

    return obj;
  }

  //#endregion

  //#region Current Document handling
  /**
   * Load current document if needed and returns it
   */
  async getCurrentDocument() {
    if (this.currentDocumentId === null || this.currentDocumentId === undefined)
      return (this.currentDocument = null);

    if (this.currentDocument && this.currentDocumentId === this.currentDocument._id)
      return this.currentDocument;

    return (this.currentDocument = await this.objectToDocument(
      { _id: this.currentDocumentId },
      { populate: true }
    ));
  }

  /**
   * Set the new current document and emit the corrispective event
   * @param {Object} newCurrentDocument
   * @param {Component} sender Sender of the event
   */
  setCurrentDocument(newCurrentDocument, sender) {
    this.currentDocument = newCurrentDocument;
    this.currentDocumentId = newCurrentDocument ? newCurrentDocument._id : null;
    this.emitEvent('currentDocumentChanged', sender);
  }
  //#endregion

  //#region Private load handling
  /**
   * Build query for filling the DataTable
   */
  async buildQuery() {
    // Find documents
    let query = this.entityInfo.model.find(this.findOptions);

    // Projection
    if (this.selectionOptions) query = query.select(this.selectionOptions);

    query = this.additionalBuildQuery ? this.additionalBuildQuery(query) : query;

    /**
     *  These will be expensive in computation, so we execute them in last place
     */

    if (this.populationOptions.length > 0)
      // Populate refs
      query = query.populate(
        // Only take populationOptions that are inclused in selectionOptions
        this.populationOptions.filter(
          ({ path }) => Ɂ(this.selectionOptions[path]) || this.selectionOptions[path] === 1
        )
      );

    if (this.subPopulationOptions.length > 0)
      // SubPopulate refs
      query = query.subPopulate(
        // Only take subPopulationOptions that are inclused in selectionOptions
        this.subPopulationOptions.filter(
          ({ path }) => Ɂ(this.selectionOptions[path]) || this.selectionOptions[path] === 1
        )
      );

    return query;
  }

  /**
   * Fill the DataTable with all documents of the entity
   */
  async fill() {
    this.assert(
      this.canRead,
      `The user hasn't got the privilege to read on the entity  '${
        this.entityInfo.entity.description || this.entityInfo.entity._id
      }'`
    );

    // If these change, the fill result changes
    const fillProps = [
      this.findOptions,
      this.populationOptions,
      this.subPopulationOptions,
      this.selectionOptions,
      this.additionalBuildQuery,
    ];

    // Check if we have this query result already in cache
    const fillResult = await this.cache.getByProps('fillResult', fillProps);
    this.documents = fillResult || (await this.buildQuery());

    // Cache result for max 2 minutes
    this.cache.setWithProps('fillResult', fillProps, this.documents, '120s');
  }
  //#endregion

  //#region Life Cycle
  // Load all data
  async load() {
    // Set permissions
    this.canRead = await this.auth.checkPermission(
      this.entityInfo.entity._id,
      UserPermission.PermissionType.Read
    );

    this.canEdit = await this.auth.checkPermission(
      this.entityInfo.entity._id,
      UserPermission.PermissionType.Edit
    );

    this.canAdd = await this.auth.checkPermission(
      this.entityInfo.entity._id,
      UserPermission.PermissionType.Add
    );

    this.canDelete = await this.auth.checkPermission(
      this.entityInfo.entity._id,
      UserPermission.PermissionType.Delete
    );

    // Load all documents
    await this.fill();

    this.emitEvent('load');
  }

  async serialize() {
    return {
      ...(await super.serialize()),
      documents: this.documents || [],
      fields: this.getFields(),
      virtualFields: this.getVirtualFields(),
      canRead: this.canRead,
      canEdit: this.canEdit,
      canAdd: this.canAdd,
      canDelete: this.canDelete,
    };
  }
  //#endregion
}

module.exports = DataTable;
