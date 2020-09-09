import React from "react";
import { Input, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { withTranslation } from "react-i18next";
import variables from "scss/colors.scss";

import "./ReactionModal.scss";
import FButton from "../../FigmaUI/FButton/FButton";

const suggererModal = (props) => {
  const { t, showModals } = props;
  const isOpen = showModals.reaction;
  let name = "reaction",
    fieldName = "suggestions";

  return (
    <Modal
      isOpen={isOpen}
      toggle={() => props.toggleModal(false, name)}
      className="modal-suggerer"
    >
      <ModalHeader toggle={() => props.toggleModal(false, name)}>
        {t("Dispositif.Envoyer une réaction", "Envoyer une réaction")}
      </ModalHeader>
      <ModalBody>
        <div
          style={{ fontSize: " 16px", lineHeight: "20px", marginBottom: "8px" }}
        >
          {t(
            "Dispositif.Dites nous ce que vous pensez",
            "Dites nous ce que vous pensez :"
          )}
        </div>

        <Input
          type="textarea"
          placeholder="J'écris ici ma réaction"
          rows={5}
          value={props.suggestion}
          onChange={props.onChange}
          id="suggestion"
        />
      </ModalBody>
      <ModalFooter>
        <FButton
          tag={"a"}
          href="https://help.refugies.info/fr/"
          target="_blank"
          rel="noopener noreferrer"
          type="help"
          name="question-mark-circle-outline"
          fill={variables.error}
        >
          {t("J'ai besoin d'aide")}
        </FButton>
        <FButton
          type="validate"
          name="checkmark"
          onClick={() => props.onValidate(name, fieldName)}
        >
          {t("Envoyer", "Envoyer")}
        </FButton>

        {/* <Button
          color="dark"
          className="send-btn"
          onClick={() => props.onValidate(name, fieldName)}
        >
          
        </Button> */}
      </ModalFooter>
    </Modal>
  );
};

export default withTranslation()(suggererModal);
