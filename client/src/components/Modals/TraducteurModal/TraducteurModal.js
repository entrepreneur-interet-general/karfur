import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import {
  Col,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  FormGroup,
  Label,
  Spinner,
} from "reactstrap";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import FButton from "../../FigmaUI/FButton/FButton";

import API from "../../../utils/API";
import { fetchUserActionCreator } from "../../../services/User/user.actions";

import "./TraducteurModal.scss";

class TraducteurModal extends Component {
  state = {
    langues: [],
    spinner: false,
  };
  shadowSelectedLanguages = [];

  // eslint-disable-next-line react/no-deprecated
  componentWillReceiveProps(nextProps) {
    if (
      nextProps.user &&
      nextProps.user.selectedLanguages &&
      nextProps.langues &&
      nextProps.langues.length > 0
    ) {
      let selectedLangues = nextProps.user.selectedLanguages;
      this.setState({
        langues: [...nextProps.langues].map((x) => ({
          ...x,
          checked: selectedLangues.some((y) => y._id === x._id),
        })),
      });
    }
  }

  handleCheck = (_, key) => {
    // we have to check === key+1 because we remove french from list which has the first index
    this.setState((prevState) => ({
      langues: prevState.langues.map((x, i) =>
        i === key + 1 ? { ...x, checked: !x.checked } : x
      ),
    }));
  };

  onValidate = () => {
    this.setState({ spinner: true });
    let user = { ...this.props.user };
    let newUser = {
      _id: user._id,
      selectedLanguages: [
        ...this.shadowSelectedLanguages,
        ...this.state.langues.filter(
          (x) =>
            x.checked &&
            !this.shadowSelectedLanguages.some((y) => y._id === x._id)
        ),
      ].map((el) => {
        return {
          _id: el._id,
          i18nCode: el.i18nCode,
          langueCode: el.langueCode,
          langueFr: el.langueFr,
          langueLoc: el.langueLoc,
        };
      }),
      traducteur: true,
    };
    API.set_user_info(newUser).then((data) => {
      let userRes = data.data.data;
      if (!userRes) {
        return;
      }
      const shouldRedirect = !!this.props.redirect;
      this.props.fetchUser({ shouldRedirect, user: userRes });
      this.setState({ spinner: false });
      if (!this.props.redirect && this.props.setUser) {
        this.props.setUser(userRes);
      }
    });
  };

  render() {
    const { show, toggle } = this.props;
    const { langues } = this.state;
    return (
      <Modal isOpen={show} toggle={toggle} className="modal-traducteur">
        <ModalHeader toggle={toggle}>C'est parti !</ModalHeader>
        <ModalBody>
          <h5>Quelles sont vos langues de travail ?</h5>
          <FormGroup row>
            {(langues || [])
              .filter(
                (langue) =>
                  (langue.avancement > 0.8) & (langue.i18nCode !== "fr")
              )
              .map((langue, key) => {
                return (
                  <Col lg="3" key={key}>
                    <FormGroup check>
                      <Input
                        className="form-check-input langue"
                        type="checkbox"
                        id={langue._id}
                        checked={langue.checked}
                        onChange={(e) => this.handleCheck(e, key)}
                      />
                      <Label
                        check
                        className="form-check-label"
                        htmlFor={langue._id}
                      >
                        {langue.langueFr}
                      </Label>
                    </FormGroup>
                  </Col>
                );
              })}
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <FButton className="validate hero" onClick={this.onValidate}>
            {this.props.setUser ? "Valider" : "Devenir traducteur"}
            {this.state.spinner && <Spinner color="success" className="ml-2" />}
          </FButton>
        </ModalFooter>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    langues: state.langue.langues,
  };
};

const mapDispatchToProps = {
  fetchUser: fetchUserActionCreator,
};

export default withRouter(
  withTranslation()(
    connect(mapStateToProps, mapDispatchToProps)(TraducteurModal)
  )
);
