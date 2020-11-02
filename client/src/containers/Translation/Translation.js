import React, { Component } from "react";
import Swal from "sweetalert2";
import querySearch from "stringquery";
import h2p from "html2plaintext";
import debounce from "lodash.debounce";
import { EditorState, ContentState } from "draft-js";
import htmlToDraft from "html-to-draftjs";
import { connect } from "react-redux";
import _ from "lodash";
import produce from "immer";

import API from "../../utils/API";
import StringTranslation from "./StringTranslation/StringTranslation";
import Dispositif from "../Dispositif/Dispositif";
import { menu } from "../Dispositif/data";
import { initializeTimer } from "./functions";
import {
  fetchTranslationsActionCreator,
  addTradActionCreator,
} from "../../services/Translation/translation.actions";

let last_target = null;
let letter_pressed = null;

export class TranslationHOC extends Component {
  constructor(props) {
    super(props);
    this.mountTime = 0;
    this._isMounted = false;
    this.initializeTimer = initializeTimer.bind(this);
  }

  state = {
    value: "",
    francais: {
      title: "",
      body: "",
    },
    translated: {
      body: "",
      title: "",
    },
    texte_traduit: "",
    texte_a_traduire: "",
    avancement: 1,
    isComplete: false,

    itemId: "",
    isExpert: false,
    isStructure: false,
    path: [],
    id: "",
    locale: "",
    translationId: "",
    langue: {},
    tooltipOpen: false,
    nbMotsRestants: 0,
    score: -1,
    type: "",
    traduction: {
      initialText: { contenu: new Array(menu.length).fill(false) },
      translatedText: { contenu: new Array(menu.length).fill(false) },
    },
    traductionsFaites: [],
    translating: true,
    time: 0,
    initialTime: 0,
    autosuggest: false,
    disableBtn: false,
    jsonId: null,
    langueBackupId: null,
    traducteur: {},
  };

  componentDidMount() {
    this._isMounted = true;
    this._initializeComponent(this.props);
    window.scrollTo(0, 0);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.translations !== this.props.translations) {
      const { isExpert, userId } = this.props;
      const traductions = this.props.translations;

      const traduction = traductions.find(
        (trad) => trad.userId._id === trad.validatorId
      );
      this.setState({
        traductionsFaites: traductions,
        traduction: {
          initialText: _.get(traductions, "0.initialText", {}),
          translatedText:
            isExpert && traductions.find((trad) => trad.userId._id === userId)
              ? _.get(
                  traductions.find((trad) => trad.userId._id === userId),
                  ["translatedText"]
                )
              : traduction
              ? traduction.translatedText
              : _.get(traductions, "0.translatedText", {}),
        },
        autosuggest: false,
      });
    }

    if (
      prevProps.translation !== this.props.translation &&
      this.props.translation._id
    ) {
      this.setState(
        produce((draft) => {
          draft.traduction._id = this.props.translation._id;
        })
      );
    }
  }

  // eslint-disable-next-line react/no-deprecated
  componentWillReceiveProps(nextProps) {
    if (nextProps.match.params.id !== this.props.match.params.id) {
      this._initializeComponent(nextProps);
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
    clearInterval(this.timer);
  }
  // eslint-disable-next-line react/no-deprecated
  componentWillUpdate(_, nextState) {
    if (nextState.translated.body !== this.state.translated.body) {
      this.setState({
        nbMotsRestants: Math.max(
          0,
          h2p(nextState.francais.body).split(/\s+/).length -
            h2p(nextState.translated.body).split(/\s+/).length
        ),
      });
    }
  }

  _initializeComponent = async (props) => {
    this.initializeTimer();
    let itemId = null;
    try {
      itemId = props.match.params.id;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
    const { locale, langueBackupId } = await this._setLangue(props);
    const isExpert = this.props.isExpert;
    const type =
      (props.match.path || "").includes("dispositif") ||
      (props.match.path || "").includes("demarche")
        ? "dispositif"
        : "string";
    this.setState({ type, itemId, locale, isExpert, langueBackupId });
    if (itemId && type === "dispositif") {
      //...(!isExpert && userId && {userId})
      this.props.fetchTranslations(itemId, locale);
    }
  };

  get_trads = () => {
    const { itemId, locale } = this.state;
    this.props.fetchTranslations(itemId, locale);

    /* return API.get_tradForReview({
      query: { articleId: itemId, langueCible: locale },
      sort: { updatedAt: -1 },
      populate: "userId",
    }).then((data_res) => {
      if (
        data_res.data.data &&
        data_res.data.data.constructor === Array &&
        data_res.data.data.length > 0
      ) {
        const traductions = data_res.data.data;
        const traduction = traductions.find(
          (trad) => trad.userId._id === trad.validatorId
        );
        this.setState({
          traductionsFaites: traductions,
          ...((isExpert || userId) && {
            traduction: {
              initialText: _.get(traductions, "0.initialText", {}),
              translatedText:
                isExpert &&
                traductions.find(
                  (trad) => trad.userId._id === this.props.userId
                )
                  ? _.get(
                      traductions.find(
                        (trad) => trad.userId._id === this.props.userId
                      ),
                      ["translatedText"]
                    )
                  : traduction
                  ? traduction.translatedText
                  : _.get(traductions, "0.translatedText", {}),
            },
            autosuggest: false,
          }),
        });
      }
    }); */
  };

  _setLangue = async (props) => {
    let langue = null;
    try {
      langue = props.location.state.langue;
    } catch (e) {
      try {
        const params = querySearch(props.location.search);
        langue = (
          await API.get_langues({ _id: params.id }, {}, "langueBackupId")
        ).data.data[0];
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log(err);
      }
    }
    this._isMounted && this.setState({ langue });
    return {
      locale: langue.i18nCode,
      langueBackupId: _.get(langue, "langueBackupId.i18nCode"),
    };
  };

  setRef = (refObj, name) => (this[name] = refObj);
  fwdSetState = (fn, cb) => this._isMounted && this.setState(fn, cb);

  translate = (text, target, item, toEditor = false) => {
    this.setState({
      translated: { ...this.state.translated, [item]: "" },
      autosuggest: true,
    });
    API.get_translation({ q: text, target: target })
      .then((data) => {
        if (!this.state.translated[item]) {
          let value =
            data.data
              .replace(/ id='initial_/g, " id='target_")
              // eslint-disable-next-line
              .replace(/ id="initial_/g, ' id="target_') || "";
          value = toEditor
            ? EditorState.createWithContent(
                ContentState.createFromBlockArray(
                  htmlToDraft(value).contentBlocks
                )
              )
            : value;
          this._isMounted &&
            item &&
            this.setState({
              translated: {
                ...this.state.translated,
                [item]: value,
              },
            }); //, () => this.get_xlm([[h2p(this.state.translated.body), this.state.locale], [this.state.francais.body, 'fr']]) );
        }
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.log("error : ", err);
        if (
          !this.state.translated[item]
          //h2p(this.state.francais[item]) === h2p(text)
        ) {
          let value = this.state.francais[item] || "";
          value = toEditor
            ? EditorState.createWithContent(
                ContentState.createFromBlockArray(
                  htmlToDraft(value).contentBlocks
                )
              )
            : value;
          this._isMounted &&
            this.setState({
              translated: {
                ...this.state.translated,
                [item]: value,
              },
            });
        }
      });
  };

  get_xlm = debounce((sentence) => {
    API.get_laser({ sentences: sentence }).then((data) => {
      try {
        let result = JSON.parse(data.data.data) || {};
        if (result && result.cosine && result.cosine.length > 0) {
          this._isMounted && this.setState({ score: result.cosine[0] });
        } else {
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log(e);
      }
    });
  }, 500);

  handleChange = (ev) => {
    var targetNode = ev.currentTarget;
    let target = targetNode.className.includes("title") ? "title" : "body";
    let value = target === "title" ? targetNode.innerText : ev.target.value;
    this.setState({
      translated: {
        ...this.state.translated,
        [target]: value,
      },
      autosuggest: false,
    });
    // this.get_xlm([[h2p(value), this.state.locale], [this.state.francais.body, 'fr']])
  };

  onEditorStateChange = (editorState, target = "body") => {
    this.setState({
      translated: {
        ...this.state.translated,
        [target]: editorState,
      },
      autosuggest: false,
    });
  };

  handleClickText = (e, initial, target) => {
    try {
      if (last_target) {
        document
          .getElementById(last_target)
          .classList.remove("temporarily_highlight");
      }
      let cible = e.target;
      last_target = cible.id.replace(initial + "_", target + "_");
      if (last_target) {
        document
          .getElementById(last_target)
          .classList.add("temporarily_highlight");
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
  };

  handleChangeEnCours = (event) => {
    if (
      letter_pressed &&
      letter_pressed === " " &&
      this.state.texte_a_traduire.slice(0, 1) !== " "
    ) {
      let i = 0,
        le_text = this.state.texte_a_traduire;
      do {
        le_text = le_text.substring(1);
        i++;
      } while (le_text.slice(0, 1) !== " " && le_text !== "" && le_text);
      this.setState((prevState) => ({
        texte_a_traduire: prevState.texte_a_traduire.substring(i + 1),
      }));
    } else if (
      letter_pressed &&
      ((letter_pressed !== " " &&
        this.state.texte_a_traduire.slice(0, 1) !== " ") ||
        (letter_pressed === " " &&
          this.state.texte_a_traduire.slice(0, 1) === " "))
    ) {
      this.setState((prevState) => ({
        texte_a_traduire: prevState.texte_a_traduire.substring(1),
      }));
    }
    this.setState({
      texte_traduit:
        h2p(event.target.value) + (letter_pressed === " " ? " " : ""),
      translated: {
        ...this.state.trandslated,
        body:
          h2p(event.target.value) +
          (this.state.translated.body.length > event.target.value.length
            ? this.state.translated.body.substring(event.target.value.length)
            : ""),
      },
    });
    letter_pressed = null;
  };

  handleKeyPress = (event) => {
    letter_pressed = event.key;
  };

  //the trad is validated
  valider = async (tradData = {}) => {
    this.setState({ disableBtn: true });
    let traduction = {
      langueCible: this.state.locale,
      articleId: this.state.jsonId || this.state.itemId,
      initialText: this.state.francais,
      translatedText: this.state.translated,
      timeSpent: this.state.time,
      isStructure: this.state.isStructure,
      avancement: this.state.avancement,
      type: this.state.type,
      ...(this.state.path.length > 0 && { path: this.state.path }),
      ...(this.state.id && { id: this.state.id }),
    };
    if (this.state.isExpert) {
      traduction = {
        ...traduction,
        isExpert: true,
      };
    }
    traduction = { ...traduction, ...tradData };

    //const data = await API.add_traduction(traduction);
    //sent to the backend to save the trad
    await this.props.addTranslation(traduction);
    //traduction._id = (data.data.data || {})._id;
    this.setState({ traduction });
    //await this.get_trads();
    //if trad is done with 100% the sweet alert is sent  and we go back to the list of translations
    if (traduction.avancement >= 1) {
      Swal.fire({
        title: "Yay...",
        text: "La traduction a bien été enregistrée",
        type: "success",
        timer: 1000,
      });
      this._isMounted && this.setState({ disableBtn: false });
      this._isMounted && this.onSkip();
    }
    //catch(()=> this.setState({disableBtn: false}))
  };

  //gose back to the list of translations
  onSkip = () => {
    const i18nCode = (this.state.langue || {}).i18nCode,
      { isExpert, type, langue } = this.state;
    const nom = "avancement." + i18nCode;
    if (!isExpert) {
      this.props.history.push({
        pathname: "/avancement/langue/" + langue._id,
        state: { langue: langue },
      });
      return;
    }

    const query = {
      $or: [{ [nom]: { $lt: 1 } }, { [nom]: null }, { avancement: 1 }],
      status: "Actif",
    };
    API[
      isExpert
        ? "get_tradForReview"
        : type === "dispositif"
        ? "get_dispositif"
        : "getArticle"
    ]({ query: query, locale: i18nCode, random: true, isExpert })
      .then((data_res) => {
        let results = data_res.data.data;
        /*  if (!isExpert) {
          this.props.history.push({
            pathname: "/avancement/traductions/" + langue._id,
          }); 
        } */
        if (results.length === 0) {
          this.props.history.push({
            pathname: "/avancement/traductions/" + langue._id,
          });
          /* if (isExpert) {
            
          } else {
            Swal.fire({
              title: "Oh non",
              text:
                "Aucun résultat n'a été retourné. 2 possibilités : vous avez traduit tout le contenu disponible, ou une erreur s'est produite",
              type: "error",
              timer: 1500,
            });
          } */
        } else {
          clearInterval(this.timer);
          this.props.history.push({
            pathname:
              "/" +
              (isExpert ? "validation" : "traduction") +
              "/" +
              (_.get(results, "0.typeContenu") || type) +
              "/" +
              _.get(results, "0._id"),
            search: "?id=" + langue._id,
            state: { langue: langue },
          });
          this.setState({ disableBtn: false });
        }
      })
      .catch(() =>
        Swal.fire({
          title: "Oh non",
          text:
            "Aucun résultat n'a été retourné. 2 possibilités : vous avez traduit tout le contenu disponible, ou une erreur s'est produite",
          type: "error",
          timer: 2000,
        })
      );
  };

  handleCheckboxChange = (event) => {
    event.stopPropagation();
    this.setState({
      isComplete: event.target.checked,
      avancement: event.target.checked ? 1 : 0.495,
    });
  };

  handleCheckboxClicked = () => {
    this.setState((prevState) => ({
      isComplete: !prevState.isComplete,
      avancement: !prevState.isComplete ? 1 : 0.495,
    }));
  };

  handleSliderChange = (value) => {
    this.setState({ avancement: value });
    if (value === 1 || this.state.isComplete) {
      this.setState({ isComplete: value === 1 });
    }
  };

  upcoming = () =>
    Swal.fire({
      title: "Oh non!",
      text: "Cette fonctionnalité n'est pas encore activée",
      type: "error",
      timer: 1500,
    });

  render() {
    if (this.state.type === "dispositif") {
      return (
        <Dispositif
          translate={this.translate}
          fwdSetState={this.fwdSetState}
          handleChange={this.handleChange}
          valider={this.valider}
          onEditorStateChange={this.onEditorStateChange}
          onSkip={this.onSkip}
          getTrads={this.get_trads}
          {...this.state}
          {...this.props}
        />
      );
    } else if (this.state.type === "string") {
      return (
        <StringTranslation
          translate={this.translate}
          setArticle={this.setArticle}
          setRef={this.setRef}
          valider={this.valider}
          onSkip={this.onSkip}
          handleChange={this.handleChange}
          handleCheckboxClicked={this.handleCheckboxClicked}
          handleSliderChange={this.handleSliderChange}
          handleCheckboxChange={this.handleCheckboxChange}
          onKeyPress={this.handleKeyPress}
          handleChangeEnCours={this.handleChangeEnCours}
          handleClickText={this.handleClickText}
          fwdSetState={this.fwdSetState}
          {...this.state}
        />
      );
      // eslint-disable-next-line
    } else {
      return false;
    }
  }
}

const mapStateToProps = (state) => {
  return {
    userId: state.user.userId,
    isExpert: state.user.expertTrad,
    translations: state.translation.translations,
    translation: state.translation.translation,
  };
};

const mapDispatchToProps = {
  fetchTranslations: fetchTranslationsActionCreator,
  addTranslation: addTradActionCreator,
};

export default connect(mapStateToProps, mapDispatchToProps)(TranslationHOC);
