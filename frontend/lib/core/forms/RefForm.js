import React, { useMemo } from 'react';
export default function RefForm({
  children,
  title,
  noTitle,
  grid,
  setDocument
}) {
  useMemo(() => setDocument(grid.refs.resolved.dataTable.documents.find(d => d._id === grid.currentDocumentId)), [grid.currentDocumentId, grid.refs.resolved.dataTable.documents, setDocument]);
  return /*#__PURE__*/React.createElement(React.Fragment, null, !noTitle && /*#__PURE__*/React.createElement("h2", {
    className: "mb-4"
  }, title), children);
}