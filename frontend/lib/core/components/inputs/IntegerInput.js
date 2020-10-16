import React from 'react';
import DecimalInput from './DecimalInput';
export default function NumberInput(props) {
  props.fieldInfo.fixed = props.fieldInfo.fixed || 0; // Floating number with no fixed digits

  return /*#__PURE__*/React.createElement(DecimalInput, props);
}