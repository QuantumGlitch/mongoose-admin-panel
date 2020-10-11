const { ʖɁ } = require('../../utilities/global');

const DataTable = require('./DataTable');

const { getById } = require('../../models/entity');

class SubDataTable extends DataTable {
  constructor({ auth, entityName, subPath, constraintDocument }) {
    super({ auth, entityName });

    // TODO: handle deeper subPaths
    this.assert(
      this.entityInfo.model.schema.obj[subPath].type instanceof Array,
      'subPath not valid for SubDataTable (it must be an array)'
    );

    this.subPathSchemaType = this.entityInfo.model.schema.path(subPath);
    this.arrayOfObjects = !this.subPathSchemaType.options.type[0].type;
    this.arrayOfReferences = !!this.subPathSchemaType.options.type[0].ref;

    this.subPath = subPath;
    this.constraintDocument = constraintDocument;
  }

  async buildQuery() {
    let query;
    let pipeline;

    if (this.arrayOfObjects) {
      const project = {};
      this.getFields().forEach((f) => (project[f.name] = `$${this.subPath}.${f.name}`));
      project['_id'] = `$${this.subPath}._id`;

      pipeline = [
        // First match the correct document constrained
        {
          $match: { _id: this.constraintDocument._id || this.constraintDocument },
        },
        // Unwind the subPath
        {
          $unwind: `$${this.subPath}`,
        },
        // Project all fields to root
        {
          $project: project,
        },
        ...(this.findOptions
          ? // Find all subDocuments based on findOptions
            [{ $match: this.findOptions }]
          : []),
      ];
    } else if (this.arrayOfReferences) {
      pipeline = [
        // First match the correct document constrained
        {
          $match: { _id: this.constraintDocument._id || this.constraintDocument },
        },
        // Unwind the subPath
        {
          $unwind: `$${this.subPath}`,
        },
        // Transform in a collection of ids
        {
          $replaceRoot: { newRoot: { _id: `$${this.subPath}` } },
        },
        // Lookup from the referenced collection (transform ids to documents)
        {
          $lookup: {
            // Get collection's name of the refs
            from: getById(this.subPathSchemaType.options.type[0].ref).model.collection
              .collectionName,
            localField: '_id',
            foreignField: '_id',
            as: 'lookupOne',
          },
        },
        // Extract only the interested data
        {
          $unwind: '$lookupOne',
        },
        // Finally we have a collection of referenced documents
        {
          $replaceRoot: { newRoot: '$lookupOne' },
        },
        ...(this.findOptions
          ? // Find all subDocuments based on findOptions
            [{ $match: this.findOptions }]
          : []),
      ];
    }

    // Find documents
    query = this.entityInfo.model.aggregate(pipeline);

    // Populate refs
    // query.populate(this.populationOptions);

    // Projection
    // if (this.selectionOptions) query = query.select(this.selectionOptions);

    return this.additionalBuildQuery ? this.additionalBuildQuery(query) : query;
  }

  async fill() {
    this.assert(
      this.canRead,
      `The user hasn't got the privilege to read on the entity  '${
        this.entityInfo.entity.description || this.entityInfo.entity._id
      }'`
    );

    this.documents = await this.buildQuery();
  }

  /**
   * Utility for transforming raw object to mongoose document (of the entity of this datatable)
   * N.B:
   *  In this case we need to take or generate a sub document
   *  This must be called after this.load
   * @param {Object|Document} obj
   * @param {Object} options
   *
   * @returns {Document}
   */
  async objectToDocument(obj) {
    return this.documents.find((d) => d._id === obj._id);
  }

  // get subPath's fields
  getFields() {
    if (this._fields) return this._fields;

    if (this.arrayOfObjects)
      this._fields = DataTable.formatSchemaObject(
        /* 
          Take this.subPathSchemaType.options.type[0].obj if defined 
          else this.subPathSchemaType.options.type[0] 
        */
        ʖɁ(this.subPathSchemaType.options.type[0], 'obj')
      );
    else if (this.arrayOfReferences) {
      // Use the referenced schema for the fields
      this._fields = DataTable.formatSchema(
        getById(this.subPathSchemaType.options.type[0].ref).model.schema
      );
    }

    return this._fields;
  }
}

module.exports = SubDataTable;
