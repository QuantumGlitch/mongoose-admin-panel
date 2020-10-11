import React from 'react';
import { Ɂ } from '../../../global';

import { Input, FormFeedback, Label } from 'reactstrap';

import { useField } from './shared/hooks';

// Choose the right input's element for the DataTable's field
export default function DecimalInput({
  document,
  emitter,
  fieldInfo,
  onChange,
  validationError,
  fieldBehaviours,
  label = true,
}) {
  const { fixed, required, readOnly } = fieldInfo;

  const { fieldValue, onChangeMiddleware, validationError: customValidationError } = useField({
    document,
    emitter,
    fieldInfo,
    fieldBehaviours,
    onChange,
  });

  const decimalRegex = new RegExp(
    `^([+-])?([0-9]+)${fixed === 0 ? '' : `(.)?([0-9])${Ɂ(fixed) ? '*' : `{0,${fixed}}`}`}?$`
  );

  // Default Input
  return (
    <>
      {label && <Label>{fieldInfo.description}</Label>}

      <Input
        {...(validationError ? { invalid: true } : {})}
        {...(readOnly ? { disabled: true } : {})}
        value={`${Ɂ(fieldValue) ? '' : fieldValue}`}
        onChange={(e) => {
          if (!required && e.target.value === '') onChangeMiddleware(null);
          else if (e.target.value.match(decimalRegex)) onChangeMiddleware(e.target.value);
        }}
        onBlur={() => {
          if (readOnly) return;

          // Convert from string to number on blur
          if (typeof fieldValue === 'string') {
            let parsed = parseFloat(fieldValue);
            parsed = isNaN(parsed) ? 0 : parsed;
            onChangeMiddleware(Ɂ(fixed) ? parsed : parsed.toFixed(fixed));
          }
        }}
        autoComplete="new-password"
      />

      {(customValidationError || validationError) && (
        <FormFeedback className="d-block">
          {(customValidationError || validationError).message}
        </FormFeedback>
      )}
    </>
  );
}
