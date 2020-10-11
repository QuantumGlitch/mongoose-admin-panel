function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import React from 'react';
import { Check, Square } from 'react-feather';
import { Input, FormFeedback, Label, FormGroup } from 'reactstrap';
import { Ɂ } from '../../../global';
import { useField } from './shared/hooks';
import './BooleanInput.css';
export default function BooleanInput({
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
  }); // If required === true then 2 states only are possible (true, false)
  // Else then 3 states are possible (true, false, null)
  // Default Input

  return /*#__PURE__*/React.createElement(React.Fragment, null, label && /*#__PURE__*/React.createElement(Label, null, fieldInfo.description), /*#__PURE__*/React.createElement(FormGroup, null, /*#__PURE__*/React.createElement(Label, {
    check: true,
    className: `${readOnly ? 'read-only' : ''} ${Ɂ(fieldValue) ? 'null' : fieldValue ? 'true' : 'false'}`
  }, /*#__PURE__*/React.createElement("i", {
    className: "input-frame"
  }, Ɂ(fieldValue) && /*#__PURE__*/React.createElement(Square, {
    size: "18px",
    color: "var(--warning)",
    fill: "var(--warning)"
  }), fieldValue === true && /*#__PURE__*/React.createElement(Check, {
    size: "18px",
    color: "var(--primary)",
    strokeWidth: "4px"
  })), /*#__PURE__*/React.createElement(Label, null, Ɂ(fieldValue) ? '[ NULL ]' : fieldValue ? 'True' : 'False'), /*#__PURE__*/React.createElement(Input, _extends({}, validationError || customValidationError ? {
    invalid: true
  } : {}, readOnly ? {
    disabled: true
  } : {}, {
    type: "checkbox",
    checked: fieldValue === null || fieldValue === true,
    onChange: () => !readOnly && onChangeMiddleware(required ? // 2 states
    !fieldValue : // 3 states
    Ɂ(fieldValue) ? true : fieldValue === false ? null : false)
  })), (customValidationError || validationError) && /*#__PURE__*/React.createElement(FormFeedback, {
    className: "d-block"
  }, (customValidationError || validationError).message))));
}