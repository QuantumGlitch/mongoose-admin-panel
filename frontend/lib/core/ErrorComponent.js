import React from 'react';
import errorImage from '../assets/error.svg';
export default function ErrorPageComponent({
  error
}) {
  // HTTP Error
  if (error.response) {
    const status = error.response.status;
    const title = error.response.statusText;
    const message = error.response.data.message || error.response.data.error;
    return /*#__PURE__*/React.createElement("div", {
      className: "page-content d-flex align-items-center justify-content-center"
    }, /*#__PURE__*/React.createElement("div", {
      className: "row w-100 mx-0 auth-page"
    }, /*#__PURE__*/React.createElement("div", {
      className: "col-md-8 col-xl-6 mx-auto d-flex flex-column align-items-center"
    }, /*#__PURE__*/React.createElement("img", {
      src: errorImage,
      className: "img-fluid mb-2",
      alt: "404"
    }), /*#__PURE__*/React.createElement("h1", {
      className: "font-weight-bold mb-22 mt-2 tx-80 text-muted"
    }, status), /*#__PURE__*/React.createElement("h4", {
      className: "mb-2"
    }, title), /*#__PURE__*/React.createElement("h6", {
      className: "text-muted mb-3 text-center"
    }, message))));
  } else if (error.data) {
    const status = error.status === 200 ? 'Errore' : error.status;
    const title = error.status === 200 ? '' : error.statusText;
    const message = error.data.message || error.data.error;
    return /*#__PURE__*/React.createElement("div", {
      className: "page-content d-flex align-items-center justify-content-center"
    }, /*#__PURE__*/React.createElement("div", {
      className: "row w-100 mx-0 auth-page"
    }, /*#__PURE__*/React.createElement("div", {
      className: "col-md-8 col-xl-6 mx-auto d-flex flex-column align-items-center"
    }, /*#__PURE__*/React.createElement("img", {
      src: errorImage,
      className: "img-fluid mb-2",
      alt: "404"
    }), /*#__PURE__*/React.createElement("h1", {
      className: "font-weight-bold mb-22 mt-2 tx-80 text-muted"
    }, status), /*#__PURE__*/React.createElement("h4", {
      className: "mb-2"
    }, title), /*#__PURE__*/React.createElement("h6", {
      className: "text-muted mb-3 text-center"
    }, message))));
  } else return /*#__PURE__*/React.createElement("div", {
    className: "page-content d-flex align-items-center justify-content-center"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row w-100 mx-0 auth-page"
  }, /*#__PURE__*/React.createElement("div", {
    className: "col-md-8 col-xl-6 mx-auto d-flex flex-column align-items-center"
  }, /*#__PURE__*/React.createElement("img", {
    src: errorImage,
    className: "img-fluid mb-2",
    alt: "Offline"
  }), /*#__PURE__*/React.createElement("h1", {
    className: "font-weight-bold mb-22 mt-2 tx-80 text-muted"
  }, "Offline"), /*#__PURE__*/React.createElement("h6", {
    className: "text-muted mb-3 text-center"
  }, "Impossibile raggiungere il server."))));
}