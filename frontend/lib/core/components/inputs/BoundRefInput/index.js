function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import React, { useState, useEffect } from 'react';
import { Link, X } from 'react-feather';
import { Label, InputGroup, InputGroupAddon, Input, FormFeedback, Button } from 'reactstrap';
import { Ɂ } from '../../../../global';
import { formatField } from '../../../utils/fields';
import { useField } from '../shared/hooks';
import Dialog from '../RefInput/Dialog';
/* 
    This input reference another Entity, so it must open a dialog on the Entity
    from which the user can choose a document
*/

export default function BoundRefInput({
  document,
  emitter,
  fields,
  fieldInfo,
  onChange,
  validationError,
  fieldBehaviours,
  label = true
}) {
  const {
    readOnly,
    required,
    boundTo
  } = fieldInfo;
  const ref = fieldInfo.ref || fieldInfo.subRef;
  const [dialogOpen, setDialogOpen] = useState(false);
  const {
    fieldValue,
    onChangeMiddleware,
    validationError: customValidationError
  } = useField({
    document,
    emitter,
    fieldInfo,
    fieldBehaviours,
    onChange
  });
  const fieldBoundTo = fields.find(({
    name
  }) => name === boundTo); // Value to which this field is bound

  const [boundToValue, setBoundToValue] = useState(document[fieldBoundTo.name]);
  const [boundValidationError, setBoundValidationError] = useState(null);
  useEffect(() => {
    // Emitter is available
    if (emitter) {
      const listener = (fieldName, newFieldValue) => {
        /* 
          When someone changes value for the field to which the current field is bound to, 
          then set to null the current field's value, because the reference is no longer mantained. 
        */
        if (fieldName === boundTo) {
          setBoundToValue(newFieldValue);
          onChangeMiddleware(null);
        }
      }; // Setup listener on mount


      emitter.on('fieldChanged', listener); // Cleanup listener on unmount

      return () => emitter.off('fieldChanged', listener);
    }
  }, [boundTo, setBoundToValue, onChangeMiddleware]); // On server changes current document

  useEffect(() => {
    setBoundToValue(document[fieldBoundTo.name]);
  }, [document]);
  if (!ref.startsWith(fieldBoundTo.ref)) throw new Error("Using BoundRefInput with different ref. (RefInput's ref !== BoundRefInput's ref)");
  return /*#__PURE__*/React.createElement(React.Fragment, null, !readOnly && /*#__PURE__*/React.createElement(Dialog, {
    onChange: value => {
      if (value) onChangeMiddleware(value);
      setDialogOpen(false);
    },
    open: dialogOpen,
    reference: fieldBoundTo.ref,
    constraint: {
      path: ref.substring(fieldBoundTo.ref.length + 1),
      document: boundToValue
    }
  }), label && /*#__PURE__*/React.createElement(Label, null, fieldInfo.description), /*#__PURE__*/React.createElement(InputGroup, null, !readOnly && /*#__PURE__*/React.createElement(InputGroupAddon, {
    addonType: "prepend"
  }, /*#__PURE__*/React.createElement(Button, {
    onClick: () => {
      if (Ɂ(boundToValue)) setBoundValidationError({
        message: `Before you need to choose a value for the field '${fieldBoundTo.description}'.`
      });else {
        setBoundValidationError(null);
        setDialogOpen(true);
      }
    }
  }, /*#__PURE__*/React.createElement(Link, {
    size: "16px"
  }))), !required && !readOnly && /*#__PURE__*/React.createElement(InputGroupAddon, {
    addonType: "prepend"
  }, /*#__PURE__*/React.createElement(Button, {
    onClick: () => onChangeMiddleware(null),
    color: 'warning'
  }, /*#__PURE__*/React.createElement(X, {
    size: "16px"
  }))), /*#__PURE__*/React.createElement(Input, _extends({}, boundValidationError || customValidationError || validationError ? {
    invalid: true
  } : {}, {
    readOnly: true,
    value: formatField(fieldInfo, fieldValue)
  })), (boundValidationError || customValidationError || validationError) && /*#__PURE__*/React.createElement(FormFeedback, {
    className: "d-block"
  }, (boundValidationError || customValidationError || validationError).message)));
}