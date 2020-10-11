import { useEffect, useReducer, useCallback } from 'react';
import API from '../../services/API/API';

const initialState = {
  loaded: false,
  loading: false,
  data: {},
  error: null,
  propsChanged: false,
  reload: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'loading':
      return {
        ...initialState,
        loading: true,
      };
    case 'loaded':
      return {
        ...initialState,
        loaded: true,
        data: action.data,
        reload: state.propsChanged,
      };
    case 'error':
      return {
        ...initialState,
        loaded: true,
        error: action.error,
        reload: state.propsChanged,
      };
    case 'propsChanged':
      return state.loading ? { ...state, propsChanged: true } : { ...state, reload: true };
    default:
      throw new Error();
  }
}

export function useLoadable({
  active = true,
  url,
  method,
  parameters,
  cacheEnabled = true,
  errorHandled = false,
  rawResponse = false,
}) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const load = useCallback(
    (url, method, parameters, cacheEnabled, errorHandled) => {
      if (state.loading) return;

      dispatch({ type: 'loading' });

      return API.create(url, method, parameters, cacheEnabled, errorHandled, rawResponse)
        .then((data) => dispatch({ type: 'loaded', data }))
        .catch((error) => dispatch({ type: 'error', error }));
    },
    [url, method, parameters, cacheEnabled, errorHandled, rawResponse]
  );

  // reload the request
  const refresh = useCallback(
    (params) => {
      if (!params) params = {};

      // defaulting parameters if no value is present
      params.url = params.url === undefined ? url : params.url;
      params.method = params.method === undefined ? method : params.method;
      params.parameters = params.parameters === undefined ? parameters : params.parameters;
      params.cacheEnabled = params.cacheEnabled === undefined ? cacheEnabled : params.cacheEnabled;
      params.errorHandled = params.errorHandled === undefined ? errorHandled : params.errorHandled;
      params.rawResponse = params.rawResponse === undefined ? rawResponse : params.rawResponse;

      return load(
        params.url,
        params.method,
        params.parameters,
        params.cacheEnabled,
        params.errorHandled,
        params.rawResponse
      );
    },
    [load]
  );

  // initialization of the useLoadable
  useEffect(() => {
    if (state.reload && url) load(url, method, parameters, cacheEnabled, errorHandled, rawResponse);
  }, [state.reload]);

  // if url parameters change (and is active) must trigger new load request after the current has been loaded
  useEffect(() => {
    if (active) dispatch({ type: 'propsChanged' });
  }, [active, url, method, parameters, cacheEnabled, errorHandled, rawResponse]);

  return {
    ...state,
    errorString: state.error ? API.error(state.error) : null,
    refresh,
  };
}
