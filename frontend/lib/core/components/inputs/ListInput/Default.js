import React, { useState, useRef } from 'react';
import EventEmitter from 'event-emitter';
import deepClone from 'deep-clone';
import Detail from '../shared/Detail';
import Grid from '../shared/Grid';
import { getFieldDefaultValue, getFieldType } from '../../../utils/fields';
/**
 * Render all the list elements fields
 */

export default function ListDefault({
  fieldInfo,
  fieldValue,
  onChange,
  validationError
}) {
  const subEmitter = useRef(EventEmitter());
  const [currentElementIndex, setCurrentElementIndex] = useState(0);
  const list = [...(fieldValue || [])];
  const {
    type
  } = fieldInfo; // We know that fieldInfo is of type = 'Array' of consequence we will check
  // the type of the list's elements (by the property type[0])

  const {
    arrayOfObjects,
    subFieldsInfo
  } = getFieldType(fieldInfo);
  let elementsFieldsInfo = null; // List of objects

  if (arrayOfObjects) {
    elementsFieldsInfo = subFieldsInfo;
    if (fieldInfo.readOnly) elementsFieldsInfo = elementsFieldsInfo.map(f => ({ ...f,
      readOnly: true
    }));
  } // List of primitives
  else elementsFieldsInfo = [{
      name: fieldInfo.name,
      ...subFieldsInfo,
      ...(fieldInfo.readOnly ? {
        readOnly: true
      } : {})
    }];

  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Detail, {
    emitter: subEmitter,
    readOnly: fieldInfo.readOnly,
    fieldsInfo: elementsFieldsInfo,
    currentElement: // Force refresh of detail if list[currentElementIndex] is an object
    arrayOfObjects ? list[currentElementIndex] ? { ...list[currentElementIndex]
    } : undefined : list[currentElementIndex],
    validationError: validationError && validationError.children && validationError.children[currentElementIndex],
    onChange: elementValue => {
      list[currentElementIndex] = elementValue;
      onChange([...list]);
    },
    _add: () => {
      const defaultValue = getFieldDefaultValue(type[0]);
      setCurrentElementIndex(list.push(defaultValue) - 1);
      onChange([...list]);
    },
    _clone: () => {
      const clone = deepClone(list[currentElementIndex]);
      if (clone._id) clone._id = null;
      setCurrentElementIndex(list.push(clone) - 1);
      onChange([...list]);
    },
    _delete: () => {
      onChange(list.filter((_, i) => i !== currentElementIndex));
      setCurrentElementIndex(0);
    }
  }), /*#__PURE__*/React.createElement(Grid, {
    fieldsInfo: elementsFieldsInfo,
    list: list,
    validationErrors: validationError && validationError.children,
    setCurrentElementIndex: setCurrentElementIndex,
    currentElementIndex: currentElementIndex
  }));
}