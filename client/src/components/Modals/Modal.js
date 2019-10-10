import React from 'react';
import { Modal, ModalHeader } from 'reactstrap';

import './Modal.scss';

const modal = (props) => {
  const {show, toggle, modalHeader, className, children} = props;
  return (
    <Modal isOpen={show} toggle={toggle} className={["custom-modal", className].join(" ")}>
      {modalHeader && 
        <ModalHeader toggle={toggle}>
          {modalHeader}
        </ModalHeader>}

      {children}
    </Modal>
  )
}

export default modal;