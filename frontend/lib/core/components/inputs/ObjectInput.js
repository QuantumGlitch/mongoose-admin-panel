function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import React, { useState, useRef } from 'react';
import EventEmitter from 'event-emitter';
import { Ɂ, ɁɁΩ } from '../../../global';
import { Plus, Minus, CheckCircle, X } from 'react-feather';
import { Button, Label, FormGroup, FormFeedback, Collapse } from 'reactstrap';
import GenericInput from './GenericInput';
import './ObjectInput.css';
import { useField } from './shared/hooks';
import { getFieldType, getFieldDefaultValue } from '../../utils/fields';
export default function ObjectInput({
  document,
  emitter,
  fieldInfo,
  onChange,
  validationError,
  fieldBehaviours,
  label = true
}) {
  const subEmitter = useRef(EventEmitter());
  const [isOpen, setIsOpen] = useState(false);
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
  const {
    subFieldsInfo
  } = getFieldType(fieldInfo);
  const {
    readOnly,
    required
  } = fieldInfo;
  const form = /*#__PURE__*/React.createElement(React.Fragment, null, !required && /*#__PURE__*/React.createElement(Button, {
    color: "secondary",
    className: "d-block mb-4",
    onClick: () => onChangeMiddleware(null)
  }, /*#__PURE__*/React.createElement(X, {
    size: '14px',
    className: "mr-2"
  }), " Make NULL"), /*#__PURE__*/React.createElement(FormGroup, _extends({
    tag: "fieldset",
    className: "p-4 pt-2 pb-2"
  }, customValidationError || validationError ? {
    style: {
      borderColor: 'var(--danger)'
    }
  } : {}), subFieldsInfo.map((fieldInfo, key) => /*#__PURE__*/React.createElement(FormGroup, {
    key: key
  }, /*#__PURE__*/React.createElement(GenericInput, {
    document: fieldValue,
    emitter: subEmitter.current // Propagate readOnly to child
    ,
    fieldInfo: readOnly ? { ...fieldInfo,
      readOnly: true
    } : fieldInfo,
    onChange: value => {
      fieldValue[fieldInfo.name] = value;
      onChangeMiddleware(fieldValue);
      subEmitter.current.emit('fieldChanged', fieldInfo.name, value);
    },
    validationError: ɁɁΩ(validationError, 'children', c => c.find(({
      name
    }) => name === fieldInfo.name)),
    label: label
  }))))); // Default Input

  return /*#__PURE__*/React.createElement(React.Fragment, null, label && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Label, null, fieldInfo.description), !Ɂ(fieldValue) && fieldInfo.view === 'Collapse' && /*#__PURE__*/React.createElement(Button, {
    className: "btn-sm p-1 pt-0 pb-0 d-block mb-2",
    color: "primary",
    onClick: () => setIsOpen(!isOpen)
  }, isOpen ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Minus, {
    size: "12px"
  }), " Reduce") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Plus, {
    size: "12px"
  }), " Expand"))), // If the object field is null then show a valorize button
  Ɂ(fieldValue) && /*#__PURE__*/React.createElement(Button, {
    color: "primary",
    className: "d-block",
    onClick: () => onChangeMiddleware(getFieldDefaultValue(fieldInfo))
  }, /*#__PURE__*/React.createElement(CheckCircle, {
    size: "14px",
    className: "mr-2"
  }), " Assign a value"), !Ɂ(fieldValue) ? label && fieldInfo.view === 'Collapse' ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Collapse, {
    isOpen: isOpen
  }, form)) : form : null, (customValidationError || validationError) && /*#__PURE__*/React.createElement(FormFeedback, {
    className: "d-block mb-4"
  }, (customValidationError || validationError).message));
}