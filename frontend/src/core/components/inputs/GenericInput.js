import React from 'react';

import { getFieldType } from '../../utils/fields';

/**
 * Primitive types
 */
import DefaultInput from './DefaultInput';

export const registeredInputs = {
  Boolean: require('./BooleanInput').default,
  Decimal: require('./DecimalInput').default,
  Number: require('./NumberInput').default,
  Date: require('./DateInput').default,
};

/**
 * Complex types
 */
export const registeredComplexInputs = {
  File: require('./FileInput').default,
  Object: require('./ObjectInput').default,
  Ref: require('./RefInput').default,
  BoundRef: require('./BoundRefInput').default,
  List: require('./ListInput').default,
  Enum: require('./EnumInput').default,
};

// Choose the right input's element for the DataTable's field
export default function GenericInput(props) {
  const { kind, enum: enumerator, boundTo } = props.fieldInfo;
  const { reference, array, object } = getFieldType(props.fieldInfo);

  /**
   * Choose by complex criterias
   */
  let ComplexInput = null;
  // This is a particular type of reference
  // Single file upload or multiple
  if (kind === 'File' || (array && props.fieldInfo.type[0].kind === 'File'))
    ComplexInput = registeredComplexInputs.File;
  else if (reference) {
    // This is used when referencing a subDocument of a reference
    if (boundTo) ComplexInput = registeredComplexInputs.BoundRef;
    else ComplexInput = registeredComplexInputs.Ref;
  } else if (object) ComplexInput = registeredComplexInputs.Object;
  else if (array) ComplexInput = registeredComplexInputs.List;
  else if (enumerator) ComplexInput = registeredComplexInputs.Enum;

  if (ComplexInput) return <ComplexInput {...props} />;

  /**
   * Choose by kind
   */
  if (registeredInputs[kind]) {
    const InputByKind = registeredInputs[kind];
    return <InputByKind {...props} />;
  } else return <DefaultInput {...props} />;
}
