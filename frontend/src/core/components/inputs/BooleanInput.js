import React from 'react';

import { Check, Square } from 'react-feather';
import { Input, FormFeedback, Label, FormGroup } from 'reactstrap';
import { Ɂ } from '../../../global';

import { useField } from './shared/hooks';

import './BooleanInput.css';

export default function BooleanInput({
  document,
  emitter,
  fieldInfo,
  onChange,
  validationError,
  fieldBehaviours,
  label = true,
}) {
  const { readOnly, required } = fieldInfo;

  const { fieldValue, onChangeMiddleware, validationError: customValidationError } = useField({
    document,
    emitter,
    fieldInfo,
    fieldBehaviours,
    onChange,
  });

  // If required === true then 2 states only are possible (true, false)
  // Else then 3 states are possible (true, false, null)
  // Default Input
  return (
    <>
      {label && <Label>{fieldInfo.description}</Label>}
      <FormGroup>
        <Label
          check
          className={`${readOnly ? 'read-only' : ''} ${
            Ɂ(fieldValue) ? 'null' : fieldValue ? 'true' : 'false'
          }`}
        >
          <i className="input-frame">
            {Ɂ(fieldValue) && <Square size="18px" color="var(--warning)" fill="var(--warning)" />}
            {fieldValue === true && <Check size="18px" color="var(--primary)" strokeWidth="4px" />}
          </i>

          <Label>{Ɂ(fieldValue) ? '[ NULL ]' : fieldValue ? 'True' : 'False'}</Label>

          <Input
            {...(validationError || customValidationError ? { invalid: true } : {})}
            {...(readOnly ? { disabled: true } : {})}
            type="checkbox"
            checked={fieldValue === null || fieldValue === true}
            onChange={() =>
              !readOnly &&
              onChangeMiddleware(
                required
                  ? // 2 states
                    !fieldValue
                  : // 3 states
                  Ɂ(fieldValue)
                  ? true
                  : fieldValue === false
                  ? null
                  : false
              )
            }
          />

          {(customValidationError || validationError) && (
            <FormFeedback className="d-block">
              {(customValidationError || validationError).message}
            </FormFeedback>
          )}
        </Label>
      </FormGroup>
    </>
  );
}
