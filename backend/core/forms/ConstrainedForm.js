const Form = require('./Form');

const DataTable = require('../data/DataTable');
const ForeignDataTable = require('../data/ForeignDataTable');

const Grid = require('../components/Grid/Advanced');
const Detail = require('../components/Detail');
const Tabs = require('../components/Tabs');

const Entity = require('../../models/entity');

/**
 * This class will be used for showing the main entity in the first tab
 * and the secondary entities in the other tabs, all constrained by foreign keys.
 */
class ConstrainedForm extends Form {
  constructor({ auth, title, initialization, parameters, mainEntityName, secondaryEntities = [] }) {
    super({ auth, title, initialization });
    this.parameters = parameters;

    this.assert(secondaryEntities.length > 0, 'You must provide secondary entities.');

    // Primary DataTable
    const primaryDataTable = new DataTable({ auth, entityName: mainEntityName });

    // Secondary DataTables
    const secondaryDataTables = secondaryEntities.map(
      (sE) =>
        new ForeignDataTable({
          auth,
          foreignEntityName: sE.entityName,
          foreignKey: sE.foreignKey,
          primaryDataTable,
          primaryKey: sE.primaryKey,
        })
    );

    // Primary Grid
    const primaryGrid = new Grid({ dataTable: primaryDataTable, initialization });
    this.primaryGrid = primaryGrid;

    // Secondary Grids
    const secondaryGrids = secondaryDataTables.map(
      (secondaryDataTable) => new Grid({ dataTable: secondaryDataTable, initialization })
    );
    this.secondaryGrids = secondaryGrids;

    // Primary Detail
    const primaryDetail = new Detail({
      dataTable: primaryDataTable,
      auth,
      initialization,
    });

    // Secondary Details
    const secondaryDetails = secondaryDataTables.map(
      (secondaryDataTable) => new Detail({ dataTable: secondaryDataTable, auth, initialization })
    );

    const tabs = new Tabs();

    // Primary tab
    tabs.addTab({
      components: [primaryDetail, primaryGrid],
      title: 'Main',
    });

    this.secondaryTabs = [];

    // Set secondary tabs
    for (let s = 0; s < secondaryEntities.length; s++) {
      const entityInfo = Entity.getById(secondaryEntities[s].entityName);
      const title =
        secondaryEntities[s].title || entityInfo.entity.description || entityInfo.entity._id;

      this.secondaryTabs.push(
        tabs.addTab({
          components: [secondaryDetails[s], secondaryGrids[s]],
          title,
        })
      );
    }

    this.children = [tabs, primaryDataTable, ...secondaryDataTables];
  }

  showOrHideSecondaryTabs() {
    this.synchronizer.waiter().then(() => {
      /* 
        If there is no document loaded in the primaryDataTable 
        Then we need to hide the secondary tabs else show them
      */
      this.secondaryTabs.forEach(
        (tab) => (tab.visible = !!this.primaryGrid.dataTable.currentDocumentId)
      );
    });
  }

  async load() {
    // After all components have been loaded
    this.showOrHideSecondaryTabs();

    // If there is an url parameter 'id' then use it to switch on the grid
    if (this.initialization && this.parameters && this.parameters.id) {
      this.primaryGrid.currentDocumentId = this.parameters.id;
      this.primaryGrid.dataTable.setCurrentDocument({ _id: this.parameters.id });
    }

    await super.load();
  }

  async execute() {
    // After all components have been executed
    this.showOrHideSecondaryTabs();

    return super.execute();
  }
}

module.exports = ConstrainedForm;
