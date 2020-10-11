import React, { useState } from 'react';

import {
  Input,
  InputGroup,
  InputGroupAddon,
  Button,
  FormFeedback,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
} from 'reactstrap';

import { X, Search } from 'react-feather';
import { useField } from './shared/hooks';

export default function DefaultInput(props) {
  const {
    document,
    emitter,
    fieldInfo,
    fieldBehaviours,
    onChange,
    validationError,
    label = true,
  } = props;
  const { readOnly, placeholder, required, maxlength, sensible, kind } = fieldInfo;
  const dialogTextarea = maxlength && maxlength > 300 && !fieldInfo.enum;
  const textarea = kind === 'LongText';

  const [dialogOpen, setDialogOpen] = useState(false);
  const { fieldValue, onChangeMiddleware, validationError: customValidationError } = useField({
    document,
    emitter,
    fieldInfo,
    fieldBehaviours,
    onChange,
  });

  // Default Input
  return (
    <>
      {label && <Label>{fieldInfo.description}</Label>}

      <InputGroup>
        {/**
         * Dialog for inspecting the field
         */}
        {!textarea && dialogTextarea && (
          <>
            <Modal
              isOpen={dialogOpen}
              toggle={() => setDialogOpen(!dialogOpen)}
              size={'xl'}
              className="p-4"
            >
              <ModalHeader toggle={() => setDialogOpen(!dialogOpen)}>
                Detail - {fieldInfo.description}
              </ModalHeader>
              <ModalBody>
                <Input
                  className="p-4"
                  style={{ height: '50vh' }}
                  type="dialogTextarea"
                  {...(readOnly ? { disabled: true } : {})}
                  value={fieldValue || ''}
                  placeholder={placeholder || (fieldValue === null ? '[ NULL ]' : '')}
                  onChange={(e) => onChangeMiddleware(e.target.value)}
                  autoComplete="new-password"
                />
              </ModalBody>
            </Modal>

            <InputGroupAddon addonType="prepend">
              <Button onClick={() => setDialogOpen(true)} color={'secondary'}>
                <Search size="16px" />
              </Button>
            </InputGroupAddon>
          </>
        )}

        {/**
         * Make null the field
         */}
        {!textarea && !required && !readOnly && (
          <InputGroupAddon addonType="prepend">
            <Button onClick={() => onChangeMiddleware(null)} color={'warning'}>
              <X size="16px" />
            </Button>
          </InputGroupAddon>
        )}

        <Input
          {...(sensible ? { type: 'password', placeholder: 'Sensible information' } : {})}
          {...(textarea ? { type: 'textarea' } : {})}
          {...(customValidationError || validationError ? { invalid: true } : {})}
          {...(readOnly ? { disabled: true } : {})}
          value={fieldValue || ''}
          placeholder={placeholder || (fieldValue === null ? '[ NULL ]' : '')}
          onChange={(e) =>
            onChangeMiddleware(e.target.value === '' && !required ? null : e.target.value)
          }
          autoComplete="new-password"
          style={{
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            ...(textarea ? { padding: '1rem', height: '10vh' } : {}),
          }}
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
    </>
  );
}
