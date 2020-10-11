function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import React, { useEffect } from 'react';
import { Button, FormFeedback, Label, ListGroup, ListGroupItem } from 'reactstrap';
import { Delete, Download, Upload } from 'react-feather';
import { Ɂ } from '../../../global';
import { useDropzone } from 'react-dropzone';
import API from '../../../services/API/API';
import { useField } from './shared/hooks';
import './FileInput.css';

function formatFileSize(size) {
  if (size < 1024) return size + ' Bytes';else if (size < 1024 * 1024) return (size / 1024).toFixed(2) + 'KB';else return (size / (1024 * 1024)).toFixed(2) + 'MB';
}

function FileUploader({
  multiple,
  onChange,
  formats,
  uploadPath
}) {
  const {
    acceptedFiles,
    getRootProps,
    getInputProps
  } = useDropzone({
    multiple,
    ...(formats ? {
      accept: formats
    } : {})
  }); // On files change

  useEffect(() => {
    // We need to upload the new ones
    if (acceptedFiles.length > 0) API.multipleFilesUpload(`/file/upload?path=${uploadPath}`, 'file', acceptedFiles).then(({
      result
    }) => onChange(multiple ? result : result[0]));
  }, [acceptedFiles.length]);
  const inputProps = getInputProps();
  return /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement("div", getRootProps({
    className: 'dropzone'
  }), /*#__PURE__*/React.createElement("input", _extends({}, inputProps, {
    className: (inputProps.className || '') + ' p-4'
  })), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement(Upload, {
    fontSize: "16px",
    className: "mr-2"
  }), "Drag and drop ", multiple ? 'one or more files' : 'one file', " (", formats ? formats.join(', ') : 'any', ") or click for", ' ', multiple ? 'choose them' : 'choose it')));
}

function FileViewer({
  files,
  deleteFile
}) {
  const filesElements = (files instanceof Array ? files : [files]).map(({
    _id,
    name,
    mimeType,
    size
  }) => /*#__PURE__*/React.createElement(ListGroupItem, {
    key: _id
  }, /*#__PURE__*/React.createElement(Button, {
    color: "primary",
    onClick: () => window.open(API.url(`file/view/${_id}`), '_blank'),
    className: "d-block"
  }, /*#__PURE__*/React.createElement(Download, {
    fontSize: "16px",
    className: "mr-2"
  }), " Download ", name, " (", formatFileSize(size), ")"), /*#__PURE__*/React.createElement(Button, {
    onClick: () => deleteFile(_id),
    className: "d-block mt-2"
  }, /*#__PURE__*/React.createElement(Delete, {
    fontSize: "16px",
    className: "mr-2"
  }), " Delete"), mimeType && mimeType.indexOf('image') > -1 ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("img", {
    alt: `Allegato ${_id}`,
    src: API.url(`file/view/${_id}`),
    className: "mw-100 mt-2 mb-4"
  })) : /*#__PURE__*/React.createElement(React.Fragment, null)));
  return /*#__PURE__*/React.createElement(ListGroup, {
    className: "mt-4"
  }, filesElements);
}

export default function FileInput({
  document,
  emitter,
  fieldInfo,
  onChange,
  validationError,
  fieldBehaviours,
  label = true
}) {
  const multiple = fieldInfo.type instanceof Array;
  const {
    formats,
    uploadPath
  } = multiple ? fieldInfo.type[0] : fieldInfo;
  const {
    fieldValue,
    onChangeMiddleware,
    validationError: customValidationError
  } = useField({
    document,
    emitter,
    fieldInfo,
    fieldBehaviours,
    onChange
  });

  function deleteFile(id) {
    if (multiple) onChangeMiddleware(fieldValue.filter(({
      _id
    }) => _id !== id));else onChangeMiddleware(null);
  } // Default Input


  return /*#__PURE__*/React.createElement(React.Fragment, null, label && /*#__PURE__*/React.createElement(Label, null, fieldInfo.description), /*#__PURE__*/React.createElement(FileUploader, _extends({
    multiple: multiple
  }, {
    formats,
    uploadPath,
    onChange: newFiles => onChangeMiddleware(multiple ? [...newFiles, ...(fieldValue || [])] : newFiles)
  })), !Ɂ(fieldValue) && Object.keys(fieldValue).length > 0 && /*#__PURE__*/React.createElement(FileViewer, {
    files: fieldValue,
    deleteFile: deleteFile
  }), (customValidationError || validationError) && /*#__PURE__*/React.createElement(FormFeedback, {
    className: "d-block"
  }, (customValidationError || validationError).message));
}