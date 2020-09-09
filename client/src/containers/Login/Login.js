import React, { Component } from "react";
import track from "react-tracking";
import { Form } from "reactstrap";
import i18n from "../../i18n";
import Swal from "sweetalert2";
import { NavLink } from "react-router-dom";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import LanguageBtn from "../../components/FigmaUI/LanguageBtn/LanguageBtn";
import API from "../../utils/API";
import setAuthToken from "../../utils/setAuthToken";
import FButton from "../../components/FigmaUI/FButton/FButton";
import FInput from "../../components/FigmaUI/FInput/FInput";
import { fetchUserActionCreator } from "../../services/User/user.actions";
import styled from "styled-components";
import LanguageModal from "../../components/Modals/LanguageModal/LanguageModal";

import variables from "scss/colors.scss";
import {
  fetchLanguesActionCreator,
  toggleLangueActionCreator,
  toggleLangueModalActionCreator,
} from "../../services/Langue/langue.actions";
import img from "../../assets/login_background.svg";

const StyledHeader = styled.div`
  font-weight: 500;
  font-size: 32px;
  line-height: 40px;
  color: #0421b1;
  margin-top: 64px;
`;

const StyledEnterValue = styled.div`
  font-weight: bold;
  font-size: 16px;
  line-height: 20px;
  margin-top: 64px;
  margin-bottom: 16px;
`;

const MainContainer = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  flex-direction: column;
  background-image: url(${img});
  background-color: #fbfbfb;
`;

const ContentContainer = styled.div`
  padding-top: 100px;
`;

const NoAccountContainer = styled.div`
  display: flex;
  flex-direction: row;
  font-size: 16px;
  line-height: 20px;
  color: #828282;
  margin-top: 64px;
`;

const PseudoForgottenContainer = styled.div`
  display: flex;
  flex-direction: row;
  font-size: 16px;
  line-height: 20px;
  color: #828282;
  margin-top: 16px;
  font-weight: bold;
`;

const FooterLink = styled.div`
  color: #828282;
  cursor: pointer;
  font-weight: bold;
  font-size: 16px;
  line-height: 20px;
  margin-top: 64px;
`;

const ErrorMessageContainer = styled.div`
  color: #e8140f;
  font-size: 16px;
  line-height: 20px;
  margin-top: 16px;
`;

const NoEmailRelatedContainer = styled.div`
  font-weight: bold;
  font-size: 16px;
  line-height: 20px;
  color: #e8140f;
  margin-top: 64px;
  margin-bottom: 64px;
`;

const EmailRelatedContainer = styled.div`
  font-weight: bold;
  font-size: 16px;
  line-height: 20px;
  margin-top: 64px;
  margin-bottom: 16px;
`;

const GoBackButton = (props) => {
  if (props.step === 0) {
    return (
      <NavLink to="/">
        <FButton
          type="light-action"
          name="arrow-back-outline"
          className="mr-10"
        >
          {props.t("Retour", "Retour")}
        </FButton>
      </NavLink>
    );
  }

  return (
    <FButton
      type="light-action"
      name="arrow-back-outline"
      className="mr-10"
      onClick={props.goBack}
    >
      {props.t("Retour", "Retour")}
    </FButton>
  );
};

export class Login extends Component {
  state = {
    username: "",
    password: "",
    code: "",
    email: "",
    phone: "",
    passwordVisible: false,
    step: 0,
    noUserError: false,
    wrongPasswordError: false,
    resetPasswordNotPossible: false,
    resetPasswordPossible: false,
    wrongAdminCodeError: false,
    unexpectedError: false,
    newAdminWithoutPhoneOrEmail: false,
  };

  componentDidMount() {
    this.props.fetchLangues();
    if (API.isAuth()) {
      return this.props.history.push("/");
    }
    window.scrollTo(0, 0);
  }

  togglePasswordVisibility = () =>
    this.setState((pS) => ({ passwordVisible: !pS.passwordVisible }));

  goBack = () =>
    this.setState({
      step: 0,
      password: "",
      wrongPasswordError: false,
      resetPasswordNotPossible: false,
      resetPasswordPossible: false,
      wrongAdminCodeError: false,
      unexpectedError: false,
      newAdminWithoutPhoneOrEmail: false,
    });

  resetPassword = () => {
    API.reset_password({ username: this.state.username })
      .then((data) => {
        this.setState({ resetPasswordPossible: true, email: data.data.data });
      })
      .catch((e) => {
        if (e.response.status === 403) {
          this.setState({ resetPasswordNotPossible: true });
        }
      });
  };

  changeLanguage = (lng) => {
    this.props.toggleLangue(lng);
    if (this.props.i18n.getResourceBundle(lng, "translation")) {
      this.props.i18n.changeLanguage(lng);
    } else {
      // eslint-disable-next-line no-console
      console.log("Resource not found in i18next.");
    }
    if (this.props.showLangModal) {
      this.props.toggleLangueModal();
    }
  };

  /**
   * Errors returned by login route
   * 400 : invalid request, no user with this pseudo
   * 500 : internal error
   * 401 : wrong password
   * 402 : wrong code (admin)
   * 404 : error sending code (admin), error creating admin account
   * 501 : no code provided (admin)
   * 200 : authentification succeeded
   * 502 : new admin without phone number or email
   */

  login = () => {
    const user = {
      username: this.state.username,
      password: this.state.password,
      code: this.state.code,
      email: this.state.email,
      phone: this.state.phone,
    };
    API.login(user)
      .then((data) => {
        const token = data.data.token;

        Swal.fire({
          title: "Yay...",
          text: "Authentification réussie !",
          type: "success",
          timer: 1500,
        }).then(() => {
          return this.props.history.push("/");
        });
        localStorage.setItem("token", token);
        setAuthToken(token);
        this.props.fetchUser();
      })
      .catch((e) => {
        // status 501 corresponds to an admin connecting (before entering the code)
        if (e.response.status === 501) {
          this.setState({ step: 2, newAdminWithoutPhoneOrEmail: false });
          // status 401 corresponds to wrong password
        } else if (e.response.status === 401) {
          this.setState({
            wrongPasswordError: true,
          });
        } else if (e.response.status === 402) {
          this.setState({ wrongAdminCodeError: true });
        } else if (e.response.status === 502) {
          this.setState({ newAdminWithoutPhoneOrEmail: true });
        } else {
          this.setState({ unexpectedError: true });
        }
      });
  };

  send = (e) => {
    e.preventDefault();

    // validate pseudo
    if (this.state.step === 0) {
      if (this.state.username.length === 0) {
        Swal.fire({
          title: "Oops...",
          text: "Aucun nom d'utilisateur n'est renseigné !",
          type: "error",
          timer: 1500,
        });
        return;
      }
      API.checkUserExists({ username: this.state.username }).then((data) => {
        const userExists = data.status === 200;
        // if user, go to next step (password)
        if (userExists) {
          this.setState({
            step: 1,
          });
        } else {
          // if no user: display error
          this.setState({
            noUserError: !userExists,
          });
        }
      });
    } else {
      // password check
      if (this.state.password.length === 0) {
        return Swal.fire({
          title: "Oops...",
          text: "Aucun mot de passe n'est renseigné !",
          type: "error",
          timer: 1500,
        });
      }
      this.login();
    }
  };

  handleChange = (event) =>
    this.setState({ [event.target.id]: event.target.value });

  getHeaderText = () => {
    if (this.state.step === 0) {
      return this.props.t(
        "Login.Content de vous revoir !",
        "Content de vous revoir !"
      );
    }

    if (this.state.newAdminWithoutPhoneOrEmail) {
      return this.props.t(
        "Login.Nouvel administrateur",
        "Nouvel administrateur"
      );
    }
    if (this.state.resetPasswordNotPossible) {
      return this.props.t(
        "Login.Impossible de réinitialiser",
        "Impossible de réinitialiser"
      );
    }

    if (this.state.resetPasswordPossible) {
      return this.props.t(
        "Login.Réinitialisation du mot de passe",
        "Un lien de réinitialisation a été envoyé"
      );
    }
    if (this.state.step === 1) {
      return (
        this.props.t("Login.Bonjour", "Bonjour ") + this.state.username + " !"
      );
    }

    if (this.state.step === 2) {
      return this.props.t(
        "Login.Double authentification",
        "Double authentification "
      );
    }
  };

  getHashedEmail = () => {
    const splittedEmailArray = this.state.email.split("@");
    if (splittedEmailArray.length === 2) {
      const prefixEmail = splittedEmailArray[0];
      const suffixEmail = splittedEmailArray[1];
      const hashLength =
        prefixEmail.length - 2 > 0 ? prefixEmail.length - 2 : 0;
      const hashedPrefix = prefixEmail.substring(0, 2) + "*".repeat(hashLength);
      return hashedPrefix + "@" + suffixEmail;
    }
    return "";
  };

  getSubtitle = () => {
    if (this.state.step === 0) {
      return this.props.t(
        "Login.Entrez votre pseudonyme",
        "Entrez votre pseudonyme"
      );
    }

    if (this.state.newAdminWithoutPhoneOrEmail) {
      return this.props.t(
        "Login.Entrez votre numéro et votre email",
        "Entrez votre numéro et votre email"
      );
    }
    if (this.state.step === 1) {
      return this.props.t(
        "Login.Entrez votre mot de passe",
        "Entrez votre mot de passe"
      );
    }

    if (this.state.step === 2) {
      return this.props.t(
        "Login.Un code vous a été envoyé par sms sur votre mobile.",
        "Un code vous a été envoyé par sms sur votre mobile."
      );
    }
  };

  render() {
    const {
      passwordVisible,
      username,
      step,
      code,
      email,
      phone,
      resetPasswordNotPossible,
      resetPasswordPossible,
      noUserError,
      newAdminWithoutPhoneOrEmail,
      password,
      wrongAdminCodeError,
      wrongPasswordError,
      unexpectedError,
    } = this.state;
    const { t } = this.props;
    return (
      <div className="app">
        <MainContainer>
          <ContentContainer>
            <GoBackButton step={step} goBack={this.goBack} t={t} />
            <LanguageBtn />
            <FButton
              tag={"a"}
              href="https://help.refugies.info/fr/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-btn"
              type="help"
              name="question-mark-circle-outline"
              fill={variables.noir}
            >
              {t("Login.Centre d'aide", "Centre d'aide")}
            </FButton>
            <StyledHeader>{this.getHeaderText()}</StyledHeader>
            {resetPasswordNotPossible && (
              <NoEmailRelatedContainer>
                {t(
                  "Login.Pas email",
                  "Il n'y a pas d'email associé à ce pseudonyme."
                )}
              </NoEmailRelatedContainer>
            )}
            {resetPasswordPossible && (
              <>
                <EmailRelatedContainer>
                  {t(
                    "Login.Lien réinitialisation",
                    "Un lien de réinitialisation a été envoyé à "
                  ) +
                    this.getHashedEmail() +
                    "."}
                </EmailRelatedContainer>
                <div
                  style={{
                    fontWeight: "bold",
                    fontSize: "16px",
                    lineHeight: "20px",
                    marginBottom: "64px",
                  }}
                >
                  {t(
                    "Login.Réinitialisation texte",
                    "Vous n'avez rien reçu ? Avez-vous vérifié dans vos spams ?"
                  )}
                </div>
              </>
            )}
            {!resetPasswordNotPossible && !resetPasswordPossible && (
              <>
                <StyledEnterValue>{this.getSubtitle()}</StyledEnterValue>
                <Form onSubmit={this.send}>
                  {step === 0 ? (
                    <UsernameField
                      value={username}
                      onChange={this.handleChange}
                      step={step}
                      key="username-field"
                      t={t}
                      noUserError={noUserError}
                    />
                  ) : newAdminWithoutPhoneOrEmail ? (
                    <PhoneAndEmailFields
                      t={t}
                      {...this.props}
                      onChange={this.handleChange}
                      phone={phone}
                      email={email}
                    />
                  ) : step === 1 ? (
                    <PasswordField
                      id="password"
                      value={password}
                      onChange={this.handleChange}
                      passwordVisible={passwordVisible}
                      onClick={this.togglePasswordVisibility}
                      t={t}
                      wrongPasswordError={wrongPasswordError}
                    />
                  ) : (
                    <CodeField
                      value={code}
                      onChange={this.handleChange}
                      key="code-field"
                      t={t}
                      wrongAdminCodeError={wrongAdminCodeError}
                    />
                  )}
                </Form>
              </>
            )}
            <Footer
              step={step}
              t={t}
              resetPassword={this.resetPassword}
              resetPasswordNotPossible={resetPasswordNotPossible}
              resetPasswordPossible={resetPasswordPossible}
              login={this.login}
              unexpectedError={unexpectedError}
              newAdminWithoutPhoneOrEmail={newAdminWithoutPhoneOrEmail}
            />
          </ContentContainer>
          <LanguageModal
            show={this.props.showLangModal}
            current_language={i18n.language}
            toggle={this.props.toggleLangueModal}
            changeLanguage={this.changeLanguage}
            languages={{
              ...this.props.langues.filter((x) => x.avancement >= 0.5),
              unavailable: { unavailable: true },
            }}
          />
        </MainContainer>
      </div>
    );
  }
}

const ResetPasswordMessage = styled.div`
  font-size: 16px;
  line-height: 20px;
  color: #828282;
  margin-bottom: 16px;
`;

const ContactSupport = (props) => (
  <a onClick={() => window.$crisp.push(["do", "chat:open"])}>
    <div
      style={{
        fontWeight: "bold",
        textDecoration: "underline",
        cursor: "pointer",
        color: "#828282",
      }}
    >
      {props.t("Login.Contactez le support", "Contactez le support")}
    </div>
  </a>
);
const Footer = (props) => {
  if (props.unexpectedError) {
    return (
      <ErrorMessageContainer>
        {props.t(
          "Login.Une erreur est survenue. Veuillez réessayer.",
          "Une erreur est survenue. Veuillez réessayer."
        )}
      </ErrorMessageContainer>
    );
  }
  if (props.resetPasswordNotPossible) {
    return (
      <>
        <ResetPasswordMessage>
          {props.t(
            "Login.Reset password message",
            "Attention, si vous n'avez pas configuré d'email, vous ne pourrez pas réinitialiser votre mot de passe."
          )}
        </ResetPasswordMessage>
        <ContactSupport t={props.t} />
      </>
    );
  }

  if (props.resetPasswordPossible) {
    return (
      <>
        <FooterLink>
          <div onClick={props.resetPassword}>
            <u>{props.t("Login.Renvoyer le lien", "Renvoyer le lien")}</u>
          </div>
        </FooterLink>
        <div style={{ marginTop: "16px" }}>
          <ContactSupport t={props.t} />
        </div>
      </>
    );
  }

  if (props.step === 0) {
    return <PseudoFooter t={props.t} />;
  }

  if (props.step === 1 && !props.newAdminWithoutPhoneOrEmail) {
    return <PasswordFooter t={props.t} resetPassword={props.resetPassword} />;
  }

  if (props.step === 2) {
    return (
      <FooterLink>
        <div onClick={props.login}>
          <u>{props.t("Login.Renvoyer le code", "Renvoyer le code")}</u>
        </div>
      </FooterLink>
    );
  }
  return false;
};

const PhoneAndEmailFields = (props) => (
  <>
    <FInput
      prepend
      prependName="at-outline"
      value={props.email}
      {...props}
      id="email"
      type="email"
      placeholder={props.t("Login.Entrez votre email", "Entrez votre email")}
      newSize
    />
    <FInput
      prepend
      prependName="smartphone-outline"
      value={props.phone}
      {...props}
      id="phone"
      type="phone"
      placeholder={props.t("Login.Entrez votre numéro", "Entrez votre numéro")}
      newSize
    />
    <FButton
      type="validate-light"
      name="arrow-forward-outline"
      disabled={!props.phone || !props.email}
    >
      {props.t("Suivant", "Suivant")}
      newSize
    </FButton>
  </>
);

const PseudoFooter = (props) => (
  <>
    <NoAccountContainer>
      {props.t("Login.Pas encore de compte ?", "Pas encore de compte ?")}
      <Link
        to={{
          pathname: "/register",
        }}
      >
        <div
          style={{
            fontWeight: "bold",
            textDecoration: "underline",
            marginLeft: "5px",
          }}
        >
          {props.t("Login.Créez un compte", "Créez un compte")}
        </div>
      </Link>
    </NoAccountContainer>
    <PseudoForgottenContainer>
      <div style={{ marginRight: "5px" }}>
        {props.t("Login.Pseudonyme oublié ?", "Pseudonyme oublié ?")}{" "}
      </div>
      <ContactSupport t={props.t} />
    </PseudoForgottenContainer>{" "}
  </>
);

const UsernameField = (props) => (
  <>
    <div
      key="username-field"
      style={{
        flexDirection: "row",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div style={{ marginTop: "10px" }}>
        <FInput
          prepend
          prependName="person-outline"
          id="username"
          type="username"
          placeholder={props.t("Login.Pseudonyme", "Pseudonyme")}
          autoComplete="username"
          error={props.noUserError}
          errorIcon="person"
          newSize
          {...props}
        />
      </div>
      <div style={{ marginLeft: "10px" }}>
        <FButton
          type="validate-light"
          name="arrow-forward-outline"
          disabled={!props.value}
        >
          {props.t("Suivant", "Suivant")}
        </FButton>
      </div>
    </div>
    {props.noUserError && (
      <ErrorMessageContainer>
        <b>{props.t("Login.Oups,", "Oups,")}</b>{" "}
        {props.t(
          "Login.Pas de compte",
          `il n'existe pas de compte à
  ce nom.`
        )}
      </ErrorMessageContainer>
    )}
  </>
);

const CodeField = (props) => (
  <>
    <div
      key="code-field"
      style={{
        flexDirection: "row",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div style={{ marginTop: "10px" }}>
        <FInput
          prepend
          prependName="lock-outline"
          {...props}
          id="code"
          type="number"
          placeholder={props.t("Login.Entrez votre code", "Entrez votre code")}
          error={props.wrongAdminCodeError}
          errorIcon="lock"
          newSize
        />
      </div>
      <div style={{ marginLeft: "10px" }}>
        <FButton
          type="validate-light"
          name="checkmark-outline"
          disabled={!props.value}
        >
          {props.t("Valider", "Valider")}
        </FButton>
      </div>
    </div>
    {props.wrongAdminCodeError && (
      <ErrorMessageContainer>
        <b>
          {props.t(
            "Login.Le code saisi n'est pas le bon.",
            "Le code saisi n'est pas le bon."
          )}
        </b>
      </ErrorMessageContainer>
    )}
  </>
);

const PasswordField = (props) => (
  <>
    <div
      style={{
        flexDirection: "row",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div style={{ marginTop: "10px" }}>
        <FInput
          prepend
          append
          autoFocus={props.id === "password"}
          prependName="lock-outline"
          appendName={
            props.passwordVisible ? "eye-off-2-outline" : "eye-outline"
          }
          inputClassName="password-input"
          onAppendClick={props.onClick}
          {...props}
          type={props.passwordVisible ? "text" : "password"}
          id={props.id}
          placeholder={props.t("Login.Mot de passe", "Mot de passe")}
          autoComplete="new-password"
          error={props.wrongPasswordError}
          errorIcon="lock"
          errorType="wrongPassword"
          newSize
        />
      </div>
      <div style={{ marginLeft: "10px" }}>
        <FButton
          type="validate-light"
          name="checkmark-outline"
          disabled={!props.value}
        >
          {props.t("Valider", "Valider")}
        </FButton>
      </div>
    </div>
    {props.wrongPasswordError && (
      <ErrorMessageContainer>
        {props.t(
          "Login.Mauvais mot de passe",
          "Erreur, mauvais mot de passe : "
        )}
        <b>{props.t("Login.Reessayez", "réessayez !")}</b>
      </ErrorMessageContainer>
    )}
  </>
);

const PasswordFooter = (props) => (
  <FooterLink>
    <div onClick={props.resetPassword}>
      <u>
        {props.t("Login.Mot de passe oublié ?", "J'ai oublié mon mot de passe")}
      </u>
    </div>
  </FooterLink>
);

const mapDispatchToProps = {
  fetchUser: fetchUserActionCreator,
  fetchLangues: fetchLanguesActionCreator,
  toggleLangue: toggleLangueActionCreator,
  toggleLangueModal: toggleLangueModalActionCreator,
};
const mapStateToProps = (state) => {
  return {
    languei18nCode: state.langue.languei18nCode,
    showLangModal: state.langue.showLangModal,
    langues: state.langue.langues,
  };
};

export default track(
  {
    page: "Login",
  },
  { dispatchOnMount: true }
)(connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Login)));
