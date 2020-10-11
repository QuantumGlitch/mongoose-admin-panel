import React from 'react';

import errorImage from '../assets/error.svg';

export default function ErrorPageComponent({ error }) {
  // HTTP Error
  if (error.response) {
    const status = error.response.status;
    const title = error.response.statusText;
    const message = error.response.data.message || error.response.data.error;

    return (
      <div className="page-content d-flex align-items-center justify-content-center">
        <div className="row w-100 mx-0 auth-page">
          <div className="col-md-8 col-xl-6 mx-auto d-flex flex-column align-items-center">
            <img src={errorImage} className="img-fluid mb-2" alt="404" />
            <h1 className="font-weight-bold mb-22 mt-2 tx-80 text-muted">{status}</h1>
            <h4 className="mb-2">{title}</h4>
            <h6 className="text-muted mb-3 text-center">{message}</h6>
          </div>
        </div>
      </div>
    );
  } else if (error.data) {
    const status = error.status === 200 ? 'Errore' : error.status;
    const title = error.status === 200 ? '' : error.statusText;
    const message = error.data.message || error.data.error;

    return (
      <div className="page-content d-flex align-items-center justify-content-center">
        <div className="row w-100 mx-0 auth-page">
          <div className="col-md-8 col-xl-6 mx-auto d-flex flex-column align-items-center">
            <img src={errorImage} className="img-fluid mb-2" alt="404" />
            <h1 className="font-weight-bold mb-22 mt-2 tx-80 text-muted">{status}</h1>
            <h4 className="mb-2">{title}</h4>
            <h6 className="text-muted mb-3 text-center">{message}</h6>
          </div>
        </div>
      </div>
    );
  } else
    return (
      <div className="page-content d-flex align-items-center justify-content-center">
        <div className="row w-100 mx-0 auth-page">
          <div className="col-md-8 col-xl-6 mx-auto d-flex flex-column align-items-center">
            <img src={errorImage} className="img-fluid mb-2" alt="Offline" />
            <h1 className="font-weight-bold mb-22 mt-2 tx-80 text-muted">Offline</h1>
            <h6 className="text-muted mb-3 text-center">Impossibile raggiungere il server.</h6>
          </div>
        </div>
      </div>
    );
}
