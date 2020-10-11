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
  readOnly,
}) {
  function changeFieldValue(fieldName, fieldValue) {
    currentElement[fieldName] = fieldValue;
    onChange(currentElement);
  }

  const primitivesList =
    fieldsInfo.length === 1 && (fieldsInfo[0].kind || fieldsInfo[0].ref || fieldsInfo[0].subRef);

  return (
    <div className="row">
      <h6 className="m-3">Detail</h6>
      <div className="col-md-12 grid-margin stretch-card">
        <div className="card">
          <div className="card-body">
            {currentElement !== undefined ? (
              <>
                {fieldsInfo.map((f, k) => {
                  const validationError =
                    validationErrors &&
                    validationErrors.length > 0 &&
                    validationErrors.find((e) => e.name === f.name);

                  return (
                    <FormGroup key={k}>
                      <GenericInput
                        fieldInfo={f}
                        document={primitivesList ? { [f.name]: currentElement } : currentElement}
                        onChange={(value) => {
                          if (primitivesList) onChange(value);
                          // list of objects
                          else changeFieldValue(f.name, value);
                        }}
                        validationError={validationError}
                      />
                    </FormGroup>
                  );
                })}

                {!readOnly && (
                  <FormGroup className="mt-4">
                    {_delete && (
                      <Button color="secondary" className="mr-2" onClick={() => _delete()}>
                        <Delete size={'15px'} className="mr-2" />
                        Delete
                      </Button>
                    )}

                    {_add && (
                      <Button color="secondary" className="mr-2" onClick={() => _add()}>
                        <PlusCircle size={'15px'} className="mr-2" />
                        New
                      </Button>
                    )}

                    {_clone && (
                      <Button color="secondary" className="mr-2" onClick={() => _clone()}>
                        <Copy size={'15px'} className="mr-2" />
                        Copy
                      </Button>
                    )}
                  </FormGroup>
                )}
              </>
            ) : (
              _add && (
                <Button color="secondary" className="mr-2" onClick={() => _add()}>
                  <PlusCircle size={'15px'} className="mr-2" />
                  New
                </Button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
