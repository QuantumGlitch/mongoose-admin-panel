const Component = require('../components/Component');

/*
 * This is the base class for handling entities server-side,
 * interacting with the corrispective client-side component
 */
class Form extends Component {
  constructor({ auth, title, initialization, parameters }) {
    super({ auth, initialization });
    this.title = title;
  }

  async serialize() {
    return { ...(await super.serialize()), title: this.title };
  }
}

module.exports = Form;
