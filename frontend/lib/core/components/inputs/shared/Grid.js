import React from 'react';
import { AlertTriangle } from 'react-feather';
import { formatField } from '../../../utils/fields';
import '../../Grid/index.css';
export default function Grid({
  fieldsInfo,
  list,
  validationErrors,
  currentElementIndex,
  setCurrentElementIndex
}) {
  const selectedFields = fieldsInfo.filter(field => // hide booleans
  field.kind !== 'Boolean' && // hide objects
  field.kind !== 'Object' && field.kind !== 'LongText');
  const primitivesList = fieldsInfo.length === 1 && (fieldsInfo[0].kind || fieldsInfo[0].ref || fieldsInfo[0].subRef);
  return /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement("h6", {
    className: "m-3"
  }, "List"), /*#__PURE__*/React.createElement("div", {
    className: "col-md-12 grid-margin stretch-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card-body"
  }, list && list.length > 0 ? /*#__PURE__*/React.createElement("div", {
    className: "table-responsive"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dataTables_wrapper dt-bootstrap4 no-footer"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "col-sm-12"
  }, /*#__PURE__*/React.createElement("table", {
    className: "table dataTable no-footer grid-component",
    role: "grid",
    "aria-describedby": "dataTableExample_info"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    role: "row"
  }, validationErrors && /*#__PURE__*/React.createElement("th", {
    tabIndex: "0",
    rowSpan: "1",
    colSpan: "1"
  }), selectedFields.map((field, k) => /*#__PURE__*/React.createElement("th", {
    tabIndex: "0",
    rowSpan: "1",
    colSpan: "1",
    key: k
  }, field.description)))), /*#__PURE__*/React.createElement("tbody", null, list.map((element, k) => /*#__PURE__*/React.createElement("tr", {
    role: "row",
    key: k,
    className: `${k === currentElementIndex && 'current'} ${validationErrors && validationErrors[k] && 'warning'}`,
    onClick: () => {
      if (k !== currentElementIndex) setCurrentElementIndex(k);
    }
  }, validationErrors && /*#__PURE__*/React.createElement("th", {
    tabIndex: "0",
    rowSpan: "1",
    colSpan: "1"
  }, validationErrors[k] ? /*#__PURE__*/React.createElement(AlertTriangle, {
    size: "16px"
  }) : null), selectedFields.map((field, k2) => {
    return /*#__PURE__*/React.createElement("td", {
      key: k2
    }, primitivesList ? formatField(fieldsInfo[0], element) : formatField(field, element[field.name]));
  }))))))))) : /*#__PURE__*/React.createElement("span", null, "Nessun elemento disponibile")))));
}