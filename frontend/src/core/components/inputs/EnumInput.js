import React, { useMemo } from 'react';
import { Ɂ, equalsɁ } from '../../../global';

import { InputGroup, FormFeedback, Label } from 'reactstrap';
import Select from 'react-select';

import DefaultInput from './DefaultInput';
import { useField } from './shared/hooks';
//import useTraceUpdate from '../../../../../hooks/trace-update';

export default function EnumInput({
  document,
  emitter,
  fieldInfo,
  onChange,
  validationError,
  fieldBehaviours,
  label = true,
}) {
  // useTraceUpdate(
  //   {
  //     fieldInfo,
  //     fieldValue,
  //     onChange,
  //     validationError,
  //     fieldBehaviours,
  //     label,
  //   },
  //   'EnumInput'
  // );

  const { readOnly, enum: enumerator, enumDescription, required } = fieldInfo;

  const { fieldValue, onChangeMiddleware, validationError: customValidationError } = useField({
    document,
    emitter,
    fieldInfo,
    fieldBehaviours,
    onChange,
  });

  const options = useMemo(() => {
    const res = enumerator.map((v, k) => ({
      value: v,
      label: (enumDescription || enumerator)[k],
    }));

    // If field is nully or can be nullable
    if (Ɂ(fieldValue) || !required) res.unshift({ value: null, label: '[ Valore Nullo ]' });

    return res;
  }, [enumerator.length]);

  const currentIndex = useMemo(() => options.findIndex(({ value }) => equalsɁ(value, fieldValue)), [
    fieldValue,
  ]);

  const currentLabel = currentIndex > -1 ? options[currentIndex].label : null;

  if (readOnly)
    return (
      <DefaultInput
        {...{ fieldInfo, document: { [fieldInfo.name]: currentLabel }, validationError, label }}
      />
    );

  return (
    <>
      {label && <Label>{fieldInfo.description}</Label>}

      <InputGroup>
        <Select
          {...(customValidationError || validationError ? { invalid: true } : {})}
          {...(readOnly ? { disabled: true } : {})}
          value={{ value: fieldValue, label: currentLabel }}
          placeholder={''}
          onChange={({ value, label }) => onChangeMiddleware(value)}
          options={options}
          styles={{
            container: () => ({
              // none of react-select's styles are passed to <Control />
              width: '100%',
            }),
            menu: (provided) => ({
              ...provided,
              zIndex: '10000',
            }),
            control: (provided) => ({
              ...provided,
              ...(customValidationError || validationError ? { border: '1px solid red' } : {}),
            }),
          }}
        />

        {(customValidationError || validationError) && (
          <FormFeedback className="d-block">
            {(customValidationError || validationError).message}
          </FormFeedback>
        )}
      </InputGroup>
    </>
  );
}
