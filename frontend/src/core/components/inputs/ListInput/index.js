import React, { useState } from 'react';

import { Search } from 'react-feather';

import {
  Input,
  InputGroup,
  InputGroupAddon,
  Button,
  FormFeedback,
  Label,
  FormGroup,
} from 'reactstrap';

import DefaultView from './Default';
import DialogView from './Dialog';

import { useField } from '../shared/hooks';

// Choose the right input's element for the DataTable's field
export default function ListInput({
  document,
  emitter,
  fieldInfo,
  onChange,
  validationError,
  fieldBehaviours,
  label = true,
}) {
  // Dialog is the default view for this component
  const view = fieldInfo.view || 'Dialog';

  const [dialogOpen, setDialogOpen] = useState(false);
  const { fieldValue, onChangeMiddleware, validationError: customValidationError } = useField({
    document,
    emitter,
    fieldInfo,
    fieldBehaviours,
    onChange,
  });

  return (
    <>
      {view === 'Dialog' && (
        <DialogView
          onChange={(value) => {
            if (value) onChangeMiddleware(value);
          }}
          open={dialogOpen}
          {...{ setDialogOpen, fieldInfo, fieldValue, validationError }}
        />
      )}

      {label && <Label>{fieldInfo.description}</Label>}

      {view === 'Default' && (
        <FormGroup
          {...{
            tag: 'fieldset',
            className: 'p-4 pt-2 pb-2',
            ...(customValidationError || validationError
              ? { style: { borderColor: 'var(--danger)' } }
              : {}),
          }}
        >
          <DefaultView
            {...{
              fieldInfo,
              fieldValue,
              onChange: onChangeMiddleware,
              validationError,
            }}
          />
        </FormGroup>
      )}

      {view === 'Dialog' && (
        <InputGroup>
          {/**
           * Search on relative RefForm for a new record
           */}
          {
            <InputGroupAddon addonType="prepend">
              <Button onClick={() => setDialogOpen(true)}>
                <Search size="16px" />
              </Button>
            </InputGroupAddon>
          }

          <Input
            {...(validationError || customValidationError ? { invalid: true } : {})}
            readOnly
            value={fieldValue ? `Inspect - ( ${fieldValue.length} elements )` : '[ NULL ]'}
          />
        </InputGroup>
      )}

      {/**
       * Validation error
       */}
      {(customValidationError || validationError) && (
        <FormFeedback className="d-block">
          {(customValidationError || validationError).message}
        </FormFeedback>
      )}
    </>
  );
}
