function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import React, { useState } from 'react';
import { Input, InputGroup, InputGroupAddon, Button, FormFeedback, Label, Modal, ModalBody, ModalHeader } from 'reactstrap';
import { X, Search } from 'react-feather';
import { useField } from './shared/hooks';
export default function DefaultInput(props) {
  const {
    document,
    emitter,
    fieldInfo,
    fieldBehaviours,
    onChange,
    validationError,
    label = true
  } = props;
  const {
    readOnly,
    placeholder,
    required,
    maxlength,
    sensible,
    kind
  } = fieldInfo;
  const dialogTextarea = maxlength && maxlength > 300 && !fieldInfo.enum;
  const textarea = kind === 'LongText';
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
  }); // Default Input

  return /*#__PURE__*/React.createElement(React.Fragment, null, label && /*#__PURE__*/React.createElement(Label, null, fieldInfo.description), /*#__PURE__*/React.createElement(InputGroup, null, !textarea && dialogTextarea && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Modal, {
    isOpen: dialogOpen,
    toggle: () => setDialogOpen(!dialogOpen),
    size: 'xl',
    className: "p-4"
  }, /*#__PURE__*/React.createElement(ModalHeader, {
    toggle: () => setDialogOpen(!dialogOpen)
  }, "Detail - ", fieldInfo.description), /*#__PURE__*/React.createElement(ModalBody, null, /*#__PURE__*/React.createElement(Input, _extends({
    className: "p-4",
    style: {
      height: '50vh'
    },
    type: "dialogTextarea"
  }, readOnly ? {
    disabled: true
  } : {}, {
    value: fieldValue || '',
    placeholder: placeholder || (fieldValue === null ? '[ NULL ]' : ''),
    onChange: e => onChangeMiddleware(e.target.value),
    autoComplete: "new-password"
  })))), /*#__PURE__*/React.createElement(InputGroupAddon, {
    addonType: "prepend"
  }, /*#__PURE__*/React.createElement(Button, {
    onClick: () => setDialogOpen(true),
    color: 'secondary'
  }, /*#__PURE__*/React.createElement(Search, {
    size: "16px"
  })))), !textarea && !required && !readOnly && /*#__PURE__*/React.createElement(InputGroupAddon, {
    addonType: "prepend"
  }, /*#__PURE__*/React.createElement(Button, {
    onClick: () => onChangeMiddleware(null),
    color: 'warning'
  }, /*#__PURE__*/React.createElement(X, {
    size: "16px"
  }))), /*#__PURE__*/React.createElement(Input, _extends({}, sensible ? {
    type: 'password',
    placeholder: 'Sensible information'
  } : {}, textarea ? {
    type: 'textarea'
  } : {}, customValidationError || validationError ? {
    invalid: true
  } : {}, readOnly ? {
    disabled: true
  } : {}, {
    value: fieldValue || '',
    placeholder: placeholder || (fieldValue === null ? '[ NULL ]' : ''),
    onChange: e => onChangeMiddleware(e.target.value === '' && !required ? null : e.target.value),
    autoComplete: "new-password",
    style: {
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      ...(textarea ? {
        padding: '1rem',
        height: '10vh'
      } : {})
    }
  })), (customValidationError || validationError) && /*#__PURE__*/React.createElement(FormFeedback, {
    className: "d-block"
  }, (customValidationError || validationError).message)));
}