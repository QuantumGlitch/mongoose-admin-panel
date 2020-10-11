import { useEffect, useCallback, useRef } from 'react'; // React hook for delaying calls with time
// returns callback to use for cancelling

export function useInterval(callback, interval) {
  const intervalIdRef = useRef();
  const cancel = useCallback(() => {
    const intervalId = intervalIdRef.current;

    if (intervalId) {
      intervalIdRef.current = undefined;
      clearInterval(intervalId);
    }
  }, [intervalIdRef]);
  useEffect(() => {
    intervalIdRef.current = setInterval(callback, interval);
    return cancel;
  }, [callback, interval, cancel]);
  return cancel;
}