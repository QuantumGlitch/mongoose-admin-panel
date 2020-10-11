import React from 'react';

import { FormFeedback, Label, FormGroup } from 'reactstrap';
import DateTimePicker from 'react-datetime-picker';

import { useField } from './shared/hooks';

import './DateInput.css';

// Choose the right input's element for the DataTable's field
export default function DateInput({
  document,
  emitter,
  fieldInfo,
  onChange,
  validationError,
  fieldBehaviours,
  label = true,
}) {
  const { readOnly } = fieldInfo;

  const { fieldValue, onChangeMiddleware, validationError: customValidationError } = useField({
    document,
    emitter,
    fieldInfo,
    fieldBehaviours,
    onChange,
  });

  const dateValue = fieldValue && new Date(fieldValue);

  // Default Input
  return (
    <>
      {label && <Label>{fieldInfo.description}</Label>}

      <DateTimePicker
        {...(validationError || customValidationError ? { invalid: true } : {})}
        {...(readOnly ? { disabled: true } : {})}
        format="dd/MM/y HH:mm:ss"
        value={dateValue}
        onChange={onChangeMiddleware}
        className={`d-block ${(customValidationError || validationError) && 'invalid'}`}
      />

      {(customValidationError || validationError) && (
        <FormFeedback className="d-block">
          {(customValidationError || validationError).message}
        </FormFeedback>
      )}
    </>
  );
}
