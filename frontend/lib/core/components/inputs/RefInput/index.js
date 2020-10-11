function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import React, { useState } from 'react';
import { Link, X } from 'react-feather';
import { Label, FormGroup, InputGroup, InputGroupAddon, Input, FormFeedback, Button } from 'reactstrap';
import Dialog from './Dialog';
import { formatField } from '../../../utils/fields';
import { useField } from '../shared/hooks';
/* 
    This input reference another Entity, so it must open a dialog on the Entity
    from which the user can choose a document
*/

export default function RefInput({
  document,
  emitter,
  fieldInfo,
  onChange,
  validationError,
  fieldBehaviours,
  label = true
}) {
  const {
    readOnly,
    required
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
  return /*#__PURE__*/React.createElement(FormGroup, null, !readOnly && /*#__PURE__*/React.createElement(Dialog, {
    onChange: value => {
      if (value) onChangeMiddleware(value);
      setDialogOpen(false);
    },
    open: dialogOpen,
    reference: ref,
    constraint: { ...(fieldInfo.filters ? {
        filters: fieldInfo.filters
      } : {})
    }
  }), label && /*#__PURE__*/React.createElement(Label, null, fieldInfo.description), /*#__PURE__*/React.createElement(InputGroup, null, !readOnly && /*#__PURE__*/React.createElement(InputGroupAddon, {
    addonType: "prepend"
  }, /*#__PURE__*/React.createElement(Button, {
    onClick: () => setDialogOpen(true)
  }, /*#__PURE__*/React.createElement(Link, {
    size: "16px"
  }))), !required && !readOnly && /*#__PURE__*/React.createElement(InputGroupAddon, {
    addonType: "prepend"
  }, /*#__PURE__*/React.createElement(Button, {
    onClick: () => onChangeMiddleware(null),
    color: 'warning'
  }, /*#__PURE__*/React.createElement(X, {
    size: "16px"
  }))), /*#__PURE__*/React.createElement(Input, _extends({}, customValidationError || validationError ? {
    invalid: true
  } : {}, {
    readOnly: true,
    value: formatField(fieldInfo, fieldValue)
  })), (customValidationError || validationError) && /*#__PURE__*/React.createElement(FormFeedback, {
    className: "d-block"
  }, (customValidationError || validationError).message)));
}