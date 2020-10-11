function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import React from 'react';
import { FormFeedback, Label, FormGroup } from 'reactstrap';
import DateTimePicker from 'react-datetime-picker';
import { useField } from './shared/hooks';
import './DateInput.css'; // Choose the right input's element for the DataTable's field

export default function DateInput({
  document,
  emitter,
  fieldInfo,
  onChange,
  validationError,
  fieldBehaviours,
  label = true
}) {
  const {
    readOnly
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
  });
  const dateValue = fieldValue && new Date(fieldValue); // Default Input

  return /*#__PURE__*/React.createElement(React.Fragment, null, label && /*#__PURE__*/React.createElement(Label, null, fieldInfo.description), /*#__PURE__*/React.createElement(DateTimePicker, _extends({}, validationError || customValidationError ? {
    invalid: true
  } : {}, readOnly ? {
    disabled: true
  } : {}, {
    format: "dd/MM/y HH:mm:ss",
    value: dateValue,
    onChange: onChangeMiddleware,
    className: `d-block ${(customValidationError || validationError) && 'invalid'}`
  })), (customValidationError || validationError) && /*#__PURE__*/React.createElement(FormFeedback, {
    className: "d-block"
  }, (customValidationError || validationError).message));
}