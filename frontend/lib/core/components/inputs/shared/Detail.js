import React from 'react';
import { Form, FormGroup, Button } from 'reactstrap';
import { Delete, PlusCircle, Copy } from 'react-feather';
import GenericInput from '../GenericInput';
export default function Detail({
  fieldsInfo,
  currentElement,
  validationError: validationErrors,
  onChange,
  _add,
  _clone,
  _delete,
  readOnly
}) {
  function changeFieldValue(fieldName, fieldValue) {
    currentElement[fieldName] = fieldValue;
    onChange(currentElement);
  }

  const primitivesList = fieldsInfo.length === 1 && (fieldsInfo[0].kind || fieldsInfo[0].ref || fieldsInfo[0].subRef);
  return /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement("h6", {
    className: "m-3"
  }, "Detail"), /*#__PURE__*/React.createElement("div", {
    className: "col-md-12 grid-margin stretch-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card-body"
  }, currentElement !== undefined ? /*#__PURE__*/React.createElement(React.Fragment, null, fieldsInfo.map((f, k) => {
    const validationError = validationErrors && validationErrors.length > 0 && validationErrors.find(e => e.name === f.name);
    return /*#__PURE__*/React.createElement(FormGroup, {
      key: k
    }, /*#__PURE__*/React.createElement(GenericInput, {
      fieldInfo: f,
      document: primitivesList ? {
        [f.name]: currentElement
      } : currentElement,
      onChange: value => {
        if (primitivesList) onChange(value); // list of objects
        else changeFieldValue(f.name, value);
      },
      validationError: validationError
    }));
  }), !readOnly && /*#__PURE__*/React.createElement(FormGroup, {
    className: "mt-4"
  }, _delete && /*#__PURE__*/React.createElement(Button, {
    color: "secondary",
    className: "mr-2",
    onClick: () => _delete()
  }, /*#__PURE__*/React.createElement(Delete, {
    size: '15px',
    className: "mr-2"
  }), "Delete"), _add && /*#__PURE__*/React.createElement(Button, {
    color: "secondary",
    className: "mr-2",
    onClick: () => _add()
  }, /*#__PURE__*/React.createElement(PlusCircle, {
    size: '15px',
    className: "mr-2"
  }), "New"), _clone && /*#__PURE__*/React.createElement(Button, {
    color: "secondary",
    className: "mr-2",
    onClick: () => _clone()
  }, /*#__PURE__*/React.createElement(Copy, {
    size: '15px',
    className: "mr-2"
  }), "Copy"))) : _add && /*#__PURE__*/React.createElement(Button, {
    color: "secondary",
    className: "mr-2",
    onClick: () => _add()
  }, /*#__PURE__*/React.createElement(PlusCircle, {
    size: '15px',
    className: "mr-2"
  }), "New")))));
}