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
  onSave,
}) {
  return (
    <div>
      <Row>
        <Col sm={12}>
          {filterOptions && filterOptions.length > 0 ? (
            <table className="table dataTable no-footer" role="grid">
              <thead>
                <tr role="row">
                  <th className="sorting_asc" tabIndex="0" rowSpan="1" colSpan="1">
                    Field
                  </th>
                  <th className="sorting_asc" tabIndex="0" rowSpan="1" colSpan="1">
                    Operator
                  </th>
                  <th className="sorting_asc" tabIndex="0" rowSpan="1" colSpan="1">
                    Value
                  </th>
                  <th className="sorting_asc" tabIndex="0" rowSpan="1" colSpan="1">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filterOptions.map(({ name, operator, value, nestedFilterOptions }, k) => {
                  const field = name && fields.find((field) => field.name === name);
                  const { arrayOfObjects, object, subFieldsInfo } = name ? getFieldType(field) : {};
                  const isNested = object || arrayOfObjects;

                  return (
                    <React.Fragment key={k}>
                      <tr>
                        <td>
                          <FormGroup className="mt-3">
                            <select
                              value={name}
                              onChange={(e) => {
                                filterOptions[k] = {
                                  ...filterOptions[k],
                                  name: e.target.value,
                                  value: null,
                                };

                                onChangeFilterOptions(filterOptions);
                              }}
                            >
                              {!name && <option value={undefined}>Choose a field</option>}
                              {fields
                                // Don't filter for HTML fields
                                .filter(
                                  ({ name, kind, type, boundTo }) =>
                                    fieldsFiltersOperators[name] &&
                                    // No html fields
                                    kind !== 'HTML' &&
                                    // No file fields or multiple file fields
                                    kind !== 'File' &&
                                    (!type || (type[0] && type[0].kind !== 'File')) &&
                                    // No boundTo fields
                                    !boundTo
                                )
                                .map(({ name, description }) => (
                                  <option key={name} value={name}>
                                    {description}
                                  </option>
                                ))}
                            </select>
                          </FormGroup>
                        </td>
                        {isNested ? (
                          <>
                            <td></td>
                            <td></td>
                          </>
                        ) : (
                          <>
                            <td>
                              {/* Operator */}
                              <FormGroup className="mt-3">
                                {name && fieldsFiltersOperators[name] && (
                                  <select
                                    value={operator}
                                    onChange={(e) => {
                                      filterOptions[k] = {
                                        ...filterOptions[k],
                                        operator: e.target.value,
                                      };

                                      onChangeFilterOptions(filterOptions);
                                    }}
                                  >
                                    {!operator && (
                                      <option value={undefined}>Choose an operator</option>
                                    )}

                                    {fieldsFiltersOperators[name].map(({ id, description }) => (
                                      <option key={id} value={id}>
                                        {description}
                                      </option>
                                    ))}
                                  </select>
                                )}{' '}
                              </FormGroup>
                            </td>
                            <td>
                              {/* Field's value */}
                              <div className="mt-3 form-group">
                                {field && (
                                  <GenericInput
                                    label={false}
                                    fields={fields}
                                    document={{ [field.name]: value }}
                                    fieldInfo={{
                                      ...field,
                                      readOnly: false,
                                    }}
                                    onChange={(value) => {
                                      filterOptions[k] = {
                                        ...filterOptions[k],
                                        value,
                                      };

                                      onChangeFilterOptions(filterOptions);
                                    }}
                                  />
                                )}
                              </div>
                            </td>
                          </>
                        )}
                        <td>
                          <FormGroup>
                            <Button
                              className="mt-3"
                              color="primary"
                              onClick={() =>
                                onChangeFilterOptions(filterOptions.filter((_, i) => i !== k))
                              }
                            >
                              <Delete size="16px" className="mr-2" /> Remove
                            </Button>
                          </FormGroup>
                        </td>
                      </tr>
                      {isNested && (
                        <>
                          <tr>
                            <td colSpan="4">
                              <Filters
                                onChangeFilterOptions={(subFilterOptions) => {
                                  filterOptions[k] = {
                                    ...filterOptions[k],
                                    nestedFilterOptions: subFilterOptions,
                                  };

                                  onChangeFilterOptions(filterOptions);
                                }}
                                {...{
                                  fields: subFieldsInfo,
                                  fieldsFiltersOperators: fieldsFiltersOperators[name],
                                  filterOptions: nestedFilterOptions || [],
                                }}
                              />
                            </td>
                          </tr>
                          <tr>
                            <td colSpan="4" style={{ height: '2em' }}></td>
                          </tr>
                        </>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="mt-2 mb-2">No filters configured.</div>
          )}
        </Col>
      </Row>
      <Row>
        <Col sm={12} md={6}>
          <div className="dataTables_length">
            {onSave && (
              <Button className="mt-2 mr-2" color="primary" onClick={() => onSave()}>
                <RefreshCw size="16px" className="mr-2" /> Apply
              </Button>
            )}
            <Button
              className="mt-2 mr-2"
              color="secondary"
              onClick={() => {
                filterOptions.push({});
                onChangeFilterOptions(filterOptions);
              }}
            >
              <Plus size="16px" className="mr-2" /> Add
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );
}
