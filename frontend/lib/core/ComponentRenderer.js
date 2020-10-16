function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import React, { useState, useEffect } from 'react';
import isDeepEqual from 'react-fast-compare'; // In memory structure for temp data

const components = {};
/**
 * Server-Side Components to Client-Side Components
 */

export const registeredComponents = {
  Form: require('./forms/Form').default,
  RefForm: require('./forms/RefForm').default,
  Detail: require('./components/Detail').default,
  Grid: require('./components/Grid').default,
  Tabs: require('./components/Tabs').default,
  // ReadOnly components
  DataTable: null
};
/**
 * @param {String[]} classPath
 */

function getComponentClassByClassPath(classPath) {
  let Component = null;

  for (const cls of classPath) if (cls && registeredComponents[cls]) Component = registeredComponents[cls];

  return Component;
}
/**
 * @param {*} configuration Server-side configuration object
 * @param {String} refId Id of the component to find
 */


export function findRef(configuration, refId) {
  if (configuration.id === refId) return configuration;else if (configuration.children && configuration.children.length > 0) for (let childConfig of configuration.children) {
    const foundConfig = findRef(childConfig, refId);
    if (foundConfig) return foundConfig;
  } else return null;
}
/**
 * Get Component's hierarchy by Server-Side config object
 * @param {*} configuration Configuration for current component
 * @param {*} globalConfiguration Configuration root
 */

function getComponentByConfiguration(configuration, globalConfiguration, rootOptions, bus) {
  const {
    children: configChildren,
    refs,
    classPath,
    ...configurationRest
  } = configuration;
  const Component = getComponentClassByClassPath(classPath); // If no component's class is available

  if (!Component) return null;
  const children = configChildren && configChildren.length > 0 ? configChildren.map(child => getComponentByConfiguration(child, globalConfiguration, null, bus)) : null;
  const componentRefs = {};

  if (refs) {
    // This component has references to other components
    // So pass these components configurations as properties for the Component that must be instantiated
    const refsKeys = Object.keys(refs);

    for (let refKey of refsKeys) componentRefs[refKey] = findRef(globalConfiguration, refs[refKey]);

    refs.resolved = componentRefs;
  } // If is not visible


  if (configuration.visible === false) return null;
  return /*#__PURE__*/React.createElement(Component, _extends({}, rootOptions, configurationRest, componentRefs, {
    key: configuration.id,
    bus: bus
  }), children);
}

export function ComponentRenderer({
  parameters,
  configuration,
  rootOptions,
  refresh
}) {
  // This object will be used for communication among components
  const bus = {
    nextHash: null,
    serialized: {},

    /**
     * Store config that must be send to server on submit
     * @param {String} id Id of the component
     * @param {Object} obj Server-side config for the component
     */
    serialize(id, obj) {
      this.serialized[id] = obj;
      return this;
    },

    submit(callback) {
      const assembleConfig = configuration => {
        const serialization = this.serialized[configuration.id];
        return {
          id: configuration.id,
          ...serialization,
          ...(configuration.children && configuration.children.length > 0 ? {
            children: configuration.children.map(child => assembleConfig(child))
          } : {})
        };
      }; // Join all the serialized object respecting the configuration-tree's order


      const submitConfig = assembleConfig(configuration);
      refresh({
        method: 'post',
        parameters: { ...(parameters || {}),
          configuration: submitConfig
        }
      }).then(() => {
        if (callback) callback();
      });
      return this;
    },

    /**
     * Update a property for a component and refresh the component's tree
     * @param {String} id
     * @param {String} prop
     * @param {Object} value
     */
    updateComponentProp(id, prop, value) {
      const config = findRef(stateConfig, id);
      config[prop] = value;
      setStateConfig({ ...stateConfig
      });
    },

    /**
     * Submit configuration and then navigate to hash
     * @param {String} hash
     */
    submitAndHash(hash) {
      window.location.hash = '';
      components[configuration.id] = {
        nextHash: hash
      };
      this.submit();
    }

  };
  if (configuration && configuration.id && !components[configuration.id]) components[configuration.id] = {};
  const [stateConfig, setStateConfig] = useState(configuration);
  const isSameConfig = isDeepEqual(configuration, stateConfig);
  useEffect(() => {
    if (!isSameConfig) setStateConfig(configuration);
  }, [isSameConfig]); // Move to the focused page zone

  useEffect(() => {
    if (components[configuration.id].nextHash) {
      const timeout = setTimeout(() => {
        window.location.hash = components[configuration.id].nextHash;
        components[configuration.id].nextHash = null;
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [components[configuration.id].nextHash]);
  return getComponentByConfiguration(stateConfig, stateConfig, rootOptions, bus
  /*.current*/
  );
}
export default function ComponentRendererSafe(props) {
  return props.configuration ? ComponentRenderer(props) : null;
}