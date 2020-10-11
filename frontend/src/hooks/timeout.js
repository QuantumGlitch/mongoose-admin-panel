import { useEffect, useCallback, useRef } from 'react';

// React hook for delaying calls with time
// returns callback to use for cancelling
export function useTimeout(callback, timeout) {
  const timeoutIdRef = useRef();
  
  const cancel = useCallback(() => {
    const timeoutId = timeoutIdRef.current;
    if (timeoutId) {
      timeoutIdRef.current = undefined;
      clearTimeout(timeoutId);
    }
  }, [timeoutIdRef]);

  useEffect(() => {
    timeoutIdRef.current = setTimeout(callback, timeout);
    return cancel;
  }, [callback, timeout, cancel]);

  return cancel;
}
