import React, { useState } from 'react';

import { Link, X } from 'react-feather';
import {
  Label,
  FormGroup,
  InputGroup,
  InputGroupAddon,
  Input,
  FormFeedback,
  Button,
} from 'reactstrap';

import Dialog from './Dialog';

import { formatField } from '../../../utils/fields';
import { useField } from '../shared/hooks';

/* 
    This input reference another Entity, so it must open a dialog on the Entity
    from which the user can choose a document
*/
export default function RefInput({
  document,
  emitter,
  fieldInfo,
  onChange,
  validationError,
  fieldBehaviours,
  label = true,
}) {
  const { readOnly, required } = fieldInfo;
  const ref = fieldInfo.ref || fieldInfo.subRef;

  const [dialogOpen, setDialogOpen] = useState(false);
  const { fieldValue, onChangeMiddleware, validationError: customValidationError } = useField({
    document,
    emitter,
    fieldInfo,
    fieldBehaviours,
    onChange,
  });

  return (
    <FormGroup>
      {!readOnly && (
        <Dialog
          onChange={(value) => {
            if (value) onChangeMiddleware(value);
            setDialogOpen(false);
          }}
          open={dialogOpen}
          reference={ref}
          constraint={{
            ...(fieldInfo.filters ? { filters: fieldInfo.filters } : {}),
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
            <Button onClick={() => setDialogOpen(true)}>
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
          {...(customValidationError || validationError ? { invalid: true } : {})}
          readOnly
          value={formatField(fieldInfo, fieldValue)}
        />

        {/**
         * Validation error
         */}
        {(customValidationError || validationError) && (
          <FormFeedback className="d-block">
            {(customValidationError || validationError).message}
          </FormFeedback>
        )}
      </InputGroup>
    </FormGroup>
  );
}
