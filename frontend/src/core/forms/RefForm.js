import React, { useMemo } from 'react';

export default function RefForm({ children, title, noTitle, grid, setDocument }) {
  useMemo(
    () =>
      setDocument(
        grid.refs.resolved.dataTable.documents.find((d) => d._id === grid.currentDocumentId)
      ),
    [grid.currentDocumentId, grid.refs.resolved.dataTable.documents, setDocument]
  );

  return (
    <>
      {!noTitle && <h2 className="mb-4">{title}</h2>}
      {children}
    </>
  );
}
