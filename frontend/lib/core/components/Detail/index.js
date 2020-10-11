import React, { useState, useRef, useEffect, useCallback } from 'react';
import EventEmitter from 'event-emitter';
import { FormGroup, Button, Alert, Input, Label } from 'reactstrap';
import Messages from '../../../services/Messages';
import GenericInput from '../inputs/GenericInput';
import { getFieldDefaultValue } from '../../utils/fields';
import useEffectDeepEqual from '../../../hooks/effect-deep-equal';

function getButtonIcon(iconName) {
  const Icon = require('react-feather')[iconName] || require('react-feather').Activity;

  return /*#__PURE__*/React.createElement(Icon, {
    className: "mr-2",
    size: "15px"
  });
} // Serialize the client-side component to server-side configuration


function serializeDetail({
  action,
  currentDocument
}) {
  return {
    action,
    currentDocument
  };
} // take currentDocument and if is a new doc, set undefined fields with default values


function defaultDocument(document, fieldsInfo) {
  const doc = document ? { ...document
  } : null; // Is a new doc

  if (doc && !doc._id) fieldsInfo.forEach(fieldInfo => {
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
  visibleFields
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
  const [currentDocumentState, setCurrentDocumentState] = useState(null); // If the server change the document, then we must set the new current document state

  useEffectDeepEqual(() => {
    //console.log('Server Changed Document', currentDocument);
    setCurrentDocumentState(defaultDocument(currentDocument, dataTable.fields));
  }, [currentDocument]); //#region Events

  const emitter = useRef(EventEmitter());
  /**
   * Listen on emitter for sending action ( This can be triggered by fields, if they need recalculations by the server )
   */

  const actionSenderListener = useCallback(action => {
    bus.serialize(id, serializeDetail({
      action,
      currentDocument: currentDocumentState
    })).submit();
  }, [bus, id, currentDocumentState]);
  useEffect(() => {
    // Setup
    emitter.current.on('sendAction', actionSenderListener); // Cleanup

    return () => emitter.current.off('sendAction', actionSenderListener);
  }, [actionSenderListener]); //#endregion

  function changeFieldValue(fieldName, value) {
    //console.log('Client Changed Document', fieldName, value);
    currentDocumentState[fieldName] = value;
    emitter.current.emit('fieldChanged', fieldName, value);
  }

  bus.serialize(id, serializeDetail({
    currentDocument: currentDocumentState
  }));
  return /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "col-md-12 grid-margin stretch-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card-body"
  }, currentDocumentState ? /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, visibleFields.map((fieldName, k) => {
    // %% this is the prefix for special fields names
    // They are used for layout
    if (fieldName.startsWith('%%blankRow')) return /*#__PURE__*/React.createElement("div", {
      className: "col-md-12 mt-4"
    });
    let field;

    if (field = dataTable.fields.find(({
      name
    }) => name === fieldName)) {
      // This field is a normal field
      const validationError = validationErrors && validationErrors.length > 0 && validationErrors.find(e => e.name === field.name);
      return /*#__PURE__*/React.createElement("div", {
        className: `${// ObjectInput
        (field.kind === 'Object' || // TextArea
        field.kind === 'LongText' || // HTML Editor
        field.kind === 'HTML' || // ModelDefinition
        field.kind === 'ModelDefinition' || // ListInput not in dialog
        field.kind === 'Array' && field.view === 'Default') && !field.ref && !field.subRef ? 'col-md-12' : 'col-md-6'} form-group`,
        key: k
      }, /*#__PURE__*/React.createElement(GenericInput
      /* For making all inputs accessing other inputs */
      , {
        document: currentDocumentState,
        fields: dataTable.fields,
        emitter: emitter.current
        /* Specifics for this input */
        ,
        fieldInfo: field,
        onChange: value => changeFieldValue(field.name, value),
        validationError: validationError,
        fieldBehaviours: fieldsBehaviours && fieldsBehaviours[field.name]
      }));
    } else if (field = dataTable.virtualFields.find(({
      name
    }) => name === fieldName)) {
      // This field is a virtual field
      return /*#__PURE__*/React.createElement("div", {
        className: "col-md-6 form-group",
        key: k
      }, /*#__PURE__*/React.createElement(Label, null, field.description), /*#__PURE__*/React.createElement(Input, {
        disabled: true,
        value: currentDocument[field.name]
      }));
    } else return null;
  })) : /*#__PURE__*/React.createElement("span", {
    className: "mt-2"
  }, "No record selected"), actions && actions.length > 0 && /*#__PURE__*/React.createElement(FormGroup, {
    className: "mt-2"
  }, actions.map(({
    action,
    link,
    label,
    icon,
    color,
    askConfirm
  }, k) => /*#__PURE__*/React.createElement(Button, {
    key: k,
    className: "mr-2",
    color: color,
    onClick: () => {
      const launchAction = () => {
        if (link) window.open(link, '_blank');else bus.serialize(id, serializeDetail({
          action,
          currentDocument: currentDocumentState
        })).submit();
      };

      if (askConfirm) Messages.confirmDialog({
        title: `Confirm the operation: ${label}`,
        message: 'Are you sure that you want to continue ?',
        confirm: launchAction
      });else launchAction();
    }
  }, icon && getButtonIcon(icon), label))), errors && errors.length > 0 && /*#__PURE__*/React.createElement(Alert, {
    className: "mt-4 mb-0",
    color: "danger"
  }, /*#__PURE__*/React.createElement("ul", {
    className: "m-0"
  }, errors.map((e, k) => /*#__PURE__*/React.createElement("li", {
    key: k
  }, e)))), validationErrors && validationErrors.length > 0 && /*#__PURE__*/React.createElement(Alert, {
    className: "mt-4 mb-0",
    color: "danger"
  }, /*#__PURE__*/React.createElement("ul", {
    className: "m-0"
  }, validationErrors.map((e, k) => /*#__PURE__*/React.createElement("li", {
    key: k
  }, e.message)))), warnings && warnings.length > 0 && /*#__PURE__*/React.createElement(Alert, {
    className: "mt-2 mb-0",
    color: "warning"
  }, /*#__PURE__*/React.createElement("ul", {
    className: "m-0"
  }, warnings.map((e, k) => /*#__PURE__*/React.createElement("li", {
    key: k
  }, e))))))));
}