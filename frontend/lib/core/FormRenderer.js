import React, { useMemo, useEffect, useRef } from 'react';
import deepClone from 'deep-clone';
import { useLoadable } from '../hooks/loadable';
import ComponentRenderer from './ComponentRenderer';
import ErrorComponent from './ErrorComponent';
export default function FormRenderer({
  active,
  url,
  parameters,
  rootOptions,
  Wrapper,
  LoadingWrapper
}) {
  const paramsObj = useMemo(() => ({
    parameters
  }), [parameters]);
  const loadable = useLoadable({
    active,
    url,
    method: 'post',
    parameters: paramsObj,
    cacheEnabled: true,
    errorHandled: false
  });
  const {
    data,
    loaded,
    loading,
    error,
    refresh
  } = loadable; // always store the previous data

  const previousData = useRef(null);
  useEffect(() => {
    if (loaded) previousData.current = deepClone(data);
  }, [loaded]);

  function Loaded(data) {
    return Wrapper ? /*#__PURE__*/React.createElement(Wrapper, loadable, /*#__PURE__*/React.createElement(ComponentRenderer, {
      parameters: paramsObj,
      configuration: data.configuration,
      refresh: refresh,
      rootOptions: rootOptions
    })) : /*#__PURE__*/React.createElement(ComponentRenderer, {
      parameters: paramsObj,
      configuration: data.configuration,
      refresh: refresh,
      rootOptions: rootOptions
    });
  }

  if (error) return Wrapper ? /*#__PURE__*/React.createElement(Wrapper, loadable, /*#__PURE__*/React.createElement(ErrorComponent, {
    error: error
  })) : /*#__PURE__*/React.createElement(ErrorComponent, {
    error: error
  });
  if (loading && LoadingWrapper) return /*#__PURE__*/React.createElement(LoadingWrapper, loadable);else if (loaded) return Loaded(data); // Else just continue to show the previous data
  else if (previousData.current) return Loaded(previousData.current);
  return null;
}