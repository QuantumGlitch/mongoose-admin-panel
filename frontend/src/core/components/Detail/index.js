import React, { useState, useRef, useEffect, useCallback } from 'react';
import EventEmitter from 'event-emitter';

import { FormGroup, Button, Alert, Input, Label } from 'reactstrap';

import Messages from '../../../services/Messages';

import GenericInput from '../inputs/GenericInput';

import { getFieldDefaultValue } from '../../utils/fields';
import useEffectDeepEqual from '../../../hooks/effect-deep-equal';

function getButtonIcon(iconName) {
  const Icon = require('react-feather')[iconName] || require('react-feather').Activity;
  return <Icon className="mr-2" size="15px" />;
}

// Serialize the client-side component to server-side configuration
function serializeDetail({ action, currentDocument }) {
  return { action, currentDocument };
}

// take currentDocument and if is a new doc, set undefined fields with default values
function defaultDocument(document, fieldsInfo) {
  const doc = document ? { ...document } : null;

  // Is a new doc
  if (doc && !doc._id)
    fieldsInfo.forEach((fieldInfo) => {
      if (doc[fieldInfo.name] === undefined) doc[fieldInfo.name] = getFieldDefaultValue(fieldInfo);
    });

  return doc;
}

export default function Detail({
  id,
  bus,
  dataTable,
  errors,
  warnings,
  validationErrors,
  currentDocument,
  actions,
  fieldsBehaviours,
  visibleFields,
}) {
  // useTraceUpdate(
  //   {
  //     id,
  //     bus,
  //     dataTable,
  //     errors,
  //     warnings,
  //     validationErrors,
  //     currentDocument,
  //     actions,
  //     fieldsBehaviours,
  //   },
  //   'Detail'
  // );

  const [currentDocumentState, setCurrentDocumentState] = useState(null);

  // If the server change the document, then we must set the new current document state
  useEffectDeepEqual(() => {
    //console.log('Server Changed Document', currentDocument);
    setCurrentDocumentState(defaultDocument(currentDocument, dataTable.fields));
  }, [currentDocument]);

  //#region Events
  const emitter = useRef(EventEmitter());

  /**
   * Listen on emitter for sending action ( This can be triggered by fields, if they need recalculations by the server )
   */
  const actionSenderListener = useCallback(
    (action) => {
      bus
        .serialize(
          id,
          serializeDetail({
            action,
            currentDocument: currentDocumentState,
          })
        )
        .submit();
    },
    [bus, id, currentDocumentState]
  );

  useEffect(() => {
    // Setup
    emitter.current.on('sendAction', actionSenderListener);

    // Cleanup
    return () => emitter.current.off('sendAction', actionSenderListener);
  }, [actionSenderListener]);
  //#endregion

  function changeFieldValue(fieldName, value) {
    //console.log('Client Changed Document', fieldName, value);
    currentDocumentState[fieldName] = value;
    emitter.current.emit('fieldChanged', fieldName, value);
  }

  bus.serialize(id, serializeDetail({ currentDocument: currentDocumentState }));

  return (
    <div className="row">
      <div className="col-md-12 grid-margin stretch-card">
        <div className="card">
          <div className="card-body">
            {currentDocumentState ? (
              <div className="row">
                {visibleFields.map((fieldName, k) => {
                  // %% this is the prefix for special fields names
                  // They are used for layout
                  if (fieldName.startsWith('%%blankRow'))
                    return <div className="col-md-12 mt-4"></div>;

                  let field;
                  if ((field = dataTable.fields.find(({ name }) => name === fieldName))) {
                    // This field is a normal field

                    const validationError =
                      validationErrors &&
                      validationErrors.length > 0 &&
                      validationErrors.find((e) => e.name === field.name);

                    return (
                      <div
                        className={`${
                          // ObjectInput
                          (field.kind === 'Object' ||
                            // TextArea
                            field.kind === 'LongText' ||
                            // HTML Editor
                            field.kind === 'HTML' ||
                            // ModelDefinition
                            field.kind === 'ModelDefinition' ||
                            // ListInput not in dialog
                            (field.kind === 'Array' && field.view === 'Default')) &&
                          !field.ref &&
                          !field.subRef
                            ? 'col-md-12'
                            : 'col-md-6'
                        } form-group`}
                        key={k}
                      >
                        <GenericInput
                          /* For making all inputs accessing other inputs */
                          document={currentDocumentState}
                          fields={dataTable.fields}
                          emitter={emitter.current}
                          /* Specifics for this input */
                          fieldInfo={field}
                          onChange={(value) => changeFieldValue(field.name, value)}
                          validationError={validationError}
                          fieldBehaviours={fieldsBehaviours && fieldsBehaviours[field.name]}
                        />
                      </div>
                    );
                  } else if (
                    (field = dataTable.virtualFields.find(({ name }) => name === fieldName))
                  ) {
                    // This field is a virtual field
                    return (
                      <div className="col-md-6 form-group" key={k}>
                        <Label>{field.description}</Label>
                        <Input disabled={true} value={currentDocument[field.name]} />
                      </div>
                    );
                  } else return null;
                })}
              </div>
            ) : (
              <span className="mt-2">No record selected</span>
            )}

            {actions && actions.length > 0 && (
              <FormGroup className="mt-2">
                {actions.map(({ action, link, label, icon, color, askConfirm }, k) => (
                  <Button
                    key={k}
                    className="mr-2"
                    color={color}
                    onClick={() => {
                      const launchAction = () => {
                        if (link) window.open(link, '_blank');
                        else
                          bus
                            .serialize(
                              id,
                              serializeDetail({
                                action,
                                currentDocument: currentDocumentState,
                              })
                            )
                            .submit();
                      };

                      if (askConfirm)
                        Messages.confirmDialog({
                          title: `Confirm the operation: ${label}`,
                          message: 'Are you sure that you want to continue ?',
                          confirm: launchAction,
                        });
                      else launchAction();
                    }}
                  >
                    {icon && getButtonIcon(icon)}
                    {label}
                  </Button>
                ))}
              </FormGroup>
            )}

            {errors && errors.length > 0 && (
              <Alert className="mt-4 mb-0" color="danger">
                <ul className="m-0">
                  {errors.map((e, k) => (
                    <li key={k}>{e}</li>
                  ))}
                </ul>
              </Alert>
            )}

            {validationErrors && validationErrors.length > 0 && (
              <Alert className="mt-4 mb-0" color="danger">
                <ul className="m-0">
                  {validationErrors.map((e, k) => (
                    <li key={k}>{e.message}</li>
                  ))}
                </ul>
              </Alert>
            )}

            {warnings && warnings.length > 0 && (
              <Alert className="mt-2 mb-0" color="warning">
                <ul className="m-0">
                  {warnings.map((e, k) => (
                    <li key={k}>{e}</li>
                  ))}
                </ul>
              </Alert>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
