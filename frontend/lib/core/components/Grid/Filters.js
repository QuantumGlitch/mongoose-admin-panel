function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import React from 'react';
import { Row, Col, FormGroup, Button } from 'reactstrap';
import { Delete, Plus, RefreshCw } from 'react-feather';
import GenericInput from '../inputs/GenericInput';
import { getFieldType } from '../../utils/fields';
export default function Filters({
  fields,
  fieldsFiltersOperators,
  filterOptions,
  onChangeFilterOptions,
  onSave
}) {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Row, null, /*#__PURE__*/React.createElement(Col, {
    sm: 12
  }, filterOptions && filterOptions.length > 0 ? /*#__PURE__*/React.createElement("table", {
    className: "table dataTable no-footer",
    role: "grid"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    role: "row"
  }, /*#__PURE__*/React.createElement("th", {
    className: "sorting_asc",
    tabIndex: "0",
    rowSpan: "1",
    colSpan: "1"
  }, "Field"), /*#__PURE__*/React.createElement("th", {
    className: "sorting_asc",
    tabIndex: "0",
    rowSpan: "1",
    colSpan: "1"
  }, "Operator"), /*#__PURE__*/React.createElement("th", {
    className: "sorting_asc",
    tabIndex: "0",
    rowSpan: "1",
    colSpan: "1"
  }, "Value"), /*#__PURE__*/React.createElement("th", {
    className: "sorting_asc",
    tabIndex: "0",
    rowSpan: "1",
    colSpan: "1"
  }, "Actions"))), /*#__PURE__*/React.createElement("tbody", null, filterOptions.map(({
    name,
    operator,
    value,
    nestedFilterOptions
  }, k) => {
    const field = name && fields.find(field => field.name === name);
    const {
      arrayOfObjects,
      object,
      subFieldsInfo
    } = name ? getFieldType(field) : {};
    const isNested = object || arrayOfObjects;
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: k
    }, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(FormGroup, {
      className: "mt-3"
    }, /*#__PURE__*/React.createElement("select", {
      value: name,
      onChange: e => {
        filterOptions[k] = { ...filterOptions[k],
          name: e.target.value,
          value: null
        };
        onChangeFilterOptions(filterOptions);
      }
    }, !name && /*#__PURE__*/React.createElement("option", {
      value: undefined
    }, "Choose a field"), fields // Don't filter for HTML fields
    .filter(({
      name,
      kind,
      type,
      boundTo
    }) => fieldsFiltersOperators[name] && // No html fields
    kind !== 'HTML' && // No file fields or multiple file fields
    kind !== 'File' && (!type || type[0] && type[0].kind !== 'File') && // No boundTo fields
    !boundTo).map(({
      name,
      description
    }) => /*#__PURE__*/React.createElement("option", {
      key: name,
      value: name
    }, description))))), isNested ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("td", null), /*#__PURE__*/React.createElement("td", null)) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(FormGroup, {
      className: "mt-3"
    }, name && fieldsFiltersOperators[name] && /*#__PURE__*/React.createElement("select", {
      value: operator,
      onChange: e => {
        filterOptions[k] = { ...filterOptions[k],
          operator: e.target.value
        };
        onChangeFilterOptions(filterOptions);
      }
    }, !operator && /*#__PURE__*/React.createElement("option", {
      value: undefined
    }, "Choose an operator"), fieldsFiltersOperators[name].map(({
      id,
      description
    }) => /*#__PURE__*/React.createElement("option", {
      key: id,
      value: id
    }, description))), ' ')), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
      className: "mt-3 form-group"
    }, field && /*#__PURE__*/React.createElement(GenericInput, {
      label: false,
      fields: fields,
      document: {
        [field.name]: value
      },
      fieldInfo: { ...field,
        readOnly: false
      },
      onChange: value => {
        filterOptions[k] = { ...filterOptions[k],
          value
        };
        onChangeFilterOptions(filterOptions);
      }
    })))), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(FormGroup, null, /*#__PURE__*/React.createElement(Button, {
      className: "mt-3",
      color: "primary",
      onClick: () => onChangeFilterOptions(filterOptions.filter((_, i) => i !== k))
    }, /*#__PURE__*/React.createElement(Delete, {
      size: "16px",
      className: "mr-2"
    }), " Remove")))), isNested && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
      colSpan: "4"
    }, /*#__PURE__*/React.createElement(Filters, _extends({
      onChangeFilterOptions: subFilterOptions => {
        filterOptions[k] = { ...filterOptions[k],
          nestedFilterOptions: subFilterOptions
        };
        onChangeFilterOptions(filterOptions);
      }
    }, {
      fields: subFieldsInfo,
      fieldsFiltersOperators: fieldsFiltersOperators[name],
      filterOptions: nestedFilterOptions || []
    })))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
      colSpan: "4",
      style: {
        height: '2em'
      }
    }))));
  }))) : /*#__PURE__*/React.createElement("div", {
    className: "mt-2 mb-2"
  }, "No filters configured."))), /*#__PURE__*/React.createElement(Row, null, /*#__PURE__*/React.createElement(Col, {
    sm: 12,
    md: 6
  }, /*#__PURE__*/React.createElement("div", {
    className: "dataTables_length"
  }, onSave && /*#__PURE__*/React.createElement(Button, {
    className: "mt-2 mr-2",
    color: "primary",
    onClick: () => onSave()
  }, /*#__PURE__*/React.createElement(RefreshCw, {
    size: "16px",
    className: "mr-2"
  }), " Apply"), /*#__PURE__*/React.createElement(Button, {
    className: "mt-2 mr-2",
    color: "secondary",
    onClick: () => {
      filterOptions.push({});
      onChangeFilterOptions(filterOptions);
    }
  }, /*#__PURE__*/React.createElement(Plus, {
    size: "16px",
    className: "mr-2"
  }), " Add")))));
}