import React, { useRef } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

import FormRenderer from '../../../FormRenderer';

/**
 * Load a RefForm so the user can choose a document
 */
export default function Dialog({ reference, constraint, open, onChange }) {  
  const document = useRef(null);

  const ModalWrapper = ({ data, loaded, loading, error, children }) => {
    return (
      <>
        {loaded && data && data.configuration && data.configuration.title && (
          <ModalHeader toggle={() => onChange(null)}>{data.configuration.title}</ModalHeader>
        )}
        <ModalBody>{loaded ? children : loading ? 'Caricamento in corso ...' : ''}</ModalBody>
        {loaded && !error && (
          <ModalFooter>
            <Button color="primary" onClick={() => onChange(document.current)}>
              Seleziona
            </Button>
          </ModalFooter>
        )}
      </>
    );
  };

  return (
    <Modal isOpen={open} toggle={() => onChange(null)} className="p-4 mw-100 w-100">
      <FormRenderer
        active={open}
        url={`/form/ref-form/${reference}`}
        parameters={{ constraint }}
        rootOptions={{ noTitle: true, setDocument: (value) => (document.current = value) }}
        Wrapper={ModalWrapper}
      />
    </Modal>
  );
}
