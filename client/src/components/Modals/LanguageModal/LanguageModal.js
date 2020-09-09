import React from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ListGroup,
  ListGroupItem,
  Row,
  Col,
  Progress,
} from "reactstrap";
import { withTranslation } from "react-i18next";
import { colorAvancement } from "../../Functions/ColorFunctions";
import { NavHashLink } from "react-router-hash-link";

import "./LanguageModal.scss";
import FButton from "../../FigmaUI/FButton/FButton";
import EVAIcon from "../../UI/EVAIcon/EVAIcon";
import { Event, initGA } from "../../../tracking/dispatch";

const languageModal = (props) => {
  const getAvancementTrad = (element) => {
    if (props.languages[element].i18nCode === "fr") return 1;

    return props.languages[element].avancementTrad;
  };

  const { t } = props;
  // const languages = (props.languages || []).map(x => ({...x, avancement: (x.avancement + dispositifs.find(y =>)) / 2}))
  if (props.show) {
    return (
      <Modal
        isOpen={props.show}
        toggle={props.toggle}
        className="language-modal"
      >
        <ModalHeader toggle={props.toggle}>
          <span className="title">
            {t("Homepage.Choisir une langue", "Choisir une langue")}
          </span>
          <div className="sous-titre">
            {t(
              "Homepage.site dispo",
              "Réfugiés.info est disponible dans les langues suivantes :"
            )}
          </div>
        </ModalHeader>
        <ModalBody>
          <ListGroup>
            {Object.keys(props.languages).map((element) => {
              if (element === "unavailable") {
                return (
                  <ListGroupItem
                    action
                    key={element}
                    className="unavailable-item"
                  >
                    <Row>
                      <Col
                        xl="8"
                        lg="8"
                        md="8"
                        sm="8"
                        xs="8"
                        className="vertical-center"
                      >
                        <b>
                          {t("Homepage.traduire", "Aidez-nous à traduire !")}
                        </b>
                      </Col>
                      <Col
                        xl="4"
                        lg="4"
                        md="4"
                        sm="4"
                        xs="4"
                        className="button-col"
                      >
                        <FButton
                          tag={NavHashLink}
                          to="/comment-contribuer#traduire"
                          onClick={props.toggle}
                          type="outline"
                        >
                          {t("Homepage.Je traduis", "Je traduis")}
                        </FButton>
                      </Col>
                    </Row>
                  </ListGroupItem>
                );
              }
              const isSelected =
                props.languages[element].i18nCode === props.current_language;
              return (
                <ListGroupItem
                  action
                  key={props.languages[element]._id}
                  disabled={!props.languages[element].avancement}
                  onClick={() => {
                    initGA();
                    Event(
                      "CHANGE_LANGUAGE",
                      props.languages[element].i18nCode,
                      "label"
                    );
                    props.changeLanguage(props.languages[element].i18nCode);
                  }}
                  className={isSelected ? "active" : ""}
                >
                  <Row>
                    <Col xl="1" lg="1" md="1" sm="1" xs="1">
                      <i
                        className={
                          "flag-icon flag-icon-" +
                          props.languages[element].langueCode
                        }
                        title={props.languages[element].langueCode}
                        id={props.languages[element].langueCode}
                      ></i>
                    </Col>
                    <Col xl="5" lg="5" md="5" sm="5" xs="5">
                      <span>
                        <b>{props.languages[element].langueFr}</b> -{" "}
                        {props.languages[element].langueLoc}
                      </span>
                    </Col>
                    <Col
                      xl="5"
                      lg="5"
                      md="5"
                      sm="5"
                      xs="5"
                      className="progress-col"
                    >
                      <Progress
                        color={colorAvancement(getAvancementTrad(element))}
                        value={getAvancementTrad(element) * 100}
                      />
                      <span
                        className={
                          "text-" + colorAvancement(getAvancementTrad(element))
                        }
                      >
                        <b>
                          {Math.round(
                            getAvancementTrad(element) * 100 || 0,
                            0
                          ) + " %"}
                        </b>
                      </span>
                    </Col>
                    <Col
                      xl="1"
                      lg="1"
                      md="1"
                      sm="1"
                      xs="1"
                      className="icon-col"
                    >
                      {isSelected && (
                        <EVAIcon
                          name="checkmark-circle-2"
                          fill="#FFFFFF"
                          size="large"
                        />
                      )}
                    </Col>
                  </Row>
                </ListGroupItem>
              );
            })}
          </ListGroup>
        </ModalBody>
      </Modal>
    );
  }
  return false;
};

export default withTranslation()(languageModal);
