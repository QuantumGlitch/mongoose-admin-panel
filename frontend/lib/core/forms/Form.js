import React from 'react';
export default function Form({
  children,
  title,
  noTitle
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, !noTitle && /*#__PURE__*/React.createElement("h2", {
    className: "mb-4"
  }, title), children);
}