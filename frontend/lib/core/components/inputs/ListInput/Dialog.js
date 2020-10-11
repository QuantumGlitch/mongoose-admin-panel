import React from 'react';
import { ɁɁ } from '../../../../global';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import DefaultView from './Default';
/**
 * Render all the list elements fields
 */

export default function ListDialog({
  setDialogOpen,
  fieldInfo,
  fieldValue,
  onChange,
  validationError,
  open
}) {
  return /*#__PURE__*/React.createElement(Modal, {
    isOpen: open,
    toggle: () => setDialogOpen(!open),
    className: "p-4 mw-100 w-100"
  }, /*#__PURE__*/React.createElement(ModalHeader, {
    toggle: () => setDialogOpen(!open)
  }, fieldInfo.description, " (", ɁɁ(fieldValue, 'length') || 0, " elements)"), /*#__PURE__*/React.createElement(ModalBody, null, /*#__PURE__*/React.createElement(DefaultView, {
    fieldInfo,
    fieldValue,
    onChange,
    validationError
  })));
}