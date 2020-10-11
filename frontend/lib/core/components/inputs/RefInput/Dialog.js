import React, { useRef } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import FormRenderer from '../../../FormRenderer';
/**
 * Load a RefForm so the user can choose a document
 */

export default function Dialog({
  reference,
  constraint,
  open,
  onChange
}) {
  const document = useRef(null);

  const ModalWrapper = ({
    data,
    loaded,
    loading,
    error,
    children
  }) => {
    return /*#__PURE__*/React.createElement(React.Fragment, null, loaded && data && data.configuration && data.configuration.title && /*#__PURE__*/React.createElement(ModalHeader, {
      toggle: () => onChange(null)
    }, data.configuration.title), /*#__PURE__*/React.createElement(ModalBody, null, loaded ? children : loading ? 'Caricamento in corso ...' : ''), loaded && !error && /*#__PURE__*/React.createElement(ModalFooter, null, /*#__PURE__*/React.createElement(Button, {
      color: "primary",
      onClick: () => onChange(document.current)
    }, "Seleziona")));
  };

  return /*#__PURE__*/React.createElement(Modal, {
    isOpen: open,
    toggle: () => onChange(null),
    className: "p-4 mw-100 w-100"
  }, /*#__PURE__*/React.createElement(FormRenderer, {
    active: open,
    url: `/form/ref-form/${reference}`,
    parameters: {
      constraint
    },
    rootOptions: {
      noTitle: true,
      setDocument: value => document.current = value
    },
    Wrapper: ModalWrapper
  }));
}