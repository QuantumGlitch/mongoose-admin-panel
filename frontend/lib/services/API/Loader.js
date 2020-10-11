function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import React from 'react';
import LoaderSpinner from 'react-loader-spinner'; // Loader disappear if no hide request, after 1 min

const TIMEOUT = 60000;
/*
  This loader handles all ajax requests loading in page
*/

export default class Loader extends React.Component {
  // Statics
  static show() {
    // prevent invoking loader before component is mounted
    if (!Loader.mounted) return;

    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }

    this.instance.setState({
      show: true
    });
    this.showCount++;
    if (this.timeout) clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.hideAll();
    }, TIMEOUT);
  }

  static hide() {
    // prevent invoking loader before component is mounted
    if (!Loader.mounted) return;
    if (--this.showCount <= 0) this.showCount = 0;

    if (this.showCount === 0 && this.instance.state.show) {
      this.hideTimeout = setTimeout(() => {
        if (this.instance.state.show && this.showCount === 0) this.instance.setState({
          show: false
        });
      }, 300);
    }
  }

  static hideAll() {
    this.showCount = 0;
    if (this.instance.state.show) this.instance.setState({
      show: false
    });
  } // Component


  constructor(props) {
    super(props);
    this.state = {
      show: false
    };
    Loader.instance = this;
  }

  componentDidMount() {
    Loader.mounted = true;
  }

  render() {
    return this.state.show ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'block',
        position: 'fixed',
        zIndex: 10000,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'inline-block',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      }
    }, /*#__PURE__*/React.createElement(LoaderSpinner, {
      type: "Audio",
      color: "var(--primary)",
      height: '56px',
      width: '56px'
    }))) : null;
  }

}

_defineProperty(Loader, "instance", void 0);

_defineProperty(Loader, "mounted", false);

_defineProperty(Loader, "showCount", 0);

_defineProperty(Loader, "timeout", null);

_defineProperty(Loader, "hideTimeout", null);