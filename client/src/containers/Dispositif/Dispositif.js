import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import track from "react-tracking";
import { Col, Row, Spinner } from "reactstrap";
import { connect } from "react-redux";
import ContentEditable from "react-contenteditable";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import htmlToDraft from "html-to-draftjs";
import {
  EditorState,
  convertToRaw,
  convertFromRaw,
  ContentState,
} from "draft-js";
import i18n from "../../i18n";
import moment from "moment/min/moment-with-locales";
import Swal from "sweetalert2";
import h2p from "html2plaintext";
import _ from "lodash";
import querySearch from "stringquery";
import { convertToHTML } from "draft-convert";
import windowSize from "react-window-size";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";
import "../../../node_modules/video-react/dist/video-react.css";
import API from "../../utils/API";
import Sponsors from "../../components/Frontend/Dispositif/Sponsors/Sponsors";
import { ContenuDispositif } from "../../components/Frontend/Dispositif/ContenuDispositif";
import {
  BookmarkedModal,
  DispositifCreateModal,
  DemarcheCreateModal,
  DispositifValidateModal,
  ReactionModal,
  EnConstructionModal,
  ResponsableModal,
  VarianteCreateModal,
  RejectionModal,
  TagsModal,
  FrameModal,
  DraftModal,
} from "../../components/Modals/index";
import FButton from "../../components/FigmaUI/FButton/FButton";
import Commentaires from "../../components/Frontend/Dispositif/Commentaires/Commentaires";
import { Tags } from "./Tags";
import { LeftSideDispositif } from "../../components/Frontend/Dispositif/LeftSideDispositif";
import { BandeauEdition } from "../../components/Frontend/Dispositif/BandeauEdition";
import { TopRightHeader } from "../../components/Frontend/Dispositif/TopRightHeader";
import { fetchDispositifsActionCreator } from "../../services/Dispositif/dispositif.actions";
import { fetchUserActionCreator } from "../../services/User/user.actions";
import ContribCaroussel from "./ContribCaroussel/ContribCaroussel";
import SideTrad from "./SideTrad/SideTrad";
import ExpertSideTrad from "./SideTrad/ExpertSideTrad";
import { initializeTimer } from "../Translation/functions";
import { readAudio } from "../Layout/functions";
import MoteurVariantes from "./MoteurVariantes/MoteurVariantes";
import {
  contenu,
  menu,
  filtres,
  onBoardSteps,
  importantCard,
  showModals,
  menuDemarche,
  demarcheSteps,
  customConvertOption,
} from "./data";
import {
  switchVariante,
  initializeVariantes,
  initializeInfoCards,
  verifierDemarche,
  validateVariante,
  deleteVariante,
  calculFiabilite,
} from "./functions";
import { breakpoints } from "utils/breakpoints.js";
import { BackButton } from "../../components/Frontend/Dispositif/BackButton";
import variables from "scss/colors.scss";
import {
  fetchSelectedDispositifActionCreator,
  updateUiArrayActionCreator,
  updateSelectedDispositifActionCreator,
} from "../../services/SelectedDispositif/selectedDispositif.actions";
import { EnBrefBanner } from "../../components/Frontend/Dispositif/EnBrefBanner";
import { FeedbackFooter } from "../../components/Frontend/Dispositif/FeedbackFooter";
import { initGA, Event } from "../../tracking/dispatch";
// var opentype = require('opentype.js');

moment.locale("fr");

const sponsorsData = [];
const uiElement = {
  isHover: false,
  accordion: false,
  cardDropdown: false,
  addDropdown: false,
  varianteSelected: false,
};
let user = { _id: "", cookies: {} };

const MAX_NUMBER_CHARACTERS_INFOCARD = 40;
export class Dispositif extends Component {
  constructor(props) {
    super(props);
    this.newRef = React.createRef();
    this.sponsors = React.createRef();
    this.mountTime = 0;
    this.audio = new Audio();
    this._isMounted = false;
    this.initializeTimer = initializeTimer.bind(this);
    this.readAudio = readAudio.bind(this);
    this.switchVariante = switchVariante.bind(this);
    this.initializeVariantes = initializeVariantes.bind(this);
    this.initializeInfoCards = initializeInfoCards.bind(this);
    this.verifierDemarche = verifierDemarche.bind(this);
    this.validateVariante = validateVariante.bind(this);
    this.deleteVariante = deleteVariante.bind(this);
  }

  state = {
    menu: [],
    content: contenu,
    sponsors: sponsorsData,
    tags: [],
    mainTag: {
      darkColor: variables.darkColor,
      lightColor: variables.lightColor,
      hoverColor: variables.gris,
      short: "noImage",
    },

    uiArray: new Array(menu.length).fill(uiElement),
    showModals: showModals,
    accordion: new Array(1).fill(false),
    dropdown: new Array(5).fill(false),
    disableEdit: true,
    tooltipOpen: false,
    showBookmarkModal: false,
    isAuth: false,
    showDispositifCreateModal: false,
    showDispositifValidateModal: false,
    showTagsModal: false,
    showTutorielModal: false,
    showDraftModal: false,
    showSpinnerPrint: false,
    showSpinnerBookmark: false,
    suggestion: "",
    mail: "",
    tKeyValue: -1,
    tSubkey: -1,
    pinned: false,
    user: {},
    isDispositifLoading: true,
    contributeurs: [],
    withHelp: process.env.NODE_ENV !== "development",
    inputBtnClicked: false,
    mainSponsor: {},
    status: "",
    time: 0,
    initialTime: 0,
    typeContenu: "dispositif",
    variantes: [],
    search: {},
    inVariante: false,
    allDemarches: [],
    demarcheId: null,
    isVarianteValidated: false,
    dispositif: {},
    _id: undefined,
    checkingVariante: false,
    printing: false,
    didThank: false,
    finalValidation: false,
    tutorielSection: "",
    displayTuto: true,
    addMapBtn: true,
  };

  componentDidMount() {
    this.props.history.push({
      state: {},
    });
    this._isMounted = true;
    this.props.fetchUser();
    this.checkUserFetchedAndInitialize();
    // this._initializeDispositif(this.props);
  }

  // eslint-disable-next-line react/no-deprecated
  componentWillReceiveProps(nextProps) {
    if (
      ((nextProps.match || {}).params || {}).id !==
      ((this.props.match || {}).params || {}).id
    ) {
      this._isMounted && this._initializeDispositif(nextProps);
    }
    if (nextProps.languei18nCode !== this.props.languei18nCode) {
      this._isMounted && this._initializeDispositif(nextProps);
    }
    const userQuery = querySearch(
      _.get(nextProps, "history.location.search", "")
    );
    if (
      userQuery &&
      userQuery.age !== this.state.search.age &&
      userQuery.ville !== this.state.search.ville
    ) {
      this._isMounted && this.setState({ search: userQuery });
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
    clearInterval(this.timer);
  }

  checkUserFetchedAndInitialize = () => {
    if (this.props.userFetched) {
      this._initializeDispositif(this.props);
    } else {
      setTimeout(this.checkUserFetchedAndInitialize, 100); // check again in a 100 ms
    }
  };

  _initializeDispositif = (props) => {
    const itemId = props.match && props.match.params && props.match.params.id;
    const typeContenu = (props.match.path || "").includes("demarche")
      ? "demarche"
      : "dispositif";
    const checkingVariante = _.get(props, "location.state.checkingVariante"),
      textInput = _.get(props, "location.state.textInput");

    // if an itemId is present : initialize dispositif lecture or dispositif modification
    // if no itemId and user logged in : initialize new dispo creation
    // if no itemId and user not logged in : redirect to login page
    if (itemId) {
      this.props.tracking.trackEvent({
        action: "readDispositif",
        label: "dispositifId",
        value: itemId,
      });

      // work in progress : store dispo in redux and in state. the goal is not to have dispo in state anymore
      this.props.fetchSelectedDispositif({
        selectedDispositifId: itemId,
        locale: props.languei18nCode,
      });

      return API.get_dispositif({
        query: { _id: itemId },
        sort: {},
        populate: "creatorId mainSponsor participants",
        locale: props.languei18nCode,
      })
        .then((data_res) => {
          let dispositif = { ...data_res.data.data[0] };
          if (!dispositif || !dispositif._id) {
            this._isMounted = false;
            return this.props.history.push("/");
          }

          // case dispositif not active and user neither admin nor contributor nor in structure
          if (
            dispositif.status !== "Actif" &&
            !this.props.admin &&
            !this.props.user.contributions.includes(dispositif._id) &&
            !this.props.user.structures.includes(dispositif.sponsors[0]._id)
          ) {
            if (_.isEmpty(this.props.user)) {
              Swal.fire({
                title: "Erreur",
                text: "Accès non authorisé",
                type: "error",
                timer: 1200,
              });
              return this.props.history.push("/login");
            }
            Swal.fire({
              title: "Erreur",
              text: "Accès non authorisé",
              type: "error",
              timer: 1200,
            });
            this._isMounted = false;
            return this.props.history.push("/");
          }
          const disableEdit =
            dispositif.status !== "Accepté structure" || props.translating;

          if (dispositif.status === "Brouillon" && this._isMounted) {
            this.initializeTimer(3 * 60 * 1000, () =>
              this.valider_dispositif("Brouillon", true)
            );
          } //Enregistrement automatique du dispositif toutes les 3 minutes
          this._isMounted &&
            this.setState(
              {
                _id: itemId,
                menu: dispositif.contenu || [],
                content: {
                  titreInformatif: dispositif.titreInformatif,
                  titreMarque: dispositif.titreMarque,
                  abstract: dispositif.abstract,
                  contact: dispositif.contact,
                  externalLink: dispositif.externalLink,
                },
                sponsors: dispositif.sponsors,
                tags: dispositif.tags,
                creator: dispositif.creatorId,
                uiArray: _.get(dispositif, "contenu", []).map((x) => {
                  return {
                    ...uiElement,
                    ...(x.children && {
                      children: new Array(x.children.length).fill({
                        ...uiElement,
                        accordion: dispositif.status === "Accepté structure",
                      }),
                    }),
                  };
                }),
                dispositif: dispositif,
                isDispositifLoading: false,
                contributeurs: this.computeContributors(
                  dispositif.participants,
                  dispositif.creatorId
                ),
                mainTag:
                  dispositif.tags && dispositif.tags.length > 0
                    ? filtres.tags.find(
                        (x) => x && x.name === (dispositif.tags[0] || {}).name
                      ) || {}
                    : {},
                mainSponsor: dispositif.mainSponsor,
                status: dispositif.status,
                variantes: dispositif.variantes || [],
                fiabilite: calculFiabilite(dispositif),
                disableEdit,
                typeContenu,
                checkingVariante,
                ...(dispositif.status === "Brouillon" && {
                  initialTime: dispositif.timeSpent,
                }),
              },
              () => {
                if (typeContenu === "demarche") {
                  this.initializeInfoCards();
                  this.initializeVariantes(itemId, props);
                } else {
                  this.setColors();
                }
              }
            );
          document.title =
            this.state.content.titreMarque ||
            this.state.content.titreInformatif;
          //On va récupérer les vraies données des sponsors
          this._isMounted &&
            API.get_structure({
              _id: {
                $in: _.get(dispositif, "sponsors", []).map((s) => s && s._id),
              },
            }).then((data) => {
              this._isMounted &&
                data.data.data &&
                data.data.data.length > 0 &&
                this.setState((pS) => ({
                  sponsors: [
                    ...data.data.data,
                    ...pS.sponsors.filter((x) => x.asAdmin),
                  ],
                }));
            });
          //On récupère les données de l'utilisateur
          if (this._isMounted && API.isAuth()) {
            this._isMounted &&
              // TO DO not necessary to call api, these info are stored in redux
              API.get_user_info().then((data_res) => {
                let u = data_res.data.data;
                user = { _id: u._id, cookies: u.cookies || {} };
                this._isMounted &&
                  this.setState({
                    pinned: (user.cookies.dispositifsPinned || []).some(
                      (x) => x._id === itemId
                    ),
                    isAuthor: u._id === (dispositif.creatorId || {})._id,
                  });
              });
          }
        })
        .catch((err) => {
          if (_.isEmpty(this.props.user)) {
            Swal.fire({
              title: "Erreur",
              text: "Accès non authorisé",
              type: "error",
              timer: 1200,
            });
            this._isMounted = false;
            return this.props.history.push("/login");
          }
          Swal.fire({
            title: "Erreur",
            text: "Accès non authorisé",
            type: "error",
            timer: 1200,
          });
          // eslint-disable-next-line no-console
          console.log("Error: ", err.message);
          this._isMounted = false;
          return this.props.history.push("/");
        });
    } else if (API.isAuth()) {
      // initialize the creation of a new dispositif if user is logged in
      this.initializeTimer(3 * 60 * 1000, () =>
        this.valider_dispositif("Brouillon", true)
      ); //Enregistrement automatique du dispositif toutes les 3 minutes
      const menuContenu = typeContenu === "demarche" ? menuDemarche : menu;
      this.setState(
        {
          disableEdit: false,
          uiArray: menuContenu.map((x) => {
            return {
              ...uiElement,
              ...(x.children && {
                children: new Array(x.children.length).fill({
                  ...uiElement,
                  accordion: true,
                }),
              }),
            };
          }),
          showDispositifCreateModal: true, //A modifier avant la mise en prod
          isDispositifLoading: false,
          menu: menuContenu.map((x) => {
            return {
              ...x,
              type: x.type || "paragraphe",
              isFakeContent: true,
              content: x.type ? null : x.content,
              editorState: EditorState.createWithContent(
                ContentState.createFromBlockArray(htmlToDraft("").contentBlocks)
              ),
            };
          }),
          typeContenu,
          ...(textInput && {
            content: { ...contenu, titreInformatif: textInput },
          }),
        },
        () => this.setColors()
      );
    } else {
      props.history.push({
        pathname: "/login",
        state: { redirectTo: "/dispositif" },
      });
    }
    window.scrollTo(0, 0);
  };

  setColors = () => {
    return ["color", "borderColor", "backgroundColor", "fill"].map((s) => {
      return ["dark", "light"].map((c) => {
        return (
          document &&
          document
            .querySelectorAll("." + s + "-" + c + "Color")
            .forEach((elem) => {
              elem.style[s] = this.state.mainTag[c + "Color"];
            })
        );
      });
    });
  };

  onInputClicked = (ev) => {
    // when clicking on titreInformatif or titreMarque (name of asso)
    // if titre informatif is 'Titre informatif' we store "" instead of titre informatif
    // same for titre marque

    const id = ev.currentTarget.id;
    if (
      !this.state.disableEdit &&
      ((id === "titreInformatif" &&
        this.state.content.titreInformatif === contenu.titreInformatif) ||
        (id === "titreMarque" &&
          this.state.content.titreMarque === contenu.titreMarque))
    ) {
      this.setState({ content: { ...this.state.content, [id]: "" } });
    }
  };

  handleChange = (ev) => {
    // update selected dispositif in redux
    this.props.updateSelectedDispositif({
      [ev.currentTarget.id]: ev.target.value,
    });
    // TO DO : remove this set state when all infos are taken from store
    this.setState({
      content: {
        ...this.state.content,
        [ev.currentTarget.id]: ev.target.value,
      },
    });
  };

  handleKeyPress = (ev, index) => {
    if (ev.key === "Enter") {
      ev.preventDefault();
      if (
        index === 0 &&
        this.state.content.titreMarque === contenu.titreMarque
      ) {
        this.setState({ content: { ...this.state.content, titreMarque: "" } });
        document.getElementById("titreMarque").focus();
      }
    }
  };

  handleModalChange = (ev) =>
    this.setState({ [ev.currentTarget.id]: ev.target.value });

  disableIsMapLoaded = (key, subkey) => {
    let state = [...this.state.menu];
    if (
      state.length > key &&
      state[key].children &&
      state[key].children.length > subkey
    ) {
      state[key].children[subkey].isMapLoaded = true;
      this.setState({ menu: state });
    }
  };

  fwdSetState = (fn, cb) => this.setState(fn, cb);

  handleMenuChange = (ev, value = null) => {
    const node = ev.currentTarget;
    let state = [...this.state.menu];
    state[node.id] = {
      ...state[node.id],
      ...(!node.dataset.subkey && {
        [(node.dataset || {}).target || "content"]:
          value || (value === null && ev.target.value),
        isFakeContent: false,
      }),
      ...(node.dataset.subkey &&
        state[node.id].children &&
        state[node.id].children.length > node.dataset.subkey && {
          children: state[node.id].children.map((y, subidx) => {
            return {
              ...y,
              ...(subidx === parseInt(node.dataset.subkey) && {
                [node.dataset.target || "content"]:
                  value ||
                  // in infocards we want to limit the number of caracters
                  (value === null && y.type === "card"
                    ? ev.target.value.substring(
                        0,
                        MAX_NUMBER_CHARACTERS_INFOCARD
                      )
                    : ev.target.value),
                isFakeContent: false,
              }),
            };
          }),
        }),
    };

    return this.setState({ menu: state });
  };

  handleContentClick = (key, editable, subkey = undefined) => {
    let state = [...this.state.menu];
    if (
      state.length > key &&
      key >= 0 &&
      !this.state.disableEdit &&
      (!this.state.inVariante ||
        _.get(
          this.state.uiArray,
          key + (subkey ? ".children." + subkey : "") + ".varianteSelected"
        ))
    ) {
      if (editable) {
        state = state.map((x) => {
          const hasNewContent =
            x.editable && x.editorState && x.editorState.getCurrentContent();
          // if user removed text with store empty string without html balise (so that it works with translation)
          const content =
            hasNewContent &&
            x.editorState.getCurrentContent().getPlainText() !== ""
              ? convertToHTML(customConvertOption)(
                  x.editorState.getCurrentContent()
                )
              : "";
          return {
            ...x,
            editable: false,
            ...(hasNewContent && {
              content,
            }),
            ...(x.children && {
              children: x.children.map((y) => {
                const hasNewContent =
                  y.editable &&
                  y.editorState &&
                  y.editorState.getCurrentContent();
                // if user removed text with store empty string without html balise (so that it works with translation)
                const content =
                  hasNewContent &&
                  y.editorState.getCurrentContent().getPlainText() !== ""
                    ? convertToHTML(customConvertOption)(
                        y.editorState.getCurrentContent()
                      )
                    : "";
                return {
                  ...y,
                  ...(hasNewContent && {
                    content,
                  }),
                  editable: false,
                };
              }),
            }), //draftToHtml(convertToRaw(y.editorState.getCurrentContent()))
          };
        });
      }
      let right_node = state[key];
      if (subkey !== undefined && state[key].children.length > subkey) {
        right_node = state[key].children[subkey];
      }
      right_node.editable = editable;
      if (
        editable &&
        right_node.content !== undefined &&
        right_node.content !== null
      ) {
        const contentState = ContentState.createFromBlockArray(
          htmlToDraft(right_node.isFakeContent ? "" : right_node.content)
            .contentBlocks
        );
        const rawContentState = convertToRaw(contentState) || {};
        const rawBlocks = rawContentState.blocks || [];
        const textPosition = rawBlocks.findIndex((x) =>
          (x.text || "").includes("Bon à savoir :")
        );
        const newRawBlocks = rawBlocks.filter(
          (_, i) => i < textPosition - 3 || i >= textPosition
        );
        const newRawContentState = {
          ...rawContentState,
          blocks: newRawBlocks.map((x) =>
            x.text.includes("Bon à savoir :")
              ? {
                  ...x,
                  text: x.text.replace("Bon à savoir :", ""),
                  type: "header-six",
                }
              : x
          ),
        };
        const newContentState = convertFromRaw(newRawContentState);
        right_node.editorState = EditorState.createWithContent(newContentState);
      } else if (
        !editable &&
        right_node.editorState &&
        right_node.editorState.getCurrentContent
      ) {
        right_node.content = convertToHTML(customConvertOption)(
          right_node.editorState.getCurrentContent()
        ); //draftToHtml(convertToRaw(right_node.editorState.getCurrentContent()));
      }
      if (right_node.type === "accordion") {
        this.updateUIArray(key, subkey, "accordion", true);
      }
      return new Promise((resolve) =>
        this.setState({ menu: state }, () => {
          this.updateUI(key, subkey, editable);
          resolve();
        })
      );
    }
    return new Promise((r) => r());
  };

  updateUI = (key, subkey, editable) => {
    if (
      editable &&
      (subkey === undefined || (subkey === 0 && key > 1)) &&
      this.state.withHelp
    ) {
      try {
        //On place le curseur à l'intérieur du wysiwyg et on ajuste la hauteur
        const target =
          key === 0 || subkey !== undefined
            ? "editeur-" + key + "-" + subkey
            : key === 1
            ? "card-col col-lg-4"
            : undefined;
        let parentNode = document.getElementsByClassName(target)[0];
        if (subkey && parentNode) {
          parentNode
            .getElementsByClassName("public-DraftEditor-content")[0]
            .focus();
          window.getSelection().addRange(document.createRange());
          parentNode.getElementsByClassName(
            "DraftEditor-root"
          )[0].style.height =
            (
              parentNode.getElementsByClassName(
                "public-DraftEditorPlaceholder-inner"
              )[0] || {}
            ).offsetHeight + "px";
        }

        // test remove this part
        // if (parentNode) {
        //   parentNode.scrollIntoView({
        //     behavior: "smooth",
        //     block: "end",
        //     inline: "nearest",
        //   });
        // }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log(e);
      }
      this.setState({
        inputBtnClicked: false,
      });
    }
  };

  onEditorStateChange = (editorState, key, subkey = null) => {
    let state = [...this.state.menu];

    if (state.length > key) {
      if (subkey !== null && state[key].children.length > subkey) {
        state[key].children[subkey].editorState = editorState;
        state[key].children[subkey].isFakeContent = false;
      } else {
        state[key].editorState = editorState;
        state[key].isFakeContent = false;
      }
      this.setState({ menu: state });
    }
  };

  updateUIArray = (key, subkey = null, node = "isHover", value = true) => {
    let uiArray = [...this.state.uiArray];
    const updateOthers =
      node !== "varianteSelected" &&
      (this.state.disableEdit || node !== "accordion");
    uiArray = uiArray.map((x, idx) => {
      return {
        ...x,
        ...((subkey === null && idx === key && { [node]: value }) ||
          (updateOthers && { [node]: false })),
        ...(x.children && {
          children: x.children.map((y, subidx) => {
            return {
              ...y,
              ...((subidx === subkey && idx === key && { [node]: value }) ||
                (updateOthers && { [node]: false })),
            };
          }),
        }),
      };
    });

    // update uiarray in store redux
    this.props.updateUiArray({ subkey, key, node, value, updateOthers });
    this.setState({ uiArray: uiArray, tKeyValue: key, tSubkey: subkey });
  };

  showMapButton = (show) => {
    this.setState({ addMapBtn: show });
  };

  addItem = (key, type = "paragraphe", subkey = null) => {
    let prevState = [...this.state.menu];
    let uiArray = [...this.state.uiArray];
    const importantCard = {
      type: "card",
      isFakeContent: true,
      title: "Important !",
      titleIcon: "warning",
      contentTitle: "Compte bancaire",
      contentBody: "nécessaire pour recevoir l’indemnité",
      footer: "Pourquoi ?",
      footerIcon: "question-mark-circle-outline",
    };
    if (prevState[key].children && prevState[key].children.length > 0) {
      let newChild = {
        ...prevState[key].children[prevState[key].children.length - 1],
      };
      if (type === "card" && newChild.type !== "card") {
        prevState[key].type = "cards";
        newChild = importantCard;
      } else if (type === "card") {
        // the new child is an infocard which title is subkey (a title that is not already displayed)
        newChild =
          menu[1].children.filter((x) => x.title === subkey).length > 0
            ? menu[1].children.filter((x) => x.title === subkey)[0]
            : importantCard;
      } else if (type === "accordion" && !newChild.content) {
        newChild = {
          type: "accordion",
          isFakeContent: true,
          content: "",
        };
      } else if (type === "map") {
        newChild = {
          type: "map",
          isFakeContent: true,
          isMapLoaded: false,
          markers: [],
        };
        this.setState({ addMapBtn: false });
      } else if (type === "paragraph" && !newChild.content) {
        newChild = {
          title: "Un exemple de paragraphe",
          isFakeContent: true,
          content: "",
          type: type,
        };
      } else if (type === "etape") {
        newChild = {
          ...newChild,
          papiers: [],
          duree: "00",
          timeStepDuree: "minutes",
          delai: "00",
          timeStepDelai: "minutes",
          option: {},
        };
      }
      newChild.type = type;
      if (subkey === null || subkey === undefined) {
        prevState[key].children.push(newChild);
      } else {
        prevState[key].children.splice(subkey + 1, 0, newChild);
      }
    } else {
      if (type === "card") {
        prevState[key].type = "cards";
        prevState[key].children = [
          {
            type: "card",
            isFakeContent: true,
            title: "Important !",
            titleIcon: "warning",
            contentTitle: "Compte bancaire",
            contentBody: "nécessaire pour recevoir l’indemnité",
            footer: "Pourquoi ?",
            footerIcon: "question-mark-circle-outline",
          },
        ];
      } else if (type === "map") {
        prevState[key].children = [
          { type: "map", isFakeContent: true, isMapLoaded: false, markers: [] },
        ];
      } else {
        prevState[key].children = [
          {
            title: "Nouveau sous-paragraphe",
            type: type,
          },
        ];
      }
    }
    uiArray[key].children = [
      ...(uiArray[key].children || []),
      { ...uiElement, accordion: true, varianteSelected: true },
    ];
    this.setState(
      { menu: prevState, uiArray: uiArray },
      () => (type === "card" || type === "map") && this.setColors()
    );
  };

  removeItem = (key, subkey = null) => {
    let prevState = [...this.state.menu];
    let uiArray = [...this.state.uiArray];
    if (
      prevState[key].children &&
      prevState[key].children.length > 0 &&
      (prevState[key].children.length > 1 || prevState[key].content)
    ) {
      if (subkey === null || subkey === undefined) {
        prevState[key].children.pop();
        uiArray[key].children.pop();
      } else if (prevState[key].children.length > subkey) {
        prevState[key].children.splice(subkey, 1);
        uiArray[key].children.splice(subkey, 1);
      }
    }
    this.setState({ menu: prevState });
  };

  deleteCard = (key, subkey, type) => {
    if (type === "map") {
      this.setState({ addMapBtn: true });
    }
    const prevState = [...this.state.menu];
    prevState[key].children = prevState[key].children.filter(
      (x, index) => index !== subkey
    );
    this.setState({
      menu: prevState,
    });
  };

  toggleModal = (show, name) => {
    this.props.tracking.trackEvent({
      action: "toggleModal",
      label: name,
      value: show,
    });
    if (name === "merci" && this.state.showModals.merci) {
      Swal.fire({
        title: "Yay...",
        text: "Votre suggestion a bien été enregistrée, merci",
        type: "success",
        timer: 1500,
      });
    }
    this.setState((prevState) => ({
      showModals: { ...prevState.showModals, [name]: show },
      suggestion: "",
    }));
  };

  toggleTooltip = () => {
    this.props.tracking.trackEvent({
      action: "toggleTooltip",
      label: "tooltipOpen",
      value: !this.state.tooltipOpen,
    });
    this.setState({ tooltipOpen: !this.state.tooltipOpen });
  };

  toggleBookmarkModal = () =>
    this.setState((prevState) => ({
      showBookmarkModal: !prevState.showBookmarkModal,
    }));
  toggleDispositifCreateModal = () =>
    this.setState((prevState) => ({
      showDispositifCreateModal: !prevState.showDispositifCreateModal,
    }));
  toggleTagsModal = () =>
    this.setState((prevState) => ({
      showTagsModal: !prevState.showTagsModal,
    }));

  toggleTutorielModal = (section) =>
    this.setState((prevState) => ({
      showTutorielModal: !prevState.showTutorielModal,
      tutorielSection: section,
    }));

  toggleDraftModal = () =>
    this.setState((prevState) => ({
      showDraftModal: !prevState.showDraftModal,
    }));

  toggleTutoriel = () =>
    this.setState((prevState) => ({ displayTuto: !prevState.displayTuto }));

  toggleDispositifValidateModal = () => {
    if (_.isEmpty(this.state.sponsors)) {
      this.setState({ finalValidation: true });
      this.sponsors.current.toggleModal("responsabilite");
    } else {
      this.setState((prevState) => ({
        showDispositifValidateModal: !prevState.showDispositifValidateModal,
        finalValidation: false,
      }));
    }
  };
  toggleDispositifValidateModalFinal = () => {
    this.setState((prevState) => ({
      showDispositifValidateModal: !prevState.showDispositifValidateModal,
      finalValidation: false,
    }));
  };

  toggleFinalValidation = () => {
    this.setState({ finalValidation: false });
  };

  toggleInputBtnClicked = () =>
    this.setState((prevState) => ({
      inputBtnClicked: !prevState.inputBtnClicked,
    }));
  toggleCheckingVariante = () =>
    this.setState((pS) => ({ checkingVariante: !pS.checkingVariante }));
  toggleInVariante = () =>
    this.setState((pS) => ({
      inVariante: !pS.inVariante,
      ...(!pS.inVariante &&
        pS.disableEdit && {
          checkingVariante: false,
          showModals: { ...this.state.showModals, variante: true },
        }),
    }));

  toggleNiveau = (selectedLevels, key, subkey) => {
    this.setState(
      {
        menu: [...this.state.menu].map((x, i) =>
          i === key
            ? {
                ...x,
                children: x.children.map((y, ix) =>
                  ix === subkey ? { ...y, niveaux: selectedLevels } : y
                ),
              }
            : x
        ),
      },
      () => this.setColors()
    );
  };

  toggleFree = (key, subkey) =>
    this.setState({
      menu: [...this.state.menu].map((x, i) =>
        i === key
          ? {
              ...x,
              children: x.children.map((y, ix) =>
                ix === subkey
                  ? { ...y, free: !y.free, isFakeContent: false }
                  : y
              ),
            }
          : x
      ),
    });
  changePrice = (e, key, subkey) =>
    this.setState({
      menu: [...this.state.menu].map((x, i) =>
        i === key
          ? {
              ...x,
              children: x.children.map((y, ix) =>
                ix === subkey
                  ? { ...y, price: e.target.value, isFakeContent: false }
                  : y
              ),
            }
          : x
      ),
    });
  changeAge = (e, key, subkey, isBottom = true) =>
    this.setState({
      menu: [...this.state.menu].map((x, i) =>
        i === key
          ? {
              ...x,
              children: x.children.map((y, ix) =>
                ix === subkey
                  ? {
                      ...y,
                      [isBottom ? "bottomValue" : "topValue"]: (
                        e.target.value || ""
                      ).replace(/\D/g, ""),
                      isFakeContent: false,
                    }
                  : y
              ),
            }
          : x
      ),
    });
  setMarkers = (markers, key, subkey) =>
    this.setState({
      menu: [...this.state.menu].map((x, i) =>
        i === key
          ? {
              ...x,
              children: x.children.map((y, ix) =>
                ix === subkey
                  ? { ...y, markers: markers, isFakeContent: false }
                  : y
              ),
            }
          : x
      ),
    });

  toggleHelp = () =>
    this.setState((prevState) => ({ withHelp: !prevState.withHelp }));

  bookmarkDispositif = () => {
    this.setState({ showSpinnerBookmark: true });
    if (API.isAuth()) {
      if (this.state.pinned) {
        user.cookies.dispositifsPinned = user.cookies.dispositifsPinned.filter(
          (x) => x._id !== this.state.dispositif._id
        );
      } else {
        user.cookies.dispositifsPinned = [
          ...(user.cookies.dispositifsPinned || []),
          { _id: this.state._id, datePin: new Date() },
        ];
      }
      API.set_user_info(user).then(() => {
        this.props.fetchUser();
        this._isMounted &&
          this.setState((pS) => ({
            showSpinnerBookmark: false,
            showBookmarkModal: !pS.pinned,
            pinned: !pS.pinned,
            isAuth: true,
          }));
      });
    } else {
      this.setState(() => ({
        showSpinnerBookmark: false,
        showBookmarkModal: false,
        isAuth: false,
      }));
    }
  };

  changeCardTitle = (key, subkey, node, value) => {
    const prevState = [...this.state.menu];
    if (node === "title") {
      prevState[key].children[subkey] = [
        ...menu[1].children,
        importantCard,
      ].find((x) => x.title === value);
    } else {
      prevState[key].children[subkey][node] = value;
    }
    this.setState({ menu: prevState });
  };

  changeTag = (key, value) => {
    this.setState(
      {
        tags: this.state.tags.map((x, i) => (i === key ? value : x)),
        ...(key === 0 && {
          mainTag: filtres.tags.find((x) => x.short === value.short),
        }),
      },
      () => {
        if (key === 0) {
          this.setColors();
        }
      }
    );
  };

  addTag = (tags) => {
    this.setState({ tags: tags });
  };

  validateTags = (tags) => {
    this.setState({ tags: tags, mainTag: tags[0] }, () => this.setColors());
  };

  openTag = () => {
    this.setState({ showTagsModal: true });
  };

  deleteTag = (idx) =>
    this.setState({ tags: [...this.state.tags].filter((_, i) => i !== idx) });

  addSponsor = (sponsor) => {
    this.setState({
      sponsors: [
        ...(this.state.sponsors || []).filter((x) => !x.dummy),
        sponsor,
      ],
    });
  };

  deleteSponsor = (key) => {
    if (this.state.status === "Accepté structure") {
      Swal.fire({
        title: "Oh non!",
        text: "Vous ne pouvez plus supprimer de structures partenaires",
        type: "error",
        timer: 1500,
      });
      return;
    }
    this.setState({
      sponsors: (this.state.sponsors || []).filter((_, i) => i !== key),
    });
  };

  goBack = () => {
    this.props.tracking.trackEvent({ action: "click", label: "goBack" });
    this.props.history.push("/advanced-search");
  };

  closePdf = () => {
    this.setState({ showSpinnerPrint: false, printing: false });
  };

  createPdf = () => {
    this.props.tracking.trackEvent({ action: "click", label: "createPdf" });
    initGA();
    Event("EXPORT_PDF", this.props.languei18nCode, "label");
    let uiArray = [...this.state.uiArray];
    uiArray = uiArray.map((x) => ({
      ...x,
      accordion: true,
      ...(x.children && {
        children: x.children.map((y) => {
          return { ...y, accordion: true };
        }),
      }),
    }));
    this.setState({ uiArray: uiArray, showSpinnerPrint: true, printing: true });
    /*  this.html2canvas(document.getElementById('contenu-0')).then((canvas) => {
              const imgData = canvas.toDataURL("image/png");
              const pdf = new jsPDF();
              pdf.addImage(imgData, "PNG", 0, 0);
              pdf.save("download.pdf");
            }) */
    /*             savePDF(
              this.newRef.current,
              {
                fileName:
                  (this.state.typeContenu || "dispositif") +
                  (this.state.content && this.state.content.titreMarque
                    ? " - " + this.state.content.titreMarque
                    : "") +
                  ".pdf",
                scale: 0.5,
                margin: {
                  top: "2cm",
                  left: "1.5cm",
                  right: "1.5cm",
                  bottom: "2cm",
                },
              },
              this._isMounted &&
                setTimeout(() => {
                  this._isMounted &&
                    this.setState({ showSpinnerPrint: false, printing: false });
                }, 3000)
            ) */
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  editDispositif = (_ = null, disableEdit = false) => {
    this.props.history.push({
      state: {
        editable: true,
      },
    });
    this.setState(
      (pS) => ({
        disableEdit: disableEdit,
        uiArray: pS.menu.map((x, i) => ({
          ...uiElement,
          ...(pS.uiArray.length > i && {
            varianteSelected: pS.uiArray[i].varianteSelected,
          }),
          ...(x.children && {
            children: x.children.map((_, j) => ({
              ...uiElement,
              ...(pS.uiArray.length > i &&
                pS.uiArray[i] &&
                pS.uiArray[i].children &&
                pS.uiArray[i].children.length > j && {
                  varianteSelected: pS.uiArray[i].children[j].varianteSelected,
                }),
              accordion: !disableEdit,
            })),
          }),
        })),
      }),
      () => this.setColors()
    );
  };

  // save reaction and display modal of success
  pushReaction = (modalName = null, fieldName) => {
    // for a "Merci" modalName is null and fieldName is merci
    if (modalName) {
      this.toggleModal(false, modalName);
    }
    const dispositif = {
      dispositifId: this.state._id,
      keyValue: this.state.tKeyValue,
      subkey: this.state.tSubkey,
      fieldName: fieldName,
      type: "push",
      ...(this.state.suggestion && { suggestion: h2p(this.state.suggestion) }),
    };

    API.update_dispositif(dispositif).then(() => {
      if (this._isMounted) {
        Swal.fire({
          title: "Yay...",
          text: "Votre réaction a bien été enregistrée, merci",
          type: "success",
          timer: 1500,
        });
        fieldName === "merci" && this.setState({ didThank: true });
      }
    });
  };

  update_status = (status) => {
    let dispositif = {
      status: status,
      dispositifId: this.state._id,
    };
    API.add_dispositif(dispositif).then(() => {
      this.props.fetchDispositifs();
      this.props.fetchSelectedDispositif(this.state._id);
      this._isMounted &&
        this.setState({
          status: status,
          disableEdit: status !== "Accepté structure",
        });
      if (status === "Rejeté structure") {
        this.props.history.push("/backend/user-dash-structure");
      }
    });
  };

  computeContributors = (translators, creator) => {
    if (translators) {
      translators.push(creator);
      return translators;
    }
    return [creator];
  };

  valider_dispositif = (status = "En attente", auto = false) => {
    if (!auto && !this.verifierDemarche()) {
      return;
    }
    this.setState({ isDispositifLoading: !auto });
    let content = { ...this.state.content };
    const uiArray = { ...this.state.uiArray },
      inVariante = this.state.inVariante;
    Object.keys(content).map((k) => (content[k] = h2p(content[k])));
    if (
      auto &&
      !Object.keys(content).some((k) => content[k] && content[k] !== contenu[k])
    ) {
      return;
    }
    let dispositif = {
      ...content,
      contenu: [...this.state.menu].map((x, i) => {
        const hasNewContent =
          x.editable && x.editorState && x.editorState.getCurrentContent();
        // if user removed text with store empty string without html balise (so that it works with translation)

        const content =
          hasNewContent &&
          x.editorState.getCurrentContent().getPlainText() !== ""
            ? convertToHTML(customConvertOption)(
                x.editorState.getCurrentContent()
              )
            : "";
        return {
          title: x.title,
          ...{
            content: hasNewContent ? content : x.content,
          },
          ...(inVariante && {
            isVariante: _.get(uiArray, `${i}.varianteSelected`),
          }),
          editable: false,
          type: x.type,
          ...(x.children && {
            children: x.children.map((y, j) => {
              // eslint-disable-next-line
              const { editorState, ...noEditor } = y;
              const hasNewContent =
                y.editable &&
                y.editorState &&
                y.editorState.getCurrentContent();
              // if user removed text with store empty string without html balise (so that it works with translation)

              const content =
                hasNewContent &&
                y.editorState.getCurrentContent().getPlainText() !== ""
                  ? convertToHTML(customConvertOption)(
                      y.editorState.getCurrentContent()
                    )
                  : "";
              return {
                ...noEditor,
                ...(hasNewContent && { content }),
                ...(inVariante && {
                  isVariante: _.get(
                    uiArray,
                    `${i}.children.${j}.varianteSelected`
                  ),
                }),
                editable: false,
                ...(y.title && { title: h2p(y.title) }),
              };
            }),
          }),
        };
      }),
      sponsors: (this.state.sponsors || []).filter((x) => !x.dummy),
      tags: this.state.tags,
      avancement: 1,
      status: status,
      typeContenu: this.state.typeContenu,
      ...(this.state.inVariante
        ? { demarcheId: this.state._id }
        : { dispositifId: this.state._id }),
      ...(!this.state._id &&
        this.state.status !== "Brouillon" && { timeSpent: this.state.time }),
      autoSave: auto,
    };
    dispositif.mainSponsor = _.get(dispositif, "sponsors.0._id");
    if (dispositif.typeContenu === "dispositif") {
      let cardElement =
        (this.state.menu.find((x) => x.title === "C'est pour qui ?") || [])
          .children || [];
      dispositif.audience = cardElement.some((x) => x.title === "Public visé")
        ? cardElement
            .filter((x) => x.title === "Public visé")
            .map((x) => x.contentTitle)
        : filtres.audience;
      dispositif.audienceAge = cardElement.some((x) => x.title === "Âge requis")
        ? cardElement
            .filter((x) => x.title === "Âge requis")
            .map((x) => ({
              contentTitle: x.contentTitle,
              bottomValue: x.bottomValue,
              topValue: x.topValue,
            }))
        : [{ contentTitle: "Plus de ** ans", bottomValue: -1, topValue: 999 }];
      dispositif.niveauFrancais = cardElement.some(
        (x) => x.title === "Niveau de français"
      )
        ? cardElement
            .filter((x) => x.title === "Niveau de français")
            .map((x) => x.contentTitle)
        : filtres.niveauFrancais;
      dispositif.cecrlFrancais = cardElement.some(
        (x) => x.title === "Niveau de français"
      )
        ? [
            ...new Set(
              cardElement
                .filter((x) => x.title === "Niveau de français")
                .map((x) => x.niveaux)
                .reduce((acc, curr) => [...acc, ...curr])
            ),
          ]
        : [];
      dispositif.isFree = cardElement.some(
        (x) => x.title === "Combien ça coûte ?"
      )
        ? cardElement.find((x) => x.title === "Combien ça coûte ?").free
        : true;
    } else {
      dispositif.variantes = this.state.variantes;
      delete dispositif.titreMarque;
    }
    if (status !== "Brouillon") {
      if (
        this.state.status &&
        this.state._id &&
        !inVariante &&
        ![
          "",
          "En attente non prioritaire",
          "Brouillon",
          "Accepté structure",
        ].includes(this.state.status)
      ) {
        dispositif.status = this.state.status;
      } else if (dispositif.sponsors && dispositif.sponsors.length > 0) {
        //Je vais chercher les membres de cette structure
        const sponsors = _.get(dispositif, "sponsors.0", {});
        const currSponsor = this.props.structures.find(
          (x) => x._id === sponsors._id
        );
        //Si l'auteur appartient à la structure principale je la fait passer directe en validation
        const membre = currSponsor
          ? (currSponsor.membres || []).find(
              (x) => x.userId === this.props.userId
            )
          : (sponsors.membres || []).find(
              (x) => x.userId === this.props.userId
            );
        if (
          membre &&
          membre.roles &&
          membre.roles.some(
            (x) => x === "administrateur" || x === "contributeur"
          )
        ) {
          dispositif.status = "En attente admin";
        }
      } else {
        dispositif.status = "En attente non prioritaire";
      }
    }
    API.add_dispositif(dispositif).then((data) => {
      const newDispo = data.data.data;
      if (!auto && this._isMounted) {
        Swal.fire("Yay...", "Enregistrement réussi !", "success").then(() => {
          this.props.fetchUser();
          this.props.fetchDispositifs();
          this.setState(
            {
              disableEdit: [
                "En attente admin",
                "En attente",
                "Brouillon",
                "En attente non prioritaire",
                "Actif",
              ].includes(status),
              isDispositifLoading: false,
            },
            () => {
              this.props.history.push(
                "/" + dispositif.typeContenu + "/" + newDispo._id
              );
            }
          );
        });
      } else if (this._isMounted) {
        NotificationManager.success(
          // eslint-disable-next-line quotes
          'Retrouvez votre contribution dans votre page "Mon profil"',
          "Enregistrement automatique",
          5000,
          () => {
            Swal.fire(
              "Enregistrement automatique",
              // eslint-disable-next-line quotes
              'Retrouvez votre contribution dans votre page "Mon profil"',
              "success"
            );
          }
        );
        this.setState({ _id: newDispo._id });
      }
    });
  };

  upcoming = () =>
    Swal.fire({
      title: "Oh non!",
      text: "Cette fonctionnalité n'est pas encore disponible",
      type: "error",
      timer: 1500,
    });

  render() {
    const isRTL = ["ar", "ps", "fa"].includes(i18n.language);
    const { t, translating, windowWidth } = this.props;
    const {
      showModals,
      isDispositifLoading,
      typeContenu,
      withHelp,
      disableEdit,
      mainTag,
      inVariante,
      checkingVariante,
      printing,
      didThank,
    } = this.state;
    return (
      <div
        id="dispositif"
        className={
          "animated fadeIn dispositif vue" +
          (!disableEdit
            ? " edition-mode"
            : translating
            ? " side-view-mode"
            : printing && isRTL
            ? " printing-mode print-rtl"
            : printing && !isRTL
            ? " printing-mode"
            : " reading-mode")
        }
        ref={this.newRef}
      >
        <Row className="main-row">
          {translating && (
            <Col xl="4" lg="4" md="4" sm="4" xs="4" className="side-col">
              {!this.props.isExpert ? (
                <SideTrad
                  menu={this.state.menu}
                  content={this.state.content}
                  updateUIArray={this.updateUIArray}
                  typeContenu={typeContenu}
                  {...this.props}
                />
              ) : (
                <ExpertSideTrad
                  menu={this.state.menu}
                  content={this.state.content}
                  updateUIArray={this.updateUIArray}
                  typeContenu={typeContenu}
                  {...this.props}
                />
              )}
            </Col>
          )}
          <Col
            xl={translating ? "8" : "12"}
            lg={translating ? "8" : "12"}
            md={translating ? "8" : "12"}
            sm={translating ? "8" : "12"}
            xs={translating ? "8" : "12"}
            className="main-col"
          >
            <section
              className="banniere-dispo"
              style={
                mainTag &&
                mainTag.short && {
                  // eslint-disable-next-line no-use-before-define
                  backgroundImage: `url(${bgImage(mainTag.short)})`,
                }
              }
            >
              {(inVariante ||
                checkingVariante ||
                (typeContenu === "dispositif" && !disableEdit)) && (
                // yellow banner in top of a demarche to create a variante
                // To see this component, create a new demarche then select an existing demarche
                <BandeauEdition
                  withHelp={withHelp}
                  disableEdit={disableEdit}
                  checkingVariante={checkingVariante}
                  editDispositif={this.editDispositif}
                  upcoming={this.upcoming}
                  valider_dispositif={this.valider_dispositif}
                  toggleHelp={this.toggleHelp}
                  toggleCheckingVariante={this.toggleCheckingVariante}
                  toggleInVariante={this.toggleInVariante}
                  typeContenu={typeContenu}
                  toggleTutoriel={this.toggleTutoriel}
                  displayTuto={this.state.displayTuto}
                  toggleDispositifValidateModal={
                    this.toggleDispositifValidateModal
                  }
                  toggleDraftModal={this.toggleDraftModal}
                  tKeyValue={this.state.tKeyValue}
                  toggleDispositifCreateModal={this.toggleDispositifCreateModal}
                />
              )}
              <Row className="header-row">
                {windowWidth >= breakpoints.smLimit && (
                  <BackButton goBack={this.goBack} />
                )}
                {!inVariante && (
                  // top right part of dispositif (3 different designs : create/modify, read, sponsor gets the dispositif "En attente")
                  <TopRightHeader
                    disableEdit={this.state.disableEdit}
                    withHelp={this.state.withHelp}
                    showSpinnerBookmark={this.state.showSpinnerBookmark}
                    pinned={this.state.pinned}
                    bookmarkDispositif={this.bookmarkDispositif}
                    toggleHelp={this.toggleHelp}
                    toggleModal={this.toggleModal}
                    toggleDispositifValidateModal={
                      this.toggleDispositifValidateModal
                    }
                    editDispositif={this.editDispositif}
                    valider_dispositif={this.valider_dispositif}
                    toggleDispositifCreateModal={
                      this.toggleDispositifCreateModal
                    }
                    translating={translating}
                    status={this.state.status}
                    typeContenu={typeContenu}
                  />
                )}
              </Row>
              <Col lg="12" md="12" sm="12" xs="12" className="post-title-block">
                <div className={"bloc-titre "}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                    }}
                  >
                    <div>
                      <h1 className={disableEdit ? "" : "editable"}>
                        {
                          // Display and edition of titreInformatif
                          <ContentEditable
                            id="titreInformatif"
                            html={this.state.content.titreInformatif || ""} // innerHTML of the editable div
                            disabled={disableEdit || inVariante}
                            onClick={(e) => {
                              if (!disableEdit && !inVariante) {
                                this.onInputClicked(e);
                              }
                            }}
                            onChange={this.handleChange}
                            onMouseEnter={(e) => {
                              this.updateUIArray(-4);
                              e.target.focus();
                            }}
                            onKeyPress={(e) => this.handleKeyPress(e, 0)}
                          />
                        }
                      </h1>
                      {typeContenu === "dispositif" && (
                        <h2 className={"bloc-subtitle "}>
                          <span>{t("Dispositif.avec", "avec")}&nbsp;</span>
                          {
                            // Display and edition of titreMarque
                            <ContentEditable
                              id="titreMarque"
                              html={this.state.content.titreMarque || ""} // innerHTML of the editable div
                              disabled={this.state.disableEdit}
                              onClick={(e) => {
                                this.onInputClicked(e);
                              }}
                              onChange={this.handleChange}
                              onKeyDown={this.onInputClicked}
                              onMouseEnter={(e) => {
                                this.updateUIArray(-3);
                                e.target.focus();
                              }}
                              onKeyPress={(e) => this.handleKeyPress(e, 1)}
                            />
                          }
                        </h2>
                      )}
                    </div>
                    {!this.state.disableEdit &&
                      typeContenu === "dispositif" &&
                      this.state.displayTuto && (
                        <div style={{ marginTop: "16px" }}>
                          <FButton
                            type="tuto"
                            name={"play-circle-outline"}
                            className="ml-10"
                            onClick={() => this.toggleTutorielModal("Titre")}
                          >
                            Tutoriel
                          </FButton>
                        </div>
                      )}
                  </div>
                </div>
              </Col>
            </section>

            {!inVariante && (
              <Row className="tags-row backgroundColor-darkColor">
                <Col
                  style={{ display: "flex", alignItems: "center" }}
                  lg="8"
                  md="8"
                  sm="8"
                  xs="8"
                  className="col right-bar"
                >
                  {
                    // display En bref banner if content is a dispositif or if content is a demarch but not in edition mode
                    (disableEdit || typeContenu !== "demarche") && (
                      // TO DO : connect component to store when store updated after changing infocards
                      <EnBrefBanner menu={this.state.menu} />
                    )
                  }
                </Col>
                <Col lg="4" md="4" sm="4" xs="4" className="tags-bloc">
                  {
                    // Tags on the right of a dispositif or a demarche
                    <Tags
                      tags={this.state.tags}
                      disableEdit={this.state.disableEdit}
                      changeTag={this.changeTag}
                      addTag={this.addTag}
                      openTag={this.openTag}
                      deleteTag={this.deleteTag}
                      history={this.props.history}
                      toggleTutorielModal={this.toggleTutorielModal}
                      displayTuto={this.state.displayTuto}
                      updateUIArray={this.updateUIArray}
                    />
                  }
                </Col>
              </Row>
            )}

            <Row className="no-margin-right">
              {!translating && !printing && (
                <Col
                  xl="3"
                  lg="3"
                  md="12"
                  sm="12"
                  xs="12"
                  className="left-side-col pt-40"
                >
                  {
                    // left part of the dispositif/demarche to navigate in sections, go to external website, download in pdf, send by mail, by sms and print
                    <LeftSideDispositif
                      menu={this.state.menu}
                      showSpinner={this.state.showSpinnerPrint}
                      content={this.state.content}
                      inputBtnClicked={this.state.inputBtnClicked}
                      disableEdit={this.state.disableEdit}
                      toggleInputBtnClicked={this.toggleInputBtnClicked}
                      handleScrollSpy={this.handleScrollSpy}
                      createPdf={this.createPdf}
                      closePdf={this.closePdf}
                      newRef={this.newRef}
                      handleChange={this.handleChange}
                      typeContenu={typeContenu}
                      toggleTutorielModal={this.toggleTutorielModal}
                      displayTuto={this.state.displayTuto}
                      updateUIArray={this.updateUIArray}
                    />
                  }
                </Col>
              )}
              {inVariante && disableEdit && (
                <Col className="variante-col">
                  <div className="radio-btn" />
                </Col>
              )}
              <Col
                xl={translating || printing ? "12" : "7"}
                lg={translating || printing ? "12" : "7"}
                md={translating || printing ? "12" : "10"}
                sm={translating || printing ? "12" : "10"}
                xs={translating || printing ? "12" : "10"}
                className="pt-40 col-middle"
                id={"pageContent"}
              >
                {disableEdit && !inVariante && (
                  // Part about last update
                  <Row className="fiabilite-row">
                    <Col
                      lg="auto"
                      md="auto"
                      sm="auto"
                      xs="auto"
                      className="col align-right"
                    >
                      {t(
                        "Dispositif.Dernière mise à jour",
                        "Dernière mise à jour"
                      )}{" "}
                      :&nbsp;
                      <span className="date-maj">
                        {moment(
                          _.get(this.state, "dispositif.updatedAt", 0)
                        ).format("ll")}
                      </span>
                    </Col>
                  </Row>
                )}

                {typeContenu === "demarche" && !(disableEdit && inVariante) && (
                  // MoteurVariantes displayed when creating a variante of a demarche or reading a variante or modifying a variante
                  // in more details, it is displayed when asking 'is it the demarche you are looking for?' and at step 2 (but not at step 1) of variante creation or when reading a demarche
                  // at step 1 of variante creation, disableEdit and inVariante are true, what is displayed is in contenuDispositif (with radio-buttons)
                  <MoteurVariantes
                    itemId={this.state._id}
                    disableEdit={disableEdit}
                    inVariante={inVariante}
                    validateVariante={this.validateVariante}
                    deleteVariante={this.deleteVariante}
                    filtres={filtres}
                    upcoming={this.upcoming}
                    switchVariante={this.switchVariante}
                    variantes={this.state.variantes}
                    allDemarches={this.state.allDemarches}
                    search={this.state.search}
                  />
                )}

                <ContenuDispositif
                  showMapButton={this.showMapButton}
                  updateUIArray={this.updateUIArray}
                  handleContentClick={this.handleContentClick}
                  handleMenuChange={this.handleMenuChange}
                  onEditorStateChange={this.onEditorStateChange}
                  toggleModal={this.toggleModal}
                  deleteCard={this.deleteCard}
                  addItem={this.addItem}
                  sideView={this.state.sideView}
                  typeContenu={this.state.typeContenu}
                  uiArray={this.state.uiArray}
                  t={this.state.t}
                  disableEdit={this.state.disableEdit}
                  inVariante={this.state.inVariante}
                  menu={this.state.menu}
                  removeItem={this.removeItem}
                  changeTitle={this.changeCardTitle}
                  disableIsMapLoaded={this.disableIsMapLoaded}
                  toggleNiveau={this.toggleNiveau}
                  changeAge={this.changeAge}
                  changePrice={this.changePrice}
                  toggleFree={this.toggleFree}
                  setMarkers={this.setMarkers}
                  filtres={filtres}
                  readAudio={this.readAudio}
                  demarcheSteps={demarcheSteps}
                  upcoming={this.upcoming}
                  toggleTutorielModal={this.toggleTutorielModal}
                  displayTuto={this.state.displayTuto}
                  addMapBtn={this.state.addMapBtn}
                  // TO DO : remove spread state
                  {...this.state}
                />

                {this.state.disableEdit && !inVariante && (
                  <>
                    {!printing && (
                      <FeedbackFooter
                        pushReaction={this.pushReaction}
                        didThank={didThank}
                      />
                    )}
                    {!printing && (
                      <div className="discussion-footer backgroundColor-darkColor">
                        <h5>{t("Dispositif.Avis", "Avis et discussions")}</h5>
                        <span>
                          {t("Bientôt disponible !", "Bientôt disponible !")}
                        </span>
                      </div>
                    )}
                    {this.state.contributeurs.length > 0 && (
                      <div className="bottom-wrapper">
                        <ContribCaroussel
                          contributeurs={this.state.contributeurs}
                        />
                        {/* {// add contributors : desactivated 
                        !this.state.disableEdit  && (
                          <div className="ecran-protection">
                            <div className="content-wrapper">
                              <Icon
                                name="alert-triangle-outline"
                                fill="#FFFFFF"
                              />
                              <span>
                                Ajout des contributeurs{" "}
                                <u
                                  className="pointer"
                                  onClick={() =>
                                    this.toggleModal(true, "construction")
                                  }
                                >
                                  disponible prochainement
                                </u>
                              </span>
                            </div>
                          </div>
                        )} */}
                      </div>
                    )}
                  </>
                )}

                <Sponsors
                  ref={this.sponsors}
                  sponsors={this.state.sponsors}
                  disableEdit={disableEdit}
                  addSponsor={this.addSponsor}
                  deleteSponsor={this.deleteSponsor}
                  admin={this.props.admin}
                  validate={this.toggleDispositifValidateModalFinal}
                  t={t}
                  finalValidation={this.state.finalValidation}
                  toggleFinalValidation={this.toggleFinalValidation}
                  toggleTutorielModal={this.toggleTutorielModal}
                  displayTuto={this.state.displayTuto}
                  updateUIArray={this.updateUIArray}
                />

                {false && <Commentaires />}
              </Col>
              <Col
                xl="2"
                lg="2"
                md="2"
                sm="2"
                xs="2"
                className={
                  "aside-right pt-40" + (translating ? " sideView" : "")
                }
              />
            </Row>

            <ReactionModal
              showModals={showModals}
              toggleModal={this.toggleModal}
              onChange={this.handleModalChange}
              suggestion={this.state.suggestion}
              onValidate={this.pushReaction}
            />

            <EnConstructionModal
              name="construction"
              show={showModals.construction}
              toggleModal={this.toggleModal}
            />
            <ResponsableModal
              name="responsable"
              show={showModals.responsable}
              toggleModal={this.toggleModal}
              createur={this.state.creator}
              mainSponsor={this.state.mainSponsor}
              editDispositif={this.editDispositif}
              update_status={this.update_status}
              sponsors={this.state.sponsors}
            />
            <RejectionModal
              name="rejection"
              show={showModals.rejection}
              toggleModal={this.toggleModal}
              createur={this.state.creator}
              mainSponsor={this.state.mainSponsor}
              editDispositif={this.editDispositif}
              update_status={this.update_status}
              sponsors={this.state.sponsors}
            />

            <BookmarkedModal
              success={this.state.isAuth}
              show={this.state.showBookmarkModal}
              toggle={this.toggleBookmarkModal}
            />
            {typeContenu === "demarche" && (
              <DemarcheCreateModal
                show={this.state.showDispositifCreateModal}
                toggle={this.toggleDispositifCreateModal}
                typeContenu={typeContenu}
                onBoardSteps={onBoardSteps}
              />
            )}
            {typeContenu === "dispositif" && (
              <DispositifCreateModal
                show={this.state.showDispositifCreateModal}
                toggle={this.toggleDispositifCreateModal}
                typeContenu={typeContenu}
                navigateToCommentContribuer={() =>
                  this.props.history.push("/comment-contribuer")
                }
              />
            )}
            <DispositifValidateModal
              show={this.state.showDispositifValidateModal}
              toggle={this.toggleDispositifValidateModal}
              abstract={this.state.content.abstract}
              onChange={this.handleChange}
              validate={this.valider_dispositif}
              toggleTutorielModal={this.toggleTutorielModal}
              tags={this.state.tags}
              sponsors={this.state.sponsors}
              toggleTagsModal={this.toggleTagsModal}
              toggleSponsorModal={() =>
                this.sponsors.current.toggleModal("responsabilite")
              }
            />
            <TagsModal
              tags={this.state.tags}
              validate={this.validateTags}
              categories={filtres.tags}
              show={this.state.showTagsModal}
              toggle={this.toggleTagsModal}
              toggleTutorielModal={this.toggleTutorielModal}
            />
            <FrameModal
              show={this.state.showTutorielModal}
              toggle={this.toggleTutorielModal}
              section={this.state.tutorielSection}
            />
            <VarianteCreateModal
              titreInformatif={this.state.content.titreInformatif}
              show={showModals.variante}
              toggle={() => this.toggleModal(false, "variante")}
              upcoming={this.upcoming}
            />
            <DraftModal
              show={this.state.showDraftModal}
              toggle={this.toggleDraftModal}
              valider_dispositif={this.valider_dispositif}
              navigateToProfilePage={() =>
                this.props.history.push("/backend/user-profile")
              }
            />

            <NotificationContainer />

            {isDispositifLoading && (
              <div className="ecran-protection no-main">
                <div className="content-wrapper">
                  <h1 className="mb-3">{t("Chargement", "Chargement")}...</h1>
                  <Spinner color="success" />
                </div>
              </div>
            )}
          </Col>
        </Row>
      </div>
    );
  }
}

function bgImage(short) {
  if (short === "noImage") {
    const imageUrl = require("../../assets/figma/placeholder_no_theme" +
      ".svg");
    return imageUrl;
    //eslint-disable-next-line
  } else {
    const imageUrl = require("../../assets/figma/illustration_" +
      short.split(" ").join("-") +
      ".svg"); //illustration_
    return imageUrl;
  }
}

const mapStateToProps = (state) => {
  return {
    languei18nCode: state.langue.languei18nCode,
    user: state.user.user,
    userId: state.user.userId,
    admin: state.user.admin,
    structures: state.structure.structures,
    userFetched: state.user.userFetched,
  };
};

const mapDispatchToProps = {
  fetchDispositifs: fetchDispositifsActionCreator,
  fetchUser: fetchUserActionCreator,
  fetchSelectedDispositif: fetchSelectedDispositifActionCreator,
  updateUiArray: updateUiArrayActionCreator,
  updateSelectedDispositif: updateSelectedDispositifActionCreator,
};

export default track({
  page: "Dispositif",
})(
  connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(
    withTranslation()(windowSize(Dispositif))
  )
);
