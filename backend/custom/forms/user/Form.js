const ConstrainedForm = require('../../../core/forms/ConstrainedForm');

// Customize ConstrainedForm
class UserForm extends ConstrainedForm {
  constructor({ auth, initialization, parameters }) {
    super({
      auth,
      initialization,
      parameters,
      title: 'Users',
      mainEntityName: 'User',
      secondaryEntities: [
        {
          entityName: 'UserPermission',
          foreignKey: 'user',
        },
      ],
    });
  }
}

module.exports = UserForm;
