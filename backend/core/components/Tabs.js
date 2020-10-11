const Component = require('./Component');

// This class will be used only for viewing purpose on the frontend
module.exports = class Tabs extends Component {
  constructor(...args) {
    super(...args);

    this.tabs = [];
  }

  /**
   * @typedef {Object} Tab
   * @prop {Component[]} refs
   * @prop {String} title
   * @param {Boolean} visible
   */

  /**
   * @param {Object} Tab
   * @param {Component[]} Tab.components
   * @param {String} Tab.title
   * @param {Boolean} [Tab.visible=true]
   * @returns {Tab}
   */
  addTab({ components, title, visible = true }) {
    this.children = [...this.children, ...components];
    this.tabs.push({ refs: components, title, visible });
    return this.tabs[this.tabs.length - 1];
  }

  async serialize() {
    return {
      ...(await super.serialize()),
      tabs: this.tabs.map((t) => ({ ...t, refs: t.refs.map((c) => c.refId) })),
    };
  }
};
