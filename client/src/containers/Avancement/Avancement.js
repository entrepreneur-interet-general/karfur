import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import { Col, Row, Progress, Table } from "reactstrap";
import moment from "moment/min/moment-with-locales";
import { NavLink } from "react-router-dom";
import Swal from "sweetalert2";
import { connect } from "react-redux";
import track from "react-tracking";
import styled from "styled-components";
import { colorStatut } from "../../components/Functions/ColorFunctions";

import API from "../../utils/API";
import { colorAvancement } from "../../components/Functions/ColorFunctions";
import { diffData } from "./data";
import marioProfile from "../../assets/mario-profile.jpg";
import FButton from "../../components/FigmaUI/FButton/FButton";
import EVAIcon from "../../components/UI/EVAIcon/EVAIcon";
import produce from "immer";

import "./Avancement.scss";
import variables from "scss/colors.scss";
import _ from "lodash";
import { elementType } from "prop-types";

moment.locale("fr");

export const StyledStatus = styled.button`
  font-weight: bold;
  border-radius: 8px;
  margin: 10px;
  border: 0px;
  padding: 10px;
`;

const jsUcfirst = string => {
  return (
    string &&
    string.length > 1 &&
    string.charAt(0).toUpperCase() + string.slice(1, string.length)
  );
};
export class Avancement extends Component {
  state = {
    mainView: true,
    title: diffData.all.title,
    headers: diffData.all.headers,

    langue: {},
    data: [],
    themes: [],
    itemId: null,
    isLangue: false,
    isExpert: false,
    traductionsFaites: [],
    waiting: false,
    published: false,
    review: true,
    toTranslate: false,
    traductions: [],
    dispositif: true,
    demarche: true,
    string: true,
    waitingCount: 0,
    publishedCount: 0,
    reviewCount: 0,
    toTranslateCount: 0,
    dispositifCount: 0,
    demarcheCount: 0,
    stringCount: 0
  };

  async componentDidMount() {
    let itemId = this.props.match.params.id;
    let isLangue = this.props.location.pathname.includes("/langue");
    let isExpert = this.props.location.pathname.includes("/traductions");
    let i18nCode = null;
    if (isLangue && itemId) {
      if (
        this.props.location.state &&
        this.props.location.state.langue &&
        this.props.location.state.langue.i18nCode
      ) {
        this.setState({
          langue: this.props.location.state.langue,
          title:
            diffData.traducteur.title +
            " : " +
            this.props.location.state.langue.langueFr,
          headers: diffData.traducteur.headers
        });
        i18nCode = this.props.location.state.langue.i18nCode;
      } else {
        i18nCode = await this._loadLangue(itemId, isExpert);
      }
    } else if (isExpert) {
      i18nCode = await this._loadLangue(itemId, isExpert);
    }
    this._loadArticles(itemId, i18nCode);
    API.get_tradForReview({
      query: { langueCible: i18nCode },
      sort: {updatedAt: -1},
      populate: "userId"
    }).then(data => {
      //console.log(data.data.data);
      this.setState({ traductionsFaites: data.data.data });
      console.log(data.data.data);
    });
    // this._loadThemes();
    this.setState({ itemId, isExpert, isLangue });
    window.scrollTo(0, 0);
  }

  _loadArticles = (itemId, i18nCode = null) => {
    if (itemId) {
      let query = {};
      if (i18nCode) {
        let nom = "avancement." + i18nCode;
        query = { $or: [{ [nom]: { $lt: 1 } }, { [nom]: null }] };
      }
      API.get_article(query, i18nCode).then(data_res => {
        const articles = data_res.data.data;
        this.setState({ data: articles });
      });
    }
  };

  _loadLangue = async (itemId, isExpert) => {
    if (itemId) {
      const data_res = await API.get_langues(
        { _id: itemId },
        { avancement: 1 },
        "langueBackupId"
      );
      if (data_res && data_res.data && data_res.data.data) {
        let langue = data_res.data.data[0];
        this._loadTraductions(langue);
        this.setState({
          langue: langue,
          title: diffData.traducteur.title + " : " + langue.langueFr,
          headers: diffData[isExpert ? "expert" : "traducteur"].headers
        });
        return langue.i18nCode;
      }
    }
    return false;
  };

  _loadTraductions = langue => {
    // if(langue.i18nCode){
    //   API.get_tradForReview({query: {'langueCible':langue.i18nCode, 'status' : 'En attente'},populate: 'articleId userId'}).then(data_res => {
    //     let articles=data_res.data.data;
    //     articles=articles.map(x => {return {_id:x._id,title:x.initialText.title,nombreMots:x.nbMots,avancement:{[langue.i18nCode]:1}, status:x.status, articleId:(x.articleId || {})._id, created_at:x.created_at, user:x.userId, type: "string"}});
    //     console.log(articles)
    //     this.setState({data:articles});
    //   })
    // }
  };

  _loadThemes = () => {
    API.get_themes({}).then(data_res => {
      let themes = data_res.data.data;
      let reduced_themes = themes.reduce(
        (acc, curr, i) => {
          if (i > 0 && i % 3 === 0 && i !== themes.length - 1) {
            return {
              currGrp: [curr],
              groupedData: [...acc.groupedData, acc.currGrp]
            };
          } else if (i % 3 !== 0 && i === themes.length - 1) {
            return {
              groupedData: [...acc.groupedData, [...acc.currGrp, curr]],
              currGrp: []
            };
          } else if (i % 3 === 0 && i === themes.length - 1) {
            return {
              groupedData: [...acc.groupedData, acc.currGrp, [curr]],
              currGrp: []
            };
          }
          return {
            currGrp: [...acc.currGrp, curr],
            groupedData: acc.groupedData
          };
        },
        { currGrp: [], groupedData: [] }
      ).groupedData;
      this.setState({ themes: reduced_themes });
    });
  };

  onExiting = () => {
    this.animating = true;
  };

  onExited = () => {
    this.animating = false;
  };

  next = () => {
    if (this.animating) return;
    const nextIndex =
      this.state.activeIndex === this.state.themes.length - 1
        ? 0
        : this.state.activeIndex + 1;
    this.setState({ activeIndex: nextIndex });
  };

  previous = () => {
    if (this.animating) return;
    const nextIndex =
      this.state.activeIndex === 0
        ? this.state.themes.length - 1
        : this.state.activeIndex - 1;
    this.setState({ activeIndex: nextIndex });
  };

  goToTraduction = element => {
    this.props.history.push({
      pathname:
        (this.state.isExpert ? "/validation" : "/traduction") +
        "/" +
        (element.typeContenu || "dispositif") +
        "/" +
        element._id,
      search: "?id=" + this.state.langue._id,
      state: { langue: this.state.langue }
    });
  };

  upcoming = () =>
    Swal.fire({
      title: "Oh non!",
      text: "Cette fonctionnalité n'est pas encore activée",
      type: "error",
      timer: 1500
    });

  reorderOnTopPubblish = () => {
    this.setState(
      produce(draft => {
        draft.published = !this.state.published;
        if (!this.state.published) {
          console.log("inside inside");
          draft.traductions.sort((a, b) => {
            // console.log(a, b);
            if (a.statusTrad === "Publiées" && b.statusTrad === "Publiées") {
              return 0;
            } else if (
              a.statusTrad === "Publiées" &&
              b.statusTrad !== "Publiées"
            ) {
              return -1;
            } else {
              return 1;
            }
          });
        }
      })
    );
  };

  reorderOnTopWaiting = () => {
    this.setState(
      produce(draft => {
        draft.waiting = !this.state.waiting;
        if (!this.state.waiting) {
          draft.traductions.sort((a, b) => {
            if (
              a.statusTrad === "En attente" &&
              b.statusTrad === "En attente"
            ) {
              return 0;
            } else if (
              a.statusTrad === "En attente" &&
              b.statusTrad !== "En attente"
            ) {
              return -1;
            } else {
              return 1;
            }
          });
        }
      })
    );
  };

  reorderOnTopReview = () => {
    this.setState(
      produce(draft => {
        draft.review = !this.state.review;
        if (!this.state.review) {
          draft.traductions.sort((a, b) => {
            if (a.statusTrad === "À revoir" && b.statusTrad === "À revoir") {
              return 0;
            } else if (
              a.statusTrad === "À revoir" &&
              b.statusTrad !== "À revoir"
            ) {
              return -1;
            } else {
              return 1;
            }
          });
        }
      })
    );
  };

  reorderOnTopToTranslate = () => {
    this.setState(
      produce(draft => {
        draft.toTranslate = !this.state.toTranslate;
        if (!this.state.toTranslate) {
          draft.traductions.sort((a, b) => {
            if (
              a.statusTrad === "À traduire" &&
              b.statusTrad === "À traduire"
            ) {
              return 0;
            } else if (
              a.statusTrad === "À traduire" &&
              b.statusTrad !== "À traduire"
            ) {
              return -1;
            } else {
              return 1;
            }
          });
        }
      })
    );
  };

  reorderOnTopType = type => {
    this.setState(
      produce(draft => {
        draft[type] = !this.state[type];
        if (!this.state[type]) {
          draft.traductions.sort((a, b) => {
            if (a.typeContenu === type && b.typeContenu === type) {
              return 0;
            } else if (a.typeContenu === type && b.typeContenu !== type) {
              return -1;
            } else {
              return 1;
            }
          });
        }
      })
    );
  };

  reorder = () => {
    this.setState(
      produce(draft => {
        draft.draft = !this.state.draft;
        if (!this.state.draft) {
          draft.traductions.sort((a, b) => {
            if (a.status === "Brouillon" && b.status === "Brouillon") {
              return 0;
            } else if (a.status === "Brouillon" && b.status !== "Brouillon") {
              return -1;
            } else {
              return 1;
            }
          });
        }
      })
    );
  };

  countfilter = (trads, filter) => {
    var count = 0;
    for (var i = 0; i < trads.length; ++i) {
      if (trads[i].statusTrad == filter) {
        count++;
      }
    }
    return (count);
  };

  countType = (trads, type) => {
    var count = 0;
    for (var i = 0; i < trads.length; ++i) {
      if (trads[i].typeContenu == type && type !== 'string') {
        if (this.state.waiting && trads[i].statusTrad === "En attente") {
          count++;
        } else if (this.state.published && trads[i].statusTrad === "Publiées" ) {
          count++
        } else if (this.state.review && trads[i].statusTrad === "À revoir") {
          count++
        } else if (this.state.toTranslate && trads[i].statusTrad === 'À traduire') {
          count++
        }
      } else if (trads[i].typeContenu == type && type == 'string'){
        count++
      }
    }
    return (count);
  };

  componentDidUpdate(prevProps, prevState) {
    const { langue, isExpert, data } = this.state;
    console.log("langue", langue);
    let traductions = [];
    if (
      prevState.traductionsFaites !== this.state.traductionsFaites ||
      prevState.data !== this.state.data ||
      (!_.isEmpty(this.props.dispositifs) &&
        this.props.dispositifs !== prevProps.dispositifs)
    ) {
      console.log(
        "inside",
        this.props.dispositifs,
        this.state.traductionsFaites
      );
      traductions = [
        ...this.props.dispositifs
          .filter(x => x.status === "Actif")
          .map(x => ({
            _id: x._id,
            title:
              (x.titreMarque || "") +
              (x.titreMarque && x.titreInformatif ? " - " : "") +
              (x.titreInformatif || ""),
            nombreMots: x.nbMots,
            avancement:
              Math.max(
                0,
                ...((this.state.traductionsFaites || [])
                  .filter(y => {
                    //console.log(y);
                    return y.articleId === x._id;
                  })
                  .map(z => z.avancement || -1) || [])
              ) || 0,
            status: x.status,
            statusTrad:
              (this.state.traductionsFaites || [])
                .filter((y, index) => {
                  //console.log(y);
                  return y.articleId === x._id;
                  /*      if (y.articleId === x._id && y.status === "Validée" && x.avancement === 1) {
                  return "À revoir"
                } else if (y.articleId === x._id && y.status === "Validée" && x.avancement !== 1)  {
                  return "Publiées"
                } else if(y.articleId === x._id && y.status === "En attente") {
                return "En attente";
                } */
                })
                .map((z, index) => {
                  if (z.status === "À revoir") {
                    console.log(index);
                    return "À revoir";
                  } else if (z.status === "Validée") {
                    console.log(index);
                    return "Publiées";
                  } else if (z.status === "En attente") {
                    return "En attente";
                  }
                  return "À traduire";
                })[0] || "À traduire",
            created_at: x.created_at,
            updatedAt: x.updatedAt,
            users: [
              ...new Set(
                (this.state.traductionsFaites || [])
                  .filter(y => y.articleId === x._id)
                  .map(z => (z.userId || {})._id) || []
              )
            ].map(id => ({
              _id: id,
              picture:
                (
                  (
                    (this.state.traductionsFaites || []).find(
                      t => (t.userId || {})._id === id
                    ) || {}
                  ).userId || {}
                ).picture || {}
            })),
            typeContenu: x.typeContenu || "dispositif"
          })),
        ...data.map(x => {
          // console.log(x, (this.state.traductionsFaites || []).filter(y => y.jsonId === x._id), (this.state.traductionsFaites || []).filter(y => y.jsonId === x._id).map(z => (z.avancement || -1)))
          return {
            ...x,
            avancement:
              Math.max(
                0,
                ...((this.state.traductionsFaites || [])
                  .filter(y => y.jsonId === x._id)
                  .map(z => z.avancement || -1) || [])
              ) || 0,
            users: [
              ...new Set(
                (this.state.traductionsFaites || [])
                  .filter(y => y.jsonId === x._id)
                  .map(z => (z.userId || {})._id) || []
              )
            ].map(id => ({
              _id: id,
              picture:
                (
                  (
                    (this.state.traductionsFaites || []).find(
                      t => (t.userId || {})._id === id
                    ) || {}
                  ).userId || {}
                ).picture || {}
            })),
            typeContenu: "string",
            _id: isExpert
              ? (
                  (this.state.traductionsFaites || []).find(
                    y => y.jsonId === x._id && y.avancement === 1
                  ) || {}
                )._id
              : x._id
          };
        })
        //...this.props.dispositifs.filter(x => x.status === "Actif" && (x.avancement || {})[this.state.langue.i18nCode] !== 1).map(x => ( {
      ];
      console.log("those are translations", traductions);
      /*     traductions = traductions.filter(x =>
        isExpert ? x.avancement >= 1 : x.avancement < 1
      ); */
      this.setState({
        traductions,
        waitingCount: this.countfilter(traductions, "En attente"),
        publishedCount:this.countfilter(traductions, "Publiées"),
        reviewCount: this.countfilter(traductions, "À revoir"),
        toTranslateCount: this.countfilter(traductions, "À traduire"),
        dispositifCount: this.countType(traductions, "dispositif"),
        demarcheCount: this.countType(traductions, "demarche"),
        stringCount: this.countType(traductions, "string"),
      });
      if (this.countfilter(traductions, "À revoir") == 0 && this.countfilter(traductions, "À traduire") > 0) {
        this.setState({
          toTranslate: true,
          review: false,
        });
      }
    }
    if ((prevState.waiting !== this.state.waiting) ||
    (prevState.published !== this.state.published) ||
    (prevState.review !== this.state.review) ||
    (prevState.toTranslate !== this.state.toTranslate)) {
      this.setState({
        waitingCount: this.countfilter(this.state.traductions, "En attente"),
        publishedCount:this.countfilter(this.state.traductions, "Publiées"),
        reviewCount: this.countfilter(this.state.traductions, "À revoir"),
        toTranslateCount: this.countfilter(this.state.traductions, "À traduire"),
        dispositifCount: this.countType(this.state.traductions, "dispositif"),
        demarcheCount: this.countType(this.state.traductions, "demarche"),
        stringCount: this.countType(this.state.traductions, "string"),
      })
/*       if (this.countfilter(traductions, "À revoir") == 0) {
        this.setState({
          toTranslate: true,
          review: false,
        });
      } */
    }
  }

  render() {
    const { langue, isExpert, data, traductions } = this.state;

    /*  let traductions = [
      ...data.map(x => {
        // console.log(x, (this.state.traductionsFaites || []).filter(y => y.jsonId === x._id), (this.state.traductionsFaites || []).filter(y => y.jsonId === x._id).map(z => (z.avancement || -1)))
        return {
          ...x,
          avancement:
            Math.max(
              0,
              ...((this.state.traductionsFaites || [])
                .filter(y => y.jsonId === x._id)
                .map(z => z.avancement || -1) || [])
            ) || 0,
          users: [
            ...new Set(
              (this.state.traductionsFaites || [])
                .filter(y => y.jsonId === x._id)
                .map(z => (z.userId || {})._id) || []
            )
          ].map(id => ({
            _id: id,
            picture:
              (
                (
                  (this.state.traductionsFaites || []).find(
                    t => (t.userId || {})._id === id
                  ) || {}
                ).userId || {}
              ).picture || {}
          })),
          typeContenu: "string",
          _id: isExpert
            ? (
                (this.state.traductionsFaites || []).find(
                  y => y.jsonId === x._id && y.avancement === 1
                ) || {}
              )._id
            : x._id
        };
      }),
      //...this.props.dispositifs.filter(x => x.status === "Actif" && (x.avancement || {})[this.state.langue.i18nCode] !== 1).map(x => ( {
      ...this.props.dispositifs
        .filter(x => x.status === "Actif")
        .map(x => ({
          _id: x._id,
          title:
            (x.titreMarque || "") +
            (x.titreMarque && x.titreInformatif ? " - " : "") +
            (x.titreInformatif || ""),
          nombreMots: x.nbMots,
          avancement:
            Math.max(
              0,
              ...((this.state.traductionsFaites || [])
                .filter(y => {
                  //console.log(y);
                  return y.articleId === x._id;
                })
                .map(z => z.avancement || -1) || [])
            ) || 0,
          status: x.status,
          statusTrad: (this.state.traductionsFaites || [])
            .filter(y => {
              //console.log(y);
              return y.articleId === x._id;
            })
            .map(z => z.status || -1),
          created_at: x.created_at,
          updatedAt: x.updatedAt,
          users: [
            ...new Set(
              (this.state.traductionsFaites || [])
                .filter(y => y.articleId === x._id)
                .map(z => (z.userId || {})._id) || []
            )
          ].map(id => ({
            _id: id,
            picture:
              (
                (
                  (this.state.traductionsFaites || []).find(
                    t => (t.userId || {})._id === id
                  ) || {}
                ).userId || {}
              ).picture || {}
          })),
          typeContenu: x.typeContenu || "dispositif"
        }))
    ]; */
    /* console.log(traductions);
    traductions = traductions
      .filter(x => (isExpert ? x.avancement >= 1 : x.avancement < 1))
      .sort((a, b) => {
        b[this.state.filterSelected] - a[this.state.filterSelected];
      });*/
    console.log("this is rendereing", traductions, this.state);
    const displayedText =
      (data || []).length === 0 || (this.props.dispositifs || []).length === 0
        ? "Chargement"
        : "Aucun résultat";

    /* if (
      (data || []).length > 0 &&
      (this.props.dispositifs || []).length > 0 &&
      traductions.length === 0 &&
      (!isExpert || (this.state.traductionsFaites || []).length > 0)
    ) {
      console.log(
        isExpert,
        this.state.traductionsFaites,
        data,
        this.props.dispositifs,
        traductions.length
      );
      Swal.fire({
        title: "Oh non!",
        text:
          "Il semblerait qu'il n'y ait aucun élément à " +
          (isExpert ? "valider" : "traduire"),
        type: "error",
        timer: 1500
      });
    } */
    const AvancementData = () => {
      if (
        this.props.match.params.id &&
        traductions.length > 0 &&
        this.state.langue.i18nCode
      ) {
        return traductions.map(element => {
          if (
            isExpert &&
            // element.statusTrad &&
            ((element.statusTrad === "Publiées" && !this.state.published) ||
              (element.statusTrad === "En attente" && !this.state.waiting) ||
              (element.statusTrad === "À revoir" && !this.state.review) ||
              (element.statusTrad === "À traduire" &&
                !this.state.toTranslate) ||
              (element.typeContenu === "demarche" && !this.state.demarche) ||
              (element.typeContenu === "dispositif" &&
                !this.state.dispositif) ||
              (element.typeContenu === "string" && !this.state.string))
          ) {
            return;
          }
          if (
            !isExpert &&
            (element.statusTrad === "En attente" ||
              (element.statusTrad === "Publiées" && !this.state.published) ||
              (element.statusTrad === "À revoir" && !this.state.review) ||
              (element.statusTrad === "À traduire" &&
                !this.state.toTranslate) ||
              (element.typeContenu === "demarche" && !this.state.demarche) ||
              (element.typeContenu === "dispositif" &&
                !this.state.dispositif) ||
              (element.typeContenu === "string" && !this.state.string))
          ) {
            return;
          }
          const joursDepuis =
            (new Date().getTime() - new Date(element.updatedAt).getTime()) /
            (1000 * 3600 * 24);
          const titre =
            (element.title || {}).fr ||
            element.title ||
            (element.initialText || {}).title ||
            (element.titreMarque || "") +
              (element.titreMarque && element.titreInformatif ? " - " : "") +
              (element.titreInformatif || "") ||
            "";
          return (
            <tr
              key={element._id}
              className="avancement-row pointer"
              onClick={() =>
                !isExpert && element.statusTrad === "Publiées"
                  ? null
                  : this.goToTraduction(element)
              }
            >
              <td className="align-middle">
                {element.isStructure ? "Site" : jsUcfirst(element.typeContenu)}
              </td>
              <td className="align-middle">
                {titre.slice(0, 30) + (titre.length > 30 ? "..." : "")}
              </td>
              <td
                className={
                  "align-middle depuis " +
                  (element.nombreMots > 100 ? "alert" : "success")
                }
              >
                {(isExpert
                  ? ""
                  : Math.round(
                      (element.nombreMots || 0) * (element.avancement || 0)
                    ) + " / ") + element.nombreMots}
              </td>
              {isExpert ? (
                <>
                  <td className="align-middle">
                    {element.users &&
                      element.users.map(participant => {
                        return (
                          <img
                            key={participant._id}
                            src={
                              participant.picture &&
                              participant.picture.secure_url
                                ? participant.picture.secure_url
                                : marioProfile
                            }
                            className="profile-img-pin img-circle mr-10"
                            alt="random profiles"
                          />
                        );
                      })}
                  </td>
                  <td className="align-middle">
                    {element.statusTrad ? element.statusTrad : ""}
                  </td>
                </>
              ) : (
                <>
                  <td className="align-middle">
                    <Row>
                      <Col>
                        <Progress
                          color={colorAvancement(element.avancement)}
                          value={element.avancement * 100}
                        />
                      </Col>
                      <Col
                        className={
                          "text-" + colorAvancement(element.avancement)
                        }
                      >
                        {element.avancement === 1 ? (
                          <EVAIcon
                            name="checkmark-circle-2"
                            fill={variables.vert}
                          />
                        ) : (
                          <span>
                            {Math.round((element.avancement || 0) * 100)} %
                          </span>
                        )}
                      </Col>
                    </Row>
                  </td>
                  <td className="align-middle">
                    {element.statusTrad ? element.statusTrad : ""}
                  </td>
                </>
              )}
              <td
                className={
                  "align-middle depuis " +
                  (joursDepuis > 3 ? "alert" : "success")
                }
              >
                {moment(element.updatedAt).fromNow()}
              </td>
              <td className="align-middle fit-content">
                {/* <FButton type="light-action" name="bookmark-outline" fill={variables.noir} onClick={e => {e.stopPropagation();this.upcoming();}}/> */}
              </td>
              <td className="align-middle fit-content">
                {!isExpert && element.statusTrad === "Publiées" ? null : (
                  <FButton
                    type="light-action"
                    name="eye-outline"
                    fill={variables.noir}
                    onClick={() => this.goToTraduction(element)}
                  />
                )}
              </td>
            </tr>
          );
        });
      } else {
        return (
          <tr>
            <td>{displayedText}</td>
            <td>{displayedText}</td>
            <td>{displayedText}</td>
            <td>{displayedText}</td>
            <td>{displayedText}</td>
            <td>{displayedText}</td>
          </tr>
        );
      }
    };

    return (
      <div className="animated fadeIn avancement">
        <Row>
          <Col>
            <h2>
              <NavLink to="/backend/user-profile" className="my-breadcrumb">
                Mon profil
              </NavLink>{" "}
              /{" "}
              <NavLink to="/backend/user-dashboard" className="my-breadcrumb">
                Espace traduction
              </NavLink>{" "}
              / {langue.langueFr}
            </h2>
          </Col>
          <Col className="avancement-header-right tableau-header align-right">
            <FButton
              type="outline-black"
              name="info-outline"
              fill={variables.noir}
              className="mr-10"
              onClick={this.upcoming}
            >
              Aide
            </FButton>
            <FButton type="dark" name="flip-2-outline" onClick={this.upcoming}>
              Sélection aléatoire
            </FButton>
          </Col>
        </Row>
        <Row>
          <StyledStatus
            onClick={this.reorderOnTopToTranslate}
            className={
              "status-pill bg-" +
              (this.state.toTranslate ? "focus text-white" : "white")
            }
          >
            {"À traduire (" + this.state.toTranslateCount + ")"}
          </StyledStatus>
          <StyledStatus
            onClick={this.reorderOnTopReview}
            className={
              "status-pill bg-" +
              (this.state.review ? colorStatut("Supprimé") : "white")
            }
          >
            {"À revoir (" + this.state.reviewCount + ")"}
          </StyledStatus>
          {isExpert ? (
            <StyledStatus
              onClick={this.reorderOnTopWaiting}
              className={
                "status-pill bg-" +
                (this.state.waiting ? colorStatut("Brouillon") : "white")
              }
            >
              {"À valider (" + this.state.waitingCount + ")"}
            </StyledStatus>
          ) : null}
          <StyledStatus
            onClick={this.reorderOnTopPubblish}
            className={
              "status-pill bg-" +
              (this.state.published ? colorStatut("Publié") : "white")
            }
          >
            {"Publiées (" + this.state.publishedCount + ")"}
          </StyledStatus>
          <StyledStatus
            onClick={() => this.reorderOnTopType("demarche")}
            className={
              "status-pill bg-" +
              (this.state.demarche ? "black text-white" : "white")
            }
          >
            {"Démarches (" + this.state.demarcheCount + ")"}
          </StyledStatus>
          <StyledStatus
            onClick={() => this.reorderOnTopType("dispositif")}
            className={
              "status-pill bg-" +
              (this.state.dispositif ? "black text-white" : "white")
            }
          >
            {"Dispositifs (" + this.state.dispositifCount + ")"}
          </StyledStatus>
          <StyledStatus
            onClick={() => this.reorderOnTopType("string")}
            className={
              "status-pill bg-" +
              (this.state.string ? "black text-white" : "white")
            }
          >
            {"Interface (" + this.state.stringCount + ")"}
          </StyledStatus>
        </Row>

        {/*<Row className="avancement-header">
          <Col className="tableau-header">
            <div className="float-right">
              Plus que <b className="big-number">{(this.state.data || []).length}</b> éléments à traduire, on lâche rien !
            </div>
          </Col>
    </Row>*/}

        <div className="tableau">
          <Table responsive className="avancement-user-table">
            <thead>
              <tr>
                {this.state.headers.map((element, key) => (
                  <th
                    key={key}
                    className={
                      (element.active ? "texte-bold" : "") +
                      (element.hideOnPhone ? " hideOnPhone" : "") +
                      " cursor-pointer"
                    }
                    onClick={() => this.reorder(key, element)}
                  >
                    {element.name}
                    {element.order && (
                      <EVAIcon
                        name={"chevron-" + (element.croissant ? "up" : "down")}
                        fill={variables.noir}
                        className="sort-btn"
                      />
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AvancementData />
            </tbody>
          </Table>
        </div>

        {/* <AvancementLangue 
          mainView={this.state.mainView}
          title={this.state.title}
          headers={this.state.headers}
          data={this.state.data}
          switchView={this.switchView}
        /> */}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    dispositifs: state.dispositif.dispositifs
  };
};

export default track({
  page: "Avancement"
})(connect(mapStateToProps)(withTranslation()(Avancement)));
