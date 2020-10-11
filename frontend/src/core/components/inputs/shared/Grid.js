import React from 'react';

import { AlertTriangle } from 'react-feather';

import { formatField } from '../../../utils/fields';

import '../../Grid/index.css';

export default function Grid({
  fieldsInfo,
  list,
  validationErrors,
  currentElementIndex,
  setCurrentElementIndex,
}) {
  const selectedFields = fieldsInfo.filter(
    (field) =>
      // hide booleans
      field.kind !== 'Boolean' &&
      // hide objects
      field.kind !== 'Object' &&
      field.kind !== 'LongText'
  );

  const primitivesList =
    fieldsInfo.length === 1 && (fieldsInfo[0].kind || fieldsInfo[0].ref || fieldsInfo[0].subRef);

  return (
    <div className="row">
      <h6 className="m-3">List</h6>
      <div className="col-md-12 grid-margin stretch-card">
        <div className="card">
          <div className="card-body">
            {list && list.length > 0 ? (
              <div className="table-responsive">
                <div className="dataTables_wrapper dt-bootstrap4 no-footer">
                  <div className="row">
                    <div className="col-sm-12">
                      <table
                        className="table dataTable no-footer grid-component"
                        role="grid"
                        aria-describedby="dataTableExample_info"
                      >
                        <thead>
                          <tr role="row">
                            {validationErrors && <th tabIndex="0" rowSpan="1" colSpan="1"></th>}
                            {selectedFields.map((field, k) => (
                              <th tabIndex="0" rowSpan="1" colSpan="1" key={k}>
                                {field.description}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {list.map((element, k) => (
                            <tr
                              role="row"
                              key={k}
                              className={`${k === currentElementIndex && 'current'} ${
                                validationErrors && validationErrors[k] && 'warning'
                              }`}
                              onClick={() => {
                                if (k !== currentElementIndex) setCurrentElementIndex(k);
                              }}
                            >
                              {validationErrors && (
                                <th tabIndex="0" rowSpan="1" colSpan="1">
                                  {validationErrors[k] ? <AlertTriangle size="16px" /> : null}
                                </th>
                              )}
                              {selectedFields.map((field, k2) => {
                                return (
                                  <td key={k2}>
                                    {primitivesList
                                      ? formatField(fieldsInfo[0], element)
                                      : formatField(field, element[field.name])}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <span>Nessun elemento disponibile</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
