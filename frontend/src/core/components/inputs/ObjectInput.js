import React, { useState, useRef } from 'react';
import EventEmitter from 'event-emitter';

import { Ɂ, ɁɁΩ } from '../../../global';

import { Plus, Minus, CheckCircle, X } from 'react-feather';
import { Button, Label, FormGroup, FormFeedback, Collapse } from 'reactstrap';

import GenericInput from './GenericInput';

import './ObjectInput.css';

import { useField } from './shared/hooks';
import { getFieldType, getFieldDefaultValue } from '../../utils/fields';

export default function ObjectInput({
  document,
  emitter,
  fieldInfo,
  onChange,
  validationError,
  fieldBehaviours,
  label = true,
}) {
  const subEmitter = useRef(EventEmitter());
  const [isOpen, setIsOpen] = useState(false);
  const { fieldValue, onChangeMiddleware, validationError: customValidationError } = useField({
    document,
    emitter,
    fieldInfo,
    fieldBehaviours,
    onChange,
  });

  const { subFieldsInfo } = getFieldType(fieldInfo);
  const { readOnly, required } = fieldInfo;

  const form = (
    <>
      {!required && (
        <Button color="secondary" className="d-block mb-4" onClick={() => onChangeMiddleware(null)}>
          <X size={'14px'} className="mr-2" /> Make NULL
        </Button>
      )}
      <FormGroup
        tag="fieldset"
        className="p-4 pt-2 pb-2"
        {...(customValidationError || validationError
          ? { style: { borderColor: 'var(--danger)' } }
          : {})}
      >
        {subFieldsInfo.map((fieldInfo, key) => (
          <FormGroup key={key}>
            <GenericInput
              document={fieldValue}
              emitter={subEmitter.current}
              // Propagate readOnly to child
              fieldInfo={readOnly ? { ...fieldInfo, readOnly: true } : fieldInfo}
              onChange={(value) => {
                fieldValue[fieldInfo.name] = value;
                onChangeMiddleware(fieldValue);
                subEmitter.current.emit('fieldChanged', fieldInfo.name, value);
              }}
              validationError={ɁɁΩ(validationError, 'children', (c) =>
                c.find(({ name }) => name === fieldInfo.name)
              )}
              label={label}
            />
          </FormGroup>
        ))}
      </FormGroup>
    </>
  );

  // Default Input
  return (
    <>
      {label && (
        <>
          <Label>{fieldInfo.description}</Label>

          {!Ɂ(fieldValue) && fieldInfo.view === 'Collapse' && (
            <Button
              className="btn-sm p-1 pt-0 pb-0 d-block mb-2"
              color="primary"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <>
                  <Minus size="12px" /> Reduce
                </>
              ) : (
                <>
                  <Plus size="12px" /> Expand
                </>
              )}
            </Button>
          )}
        </>
      )}

      {
        // If the object field is null then show a valorize button
        Ɂ(fieldValue) && (
          <Button
            color="primary"
            className="d-block"
            onClick={() => onChangeMiddleware(getFieldDefaultValue(fieldInfo))}
          >
            <CheckCircle size="14px" className="mr-2" /> Assign a value
          </Button>
        )
      }

      {!Ɂ(fieldValue) ? (
        label && fieldInfo.view === 'Collapse' ? (
          <>
            <Collapse isOpen={isOpen}>{form}</Collapse>
          </>
        ) : (
          form
        )
      ) : null}

      {/**
       * Validation error
       */}
      {(customValidationError || validationError) && (
        <FormFeedback className="d-block mb-4">
          {(customValidationError || validationError).message}
        </FormFeedback>
      )}
    </>
  );
}
