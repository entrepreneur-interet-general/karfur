/* eslint-disable no-console */
import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import { Col, Row, Progress, Table } from "reactstrap";
import moment from "moment/min/moment-with-locales";
import { NavLink } from "react-router-dom";
import Swal from "sweetalert2";
import { connect } from "react-redux";
import styled from "styled-components";
import { colorStatut } from "../../components/Functions/ColorFunctions";

import API from "../../utils/API";
import { colorAvancement } from "../../components/Functions/ColorFunctions";
import { diffData } from "./data";
import FButton from "../../components/FigmaUI/FButton/FButton";
import EVAIcon from "../../components/UI/EVAIcon/EVAIcon";
import Skeleton from "react-loading-skeleton";
import produce from "immer";

import "./Avancement.scss";
import { colors } from "colors";
import _ from "lodash";

moment.locale("fr");

export const StyledStatus = styled.button`
  font-weight: bold;
  border-radius: 8px;
  margin: 10px;
  border: 0px;
  padding: 10px;
`;

const StyledFirstCell = styled.td`
  border-radius: 12px 0px 0px 12px;
  background-color: white;
`;

const StyledLastCell = styled.td`
  border-radius: 0px 12px 12px 0px;
  background-color: white;
`;

const StyledCell = styled.td`
  background-color: white;
`;

export const StyledInput = styled.input`
  font-weight: bold;
  border-radius: 8px;
  margin: 10px;
  border: 0px;
  padding: 10px;
  border: 0.5px solid gray;
`;

const jsUcfirst = (string) => {
  return (
    string &&
    string.length > 1 &&
    string.charAt(0).toUpperCase() + string.slice(1, string.length)
  );
};
export class Avancement extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mainView: true,
      title: diffData.all.title,
      headers: diffData.all.headers,
      loader: false,
      langue: {},
      data: [],
      themes: [],
      itemId: null,
      isLangue: false,
      isExpert: props.isExpert,
      traductionsFaites: [],
      waiting: false,
      published: false,
      review: props.isExpert,
      toTranslate: !props.isExpert,
      traductions: [],
      unfiltered: [],
      dispositif: true,
      demarche: true,
      string: true,
      waitingCount: 0,
      publishedCount: 0,
      reviewCount: 0,
      toTranslateCount: 0,
      dispositifCount: 0,
      demarcheCount: 0,
      stringCount: 0,
      ascending: false,
      research: "",
    };
  }

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
          headers: diffData.traducteur.headers,
        });
        i18nCode = this.props.location.state.langue.i18nCode;
      } else {
        i18nCode = await this._loadLangue(itemId, isExpert);
      }
    } else if (isExpert) {
      i18nCode = await this._loadLangue(itemId, isExpert);
    }
    this.setState({ loader: true });
    API.get_tradForReview({
      query: { langueCible: i18nCode },
      sort: { updatedAt: -1 },
      populate: "userId",
    }).then((data) => {
      this.setState({ traductionsFaites: data.data.data });
      this.setState({ loader: false });
    });
    this.setState({ itemId, isExpert, isLangue });
    window.scrollTo(0, 0);
  }

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
          headers: diffData[isExpert ? "expert" : "traducteur"].headers,
        });
        return langue.i18nCode;
      }
    }
    return false;
  };

  _loadTraductions = () => {
    // if(langue.i18nCode){
    //   API.get_tradForReview({query: {'langueCible':langue.i18nCode, 'status' : 'En attente'},populate: 'articleId userId'}).then(data_res => {
    //     let articles=data_res.data.data;
    //     articles=articles.map(x => {return {_id:x._id,title:x.initialText.title,nombreMots:x.nbMots,avancement:{[langue.i18nCode]:1}, status:x.status, articleId:(x.articleId || {})._id, created_at:x.created_at, user:x.userId, type: "string"}});
    //     this.setState({data:articles});
    //   })
    // }
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

  goToTraduction = (element) => {
    this.props.history.push({
      pathname:
        (this.state.isExpert ? "/validation" : "/traduction") +
        "/" +
        (element.typeContenu || "dispositif") +
        "/" +
        element._id,
      search: "?id=" + this.state.langue._id,
    });
  };

  upcoming = () =>
    Swal.fire({
      title: "Oh non!",
      text: "Cette fonctionnalité n'est pas encore activée",
      type: "error",
      timer: 1500,
    });

  reorderOnTopPubblish = () => {
    this.setState(
      produce((draft) => {
        draft.published = !this.state.published;
        if (!this.state.published) {
          draft.traductions.sort((a, b) => {
            if (a.statusTrad === "Publiées" && b.statusTrad === "Publiées") {
              return 0;
            } else if (
              a.statusTrad === "Publiées" &&
              b.statusTrad !== "Publiées"
            ) {
              return -1;
            }
            return 1;
          });
        }
      })
    );
  };

  reorderOnTopWaiting = () => {
    this.setState(
      produce((draft) => {
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
            }
            return 1;
          });
        }
      })
    );
  };

  reorderOnTopReview = () => {
    this.setState(
      produce((draft) => {
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
            }
            return 1;
          });
        }
      })
    );
  };

  reorderOnTopToTranslate = () => {
    this.setState(
      produce((draft) => {
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
            }
            return 1;
          });
        }
      })
    );
  };

  reorderOnTopType = (type) => {
    this.setState(
      produce((draft) => {
        draft[type] = !this.state[type];
        if (!this.state[type]) {
          draft.traductions.sort((a, b) => {
            if (a.typeContenu === type && b.typeContenu === type) {
              return 0;
            } else if (a.typeContenu === type && b.typeContenu !== type) {
              return -1;
            }
            return 1;
          });
        }
      })
    );
  };

  reorder = (_, element) => {
    this.setState(
      produce((draft) => {
        draft.ascending = !this.state.ascending;
        if (element.order === "title") {
          draft.traductions.sort((a, b) => {
            if (
              a[element.order].toUpperCase() >= b[element.order].toUpperCase()
            ) {
              return this.state.ascending ? 1 : -1;
            } else if (
              a[element.order].toUpperCase() < b[element.order].toUpperCase()
            ) {
              return this.state.ascending ? -1 : 1;
            }
            return 1;
          });
        } else {
          draft.traductions.sort((a, b) => {
            if (a[element.order] >= b[element.order]) {
              return this.state.ascending ? 1 : -1;
            } else if (a[element.order] < b[element.order]) {
              return this.state.ascending ? -1 : 1;
            }

            return -1;
          });
        }
      })
    );
  };

  countfilter = (trads, filter) => {
    var count = 0;
    for (var i = 0; i < trads.length; ++i) {
      if (trads[i].statusTrad === filter) {
        count++;
      }
    }
    return count;
  };

  countType = (trads, type) => {
    var count = 0;
    for (var i = 0; i < trads.length; ++i) {
      if (trads[i].typeContenu === type && type !== "string") {
        if (this.state.waiting && trads[i].statusTrad === "En attente") {
          count++;
        } else if (this.state.published && trads[i].statusTrad === "Publiées") {
          count++;
        } else if (this.state.review && trads[i].statusTrad === "À revoir") {
          count++;
        } else if (
          this.state.toTranslate &&
          trads[i].statusTrad === "À traduire"
        ) {
          count++;
        }
      } else if (trads[i].typeContenu === type && type === "string") {
        count++;
      }
    }
    return count;
  };

  componentDidUpdate(prevProps, prevState) {
    const { isExpert, data } = this.state;
    let traductions = [];
    if (
      prevState.traductionsFaites !== this.state.traductionsFaites ||
      prevState.data !== this.state.data ||
      (!_.isEmpty(this.props.dispositifs) &&
        this.props.dispositifs !== prevProps.dispositifs)
    ) {
      traductions = [
        ...this.props.dispositifs.map((x) => ({
          _id: x._id,
          title:
            (x.titreMarque || "") +
            (x.titreMarque && x.titreInformatif ? " - " : "") +
            (x.titreInformatif || ""),
          nombreMots: x.nbMots,
          avancement:
            isExpert ||
            (this.state.traductionsFaites || []).filter((y) => {
              return (
                y.articleId === x._id &&
                y.userId._id === this.props.userId &&
                y.status === "À revoir"
              );
            }).length > 0
              ? Math.max(
                  0,
                  ...((this.state.traductionsFaites || [])
                    .filter((y) => {
                      return (
                        y.articleId === x._id &&
                        y.userId._id === this.props.userId
                      );
                    })
                    .map((z) => z.avancement || -1) || [])
                )
              : (this.state.traductionsFaites || []).filter((y) => {
                  return y.articleId === x._id && y.status === "À revoir";
                }).length > 0
              ? Math.max(
                  0,
                  ...((this.state.traductionsFaites || [])
                    .filter((y) => {
                      return (
                        y.articleId === x._id && y.userId._id === y.validatorId
                      );
                    })
                    .map((z) => z.avancement || -1) || [])
                )
              : Math.max(
                  0,
                  ...((this.state.traductionsFaites || [])
                    .filter((y) => {
                      return y.articleId === x._id;
                    })
                    .map((z) => z.avancement || -1) || [])
                ),

          avancementTrad: Math.max(
            0,
            ...((this.state.traductionsFaites || [])
              .filter((y) => {
                return y.articleId === x._id;
              })
              .map((z) => z.avancement || -1) || [])
          ),

          status: x.status,
          statusTrad:
            (this.state.traductionsFaites || [])
              .filter((y) => {
                return y.articleId === x._id;
                /*      if (y.articleId === x._id && y.status === "Validée" && x.avancement === 1) {
                  return "À revoir"
                } else if (y.articleId === x._id && y.status === "Validée" && x.avancement !== 1)  {
                  return "Publiées"
                } else if(y.articleId === x._id && y.status === "En attente") {
                return "En attente";
                } */
              })
              .map((z) => {
                if (z.status === "À revoir") {
                  return "À revoir";
                } else if (z.status === "Validée") {
                  return "Publiées";
                } else if (z.status === "En attente") {
                  return "En attente";
                }
                return "À traduire";
              })[0] || "À traduire",
          created_at: x.created_at,
          updatedAt: this.state.traductionsFaites.find(
            (y) => y.articleId === x._id
          )
            ? this.state.traductionsFaites.find((y) => y.articleId === x._id)
                .updatedAt
            : false,
          users: [
            ...new Set(
              (this.state.traductionsFaites || [])
                .filter((y) => y.articleId === x._id)
                .map((z) => (z.userId || {})._id) || []
            ),
          ].map((id) => ({
            _id: id,
            picture:
              (
                (
                  (this.state.traductionsFaites || []).find(
                    (t) => (t.userId || {})._id === id
                  ) || {}
                ).userId || {}
              ).picture || {},
          })),
          typeContenu: x.typeContenu || "dispositif",
        })),
        ...data.map((x) => {
          return {
            ...x,
            avancement:
              Math.max(
                0,
                ...((this.state.traductionsFaites || [])
                  .filter((y) => y.jsonId === x._id)
                  .map((z) => z.avancement || -1) || [])
              ) || 0,
            users: [
              ...new Set(
                (this.state.traductionsFaites || [])
                  .filter((y) => y.jsonId === x._id)
                  .map((z) => (z.userId || {})._id) || []
              ),
            ].map((id) => ({
              _id: id,
              picture:
                (
                  (
                    (this.state.traductionsFaites || []).find(
                      (t) => (t.userId || {})._id === id
                    ) || {}
                  ).userId || {}
                ).picture || {},
            })),
            typeContenu: "string",
            _id: isExpert
              ? (
                  (this.state.traductionsFaites || []).find(
                    (y) => y.jsonId === x._id && y.avancement === 1
                  ) || {}
                )._id
              : x._id,
          };
        }),
        //...this.props.dispositifs.filter(x => x.status === "Actif" && (x.avancement || {})[this.state.langue.i18nCode] !== 1).map(x => ( {
      ];
      /*     traductions = traductions.filter(x =>
        isExpert ? x.avancement >= 1 : x.avancement < 1
      ); */
      this.setState({
        traductions,
        unfiltered: traductions,
        waitingCount: this.countfilter(traductions, "En attente"),
        publishedCount: this.countfilter(traductions, "Publiées"),
        reviewCount: this.countfilter(traductions, "À revoir"),
        toTranslateCount: this.countfilter(traductions, "À traduire"),
        dispositifCount: this.countType(traductions, "dispositif"),
        demarcheCount: this.countType(traductions, "demarche"),
        stringCount: this.countType(traductions, "string"),
      });
      /*   if (
        this.countfilter(traductions, "À revoir") === 0 &&
        this.countfilter(traductions, "À traduire") > 0
      ) {
        console.log(this.countfilter(traductions, "À traduire"), this.countfilter(traductions, "À revoir"), traductions)
        this.setState({
          toTranslate: true,
          review: false,
        });
      } */
    }
    if (
      prevState.waiting !== this.state.waiting ||
      prevState.published !== this.state.published ||
      prevState.review !== this.state.review ||
      prevState.toTranslate !== this.state.toTranslate ||
      prevState.research !== this.state.research
    ) {
      this.setState({
        waitingCount: this.countfilter(this.state.traductions, "En attente"),
        publishedCount: this.countfilter(this.state.traductions, "Publiées"),
        reviewCount: this.countfilter(this.state.traductions, "À revoir"),
        toTranslateCount: this.countfilter(
          this.state.traductions,
          "À traduire"
        ),
        dispositifCount: this.countType(this.state.traductions, "dispositif"),
        demarcheCount: this.countType(this.state.traductions, "demarche"),
        stringCount: this.countType(this.state.traductions, "string"),
      });
      if (
        this.countfilter(traductions, "À revoir") === 0 &&
        this.countfilter(traductions, "À traduire") > 0
      ) {
        this.setState({
          toTranslate: true,
          review: false,
        });
      }
      /*       if (this.countfilter(traductions, "À revoir") == 0) {
        this.setState({
          toTranslate: true,
          review: false,
        });
      } */
    }
  }

  handleChange = (e) => {
    this.setState({ research: e.target.value });
    // Variable to hold the original version of the list
    let currentList = [];
    // Variable to hold the filtered list before putting into state
    let newList = [];

    // If the search bar isn't empty
    if (e.target.value !== "") {
      // Assign the original list to currentList
      currentList = this.state.unfiltered;

      // Use .filter() to determine which items should be displayed
      // based on the search terms
      newList = currentList.filter((item) => {
        // change current item to lowercase
        const lc = item.title.toLowerCase();
        // change search term to lowercase
        const filter = e.target.value.toLowerCase();
        // check to see if the current list item includes the search term
        // If it does, it will be added to newList. Using lowercase eliminates
        // issues with capitalization in search terms and search content
        return lc.includes(filter);
      });
    } else {
      // If the search bar is empty, set newList to original task list
      newList = this.state.unfiltered;
    }
    // Set the filtered state based on what our rules added to newList
    this.setState({
      traductions: newList,
    });
  };

  render() {
    const { langue, isExpert, data, traductions } = this.state;

    const displayedText =
      (data || []).length === 0 || (this.props.dispositifs || []).length === 0
        ? "Chargement"
        : "Aucun résultat";

    const AvancementData = () => {
      if (
        this.props.match.params.id &&
        traductions.length > 0 &&
        this.state.langue.i18nCode
      ) {
        return traductions.map((element) => {
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
            (new Date().getTime() - new Date(element.created_at).getTime()) /
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
                {titre.slice(0, 30) + (titre.length > 30 ? "..." : "")}
              </td>
              {isExpert &&
                (element.statusTrad === "À traduire" ? (
                  <td className="align-middle">
                    <Row>
                      <Col>
                        <Progress
                          color={colorAvancement(element.avancementTrad)}
                          value={element.avancementTrad * 100}
                        />
                      </Col>
                      <Col
                        className={
                          "text-" + colorAvancement(element.avancementTrad)
                        }
                      >
                        {element.avancementTrad === 1 ? (
                          <EVAIcon
                            name="checkmark-circle-2"
                            fill={colors.vert}
                          />
                        ) : (
                          <span>
                            {Math.round((element.avancementTrad || 0) * 100)} %
                          </span>
                        )}
                      </Col>
                    </Row>
                  </td>
                ) : (
                  "--"
                ))}
              <td className="align-middle">
                <Row>
                  <Col>
                    <Progress
                      color={colorAvancement(element.avancement)}
                      value={element.avancement * 100}
                    />
                  </Col>
                  <Col
                    className={"text-" + colorAvancement(element.avancement)}
                  >
                    {element.avancement === 1 ? (
                      <EVAIcon name="checkmark-circle-2" fill={colors.vert} />
                    ) : (
                      <span>
                        {Math.round((element.avancement || 0) * 100)} %
                      </span>
                    )}
                  </Col>
                </Row>
              </td>
              <td
                className={
                  "align-middle depuis " +
                  (element.nombreMots > 100 ? "alert" : "success")
                }
              >
                {Math.round(
                  (element.nombreMots || 0) * (element.avancement || 0)
                ) +
                  " / " +
                  element.nombreMots}
              </td>
              <td
                className={
                  "align-middle depuis " +
                  (joursDepuis > 3 ? "alert" : "success")
                }
              >
                {moment(element.created_at).fromNow(true)}
              </td>
              <td className="align-middle">
                {element.statusTrad ? element.statusTrad : ""}
              </td>
              <td className="align-middle">
                {element.isStructure ? "Site" : jsUcfirst(element.typeContenu)}
              </td>
              <td className="align-middle fit-content">
                {element.updatedAt
                  ? moment(element.updatedAt).format("YYYY/MM/DD H:mm")
                  : "Pas encore traduite"}
                {/* <FButton type="light-action" name="bookmark-outline" fill={colors.noir} onClick={e => {e.stopPropagation();this.upcoming();}}/> */}
              </td>
              <td className="align-middle fit-content elevated-button">
                {this.props.isAdmin ? (
                  <FButton
                    type="light-action"
                    name="trash-2"
                    fill={colors.noir}
                    onClick={(e) => {
                      e.stopPropagation();
                      Swal.fire({
                        title: "Êtes-vous sûr ?",
                        text: "La suppression des traductions est irréversible",
                        type: "question",
                        showCancelButton: true,
                        confirmButtonColor: colors.rouge,
                        cancelButtonColor: colors.vert,
                        confirmButtonText: "Oui, les supprimer",
                        cancelButtonText: "Annuler",
                      }).then((result) => {
                        if (result.value) {
                          API.delete_trads({
                            articleId: element._id,
                            langueCible: this.state.langue.i18nCode,
                          })
                            .then(() => {
                              Swal.fire({
                                title: "Yay...",
                                text: "Suppression effectuée",
                                type: "success",
                                timer: 1500,
                              });
                              window.location.reload();
                            })
                            .catch(() => {
                              Swal.fire({
                                title: "Oh non!",
                                text: "Something went wrong",
                                type: "error",
                                timer: 1500,
                              });
                              window.location.reload();
                            });
                        }
                      });
                    }}
                  />
                ) : null}
              </td>
            </tr>
          );
        });
      }
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
    };

    return (
      <div className="animated fadeIn avancement">
        <Row>
          <Col>
            <h2>
              <NavLink to="/backend/user-profile" className="my-breadcrumb">
                {"Mon profil"}
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
              fill={colors.noir}
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
            {"À traduire" +
              (!this.state.loader
                ? " (" + this.state.toTranslateCount + ")"
                : "")}
          </StyledStatus>
          {isExpert ? (
            <StyledStatus
              onClick={this.reorderOnTopReview}
              className={
                "status-pill bg-" +
                (this.state.review ? colorStatut("Supprimé") : "white")
              }
            >
              {"À revoir" +
                (!this.state.loader ? " (" + this.state.reviewCount + ")" : "")}
            </StyledStatus>
          ) : null}
          {isExpert ? (
            <StyledStatus
              onClick={this.reorderOnTopWaiting}
              className={
                "status-pill bg-" +
                (this.state.waiting ? colorStatut("Brouillon") : "white")
              }
            >
              {"À valider" +
                (!this.state.loader
                  ? " (" + this.state.waitingCount + ")"
                  : "")}
            </StyledStatus>
          ) : null}
          <StyledStatus
            onClick={this.reorderOnTopPubblish}
            className={
              "status-pill bg-" +
              (this.state.published ? colorStatut("Publié") : "white")
            }
          >
            {"Publiées" +
              (!this.state.loader
                ? " (" + this.state.publishedCount + ")"
                : "")}
          </StyledStatus>
          <StyledStatus
            onClick={() => this.reorderOnTopType("demarche")}
            className={
              "status-pill bg-" +
              (this.state.demarche ? "black text-white" : "white")
            }
          >
            {"Démarches" +
              (!this.state.loader ? " " + this.state.demarcheCount + ")" : "")}
          </StyledStatus>
          <StyledStatus
            onClick={() => this.reorderOnTopType("dispositif")}
            className={
              "status-pill bg-" +
              (this.state.dispositif ? "black text-white" : "white")
            }
          >
            {"Dispositifs" +
              (!this.state.loader
                ? " (" + this.state.dispositifCount + ")"
                : "")}
          </StyledStatus>
          <StyledStatus
            onClick={() => this.reorderOnTopType("string")}
            className={
              "status-pill bg-" +
              (this.state.string ? "black text-white" : "white")
            }
          >
            {"Interface" +
              (!this.state.loader ? " (" + this.state.stringCount + ")" : "")}
          </StyledStatus>
          <StyledInput
            type="text"
            name="search"
            id="avancement-search"
            placeholder="Rechercher un contenu"
            onChange={this.handleChange}
          />
        </Row>

        <div className="tableau">
          <Table
            responsive
            className={
              "avancement-user-table" +
              (this.state.loader ? " loader-table" : "")
            }
          >
            <thead>
              <tr>
                {this.state.headers.map((element, key) => {
                  return (
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
                          name={
                            "chevron-" + (element.croissant ? "up" : "down")
                          }
                          fill={colors.noir}
                          className="sort-btn"
                        />
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {this.state.loader ? (
                [...Array(10).keys()].map((_, key) => (
                  <tr
                    key={key}
                    style={{ backgroundColor: "#f4f4f4", lineHeight: "30px" }}
                  >
                    <StyledFirstCell>
                      <Skeleton />
                    </StyledFirstCell>
                    <StyledCell>
                      <Skeleton />
                    </StyledCell>
                    <StyledCell>
                      <Skeleton />
                    </StyledCell>
                    <StyledCell>
                      <Skeleton />
                    </StyledCell>
                    <StyledCell>
                      <Skeleton />
                    </StyledCell>
                    <StyledCell>
                      <Skeleton />
                    </StyledCell>
                    <StyledCell>
                      <Skeleton />
                    </StyledCell>
                    <StyledLastCell>
                      <Skeleton />
                    </StyledLastCell>
                  </tr>
                ))
              ) : (
                <AvancementData />
              )}
            </tbody>
          </Table>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    dispositifs: state.activeDispositifs,
    userId: state.user.userId,
    isAdmin: state.user.admin,
    isExpert: state.user.expertTrad,
  };
};

export default connect(mapStateToProps)(withTranslation()(Avancement));
