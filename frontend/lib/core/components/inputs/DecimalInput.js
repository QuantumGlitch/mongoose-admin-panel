function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import React from 'react';
import { Ɂ } from '../../../global';
import { Input, FormFeedback, Label } from 'reactstrap';
import { useField } from './shared/hooks'; // Choose the right input's element for the DataTable's field

export default function DecimalInput({
  document,
  emitter,
  fieldInfo,
  onChange,
  validationError,
  fieldBehaviours,
  label = true
}) {
  const {
    fixed,
    required,
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
  const decimalRegex = new RegExp(`^([+-])?([0-9]+)${fixed === 0 ? '' : `(.)?([0-9])${Ɂ(fixed) ? '*' : `{0,${fixed}}`}`}?$`); // Default Input

  return /*#__PURE__*/React.createElement(React.Fragment, null, label && /*#__PURE__*/React.createElement(Label, null, fieldInfo.description), /*#__PURE__*/React.createElement(Input, _extends({}, validationError ? {
    invalid: true
  } : {}, readOnly ? {
    disabled: true
  } : {}, {
    value: `${Ɂ(fieldValue) ? '' : fieldValue}`,
    onChange: e => {
      if (!required && e.target.value === '') onChangeMiddleware(null);else if (e.target.value.match(decimalRegex)) onChangeMiddleware(e.target.value);
    },
    onBlur: () => {
      if (readOnly) return; // Convert from string to number on blur

      if (typeof fieldValue === 'string') {
        let parsed = parseFloat(fieldValue);
        parsed = isNaN(parsed) ? 0 : parsed;
        onChangeMiddleware(Ɂ(fixed) ? parsed : parsed.toFixed(fixed));
      }
    },
    autoComplete: "new-password"
  })), (customValidationError || validationError) && /*#__PURE__*/React.createElement(FormFeedback, {
    className: "d-block"
  }, (customValidationError || validationError).message));
}