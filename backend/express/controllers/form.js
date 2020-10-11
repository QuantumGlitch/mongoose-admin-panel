const path = require('path');
const assert = require('assert');

const { assertUserAuthenticated } = require('../../services/auth');

const Entity = require('../../models/entity');
const { logError } = require('../../models/log');

const DefaultForm = require('../../core/forms/DefaultForm');
const RefForm = require('../../core/forms/RefForm');

// Forms helpers for controller's actions
async function instantiateFormByEntity(FormType, req, res) {
  const entityInfo = Entity.getById(req.params.entity) || Entity.getByPath(req.params.entity);

  assert(entityInfo, 'Page not found');

  const initialization = !req.body.configuration;
  const form = new FormType({
    auth: req.auth,
    entityName: entityInfo.entity._id,
    title: entityInfo.entity.description,
    initialization,
    parameters: { ...req.query, ...req.body.parameters },
  });

  return form;
}

// parse client-side configuration, execute form's actions
async function postForm(form, req, res) {
  try {
    // Parse new config from client
    if (req.body.configuration) await form.parse(req.body.configuration);

    // Synchronize form's components
    form.sync();

    // Initialize waiter
    let syncWaiter = form.synchronizer.waiter();

    // Load the form's components
    form.load();

    // Make sure that all the loading promises stop
    await syncWaiter;

    // Execute actions on this new config
    if (req.body.configuration) {
      // Initialize waiter again
      syncWaiter = form.synchronizer.waiter();

      // Execute actions and final operations before sending back
      form.execute();

      // Make sure that all the loading and actions executing promises stop
      await syncWaiter;
    }

    const configuration = await form.serialize();
    return res.json({ ok: true, configuration });
  } catch (e) {
    logError(e, { req: { url: req.originalUrl, body: req.body }, auth: req.auth });
    return res.json({ ok: false, error: e.message });
  }
}

const configuration = require('../../configuration');

// Standard forms for generating actions
configuration.standardForms.push(
  { url: 'default-form', type: DefaultForm },
  { url: 'ref-form', type: RefForm }
);

// Standard forms factories
const standardFormsActions = configuration.standardForms
  .map(({ url, type }) => ({
    method: 'post',
    url: `/${url}/:entity/`,
    handlers: [
      assertUserAuthenticated,
      async (req, res) => await postForm(await instantiateFormByEntity(type, req, res), req, res),
    ],
  }))
  .flat();

configuration.customFormPaths.push(path.join(__dirname, '../../', 'custom', 'forms'));

// Controller's actions
module.exports = [
  ...standardFormsActions,
  // Custom forms factories
  {
    method: 'post',
    url: '/:form',
    handlers: [
      assertUserAuthenticated,
      async (req, res) => {
        try {
          const initialization = !req.body.configuration;

          let Form;
          for (const customFormPath of configuration.customFormPaths)
            try {
              if ((Form = require(path.join(customFormPath, req.params.form, 'Form.js')))) break;
            } catch {}

          assert(typeof Form === 'function', "Form can't be found");

          const form = new Form({
            auth: req.auth,
            initialization,
            parameters: { ...req.query, ...req.body.parameters },
          });

          await postForm(form, req, res);
        } catch (e) {
          logError(e, { req: { url: req.originalUrl, body: req.body }, auth: req.auth });
          return res.json({ ok: false, error: e.message });
        }
      },
    ],
  },
];
