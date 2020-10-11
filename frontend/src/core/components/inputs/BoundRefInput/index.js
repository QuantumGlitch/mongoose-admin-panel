import React, { useState, useEffect } from 'react';

import { Link, X } from 'react-feather';
import { Label, InputGroup, InputGroupAddon, Input, FormFeedback, Button } from 'reactstrap';

import { Ɂ } from '../../../../global';

import { formatField } from '../../../utils/fields';
import { useField } from '../shared/hooks';

import Dialog from '../RefInput/Dialog';

/* 
    This input reference another Entity, so it must open a dialog on the Entity
    from which the user can choose a document
*/
export default function BoundRefInput({
  document,
  emitter,
  fields,
  fieldInfo,
  onChange,
  validationError,
  fieldBehaviours,
  label = true,
}) {
  const { readOnly, required, boundTo } = fieldInfo;
  const ref = fieldInfo.ref || fieldInfo.subRef;

  const [dialogOpen, setDialogOpen] = useState(false);

  const { fieldValue, onChangeMiddleware, validationError: customValidationError } = useField({
    document,
    emitter,
    fieldInfo,
    fieldBehaviours,
    onChange,
  });

  const fieldBoundTo = fields.find(({ name }) => name === boundTo);

  // Value to which this field is bound
  const [boundToValue, setBoundToValue] = useState(document[fieldBoundTo.name]);
  const [boundValidationError, setBoundValidationError] = useState(null);

  useEffect(() => {
    // Emitter is available
    if (emitter) {
      const listener = (fieldName, newFieldValue) => {
        /* 
          When someone changes value for the field to which the current field is bound to, 
          then set to null the current field's value, because the reference is no longer mantained. 
        */
        if (fieldName === boundTo) {
          setBoundToValue(newFieldValue);
          onChangeMiddleware(null);
        }
      };

      // Setup listener on mount
      emitter.on('fieldChanged', listener);

      // Cleanup listener on unmount
      return () => emitter.off('fieldChanged', listener);
    }
  }, [boundTo, setBoundToValue, onChangeMiddleware]);

  // On server changes current document
  useEffect(() => {
    setBoundToValue(document[fieldBoundTo.name]);
  }, [document]);

  if (!ref.startsWith(fieldBoundTo.ref))
    throw new Error(
      "Using BoundRefInput with different ref. (RefInput's ref !== BoundRefInput's ref)"
    );

  return (
    <>
      {!readOnly && (
        <Dialog
          onChange={(value) => {
            if (value) onChangeMiddleware(value);
            setDialogOpen(false);
          }}
          open={dialogOpen}
          reference={fieldBoundTo.ref}
          constraint={{
            path: ref.substring(fieldBoundTo.ref.length + 1),
            document: boundToValue,
          }}
        />
      )}

      {label && <Label>{fieldInfo.description}</Label>}

      <InputGroup>
        {/**
         * Search on relative RefForm for a new record
         */}
        {!readOnly && (
          <InputGroupAddon addonType="prepend">
            <Button
              onClick={() => {
                if (Ɂ(boundToValue))
                  setBoundValidationError({
                    message: `Before you need to choose a value for the field '${fieldBoundTo.description}'.`,
                  });
                else {
                  setBoundValidationError(null);
                  setDialogOpen(true);
                }
              }}
            >
              <Link size="16px" />
            </Button>
          </InputGroupAddon>
        )}

        {/**
         * Make null the field
         */}
        {!required && !readOnly && (
          <InputGroupAddon addonType="prepend">
            <Button onClick={() => onChangeMiddleware(null)} color={'warning'}>
              <X size="16px" />
            </Button>
          </InputGroupAddon>
        )}

        <Input
          {...(boundValidationError || customValidationError || validationError
            ? { invalid: true }
            : {})}
          readOnly
          value={formatField(fieldInfo, fieldValue)}
        />

        {/**
         * Validation error
         */}
        {(boundValidationError || customValidationError || validationError) && (
          <FormFeedback className="d-block">
            {(boundValidationError || customValidationError || validationError).message}
          </FormFeedback>
        )}
      </InputGroup>
    </>
  );
}
