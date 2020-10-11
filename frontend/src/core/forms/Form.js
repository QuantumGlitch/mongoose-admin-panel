import React from 'react';

export default function Form({ children, title, noTitle }) {
  return (
    <>
      {!noTitle && <h2 className="mb-4">{title}</h2>}
      {children}
    </>
  );
}
