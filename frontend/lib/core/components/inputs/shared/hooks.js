import { ɁɁ } from '../../../../global';
import { useState, useEffect, useCallback } from 'react';
import isDeepEqual from 'react-fast-compare';
/**
 * This hook will handle the behaviour of an input based on server-side fieldBehaviours
 */

export function useFieldBehaviours({
  fieldBehaviours,
  onChange,
  fieldValue,
  emitter
}) {
  const [validationError, setValidationError] = useState(null);
  /**
   * Validate value of the field
   * @param {*} value
   */

  function validate(value, changed) {
    if (fieldBehaviours && fieldBehaviours.validators) {
      function executeValidator(path, serverParams) {//return requireFunction(path)(value, { emitter, changed }, serverParams);
      }

      let error = null;
      if (typeof fieldBehaviours.validators === 'string') error = executeValidator(fieldBehaviours.validators, fieldBehaviours.parameters);else if (fieldBehaviours.validators instanceof Array) {
        let v = 0;

        for (; v < fieldBehaviours.validators.length; v++) if (error = executeValidator(fieldBehaviours.validators[v], ɁɁ(fieldBehaviours.parameters, v))) break;
      } // If we have an error we need to set it

      if (error) setValidationError(error); // If we don't have an error but the state is still set, we need to reset the state
      else if (validationError) setValidationError(null);
    }
  }
  /**
   * Before changing the value of the field, try to validate it, if needed
   * @param {*} value The new value for the field
   */


  function onChangeMiddleware(value) {
    validate(value, true);
    onChange(value);
  } // Validate the first time


  useEffect(() => validate(fieldValue, false), []);
  return {
    onChangeMiddleware,
    validationError
  };
}
export function useField({
  document,
  emitter,
  fieldInfo,
  fieldBehaviours,
  onChange
}) {
  const [fieldValue, setFieldValue] = useState(document[fieldInfo.name]); // Use this callback for refreshing the fieldValue on changes

  const fieldChangedCallback = useCallback((fieldName, newFieldValue) => {
    if (fieldName === fieldInfo.name && // isDeepEqual will be only executed on different objects or arrays
    !isDeepEqual(newFieldValue, fieldValue)) // Someone changed this field's value, update it then
      setFieldValue(newFieldValue);
  }, [fieldValue, setFieldValue]);
  useEffect(() => {
    // We have an emitter on which we can listen
    if (emitter) {
      // Listen for changes on fields
      emitter.on('fieldChanged', fieldChangedCallback); // Stop listening on cleanup

      return () => emitter.off('fieldChanged', fieldChangedCallback);
    }
  }, [emitter, fieldChangedCallback]); // Server has changed document then update the fieldValue

  useEffect(() => setFieldValue(document[fieldInfo.name]), [document]);
  return {
    fieldValue,
    ...useFieldBehaviours({
      fieldValue,
      fieldBehaviours,
      onChange,
      emitter
    })
  };
}