import React, { Component } from "react";
import track from "react-tracking";
import { withTranslation } from "react-i18next";
import { NavLink, Link } from "react-router-dom";
import { NavHashLink } from "react-router-hash-link";
import { connect } from "react-redux";
import { Row, Col, Card, CardHeader, CardBody, CardFooter } from "reactstrap";
import AnchorLink from "react-anchor-link-smooth-scroll";

////////A enlever si pas utilisé/////////////:
// import Notifications from '../../components/UI/Notifications/Notifications';
// import SendToMessenger from './SendToMessenger';
// import MessengerSendToMessenger from '../../utils/MessengerSendToMessenger';
import { toggle_lang_modal } from "../../Store/actions/index";
import EVAIcon from "../../components/UI/EVAIcon/EVAIcon";
import FButton from "../../components/FigmaUI/FButton/FButton";
import API from "../../utils/API";
import styled from "styled-components";

import "./HomePage.scss";
import variables from "scss/colors.scss";
import SearchItem from "../AdvancedSearch/SearchItem/SearchItem";
import { initial_data } from "../AdvancedSearch/data";

const CoronaAlert = styled.div`
  display: flex;
  border-radius: 12px 12px 12px 12px;
  background-color: #ffcecb;
  width: 100%;
  justify-content: center;
  z-index: 100;
  top: 0px;
  margin-top: -70px;
`;

const AlertText = styled.p`
  color: #f44336;
  font-weight: bold;
  padding: 0px;
`;

const AlertTextLink = styled.p`
  color: #f44336;
  font-weight: bold;
  text-decoration: underline;
`;

export class HomePage extends Component {
  constructor(props) {
    super(props);
    this.selectParam = this.selectParam.bind(this); //Placé ici pour être reconnu par les tests unitaires
  }
  state = {
    users: [],
    corona: true
  };
  _isMounted = false;

  componentDidMount() {
    this._isMounted = true;
    window.scrollTo(0, 0);
    return API.get_users({
      query: { status: "Actif" },
      populate: "roles"
    }).then(
      data => this._isMounted && this.setState({ users: data.data.data })
    );
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  selectParam(_, subitem) {
    return (
      subitem &&
      this.props.history.push({
        pathname: "/advanced-search",
        search: "?tag=" + subitem.short
      })
    );
  }

  closeCorona = () => {
    this.setState({ corona: false });
  };

  render() {
    const { t } = this.props;
    const { users } = this.state;
    const item = initial_data[0];
    return (
      <div className="animated fadeIn homepage">
        <section id="hero">
          <div className="hero-container">
            {this.state.corona ? (
              <CoronaAlert>
                <div style={{ padding: 10 }}>
                  <EVAIcon fill={"#f44336"} name="alert-triangle" />
                </div>
                <div style={{ padding: 10 }}>
                  <AlertText>
                    {t("Homepage.Covid alert")}
                    <br />
                    <Link
                      to={{
                        pathname: "/advanced-search",
                        search: "?tag=Santé"
                      }}
                    >
                      <AlertTextLink>{t("Homepage.Covid link")}</AlertTextLink>
                    </Link>
                  </AlertText>
                </div>
                <div
                  onClick={this.closeCorona}
                  style={{ paddingLeft: 5, top: 0 }}
                >
                  <EVAIcon fill={"#f44336"} name="close-outline" />
                </div>
              </CoronaAlert>
            ) : null}
            <h1>
              {t(
                "Homepage.Construis ta vie en France",
                "Construire ma vie en France"
              )}
            </h1>
            <h5>
              {t("Homepage.subtitle", {
                nombre: (this.props.dispositifs || []).length
              })}
            </h5>

            <div className="search-row">
              <SearchItem
                className="on-homepage"
                item={item}
                keyValue={0}
                selectParam={this.selectParam}
                desactiver={() => {}}
              />
            </div>
          </div>
          <div className="chevron-wrapper">
            <AnchorLink
              offset="60"
              href="#plan"
              className="header-anchor d-inline-flex justify-content-center align-items-center"
            >
              <div className="slide-animation">
                <EVAIcon
                  className="bottom-slider"
                  name="arrow-circle-down"
                  size="hero"
                />
              </div>
            </AnchorLink>
          </div>
        </section>

        <section id="plan" className="triptique">
          <div className="section-container">
            <h2>{t("Homepage.Vous cherchez ?", "Je cherche à ?")}</h2>

            <Row className="card-row">
              <Col xl="4" lg="4" md="12" sm="12" xs="12" className="card-col">
                <NavLink
                  to="/advanced-search"
                  className="no-decoration demarche-link"
                >
                  <Card className="demarche-card">
                    <CardHeader>
                      {t(
                        "Homepage.À comprendre une démarche",
                        "À comprendre une démarche"
                      )}
                    </CardHeader>
                    <CardBody>
                      {/* <span>Je veux comprendre ce que l'administration me demande et bénéficier de mes droits</span> */}
                    </CardBody>
                    <CardFooter>
                      <FButton
                        type="homebtn"
                        name="search-outline"
                        fill={variables.noir}
                        className="demarche-btn"
                      >
                        {t(
                          "Homepage.Trouver une démarche",
                          "Trouver une démarche"
                        )}
                      </FButton>
                    </CardFooter>
                  </Card>
                </NavLink>
              </Col>
              <Col xl="4" lg="4" md="12" sm="12" xs="12" className="card-col">
                <NavLink to="/advanced-search" className="no-decoration">
                  <Card className="dispo-card">
                    <CardHeader>
                      {t(
                        "Homepage.A apprendre",
                        "Rejoindre un dispositif d'accompagnement"
                      )}
                    </CardHeader>
                    <CardBody>
                      {/* <span>Je veux rejoindre un dispositif d’accompagnement ou une initiative</span> */}
                    </CardBody>
                    <CardFooter>
                      <FButton
                        type="homebtn"
                        name="search-outline"
                        fill={variables.noir}
                      >
                        {t(
                          "Homepage.Trouver un dispositif",
                          "Trouver un dispositif"
                        )}
                      </FButton>
                    </CardFooter>
                  </Card>
                </NavLink>
              </Col>
              <Col xl="4" lg="4" md="12" sm="12" xs="12" className="card-col">
                <Card className="parcours-card">
                  <CardHeader>
                    {t(
                      "Homepage.creer parcours",
                      "Créer mon parcours personnalisé"
                    )}
                  </CardHeader>
                  <CardBody>
                    {/* <span>Je veux réaliser mes projets et me construire un avenir qui me plaît</span> */}
                  </CardBody>
                  <CardFooter>
                    <FButton
                      type="homebtn"
                      disabled
                      name="clock-outline"
                      fill={variables.noir}
                    >
                      Bientôt disponible
                    </FButton>
                    {/*<span>{t("Bientôt disponible !", "Bientôt disponible !")}</span>*/}
                  </CardFooter>
                </Card>
              </Col>
            </Row>
          </div>
        </section>

        <section id="contribution" className="contrib">
          <div className="section-container half-width">
            <div className="section-body">
              <h2>{t("Homepage.contributive")}</h2>
              <p className="texte-normal">
                {t("Homepage.contributive subheader")}
                <NavLink className="link ml-10" to="/qui-sommes-nous">
                  {t("En savoir plus", "En savoir plus")}
                </NavLink>
              </p>
            </div>
            <footer className="footer-section">
              {t("Homepage.contributeurs mobilises", {
                nombre: (
                  users.filter(x =>
                    (x.roles || []).some(y => y && y.nom === "Contrib")
                  ) || []
                ).length
              })}{" "}
              <FButton
                tag={NavHashLink}
                to="/comment-contribuer#ecrire"
                type="dark"
              >
                {t("Homepage.Je contribue", "Je contribue")}
              </FButton>
            </footer>
          </div>
        </section>

        <section id="multilangues">
          <div className="section-container half-width right-side">
            <div className="section-body">
              <h2>{t("Homepage.disponible langues")}</h2>
              <p className="texte-normal">
                {t("Homepage.disponible langues subheader")}
              </p>
              {/*<LanguageBtn />*/}
            </div>
            <footer className="footer-section">
              {t("Homepage.traducteurs mobilises", {
                nombre: (
                  users.filter(x =>
                    (x.roles || []).some(
                      y => y.nom === "Trad" || y.nom === "ExpertTrad"
                    )
                  ) || []
                ).length
              })}{" "}
              <FButton
                tag={NavHashLink}
                to={
                  API.isAuth()
                    ? "/backend/user-dashboard"
                    : "/comment-contribuer#traduire"
                }
                type="dark"
              >
                {t("Homepage.Je traduis", "Je traduis")}
              </FButton>
            </footer>
          </div>
        </section>

        <section id="certifiee">
          <div className="section-container half-width">
            <div className="section-body">
              <h2>{t("Homepage.information vérifiée")}</h2>
              <p className="texte-normal">
                {t("Homepage.information vérifiée subheader")}
              </p>
            </div>
            <footer>
              <FButton
                tag={NavHashLink}
                to="/comment-contribuer#corriger"
                type="dark"
              >
                {t("En savoir plus", "En savoir plus")}
              </FButton>
            </footer>
          </div>
        </section>

        <section id="explique">
          <div className="section-container half-width right-side">
            <h2>
              {t(
                "Homepage.Explique les mots difficiles",
                "Explique les mots difficiles"
              )}
            </h2>
            <p className="texte-normal">{t("Homepage.explication lexique")}</p>
            <span className="texte-normal">
              {t("Bientôt disponible !", "Bientôt disponible !")}
            </span>
          </div>
        </section>
        {/* <div>
            <button onClick={() => this.changeLanguage('fr')}>fr</button>
            <button onClick={() => this.changeLanguage('en')}>en</button>
            <button onClick={() => this.changeLanguage('ar')}>ar</button>
            <h1>{t('Bienvenue')}</h1>
        </div>
        <div>Toolbar, SideDrawer and Backdrop</div>

        <SendToMessenger messengerAppId="300548213983436" pageId="423112408432299" />

        <MessengerSendToMessenger 
          pageId="423112408432299" 
          appId="300548213983436" 
          ctaText="SEND_THIS_TO_ME"
          language= 'fr_FR'
          size="xlarge"
          dataRef="/dispositif/5cd43ce8b472e46bd90e8f58" />

        <Notifications/>

        <div>{t('Elément principal')}</div>
        <div>{t('Elément secondaire')}</div>
        <div>{t('Troisième élément')}</div>
        <div>{t('Quatrième élément')}</div>
        <div>{t('accueil.Cinquième élément')}</div>
        <div>{t('accueil.Six')}</div> */}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    languei18nCode: state.langue.languei18nCode,
    dispositifs: state.dispositif.dispositifs
  };
};

const mapDispatchToProps = { toggle_lang_modal };

export default track({
  page: "HomePage"
})(connect(mapStateToProps, mapDispatchToProps)(withTranslation()(HomePage)));
