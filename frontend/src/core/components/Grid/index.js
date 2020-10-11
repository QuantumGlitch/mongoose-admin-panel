import React, { useEffect, useState } from 'react';

import {
  Alert,
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
  Row,
  Col,
  Card,
  CardBody,
} from 'reactstrap';

import Filters from './Filters';

import { formatField } from '../../utils/fields';

import './index.css';

// Serialize the client-side component to server-side configuration
function serializeGrid({ action, currentDocumentId, paginationOptions, filterOptions }) {
  return { action, currentDocumentId, paginationOptions, filterOptions };
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
  itemsCount,
}) {
  const [activeTab, setActiveTab] = useState(1);
  const toggleTab = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  // refresh Grid on props change
  useEffect(() => {
    return () => {};
  }, [currentDocumentId]);

  const selectedFields = dataTable.fields.filter((field) =>
    // Show visible fields
    visibleFields.find((visibleField) => visibleField === field.name)
  );

  bus.serialize(id, serializeGrid({ currentDocumentId, paginationOptions, filterOptions }));

  return (
    <Row>
      <a name={`grid_${id}`}></a>
      <Col md={12}>
        <Card>
          <CardBody>
            <Nav tabs>
              <NavItem>
                <NavLink
                  href="#"
                  className={`${activeTab === 1 ? 'active' : ''}`}
                  onClick={() => toggleTab(1)}
                >
                  Grid
                </NavLink>
              </NavItem>
              {filterOptions && (
                <NavItem>
                  <NavLink
                    href="#"
                    className={`${activeTab === 2 ? 'active' : ''}`}
                    onClick={() => toggleTab(2)}
                  >
                    Filters
                  </NavLink>
                </NavItem>
              )}
            </Nav>
            <TabContent activeTab={activeTab}>
              <TabPane tabId={1}>
                <Row className="mt-2">
                  <Col sm={12}>
                    {dataTable.documents && dataTable.documents.length > 0 ? (
                      <div className="table-responsive">
                        <div className="dataTables_wrapper dt-bootstrap4 no-footer">
                          {paginationOptions && pagesCount > 1 && (
                            <Row>
                              <div className="col-sm-12 col-md-6">
                                <div className="dataTables_length">
                                  <label className="d-flex m-2 mt-4 mb-4 align-items-center text-nowrap">
                                    Show
                                    <select
                                      name="dataTableExample_length"
                                      aria-controls="dataTableExample"
                                      className="custom-select custom-select-sm form-control"
                                      value={paginationOptions.itemsPerPage}
                                      onChange={(e) =>
                                        bus
                                          .serialize(
                                            id,
                                            serializeGrid({
                                              currentDocumentId,
                                              paginationOptions: {
                                                itemsPerPage: parseInt(e.target.value),
                                                currentPage: 0,
                                              },
                                              filterOptions,
                                            })
                                          )
                                          .submitAndHash(`grid_${id}`)
                                      }
                                    >
                                      <option value={10}>10</option>
                                      <option value={30}>30</option>
                                      <option value={50}>50</option>
                                    </select>{' '}
                                    records per page
                                  </label>
                                </div>
                              </div>
                            </Row>
                          )}
                          <Row>
                            <Col sm={12}>
                              <table
                                className="table dataTable no-footer grid-component"
                                role="grid"
                                aria-describedby="dataTableExample_info"
                              >
                                <thead>
                                  <tr role="row">
                                    {selectedFields.map((c, k) => (
                                      <th
                                        className="sorting_asc"
                                        tabIndex="0"
                                        rowSpan="1"
                                        colSpan="1"
                                        key={k}
                                      >
                                        {c.description}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {dataTable.documents.map((doc, k) => (
                                    <tr
                                      role="row"
                                      key={k}
                                      className={`${doc._id == currentDocumentId && 'current'} ${
                                        doc._deleted === true && 'warning'
                                      }`}
                                      onClick={() => {
                                        if (doc._id != currentDocumentId)
                                          bus
                                            .serialize(
                                              id,
                                              serializeGrid({
                                                action: 'changeDocument',
                                                currentDocumentId: doc._id,
                                                paginationOptions,
                                                filterOptions,
                                              })
                                            )
                                            .submit();
                                      }}
                                    >
                                      {selectedFields.map((c, k2) => (
                                        <td key={k2}>{formatField(c, doc[c.name])}</td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </Col>
                          </Row>
                          {paginationOptions && pagesCount > 1 && (
                            <Row className="mt-4 align-items-center">
                              <div className="col-sm-12 col-md-5">
                                <div className="dataTables_info" role="status" aria-live="polite">
                                  Showing from{' '}
                                  {paginationOptions.itemsPerPage * paginationOptions.currentPage} a{' '}
                                  {paginationOptions.itemsPerPage *
                                    (paginationOptions.currentPage + 1)}{' '}
                                  of {itemsCount} records
                                </div>
                              </div>
                              <div className="col-sm-12 col-md-7">
                                <div className="dataTables_paginate paging_simple_numbers">
                                  <ul className="pagination">
                                    {Array(pagesCount)
                                      .fill()
                                      .map((_, k) => (
                                        <li
                                          key={k}
                                          className={`paginate_button page-item ${
                                            paginationOptions.currentPage === k && 'active'
                                          }`}
                                        >
                                          <a
                                            href="#"
                                            aria-controls="dataTableExample"
                                            data-dt-idx="1"
                                            tabIndex="0"
                                            className="page-link"
                                            onClick={() => {
                                              if (paginationOptions.currentPage === k) return;

                                              // Reset page on filter applying
                                              bus
                                                .serialize(
                                                  id,
                                                  serializeGrid({
                                                    currentDocumentId,
                                                    paginationOptions: {
                                                      ...paginationOptions,
                                                      currentPage: k,
                                                    },
                                                    filterOptions,
                                                  })
                                                )
                                                .submitAndHash(`grid_${id}`);
                                            }}
                                          >
                                            {k + 1}
                                          </a>
                                        </li>
                                      ))}
                                  </ul>
                                </div>
                              </div>
                            </Row>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2">No records available</div>
                    )}
                  </Col>
                </Row>
              </TabPane>
              {filterOptions && (
                <TabPane tabId={2}>
                  <Row className="mt-2">
                    <Col sm={12}>
                      <div className="table-responsive">
                        <div className="dataTables_wrapper dt-bootstrap4 no-footer">
                          <Filters
                            onChangeFilterOptions={(newFilterOptions) =>
                              bus.updateComponentProp(id, 'filterOptions', newFilterOptions)
                            }
                            onSave={() =>
                              bus
                                .serialize(
                                  id,
                                  serializeGrid({
                                    currentDocumentId,
                                    paginationOptions: {
                                      ...paginationOptions,
                                      currentPage: 0,
                                    },
                                    filterOptions,
                                  })
                                )
                                .submitAndHash(`grid_${id}`)
                            }
                            {...{
                              fields: dataTable.fields,
                              currentDocumentId,
                              fieldsFiltersOperators,
                              filterOptions,
                              paginationOptions,
                            }}
                          />
                        </div>
                      </div>
                    </Col>
                  </Row>
                </TabPane>
              )}
            </TabContent>

            {errors && errors.length > 0 && (
              <Alert className="alert-icon-primary mt-4 mb-0">
                <ul className="m-0">
                  {errors.map((e, k) => (
                    <li key={k}>{e}</li>
                  ))}
                </ul>
              </Alert>
            )}
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
}
