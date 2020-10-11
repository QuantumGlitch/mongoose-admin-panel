import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

/* show a dialog from a static context */
export default class Messages extends React.Component {
  static error(options) {
    Messages.instance.setState({
      isOpen: true,
      title: options.title ? String(options.title) : null,
      body: options.error ? String(options.error) : null,
      buttons: options.buttons ? options.buttons : [],
    });
  }

  static message(options) {
    Messages.instance.setState({
      isOpen: true,
      title: options.title ? String(options.title) : null,
      body: options.message ? String(options.message) : null,
      buttons: options.buttons ? options.buttons : [],
    });
  }

  static confirmDialog(options) {
    Messages.message({
      title: options.title,
      message: options.message,
      buttons: [
        {
          text: 'Ok',
          handler: options.confirm || (() => {}),
        },
        { text: 'Annulla', handler: options.cancel || (() => {}) },
      ],
    });
  }

  static instance;

  constructor(props) {
    super(props);
    Messages.instance = this;

    this.state = {
      isOpen: false,
      title: null,
      body: null,
      buttons: [],
    };

    this.toggle = this.toggle.bind(this);
  }

  toggle(callback) {
    this.setState(
      {
        isOpen: !this.state.isOpen,
        title: null,
        body: null,
        buttons: [],
      },
      typeof callback == 'function' ? callback : () => {}
    );
  }

  render() {
    return (
      <Modal
        isOpen={this.state.isOpen}
        centered={true}
        toggle={this.toggle}
        className={this.props.className}
      >
        {this.state.title && <ModalHeader toggle={this.toggle}>{this.state.title}</ModalHeader>}
        {this.state.body && <ModalBody>{this.state.body}</ModalBody>}
        <ModalFooter>
          {this.state.buttons && this.state.buttons.length > 0 ? (
            this.state.buttons.map((e, i) => (
              <Button
                key={i}
                color={e.color ? e.color : 'primary'}
                onClick={() => {
                  this.toggle(() => {
                    if (e.handler) e.handler();
                  });
                }}
              >
                {e.text ? e.text : 'Ok'}
              </Button>
            ))
          ) : (
            <Button color="primary" onClick={this.toggle}>
              Ok
            </Button>
          )}
        </ModalFooter>
      </Modal>
    );
  }
}
