import React from 'react';
import { Modal, ModalHeader, ModalBody, ListGroup, ListGroupItem, Row, Col, Progress } from 'reactstrap';
import { withTranslation } from 'react-i18next';
import {colorAvancement} from '../../Functions/ColorFunctions';

import './LanguageModal.scss';
import FButton from '../../FigmaUI/FButton/FButton';
import EVAIcon from '../../UI/EVAIcon/EVAIcon';

const languageModal = (props) => {
  const {t} = props;
  if(props.show){
    return(
      <Modal isOpen={props.show} toggle={props.toggle} className="language-modal">
        <ModalHeader toggle={props.toggle}>
          <span className="title">{t("Homepage.Choisir une langue", "Choisir une langue")}</span>
          {/* <NavLink to={{ pathname: '/login', state: {traducteur: true, redirectTo:"/backend/user-dashboard"} }} className="subtitle">
            Aider à traduire
          </NavLink> */}
          <div className="sous-titre">{t("Homepage.site dispo", "Réfugiés.info est disponible dans les langues suivantes :")}</div>
        </ModalHeader>
        <ModalBody>
          <ListGroup>
            {Object.keys(props.languages).map((element) => {
              if(element === "unavailable"){
                return(
                  <ListGroupItem action 
                    key={element}
                    className="unavailable-item"
                  >
                    <Row>
                      <Col xl="8" lg="8" md="8" sm="8" xs="8" className="vertical-center">
                        <b>{t("Homepage.langue indispo", "Votre langue n’est pas disponible ?")}</b>
                      </Col>
                      <Col xl="4" lg="4" md="4" sm="4" xs="4" className="button-col">
                        <FButton type="outline">
                          {t("Homepage.Demander", "Demander")}
                        </FButton>
                      </Col>
                    </Row>
                  </ListGroupItem>
                )
              }else{
                const isSelected = props.languages[element].i18nCode === props.current_language;
                return (
                  <ListGroupItem action 
                    key={props.languages[element]._id} 
                    disabled={!props.languages[element].avancement}
                    onClick={() => props.changeLanguage(props.languages[element].i18nCode)}
                    className={isSelected ? "active" : ""}
                  >
                    <Row>
                      <Col xl="1" lg="1" md="1" sm="1" xs="1">
                        <i className={'flag-icon flag-icon-' + props.languages[element].langueCode} title={props.languages[element].langueCode} id={props.languages[element].langueCode}></i>
                      </Col>
                      <Col xl="5" lg="5" md="5" sm="5" xs="5">
                        <span><b>{props.languages[element].langueFr}</b> - {props.languages[element].langueLoc}</span>
                      </Col>
                      <Col xl="5" lg="5" md="5" sm="5" xs="5" className="progress-col">
                        <Progress color={colorAvancement(props.languages[element].avancement)} value={props.languages[element].avancement*100} />
                        {/* <span>{Math.round(props.languages[element].avancement*100 || 0,0) + ' %'}</span> */}
                      </Col>
                      <Col xl="1" lg="1" md="1" sm="1" xs="1" className="icon-col">
                        {isSelected &&
                          <EVAIcon name="checkmark-circle-2" fill="#FFFFFF" size="large"/> }
                      </Col>
                    </Row>
                  </ListGroupItem>
                );
              }
            })}
          </ListGroup>
        </ModalBody>
      </Modal>
    )
  }else{return false} 
}

export default withTranslation()(languageModal);