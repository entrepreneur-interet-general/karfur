import React, { Component } from "react";
import track from "react-tracking";
import {
  Col,
  Row,
  Card,
  CardBody,
  CardFooter,
  Modal,
  Spinner,
  Input,
  ModalBody,
  ModalFooter,
  Progress,
} from "reactstrap";
import Swal from "sweetalert2";
import h2p from "html2plaintext";
import AnchorLink from "react-anchor-link-smooth-scroll";
import windowSize from "react-window-size";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import passwdCheck from "zxcvbn";
import _ from "lodash";

import marioProfile from "../../../assets/mario-profile.jpg";
import API from "../../../utils/API";
import {
  ActionTable,
  TradTable,
  ContribTable,
  FavoriTable,
  StructureCard,
} from "../../../components/Backend/UserProfile";
import {
  ThanksModal,
  ReactionLectureModal,
  ObjectifsModal,
  TraducteurModal,
  AddMemberModal,
  Modal as FModal,
} from "../../../components/Modals";
import EVAIcon from "../../../components/UI/EVAIcon/EVAIcon";
import ModifyProfile from "../../../components/Backend/UserProfile/ModifyProfile/ModifyProfile";
import SVGIcon from "../../../components/UI/SVGIcon/SVGIcon";
import FButton from "../../../components/FigmaUI/FButton/FButton";
import { selectItem, editMember, addMember } from "../UserDashStruct/functions";
import {
  avancement_langue,
  avancement_contrib,
  avancement_actions,
  avancement_favoris,
  data_structure,
} from "./data";
import {
  showSuggestion,
  archiveSuggestion,
  parseActions,
  deleteContrib,
  getProgression,
} from "./functions";
import { fetchDispositifsActionCreator } from "../../../services/Dispositif/dispositif.actions";
import { fetchUserActionCreator } from "../../../services/User/user.actions";
import FInput from "../../../components/FigmaUI/FInput/FInput";
import { colorAvancement } from "../../../components/Functions/ColorFunctions";
import setAuthToken from "../../../utils/setAuthToken";

import "./UserProfile.scss";
import variables from "scss/colors.scss";
import { logger } from "../../../logger";

const anchorOffset = "120";

export class UserProfile extends Component {
  constructor(props) {
    super(props);
    this._isMounted = false;
    this.showSuggestion = showSuggestion.bind(this);
    this.archiveSuggestion = archiveSuggestion.bind(this);
    this.selectItem = selectItem.bind(this);
    this.editMember = editMember.bind(this);
    this.addMember = addMember.bind(this);
    this.deleteContrib = deleteContrib.bind(this);
    this.getProgression = getProgression.bind(this);
  }

  state = {
    showModal: {
      actions: false,
      traducteur: false,
      contributions: false,
      thanks: false,
      favori: false,
      suggestion: false,
      objectifs: false,
      devenirContributeur: false,
      devenirTraducteur: false,
      addMember: false,
      password: false,
    },
    showSections: { traductions: true, contributions: true },
    user: {},
    traductions: [],
    contributions: [],
    actions: [],
    favoris: [],
    langues: [],
    structure: {},
    actionsStruct: [],
    contributionsStruct: [],
    traductionsStruct: [],
    traducteur: false,
    contributeur: false,
    editing: false,
    isDropdownOpen: [],
    uploading: false,
    suggestion: {},
    progression: {
      timeSpent: 0,
      nbMots: 0,
      nbMotsContrib: 0,
    },
    tempImg: null,
    isMainLoading: true,
    users: [],
    selected: {},
    password: "",
    newPassword: "",
    cpassword: "",
    passwordVisible: false,
    nbReadStruct: 0,
    visible: true,
    scroll: false,
  };

  componentDidMount() {
    window.addEventListener("scroll", this.handleScroll);
    this._isMounted = true;
    const user = this.props.user,
      userId = this.props.user;
    API.get_tradForReview({ query: { userId: userId } }).then((data) => {
      this._isMounted &&
        this.setState({ traductions: _.get(data, "data.data", []) });
    });
    API.get_dispositif({
      query: {
        creatorId: userId,
        status: { $ne: "Supprimé" },
        demarcheId: { $exists: false },
      },
      sort: { updatedAt: -1 },
      populate: "participants",
    }).then((data) => {
      this._isMounted &&
        this.setState({
          contributions: _.get(data, "data.data", []),
          actions: parseActions(data.data.data),
        });
    });
    if (user.structures && user.structures.length > 0) {
      this.initializeStructure();
      API.get_dispositif({
        query: {
          mainSponsor: user.structures[0],
          status: {
            $in: [
              "Actif",
              "Accepté structure",
              "En attente",
              "En attente admin",
            ],
          },
          demarcheId: { $exists: false },
        },
        sort: { updatedAt: -1 },
      }).then((data) => {
        this._isMounted &&
          this.setState(
            {
              contributionsStruct: _.get(data, "data.data", []),
              actionsStruct: parseActions(data.data.data),
            },
            () => {
              this._isMounted &&
                API.get_tradForReview({
                  query: {
                    type: "dispositif",
                    articleId: {
                      $in: this.state.contributionsStruct.map((x) => x._id),
                    },
                  },
                }).then((data) => {
                  this._isMounted &&
                    this.setState({
                      traductionsStruct: _.get(data, "data.data", []),
                    });
                });
              this._isMounted &&
                API.distinct_count_event({
                  distinct: "userId",
                  query: {
                    action: "readDispositif",
                    label: "dispositifId",
                    value: {
                      $in: this.state.contributionsStruct.map((x) => x._id),
                    },
                  },
                }).then((data) => {
                  this._isMounted &&
                    this.setState({
                      nbReadStruct: _.get(data, "data.data", []),
                    });
                });
            }
          );
      });
    }
    this.setState({
      user: user,
      isMainLoading: false,
      traducteur: user.roles.some((x) => x.nom === "Trad"),
      contributeur: user.roles.some((x) => x.nom === "Contrib"),
      isDropdownOpen: new Array((user.selectedLanguages || []).length).fill(
        false
      ),
    });

    API.get_users().then(
      (data) =>
        this._isMounted &&
        this.setState({ users: _.get(data, "data.data", []) })
    );
    API.get_langues({}).then(
      (data) =>
        this._isMounted &&
        this.setState({ langues: _.get(data, "data.data", []) })
    );
    API.get_progression().then((data_progr) => {
      if (data_progr.data.totalIndicator.length > 0)
        this._isMounted &&
          this.setState({ progression: data_progr.data.totalIndicator[0] });
    });
    window.scrollTo(0, 0);
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
    this._isMounted = false;
  }

  handleScroll = () => {
    // const { prevScrollpos } = this.state;

    const currentScrollPos = window.pageYOffset;
    const visible = currentScrollPos < 70;

    this.setState({
      //prevScrollpos: currentScrollPos,
      visible,
    });
  };

  initializeStructure = () => {
    const user = this.props.user;
    API.get_structure(
      { _id: user.structures[0] },
      {},
      "dispositifsAssocies"
    ).then((data) => {
      this._isMounted && this.setState({ structure: data.data.data[0] });
    });
  };

  toggleModal = (modal) => {
    this.props.tracking.trackEvent({
      action: "toggleModal",
      label: modal,
      value: !this.state.showModal[modal],
    });
    this.setState({
      showModal: {
        ...this.state.showModal,
        [modal]: !this.state.showModal[modal],
      },
      password: "",
      newPassword: "",
      cpassword: "",
      passwordVisible: false,
    });
  };
  togglePasswordVisibility = () =>
    this.setState((pS) => ({ passwordVisible: !pS.passwordVisible }));

  toggleSection = (section) => {
    this.props.tracking.trackEvent({
      action: "toggleSection",
      label: section,
      value: !this.state.showSections[section],
    });
    this.setState({
      showSections: {
        ...this.state.showSections,
        [section]: !this.state.showSections[section],
      },
    });
  };

  toggleEditing = () => this.setState({ editing: !this.state.editing });

  handleChange = (ev) =>
    this.setState({
      user: {
        ...this.state.user,
        [ev.currentTarget.id]:
          ev.currentTarget.id === "description"
            ? ev.target.value.slice(0, 120)
            : ev.target.value,
      },
    });
  handlePasswordChange = (ev) =>
    this.setState({ [ev.currentTarget.id]: ev.target.value });

  handleFileInputChange = (event) => {
    this.setState({ uploading: true });
    let file = event.target.files[0];

    //On l'affiche déjà directement pour l'utilisateur
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.addEventListener(
      "load",
      () => this.setState({ tempImg: reader.result }),
      false
    );

    //On l'envoie ensuite au serveur
    const formData = new FormData();
    formData.append(0, file);
    API.set_image(formData).then((data_res) => {
      this._isMounted &&
        this.setState({
          user: {
            ...this.state.user,
            picture: data_res.data.data,
          },
          uploading: false,
          tempImg: null,
        });
    });
  };

  removeBookmark = (key) => {
    let user = { ...this.state.user };
    user.cookies.dispositifsPinned =
      key === "all"
        ? []
        : user.cookies.dispositifsPinned.filter((x) => x._id !== key);
    API.set_user_info(user).then((data) => {
      this._isMounted && this.setState({ user: data.data.data });
    });
  };

  changePassword = () => {
    const { password, newPassword, cpassword, user } = this.state;
    if (!password || password.length === 0) {
      return Swal.fire({
        title: "Oops...",
        text: "Le mot de passe initial n'est pas renseigné !",
        type: "error",
        timer: 1500,
      });
    }
    if (!newPassword || newPassword.length === 0) {
      return Swal.fire({
        title: "Oops...",
        text: "Le nouveau mot de passe n'est pas renseigné !",
        type: "error",
        timer: 1500,
      });
    }
    if (!cpassword || cpassword.length === 0) {
      return Swal.fire({
        title: "Oops...",
        text: "Le nouveau mot de passe n'est pas confirmé !",
        type: "error",
        timer: 1500,
      });
    }
    if (newPassword !== cpassword) {
      return Swal.fire({
        title: "Oops...",
        text: "Les mots de passes ne correspondent pas !",
        type: "error",
        timer: 1500,
      });
    }
    if ((passwdCheck(newPassword) || {}).score < 1) {
      return Swal.fire({
        title: "Oops...",
        text: "Le mot de passe est trop faible",
        type: "error",
        timer: 1500,
      });
    }
    const newUser = { password, newPassword, cpassword };
    API.change_password({
      query: { _id: user._id, username: user.username },
      newUser,
    }).then((data) => {
      if (this._isMounted) {
        Swal.fire({
          title: "Yay...",
          text: "Mise à jour réussie !",
          type: "success",
          timer: 1500,
        });
        localStorage.setItem("token", data.data.token);
        setAuthToken(data.data.token);
        this.props.fetchUser();
        this.toggleModal("password");
      }
    });
  };

  validateObjectifs = (newUser) => {
    newUser = { _id: this.state.user._id, ...newUser };
    API.set_user_info(newUser).then((data) => {
      if (this._isMounted) {
        Swal.fire({
          title: "Yay...",
          text: "Vos objectifs ont bien été enregistrés",
          type: "success",
          timer: 1500,
        });
        this.setState({ user: data.data.data });
        this.toggleModal("objectifs");
      }
    });
  };

  validateProfile = () => {
    let user = { ...this.state.user };
    let newUser = {
      _id: user._id,
      username: h2p(user.username),
      selectedLanguages: [...new Set(user.selectedLanguages)],
      email: h2p(user.email),
      description: h2p(user.description),
      picture: user.picture,
    };
    API.set_user_info(newUser).then((data) => {
      if (this._isMounted) {
        this.props.fetchUser();
        Swal.fire({
          title: "Yay...",
          text: "Votre profil a bien été enregistré",
          type: "success",
          timer: 1500,
        });
        this.setState({ editing: false, user: data.data.data });
      }
    });
  };

  upcoming = () =>
    Swal.fire({
      title: "Oh non!",
      text: "Cette fonctionnalité n'est pas encore activée",
      type: "error",
      timer: 1500,
    });

  render() {
    logger.info("profile page", {
      user:
        this.state.user && this.state.user.username
          ? this.state.user.username
          : "no user",
    });
    const {
      traducteur,
      contributeur,
      traductions,
      contributions,
      actions,
      langues,
      structure,
      user,
      showSections,
      isMainLoading,
      actionsStruct,
      password,
      newPassword,
      cpassword,
      passwordVisible,
      nbReadStruct,
      traductionsStruct,
    } = this.state;
    const { t, dispositifs } = this.props;
    const favorisId = (user.cookies || {}).dispositifsPinned || [];
    const favoris =
      dispositifs &&
      favorisId.map((x) => ({
        ...x,
        ...dispositifs.find((y) => y._id === x._id),
      }));

    const imgSrc =
      this.state.tempImg ||
      (this.state.user.picture || []).secure_url ||
      marioProfile;
    // let nbReactions = contributions.map(dispo => ((dispo.merci || []).length + (dispo.bravo || []).length)).reduce((a,b) => a + b, 0);
    return (
      <div className="animated fadeIn user-profile">
        <div
          className={
            "profile-header" +
            (this.state.visible ? "" : " profile-header-hidden")
          }
        >
          <AnchorLink
            href="#mon-profil"
            offset={anchorOffset}
            className="header-anchor d-inline-flex justify-content-center align-items-center"
          >
            <EVAIcon
              name="settings-2-outline"
              fill={variables.noir}
              className="header-icon"
            />{" "}
            <span className="hideOnPhone">
              {t("Tables.Mon profil", "Mon profil")}
            </span>
          </AnchorLink>
          <AnchorLink
            href={
              contributeur || traducteur ? "#actions-requises" : "#mes-favoris"
            }
            offset={anchorOffset}
            className="header-anchor d-inline-flex justify-content-center align-items-center"
          >
            <EVAIcon
              name={
                (contributeur || traducteur ? "bell-" : "bookmark-") + "outline"
              }
              fill={variables.noir}
              className="header-icon"
            />{" "}
            <span className="hideOnPhone">
              {contributeur || traducteur
                ? t("Tables.Notifications", "Notifications")
                : t("Tables.Favoris", "Favoris")}
            </span>
          </AnchorLink>
          {showSections.contributions && (
            <AnchorLink
              href="#mes-contributions"
              offset={anchorOffset}
              className="header-anchor d-inline-flex justify-content-center align-items-center"
            >
              <EVAIcon
                name="file-add-outline"
                fill={variables.noir}
                className="header-icon"
              />{" "}
              <span className="hideOnPhone">
                {t("Tables.Rédactions", "Rédactions")}
              </span>
            </AnchorLink>
          )}
          {showSections.traductions && (
            <AnchorLink
              href="#mes-traductions"
              offset={anchorOffset}
              className="header-anchor d-inline-flex justify-content-center align-items-center"
            >
              <SVGIcon
                name="translate"
                fill={variables.noir}
                className="header-icon svgico"
              />{" "}
              <span className="hideOnPhone">
                {t("Tables.Traductions", "Traductions")}
              </span>
            </AnchorLink>
          )}
          {(contributeur || traducteur) && (
            <AnchorLink
              href="#mes-favoris"
              offset={anchorOffset}
              className="header-anchor d-inline-flex justify-content-center align-items-center"
            >
              <EVAIcon
                name="bookmark-outline"
                fill={variables.noir}
                className="header-icon"
              />{" "}
              <span className="hideOnPhone">
                {t("Tables.Favoris", "Favoris")}
              </span>
            </AnchorLink>
          )}
          {structure && structure._id && (
            <AnchorLink
              href="#structure"
              offset={anchorOffset}
              className="header-anchor d-inline-flex justify-content-center align-items-center"
            >
              <EVAIcon
                name="briefcase-outline"
                fill={variables.noir}
                className="header-icon"
              />{" "}
              <span className="hideOnPhone">
                {t("Tables.Ma structure", "Ma structure")}
              </span>
            </AnchorLink>
          )}
        </div>

        <div className="profile-content" id="mon-profil">
          <Row className="profile-info">
            <div className="profile-left mt-10">
              <div
                className={
                  "shadow-wrapper" + (this.state.editing ? " active" : "")
                }
              >
                <CardBody>
                  <div className="profile-header-container">
                    <div className="rank-label-container">
                      {this.state.uploading && (
                        <Spinner
                          color="success"
                          className="fadeIn fadeOut position-absolute"
                        />
                      )}
                      <img
                        className="img-circle user-picture"
                        src={imgSrc}
                        alt="profile"
                      />
                      {this.state.editing && (
                        <>
                          <Input
                            className="file-input"
                            type="file"
                            id="picture"
                            name="user"
                            accept="image/*"
                            onChange={this.handleFileInputChange}
                          />
                          <span className="label label-default rank-label">
                            {t("Changer", "Changer")}
                          </span>{" "}
                        </>
                      )}
                    </div>
                  </div>
                </CardBody>
                <CardFooter>
                  {!this.state.editing && (
                    <h2 className="name">{user.username}</h2>
                  )}
                  <span className="status">
                    {traducteur
                      ? t("UserProfile.Traducteur", "Traducteur")
                      : contributeur
                      ? t("UserProfile.Contributeur", "Contributeur")
                      : t("UserProfile.Utilisateur", "Utilisateur")}
                  </span>
                </CardFooter>
              </div>
            </div>

            <Col className="modify-col mt-10">
              <ModifyProfile
                handleChange={this.handleChange}
                toggleEditing={this.toggleEditing}
                validateProfile={this.validateProfile}
                toggleModal={this.toggleModal}
                {...this.state}
              />
            </Col>

            <Col
              xl="auto"
              lg="12"
              md="12"
              sm="12"
              xs="12"
              className="user-col mt-10"
            >
              <Card className="profile-right">
                <CardBody>
                  <Row>
                    <Col
                      xl="auto"
                      lg="4"
                      md="4"
                      sm="12"
                      xs="12"
                      className={
                        "obj-col obj-first" +
                        (this.state.progression.timeSpent > 0 ? " active" : "")
                      }
                    >
                      <AnchorLink
                        href="#mes-contributions"
                        offset={anchorOffset}
                      >
                        <h1 className="title text-big">
                          {Math.round(
                            this.state.progression.timeSpent / 1000 / 60
                          ) || 0}
                        </h1>
                        <h6 className="subtitle">
                          {t("UserProfile.minutes données", "minutes données")}
                        </h6>
                        <span className="content texte-small">
                          {this.state.progression.timeSpent
                            ? t(
                                "UserProfile.Merci de donner de votre temps",
                                "Merci de donner de votre temps pour l’intégration des personnes réfugiées"
                              )
                            : t(
                                "UserProfile.commencez à contribuer",
                                "Commencez à contribuer pour démarrer le compteur"
                              )}
                          .
                        </span>
                      </AnchorLink>
                    </Col>
                    <Col
                      xl="auto"
                      lg="4"
                      md="4"
                      sm="12"
                      xs="12"
                      className={
                        "obj-col obj-second" +
                        (this.state.progression.nbMotsContrib > 0
                          ? " active"
                          : "")
                      }
                    >
                      <AnchorLink
                        href="#mes-contributions"
                        offset={anchorOffset}
                      >
                        <h1 className="title text-big">
                          {this.state.progression.nbMotsContrib || 0}
                        </h1>
                        <h6 className="subtitle">
                          {t("UserProfile.mots écrits", "mots écrits")}
                        </h6>
                        <span className="content texte-small">
                          {this.state.progression.nbMotsContrib > 0
                            ? t(
                                "UserProfile.Grâce à vous",
                                "Grâce à vous, les personnes réfugiées seront plus et mieux informées"
                              )
                            : t(
                                "UserProfile.commencez à rédiger",
                                "Rédigez votre premier contenu pour démarrer le compteur"
                              )}
                          .
                        </span>
                      </AnchorLink>
                    </Col>
                    <Col
                      xl="auto"
                      lg="4"
                      md="4"
                      sm="12"
                      xs="12"
                      className={
                        "obj-col obj-third" +
                        (this.state.progression.wordsCount > 0 ? " active" : "")
                      }
                    >
                      <AnchorLink href="#mes-traductions" offset={anchorOffset}>
                        <h1 className="title text-big">
                          {this.state.progression.wordsCount || 0}
                        </h1>
                        <h6 className="subtitle">
                          {t("UserProfile.mots traduits", "mots traduits")}
                        </h6>
                        <span className="content texte-small">
                          {this.state.progression.wordsCount > 0
                            ? t(
                                "UserProfile.Merci de participer",
                                "Merci de participer à rendre accessible l’information au plus grand nombre"
                              )
                            : t(
                                "UserProfile.commencez à traduire",
                                "Traduisez vos premiers mots pour démarrer le compteur"
                              )}
                          .
                        </span>
                      </AnchorLink>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>

          {contributeur || traducteur ? (
            <ActionTable
              dataArray={actions}
              toggleModal={this.toggleModal}
              showSuggestion={this.showSuggestion}
              upcoming={this.upcoming}
              archive={this.archiveSuggestion}
              limit={5}
              {...avancement_actions}
            />
          ) : (
            <FavoriTable
              dataArray={favoris}
              toggleModal={this.toggleModal}
              removeBookmark={this.removeBookmark}
              upcoming={this.upcoming}
              history={this.props.history}
              limit={5}
              {...avancement_favoris}
            />
          )}

          <ContribTable
            type="user"
            displayIndicators
            dataArray={contributions}
            user={this.state.user}
            toggleModal={this.toggleModal}
            toggleSection={this.toggleSection}
            windowWidth={this.props.windowWidth}
            limit={5}
            hide={!showSections.contributions}
            overlayTitle="Rédigez des nouveaux contenus"
            overlaySpan="Réfugiés-info est une plateforme contributive, vous pouvez participer à son enrichissement"
            overlayBtn="Découvrir comment contribuer"
            overlayRedirect={false}
            history={this.props.history}
            deleteContrib={this.deleteContrib}
            {...avancement_contrib}
          />

          <TradTable
            displayIndicators
            dataArray={traductions}
            user={this.state.user}
            langues={langues}
            toggleModal={this.toggleModal}
            toggleSection={this.toggleSection}
            hide={!showSections.traductions}
            overlayTitle="Aidez à traduire les contenus"
            overlayi18n="bilingue"
            overlaySpan="Bilingue ? Polyglotte ? Participez à l’effort de traduction à votre rythme :"
            overlayBtn="Démarrer une session"
            overlayRedirect={false}
            history={this.props.history}
            windowWidth={this.props.windowWidth}
            motsRediges={this.state.progression.wordsCount}
            minutesPassees={Math.floor(
              this.state.progression.timeSpent / 1000 / 60
            )}
            limit={5}
            {...avancement_langue}
          />

          {contributeur || traducteur ? (
            <FavoriTable
              dataArray={favoris}
              toggleModal={this.toggleModal}
              removeBookmark={this.removeBookmark}
              upcoming={this.upcoming}
              history={this.props.history}
              limit={5}
              {...avancement_favoris}
            />
          ) : (
            <ActionTable
              dataArray={actions}
              toggleModal={this.toggleModal}
              showSuggestion={this.showSuggestion}
              upcoming={this.upcoming}
              archive={this.archiveSuggestion}
              limit={5}
              {...avancement_actions}
            />
          )}

          {structure && structure._id && (
            <StructureCard
              displayIndicators
              structure={structure}
              actions={actionsStruct}
              user={user}
              toggleModal={this.toggleModal}
              nbRead={nbReadStruct}
              traductions={traductionsStruct}
              {...data_structure}
            />
          )}
        </div>

        <Modal
          isOpen={this.state.showModal.actions}
          toggle={() => this.toggleModal("actions")}
          className="modal-plus"
        >
          <ActionTable
            dataArray={actions}
            toggleModal={this.toggleModal}
            showSuggestion={this.showSuggestion}
            archive={this.archiveSuggestion}
            {...avancement_actions}
          />
        </Modal>

        <Modal
          isOpen={this.state.showModal.contributions}
          toggle={() => this.toggleModal("contributions")}
          className="modal-plus"
        >
          <ContribTable
            type="user"
            dataArray={contributions}
            user={user}
            toggleModal={this.toggleModal}
            windowWidth={this.props.windowWidth}
            deleteContrib={this.deleteContrib}
            {...avancement_contrib}
          />
        </Modal>

        <Modal
          isOpen={this.state.showModal.traducteur}
          toggle={() => this.toggleModal("traducteur")}
          className="modal-plus"
        >
          <TradTable
            dataArray={traductions}
            user={this.state.user}
            langues={langues}
            toggleModal={this.toggleModal}
            windowWidth={this.props.windowWidth}
            {...avancement_langue}
          />
        </Modal>

        <Modal
          isOpen={this.state.showModal.favori}
          toggle={() => this.toggleModal("favori")}
          className="modal-plus"
        >
          <FavoriTable
            dataArray={favoris}
            toggleModal={this.toggleModal}
            removeBookmark={this.removeBookmark}
            history={this.props.history}
            {...avancement_favoris}
          />
        </Modal>

        <ThanksModal
          show={this.state.showModal.thanks}
          toggle={() => this.toggleModal("thanks")}
        />
        <ReactionLectureModal
          suggestion={this.state.suggestion}
          show={this.state.showModal.suggestion}
          toggle={() => this.toggleModal("suggestion")}
          archive={this.archiveSuggestion}
        />

        <TraducteurModal
          user={this.state.user}
          langues={this.state.langues}
          show={this.state.showModal.devenirTraducteur}
          redirect
          toggle={() => this.toggleModal("devenirTraducteur")}
        />

        <ObjectifsModal
          show={this.state.showModal.objectifs}
          toggle={() => this.toggleModal("objectifs")}
          validateObjectifs={this.validateObjectifs}
        />

        <AddMemberModal
          show={this.state.showModal.addMember}
          toggle={() => this.toggleModal("addMember")}
          users={this.state.users}
          selectItem={this.selectItem}
          addMember={this.addMember}
          selected={this.state.selected}
        />

        <PasswordModal
          show={this.state.showModal.password}
          password={password}
          newPassword={newPassword}
          cpassword={cpassword}
          passwordVisible={passwordVisible}
          toggle={() => this.toggleModal("password")}
          changePassword={this.changePassword}
          onChange={this.handlePasswordChange}
          onClick={this.togglePasswordVisibility}
          t={t}
        />

        {isMainLoading && (
          <div className="ecran-protection no-main">
            <div className="content-wrapper">
              <h1 className="mb-3">{t("Chargement", "Chargement")}...</h1>
              <Spinner color="success" />
            </div>
          </div>
        )}
      </div>
    );
  }
}

export const PasswordModal = (props) => {
  const password_check = passwdCheck(props.newPassword) || {};
  return (
    <FModal
      className="password-modal"
      modalHeader="Modifier mon mot de passe"
      {...props}
    >
      <ModalBody>
        <FInput
          prepend
          append
          prependName="lock-outline"
          appendName={
            props.passwordVisible ? "eye-off-2-outline" : "eye-outline"
          }
          inputClassName="password-input"
          onAppendClick={props.onClick}
          type={props.passwordVisible ? "text" : "password"}
          id="password"
          placeholder={props.t(
            "Login.Mot de passe actuel",
            "Mot de passe actuel"
          )}
          autoComplete="new-password"
          value={props.password}
          onChange={props.onChange}
        />
        <FInput
          prepend
          append
          prependName="lock-outline"
          appendName={
            props.passwordVisible ? "eye-off-2-outline" : "eye-outline"
          }
          type={props.passwordVisible ? "text" : "password"}
          inputClassName="password-input"
          onAppendClick={props.onClick}
          id="newPassword"
          placeholder={props.t(
            "Login.Nouveau mot de passe",
            "Nouveau mot de passe"
          )}
          autoComplete="new-password"
          value={props.newPassword}
          onChange={props.onChange}
        />
        {props.newPassword && (
          <div className="score-wrapper mb-10">
            <span className="mr-10">{props.t("Login.Force", "Force")} :</span>
            <Progress
              color={colorAvancement(password_check.score / 4)}
              value={((0.1 + password_check.score / 4) * 100) / 1.1}
            />
          </div>
        )}
        <FInput
          prepend
          append
          prependName="lock-outline"
          appendName={
            props.passwordVisible ? "eye-off-2-outline" : "eye-outline"
          }
          inputClassName="password-input"
          type={props.passwordVisible ? "text" : "password"}
          onAppendClick={props.onClick}
          id="cpassword"
          placeholder={props.t(
            "Login.Confirmez le nouveau mot de passe",
            "Confirmez le nouveau mot de passe"
          )}
          autoComplete="cpassword"
          value={props.cpassword}
          onChange={props.onChange}
        />
      </ModalBody>
      <ModalFooter>
        <FButton type="light-action" onClick={props.toggle} className="mr-10">
          {props.t("Annuler", "Annuler")}
        </FButton>
        <FButton
          type="validate"
          name="checkmark"
          onClick={props.changePassword}
          disabled={
            !props.password ||
            !props.newPassword ||
            !props.cpassword ||
            (password_check || {}).score < 1
          }
        >
          {props.t("Valider", "Valider")}
        </FButton>
      </ModalFooter>
    </FModal>
  );
};

const mapStateToProps = (state) => {
  return {
    user: state.user.user,
    userId: state.user.userId,
    dispositifs: state.dispositif.dispositifs,
  };
};

const mapDispatchToProps = {
  fetchUser: fetchUserActionCreator,
  fetchDispositifs: fetchDispositifsActionCreator,
};

export default track({
  page: "UserProfile",
})(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(withTranslation()(windowSize(UserProfile)))
);
