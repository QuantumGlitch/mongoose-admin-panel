function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import React, { useEffect, useState } from 'react';
import { Alert, TabContent, TabPane, Nav, NavItem, NavLink, Row, Col, Card, CardBody } from 'reactstrap';
import Filters from './Filters';
import { formatField } from '../../utils/fields';
import './index.css'; // Serialize the client-side component to server-side configuration

function serializeGrid({
  action,
  currentDocumentId,
  paginationOptions,
  filterOptions
}) {
  return {
    action,
    currentDocumentId,
    paginationOptions,
    filterOptions
  };
}

export default function Grid({
  id,
  bus,
  errors,
  dataTable,
  currentDocumentId,
  visibleFields,
  fieldsFiltersOperators,
  filterOptions,
  paginationOptions,
  pagesCount,
  itemsCount
}) {
  const [activeTab, setActiveTab] = useState(1);

  const toggleTab = tab => {
    if (activeTab !== tab) setActiveTab(tab);
  }; // refresh Grid on props change


  useEffect(() => {
    return () => {};
  }, [currentDocumentId]);
  const selectedFields = dataTable.fields.filter(field => // Show visible fields
  visibleFields.find(visibleField => visibleField === field.name));
  bus.serialize(id, serializeGrid({
    currentDocumentId,
    paginationOptions,
    filterOptions
  }));
  return /*#__PURE__*/React.createElement(Row, null, /*#__PURE__*/React.createElement("a", {
    name: `grid_${id}`
  }), /*#__PURE__*/React.createElement(Col, {
    md: 12
  }, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(CardBody, null, /*#__PURE__*/React.createElement(Nav, {
    tabs: true
  }, /*#__PURE__*/React.createElement(NavItem, null, /*#__PURE__*/React.createElement(NavLink, {
    href: "#",
    className: `${activeTab === 1 ? 'active' : ''}`,
    onClick: () => toggleTab(1)
  }, "Grid")), filterOptions && /*#__PURE__*/React.createElement(NavItem, null, /*#__PURE__*/React.createElement(NavLink, {
    href: "#",
    className: `${activeTab === 2 ? 'active' : ''}`,
    onClick: () => toggleTab(2)
  }, "Filters"))), /*#__PURE__*/React.createElement(TabContent, {
    activeTab: activeTab
  }, /*#__PURE__*/React.createElement(TabPane, {
    tabId: 1
  }, /*#__PURE__*/React.createElement(Row, {
    className: "mt-2"
  }, /*#__PURE__*/React.createElement(Col, {
    sm: 12
  }, dataTable.documents && dataTable.documents.length > 0 ? /*#__PURE__*/React.createElement("div", {
    className: "table-responsive"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dataTables_wrapper dt-bootstrap4 no-footer"
  }, paginationOptions && pagesCount > 1 && /*#__PURE__*/React.createElement(Row, null, /*#__PURE__*/React.createElement("div", {
    className: "col-sm-12 col-md-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dataTables_length"
  }, /*#__PURE__*/React.createElement("label", {
    className: "d-flex m-2 mt-4 mb-4 align-items-center text-nowrap"
  }, "Show", /*#__PURE__*/React.createElement("select", {
    name: "dataTableExample_length",
    "aria-controls": "dataTableExample",
    className: "custom-select custom-select-sm form-control",
    value: paginationOptions.itemsPerPage,
    onChange: e => bus.serialize(id, serializeGrid({
      currentDocumentId,
      paginationOptions: {
        itemsPerPage: parseInt(e.target.value),
        currentPage: 0
      },
      filterOptions
    })).submitAndHash(`grid_${id}`)
  }, /*#__PURE__*/React.createElement("option", {
    value: 10
  }, "10"), /*#__PURE__*/React.createElement("option", {
    value: 30
  }, "30"), /*#__PURE__*/React.createElement("option", {
    value: 50
  }, "50")), ' ', "records per page")))), /*#__PURE__*/React.createElement(Row, null, /*#__PURE__*/React.createElement(Col, {
    sm: 12
  }, /*#__PURE__*/React.createElement("table", {
    className: "table dataTable no-footer grid-component",
    role: "grid",
    "aria-describedby": "dataTableExample_info"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    role: "row"
  }, selectedFields.map((c, k) => /*#__PURE__*/React.createElement("th", {
    className: "sorting_asc",
    tabIndex: "0",
    rowSpan: "1",
    colSpan: "1",
    key: k
  }, c.description)))), /*#__PURE__*/React.createElement("tbody", null, dataTable.documents.map((doc, k) => /*#__PURE__*/React.createElement("tr", {
    role: "row",
    key: k,
    className: `${doc._id == currentDocumentId && 'current'} ${doc._deleted === true && 'warning'}`,
    onClick: () => {
      if (doc._id != currentDocumentId) bus.serialize(id, serializeGrid({
        action: 'changeDocument',
        currentDocumentId: doc._id,
        paginationOptions,
        filterOptions
      })).submit();
    }
  }, selectedFields.map((c, k2) => /*#__PURE__*/React.createElement("td", {
    key: k2
  }, formatField(c, doc[c.name]))))))))), paginationOptions && pagesCount > 1 && /*#__PURE__*/React.createElement(Row, {
    className: "mt-4 align-items-center"
  }, /*#__PURE__*/React.createElement("div", {
    className: "col-sm-12 col-md-5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dataTables_info",
    role: "status",
    "aria-live": "polite"
  }, "Showing from", ' ', paginationOptions.itemsPerPage * paginationOptions.currentPage, " a", ' ', paginationOptions.itemsPerPage * (paginationOptions.currentPage + 1), ' ', "of ", itemsCount, " records")), /*#__PURE__*/React.createElement("div", {
    className: "col-sm-12 col-md-7"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dataTables_paginate paging_simple_numbers"
  }, /*#__PURE__*/React.createElement("ul", {
    className: "pagination"
  }, Array(pagesCount).fill().map((_, k) => /*#__PURE__*/React.createElement("li", {
    key: k,
    className: `paginate_button page-item ${paginationOptions.currentPage === k && 'active'}`
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    "aria-controls": "dataTableExample",
    "data-dt-idx": "1",
    tabIndex: "0",
    className: "page-link",
    onClick: () => {
      if (paginationOptions.currentPage === k) return; // Reset page on filter applying

      bus.serialize(id, serializeGrid({
        currentDocumentId,
        paginationOptions: { ...paginationOptions,
          currentPage: k
        },
        filterOptions
      })).submitAndHash(`grid_${id}`);
    }
  }, k + 1))))))))) : /*#__PURE__*/React.createElement("div", {
    className: "mt-2"
  }, "No records available")))), filterOptions && /*#__PURE__*/React.createElement(TabPane, {
    tabId: 2
  }, /*#__PURE__*/React.createElement(Row, {
    className: "mt-2"
  }, /*#__PURE__*/React.createElement(Col, {
    sm: 12
  }, /*#__PURE__*/React.createElement("div", {
    className: "table-responsive"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dataTables_wrapper dt-bootstrap4 no-footer"
  }, /*#__PURE__*/React.createElement(Filters, _extends({
    onChangeFilterOptions: newFilterOptions => bus.updateComponentProp(id, 'filterOptions', newFilterOptions),
    onSave: () => bus.serialize(id, serializeGrid({
      currentDocumentId,
      paginationOptions: { ...paginationOptions,
        currentPage: 0
      },
      filterOptions
    })).submitAndHash(`grid_${id}`)
  }, {
    fields: dataTable.fields,
    currentDocumentId,
    fieldsFiltersOperators,
    filterOptions,
    paginationOptions
  })))))))), errors && errors.length > 0 && /*#__PURE__*/React.createElement(Alert, {
    className: "alert-icon-primary mt-4 mb-0"
  }, /*#__PURE__*/React.createElement("ul", {
    className: "m-0"
  }, errors.map((e, k) => /*#__PURE__*/React.createElement("li", {
    key: k
  }, e))))))));
}