function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import React, { useState } from 'react';
import { Search } from 'react-feather';
import { Input, InputGroup, InputGroupAddon, Button, FormFeedback, Label, FormGroup } from 'reactstrap';
import DefaultView from './Default';
import DialogView from './Dialog';
import { useField } from '../shared/hooks'; // Choose the right input's element for the DataTable's field

export default function ListInput({
  document,
  emitter,
  fieldInfo,
  onChange,
  validationError,
  fieldBehaviours,
  label = true
}) {
  // Dialog is the default view for this component
  const view = fieldInfo.view || 'Dialog';
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
  return /*#__PURE__*/React.createElement(React.Fragment, null, view === 'Dialog' && /*#__PURE__*/React.createElement(DialogView, _extends({
    onChange: value => {
      if (value) onChangeMiddleware(value);
    },
    open: dialogOpen
  }, {
    setDialogOpen,
    fieldInfo,
    fieldValue,
    validationError
  })), label && /*#__PURE__*/React.createElement(Label, null, fieldInfo.description), view === 'Default' && /*#__PURE__*/React.createElement(FormGroup, {
    tag: 'fieldset',
    className: 'p-4 pt-2 pb-2',
    ...(customValidationError || validationError ? {
      style: {
        borderColor: 'var(--danger)'
      }
    } : {})
  }, /*#__PURE__*/React.createElement(DefaultView, {
    fieldInfo,
    fieldValue,
    onChange: onChangeMiddleware,
    validationError
  })), view === 'Dialog' && /*#__PURE__*/React.createElement(InputGroup, null, /*#__PURE__*/React.createElement(InputGroupAddon, {
    addonType: "prepend"
  }, /*#__PURE__*/React.createElement(Button, {
    onClick: () => setDialogOpen(true)
  }, /*#__PURE__*/React.createElement(Search, {
    size: "16px"
  }))), /*#__PURE__*/React.createElement(Input, _extends({}, validationError || customValidationError ? {
    invalid: true
  } : {}, {
    readOnly: true,
    value: fieldValue ? `Inspect - ( ${fieldValue.length} elements )` : '[ NULL ]'
  }))), (customValidationError || validationError) && /*#__PURE__*/React.createElement(FormFeedback, {
    className: "d-block"
  }, (customValidationError || validationError).message));
}