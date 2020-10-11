import { useRef, useEffect } from 'react';
import isDeepEqual from 'react-fast-compare';
import deepClone from 'deep-clone';

/**
 * Execute useEffect on object
 */
export default function useEffectDeepEqual(callback, object) {
  // Previous value
  const previousValue = useRef(null);
  const isDeepEqualCondition = isDeepEqual(object, previousValue.current);
  
  useEffect(() => {
    if (!isDeepEqualCondition) {
      previousValue.current = deepClone(object);
      callback();
    }
  }, [isDeepEqualCondition, callback]);
}
