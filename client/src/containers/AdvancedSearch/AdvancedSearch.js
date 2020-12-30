import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import {
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Tooltip,
} from "reactstrap";
import Swal from "sweetalert2";
import querySearch from "stringquery";
import qs from "query-string";
import _ from "lodash";
import windowSize from "react-window-size";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import styled from "styled-components";
import produce from "immer";
import withSizes from "react-sizes";
// import Cookies from 'js-cookie';

import i18n from "../../i18n";
import Streamline from "../../assets/streamline";
import SearchItem from "./SearchItem/SearchItem";
import SearchResultCard from "./SearchResultCard";
import SeeMoreCard from "./SeeMoreCard";
import LoadingCard from "./LoadingCard";
import NoResultPlaceholder from "./NoResultPlaceholder";
import API from "../../utils/API";
import { initial_data } from "./data";
import EVAIcon from "../../components/UI/EVAIcon/EVAIcon";
import { filtres } from "../Dispositif/data";
import { filtres_contenu, tris } from "./data";
import FButton from "../../components/FigmaUI/FButton/FButton";
import TagButton from "../../components/FigmaUI/TagButton/TagButton";
import { BookmarkedModal } from "../../components/Modals/index";
import { fetchUserActionCreator } from "../../services/User/user.actions";

import "./AdvancedSearch.scss";
import { colors } from "colors";

const ThemeContainer = styled.div`
  width: 100%;
  background-color: ${(props) => props.color};
  padding: 24px 68px 48px 68px;
  align-items: center;
`;

const ThemeHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  padding: 48px 0px 48px 0px;
`;

const ThemeHeaderTitle = styled.p`
  font-style: normal;
  font-weight: 500;
  font-size: 32px;
  line-height: 40px;
  color: ${(props) => props.color};
`;

const ThemeListContainer = styled.div`
  display: grid;
  justify-content: start;
  align-content: start;
  grid-template-columns: ${(props) =>
    `repeat(${props.columns || 5}, minmax(260px, 300px))`};
  background-color: ${(props) => props.color};
`;

const SearchToggle = styled.div`
  width: 36px;
  height: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 18px;
  border: 0.5px solid;
  border-color: ${(props) => (props.visible ? "transparent" : "black")};
  background-color: ${(props) => (props.visible ? "#828282" : "white")};
  align-self: center;
  cursor: pointer;
  &:hover {
    filter: brightness(80%);
  }
`;

const FilterBar = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: #828282;
  box-shadow: 0px 4px 40px rgba(0, 0, 0, 0.25);
  position: fixed;
  border-radius: 6px 6px 12px 12px;
  padding: 13px 16px 0px;
  margin-left: 68px;
  margin-right: 68px;
  display: flex;
  z-index: 2;
  top: ${(props) =>
    props.visibleTop && props.visibleSearch
      ? "164px"
      : !props.visibleTop && props.visibleSearch
      ? "90px"
      : props.visibleTop && !props.visibleSearch
      ? "90px"
      : "16px"};
  transition: top 0.6s;
  height: 80px;
`;

const ThemeButton = styled.div`
  background-color: ${(props) => props.color};
  display: flex;
  flex-direction: row;
  padding: 12px;
  border-radius: 12px;
  justify-content: center;
  align-items: center;
  margin-right: 20px;
  margin-left: ${(props) => (props.ml ? `${props.ml}px` : "0px")};
`;
const ThemeText = styled.p`
  color: white;
  font-size: 18px;
  margin-left: 8px;
  margin-right: ${(props) => (props.mr ? `${props.mr}px` : "0px")};
  font-weight: 700;
`;

const ThemeTextAlone = styled.p`
  color: white;
  font-size: 18px;
  margin-left: 0px;
  margin-right: ${(props) => (props.mr ? `${props.mr}px` : "0px")};
  font-weight: 700;
`;

const LanguageText = styled.span`
  color: black;
  font-size: 16px;
  margin-right: 16px;
  margin-left: 8px;
  font-weight: 400;
`;

const LanguageTextFilter = styled.span`
  color: black;
  font-size: 16px;
  margin-right: 0px;
  margin-left: 8px;
  font-weight: 700;
`;

const FilterTitle = styled.p`
  size: 18px;
  font-weight: bold;
  color: white;
  margin-right: 10px;
`;

const ShowFullFrancePrimary = styled.div`
  padding: 8px;
  height: 52px;
  align-items: center;
  justify-content: center;
  align-self: center;
  display: flex;
  margin-top: 48px;
  margin-bottom: 48px;

  background: ${(props) => (props.active ? "white" : "transparent")};

  border: 2px solid #5e5e5e;
  box-sizing: border-box;
  border-radius: 12px;
  font-size: 16px;
  text-align: center;
  align-content: center;
  cursor: pointer;
  &:hover {
    background-color: white;
  }
`;

const ShowFullFranceSecondary = styled.div`
  padding: 8px;
  height: 52px;
  font-size: 16px;

  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  align-content: center;
  align-self: center;
  margin-top: 48px;
  margin-bottom: 48px;

  background: ${(props) => (props.active ? "white" : "transparent")};

  border: 2px solid #5e5e5e;
  box-sizing: border-box;
  border-radius: 12px;
  cursor: pointer;
  &:hover {
    background-color: white;
  }
`;

const ButtonContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

let user = { _id: null, cookies: {} };
export class AdvancedSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showSpinner: false,
      recherche: initial_data.map((x) => ({ ...x, active: false })),
      dispositifs: [],
      nbVues: [],
      pinned: [],
      activeFiltre: "",
      activeTri: "Par thème",
      data: [], //inutilisé, à remplacer par recherche quand les cookies sont stabilisés
      order: "created_at",
      croissant: true,
      filter: {},
      displayAll: true,
      dropdownOpenTri: false,
      dropdownOpenFiltre: false,
      showBookmarkModal: false,
      searchToggleVisible: true,
      visible: true,
      countTotal: 0,
      countShow: 0,
      themesObject: [],
      principalThemeList: [],
      secondaryThemeList: [],
      selectedTag: null,
      principalThemeListFullFrance: [],
      secondaryThemeListFullFrance: [],
      nonTranslated: [],
      filterLanguage: "",
      chargingArray: new Array(20).fill(),
      switch: false,
      showGeolocFullFrancePrincipal: false,
      showGeolocFullFranceSecondary: false,
      filterVille: "",
      dispositifsFullFrance: [],
      geoSearch: false,
    };

    this.setWrapperRef = this.setWrapperRef.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  setWrapperRef(node) {
    this.wrapperRef = node;
  }

  /**
   * Alert if clicked on outside of element
   */
  handleClickOutside(event) {
    if (
      this.wrapperRef &&
      !this.wrapperRef.contains(event.target) &&
      this.state.languageDropdown
    ) {
      if (this.state.filterLanguage === "") {
        this.setState({ filterLanguage: "", activeFiltre: "" });
      }
      this.setState({ languageDropdown: false });
    }
  }

  switchGeoSearch = (value) => {
    this.setState({geoSearch: value});
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    document.addEventListener("mousedown", this.handleClickOutside);
    window.addEventListener("scroll", this.handleScrolling);
    this._isMounted = true;
    this.retrieveCookies();
    let tag = querySearch(this.props.location.search).tag;
    let bottomValue = querySearch(this.props.location.search).bottomValue;
    let topValue = querySearch(this.props.location.search).topValue;
    let niveauFrancais = querySearch(this.props.location.search).niveauFrancais;
    let niveauFrancaisObj = this.state.recherche[3].children.find(
      (elem) => elem.name === decodeURIComponent(niveauFrancais)
    );
    let filter = querySearch(this.props.location.search).filter;
    if (tag || bottomValue || topValue || niveauFrancais) {
      this.setState(
        produce((draft) => {
          if (tag) {
            const tagValue = filtres.tags.find(
              (x) => x.name === decodeURIComponent(tag)
            );
            draft.selectedTag = tagValue;
            draft.recherche[0].query = decodeURIComponent(tag);
            draft.recherche[0].value = decodeURIComponent(tag);
            draft.recherche[0].active = true;
            draft.recherche[0].short =
              filtres.tags &&
              filtres.tags.find((x) => x.name === decodeURIComponent(tag))
                .short;
          }
          if (topValue && bottomValue) {
            draft.recherche[2].value = initial_data[2].children.find(
              (item) => item.topValue === parseInt(topValue, 10)
            ).name;
            draft.recherche[2].query = draft.recherche[2].value;
            draft.recherche[2].active = true;
          }
          if (niveauFrancais) {
            draft.recherche[3].name = decodeURIComponent(niveauFrancais);
            draft.recherche[3].value = decodeURIComponent(niveauFrancais);
            draft.recherche[3].query = niveauFrancaisObj.query;
            draft.recherche[3].active = true;
          }
          draft.activeTri = "";
        }),
        () =>
          this.queryDispositifs({
            "tags.name": tag ? decodeURIComponent(tag) : "",
            "audienceAge.bottomValue": topValue
              ? { $lt: parseInt(topValue, 10) }
              : "",
            "audienceAge.topValue": bottomValue
              ? { $gt: parseInt(bottomValue, 10) }
              : "",
            niveauFrancais: niveauFrancaisObj ? niveauFrancaisObj.query : "",
          })
      );
      //this.selectTag(decodeURIComponent(tag));
    } else if (filter) {
      this.filter_content(
        filter === "dispositif" ? filtres_contenu[0] : filtres_contenu[1]
      );
    } else {
      this.queryDispositifs();
    }
    this._initializeEvents();
    //window.scrollTo(0, 0);
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside);
    window.removeEventListener("scroll", this.handleScrolling);
    this._isMounted = false;
  }

  // eslint-disable-next-line react/no-deprecated
  componentDidUpdate(prevProps) {
    if (prevProps.languei18nCode !== this.props.languei18nCode) {
      this.setState(
        {
          filterLanguage: "",
          activeFiltre:
            this.state.activeFiltre === "traduction"
              ? ""
              : this.state.activeFiltre,
        },
        () => this.queryDispositifs(null, this.props)
      );
    }
  }

  handleScrolling = () => {
    const currentScrollPos = window.pageYOffset;
    //const visible = prevScrollpos > currentScrollPos;
    const visible = currentScrollPos < 70;

    this.setState({
      visible,
    });
  };

  queryDispositifs = (Nquery = null, props = this.props) => {
    this.setState({ showSpinner: true });
    if (Nquery) {
      Object.keys(Nquery).forEach((key) =>
        Nquery[key] === "" ? delete Nquery[key] : {}
      );
    }
    let query =
      Nquery ||
      this.state.recherche
        .filter((x) => x.active && x.queryName !== "localisation")
        .map((x) =>
          x.queryName === "audienceAge"
            ? {
                "audienceAge.bottomValue": { $lt: x.topValue },
                "audienceAge.topValue": { $gt: x.bottomValue },
              }
            : { [x.queryName]: x.query }
        )
        .reduce((acc, curr) => ({ ...acc, ...curr }), {});
    const localisationSearch = this.state.recherche.find(
      (x) => x.queryName === "localisation" && x.value
    );
    if (!Nquery) {
      let newQueryParam = {
        tag: query["tags.name"]
          ? decodeURIComponent(query["tags.name"])
          : undefined,
        bottomValue: query["audienceAge.bottomValue"]
          ? this.state.recherche[2].bottomValue
          : undefined,
        topValue: query["audienceAge.topValue"]
          ? this.state.recherche[2].topValue
          : undefined,
        niveauFrancais: query["niveauFrancais"]
          ? this.state.recherche[3].value
          : undefined,
      };

      Object.keys(newQueryParam).forEach((key) =>
        newQueryParam[key] === undefined ? delete newQueryParam[key] : {}
      );

      this.props.history.push({
        search: qs.stringify(newQueryParam),
      });
    }

    API.getDispositifs({
      query: {
        ...query,
        ...this.state.filter,
        status: "Actif",
        ...{ demarcheId: { $exists: false } },
      },
      locale: props.languei18nCode,
    })
      .then((data_res) => {
        let dispositifs = data_res.data.data;
        this.setState({ countTotal: dispositifs.length });

        if (query["tags.name"]) {
          //On réarrange les résultats pour avoir les dispositifs dont le tag est le principal en premier
          /*           dispositifs = dispositifs.sort(
            (a, b) =>
              a.tags.findIndex((x) =>
                x ? x.short === query["tags.name"] : 99
              ) -
              b.tags.findIndex((x) => (x ? x.short === query["tags.name"] : 99))
          ); */
          dispositifs = dispositifs.sort((a, b) =>
            _.get(a, "tags.0.name", {}) === this.state.recherche[0].query
              ? -1
              : _.get(b, "tags.0.name", {}) === this.state.recherche[0].query
              ? 1
              : 0
          );
        } else {
          dispositifs = dispositifs.sort((a, b) => a.created_at - b.created_at);
        }

        if (props.languei18nCode !== "fr" || this.state.filterLanguage !== "") {
          var nonTranslated = dispositifs.filter((dispo) => {
            if (
              typeof dispo.avancement === "object" &&
              dispo.avancement[
                props.languei18nCode !== "fr"
                  ? props.languei18nCode
                  : this.state.filterLanguage.i18nCode
              ]
            ) {
              return false;
            }
            return true;
          });
          this.setState({ nonTranslated });
          dispositifs = dispositifs.filter((dispo) => {
            if (
              typeof dispo.avancement === "object" &&
              dispo.avancement[
                props.languei18nCode !== "fr"
                  ? props.languei18nCode
                  : this.state.filterLanguage.i18nCode
              ]
            ) {
              return true;
            }
          });
        }
        let dispositifsFullFrance = [];
        if (
          localisationSearch &&
          localisationSearch.query[1] &&
          localisationSearch.query[1].long_name
        ) {
          var index;
          var i;
          var dispositifsFrance = [];
          var dispositifsVille = [];
          var dispositifsEmpty = [];
          this.setState({
            filterVille: localisationSearch.query[0].long_name || "",
          });
          for (index = 0; index < dispositifs.length; index++) {
            if (
              dispositifs[index].contenu[1] &&
              dispositifs[index].contenu[1].children &&
              dispositifs[index].contenu[1].children.length > 0
            ) {
              var geolocInfocard = dispositifs[index].contenu[1].children.find(
                (infocard) => infocard.title === "Zone d'action"
              );
              if (geolocInfocard && geolocInfocard.departments) {
                for (i = 0; i < geolocInfocard.departments.length; i++) {
                  if (geolocInfocard.departments[i] === "All") {
                    dispositifsFrance.push(dispositifs[index]);
                  } else if (
                    geolocInfocard.departments[i].split(" - ")[1] ===
                      localisationSearch.query[1].long_name ||
                    geolocInfocard.departments[i].split(" - ")[1] ===
                      localisationSearch.query[0].long_name
                  ) {
                    dispositifsVille.push(dispositifs[index]);
                  }
                }
              } else {
                dispositifsEmpty.push(dispositifs[index]);
              }
            } else {
              dispositifsEmpty.push(dispositifs[index]);
            }
          }
          dispositifsFullFrance = dispositifsFrance.concat(dispositifsEmpty);
          dispositifs = dispositifsVille;
          this.setState({dispositifsFullFrance});

          /*           dispositifs = dispositifs.filter((disp) => {
            if (
              disp.contenu[1] &&
              disp.contenu[1].children &&
              disp.contenu[1].children.length > 0
            ) {
              const geolocInfocard = disp.contenu[1].children.find(
                (infocard) => infocard.title === "Zone d'action"
              );
              if (geolocInfocard && geolocInfocard.departments) {
                for (i = 0; i < geolocInfocard.departments.length; i++) {
                  if (
                    geolocInfocard.departments[i] === "All" ||
                    geolocInfocard.departments[i].split(" - ")[1] ===
                      localisationSearch.query[1].long_name ||
                    geolocInfocard.departments[i].split(" - ")[1] ===
                      localisationSearch.query[0].long_name
                  ) {
                    return true;
                  } else if (i + 1 === geolocInfocard.departments.length) {
                    return false;
                  }
                }
              }
            }
            return true;
          }); */
          //On applique le filtre géographique maintenant
          /*           dispositifs = dispositifs.filter(
            
          );
          const filterDoubles = [
            ...new Set(dispositifs.map((x) => x.demarcheId || x._id)),
          ]; //Je vire les doublons créés par les variantes
          dispositifs = filterDoubles.map((x) =>
            dispositifs.find((y) => y.demarcheId === x || y._id === x)
          ); */
        }
        dispositifs = dispositifs.map((x) => ({
          ...x,
          nbVues: (this.state.nbVues.find((y) => y._id === x._id) || {}).count,
        })); //Je rajoute la donnée sur le nombre de vues par dispositif

        if (this.state.activeTri === "Par thème") {
          const themesObject = filtres.tags.map((tag) => {
            return {
              [tag.short]: dispositifs.filter((elem) => {
                if (elem.tags[0]) {
                  return elem.tags[0].short === tag.short;
                }
              }),
            };
          });
          this.setState({ themesObject: themesObject });
        }
        if (this.state.recherche[0] && this.state.recherche[0].value) {
          var principalThemeList = dispositifs.filter((elem) => {
            if (elem.tags && elem.tags[0]) {
              return elem.tags[0].short === this.state.recherche[0].short;
            }
          });

          var secondaryThemeList = dispositifs.filter((element) => {
            if (element.tags && element.tags.length > 0) {
              for (var index = 1; index < element.tags.length; index++) {
                if (
                  index !== 0 &&
                  element.tags[index] &&
                  element.tags[index].short === this.state.recherche[0].short
                )
                  return true;
              }
            }
          });

          this.setState({ principalThemeList, secondaryThemeList });
          if (
            localisationSearch &&
            localisationSearch.query[1] &&
            localisationSearch.query[1].long_name
          ) {
            var principalThemeListFullFrance = dispositifsFullFrance.filter(
              (elem) => {
                if (elem.tags && elem.tags[0]) {
                  return elem.tags[0].short === this.state.recherche[0].short;
                }
              }
            );
            var secondaryThemeListFullFrance = dispositifsFullFrance.filter(
              (element) => {
                if (element.tags && element.tags.length > 0) {
                  for (var index = 1; index < element.tags.length; index++) {
                    if (
                      index !== 0 &&
                      element.tags[index] &&
                      element.tags[index].short ===
                        this.state.recherche[0].short
                    )
                      return true;
                  }
                }
              }
            );
            this.setState({
              principalThemeListFullFrance,
              secondaryThemeListFullFrance,
            });
          }
        }
        this.setState({
          dispositifs: dispositifs,
          showSpinner: false,
          countShow: dispositifs.length,
        });
      })
      .catch(() => {
        this.setState({ showSpinner: false });
      });
  };

  selectTag = (tag = {}) => {
    const tagValue = filtres.tags.find((x) => x.short === tag) || {};
    this.setState((pS) => ({
      recherche: pS.recherche.map((x, i) =>
        i === 0
          ? {
              ...x,
              value: tagValue.name,
              short: tagValue.short,
              query: tagValue.name,
              active: true,
            }
          : x
      ),
      selectedTag: tagValue,
    }));
    this.queryDispositifs({ "tags.name": tagValue.name });
  };

  _initializeEvents = () => {
    API.aggregate_events([
      {
        $match: {
          action: "readDispositif",
          label: "dispositifId",
          value: { $ne: null },
        },
      },
      { $group: { _id: "$value", count: { $sum: 1 } } },
    ]).then((data_res) => {
      const countEvents = data_res.data.data;
      this.setState((pS) => ({
        nbVues: countEvents,
        dispositifs: pS.dispositifs.map((x) => ({
          ...x,
          nbVues: (countEvents.find((y) => y._id === x._id) || {}).count,
        })),
      }));
    });
  };

  retrieveCookies = () => {
    // Cookies.set('data', 'ici un test');
    // let dataC=Cookies.getJSON('data');
    // if(dataC){ this.setState({data:data.map((x,key)=> {return {...x, value:dataC[key] || x.value}})})}
    // let pinnedC=Cookies.getJSON('pinnedC');
    // if(pinnedC){ this.setState({pinned:pinnedC})}
    //data à changer en recherche après
    if (API.isAuth()) {
      API.get_user_info().then((data_res) => {
        let u = data_res.data.data;
        user = { _id: u._id, cookies: u.cookies || {} };
        this.setState({
          pinned: user.cookies.dispositifsPinned
            ? user.cookies.dispositifsPinned.map((x) => x._id)
            : [],
          dispositifs: [...this.state.dispositifs].filter(
            (x) =>
              !(user.cookies.parkourPinned || []).find(
                (y) => y._id === x._id || y === x._id
              )
          ),
          ...(user.cookies.parkourData &&
            user.cookies.parkourData.length > 0 && {
              data: this.state.data.map((x, key) => {
                return {
                  ...x,
                  value: user.cookies.parkourData[key] || x.value,
                  query: (
                    x.children.find(
                      (y) =>
                        y.name === (user.cookies.parkourData[key] || x.value)
                    ) || {}
                  ).query,
                };
              }),
            }),
        });
      });
    }
  };

  restart = () => {
    this.setState(
      { recherche: initial_data.map((x) => ({ ...x, active: false })),
      filterVille: "",
      geoSearch: false,
    },
      () => this.queryDispositifs()
    );
  };

  writeNew = () => {
    if (this.props.user) {
      this.props.history.push({
        pathname: "/comment-contribuer",
      });
    } else {
      this.props.history.push({
        pathname: "/login",
      });
    }
  };

  pin = (e, dispositif) => {
    e.preventDefault();
    e.stopPropagation();
    if (API.isAuth()) {
      dispositif.pinned = !dispositif.pinned;
      let prevState = [...this.state.dispositifs];
      const isDispositifPinned =
        this.state.pinned.includes(dispositif._id) ||
        this.state.pinned.filter(
          (pinnedDispostif) =>
            pinnedDispostif && pinnedDispostif._id === dispositif._id
        ).length > 0;
      this.setState(
        {
          pinned: dispositif.pinned
            ? [...this.state.pinned, dispositif]
            : this.state.pinned.filter((x) =>
                x && x._id ? x._id !== dispositif._id : x !== dispositif._id
              ),
          showBookmarkModal:
            !isDispositifPinned && !prevState.showBookmarkModal,
        },
        () => {
          user.cookies.parkourPinned = [
            ...new Set(this.state.pinned.map((x) => (x && x._id) || x)),
          ];
          user.cookies.dispositifsPinned = user.cookies.parkourPinned.map(
            (parkourId) => {
              if (
                user.cookies.dispositifsPinned &&
                user.cookies.dispositifsPinned.find(
                  (dispPinned) => parkourId === dispPinned._id
                )
              ) {
                return user.cookies.dispositifsPinned.find(
                  (dispPinned) => parkourId === dispPinned._id
                );
              }
              return { _id: parkourId, datePin: new Date() };
            }
          );
          API.set_user_info(user).then(() => {
            this.props.fetchUser();
          });
        }
      );
    } else {
      this.setState(() => ({
        showBookmarkModal: true,
      }));
    }
  };

  sortFunction = (dispositifs, order, croissant) => {
    return dispositifs.sort((a, b) => {
      var aValue = 0;
      var bValue = 0;
      if (order === "created_at") {
        aValue = _.get(a, "publishedAt", _.get(a, "created_at"));
        bValue = _.get(b, "publishedAt", _.get(b, "created_at"));
      } else {
        aValue = _.get(a, order);
        bValue = _.get(b, order);
      }
      return aValue > bValue
        ? croissant
          ? 1
          : -1
        : aValue < bValue
        ? croissant
          ? -1
          : 1
        : 0;
    });
  };

  reorder = (tri) => {
    if (tri.name === "Par thème") {
      this.setState(
        {
          activeTri: tri.name,
          recherche: this.state.recherche.map((x, i) =>
            i === 0 ? initial_data[i] : x
          ),
        },
        () => this.queryDispositifs()
      );
    } else {
      const order = tri.value,
        croissant = order === this.state.order ? !this.state.croissant : true;
      this.setState(
        (pS) => ({
          dispositifs: this.sortFunction(pS.dispositifs, order, croissant),
          principalThemeList: this.sortFunction(
            pS.principalThemeList,
            order,
            croissant
          ),
          secondaryThemeList: this.sortFunction(
            pS.secondaryThemeList,
            order,
            croissant
          ),
          order: tri.value,
          activeTri: tri.name,
          croissant: croissant,
        })
        //() => this.queryDispositifs()
      );
    }
  };

  filter_content = (filtre) => {
    const filter = this.state.activeFiltre === filtre.name ? {} : filtre.query;
    const activeFiltre =
      this.state.activeFiltre === filtre.name ? "" : filtre.name;
    this.setState(
      {
        filter,
        activeFiltre /* activeTri: this.state.activeTri === "Par thème" ? "" : this.state.activeTri */,
        languageDropdown: false,
        filterLanguage: "",
      },
      () => this.queryDispositifs()
    );
  };

  seeMore = (selectedTheme) => {
    this.selectParam(0, selectedTheme);
  };

  goToDispositif = (dispositif = {}) => {
    this.props.history.push(
      "/" +
        (dispositif.typeContenu || "dispositif") +
        (dispositif._id ? "/" + dispositif._id : "")
    );
  };

  upcoming = () =>
    Swal.fire({
      title: "Oh non!",
      text: "Cette fonctionnalité n'est pas encore activée",
      type: "error",
      timer: 1500,
    });

  selectParam = (key, subitem) => {
    let recherche = [...this.state.recherche];
    recherche[key] = {
      ...recherche[key],
      value: subitem.name || subitem.formatted_address,
      icon: subitem.icon,
      query:
        subitem.query ||
        subitem.address_components ||
        (key !== 3 ? subitem.name : undefined),
      active: true,
      ...(subitem.short && { short: subitem.short }),
      ...(subitem.bottomValue && { bottomValue: subitem.bottomValue }),
      ...(subitem.topValue && { topValue: subitem.topValue }),
    };
    this.setState(
      {
        recherche: recherche,
        selectedTag: key === 0 ? subitem : this.state.selectedTag,
        activeTri:
          this.state.activeTri === "Par thème" ? "" : this.state.activeTri,
      },
      () => this.queryDispositifs()
    );
  };

  desactiverTri = () => {
    this.setState({ activeTri: "" }, () => this.queryDispositifs());
  };

  desactiverFiltre = () => {
    this.setState(
      {
        activeFiltre: "",
        filter: {},
        languageDropdown: false,
        filterLanguage: "",
      },
      () => this.queryDispositifs()
    );
  };

  desactiver = (key) =>
    this.setState(
      {
        recherche: this.state.recherche.map((x, i) =>
          i === key ? initial_data[i] : x
        ),
      },
      () => this.queryDispositifs()
    );
  toggleDisplayAll = () =>
    this.setState((pS) => ({ displayAll: !pS.displayAll }));
  toggleDropdownTri = () =>
    this.setState((pS) => ({ dropdownOpenTri: !pS.dropdownOpenTri }));
  toggleDropdownFiltre = () =>
    this.setState((pS) => ({ dropdownOpenFiltre: !pS.dropdownOpenFiltre }));
  toggleBookmarkModal = () =>
    this.setState((prevState) => ({
      showBookmarkModal: !prevState.showBookmarkModal,
    }));
  toggleSearch = () => {
    this.setState({ searchToggleVisible: !this.state.searchToggleVisible });
  };

  openLDropdown = () => {
    this.setState({ activeFiltre: "traduction", languageDropdown: true });
  };

  selectLanguage = (language) => {
    this.setState({ filterLanguage: language, languageDropdown: false }, () =>
      this.queryDispositifs()
    );
  };

  render() {
    let {
      recherche,
      dispositifs,
      pinned,
      showSpinner,
      activeFiltre,
      activeTri,
      displayAll,
      selectedTag,
      filterLanguage,
    } = this.state;
    // eslint-disable-next-line
    const {
      t,
      isDesktop,
      isSmallDesktop,
      isTablet,
      isBigDesktop,
      languei18nCode,
    } = this.props;
    const isRTL = ["ar", "ps", "fa"].includes(i18n.language);
    const current =
      (this.props.langues || []).find(
        (x) => x.i18nCode === this.props.i18n.language
      ) || {};
    const langueCode =
      this.props.langues.length > 0 && current ? current.langueCode : "fr";
    /* 
    if (recherche[0].active) {
      dispositifs = dispositifs.sort((a, b) =>
        _.get(a, "tags.0.name", {}) === recherche[0].query
          ? -1
          : _.get(b, "tags.0.name", {}) === recherche[0].query
          ? 1
          : 0
      );
    } */

    return (
      <div className="animated fadeIn advanced-search">
        <div>
          <div
            className={
              "search-bar" + (this.state.visible ? "" : " search-bar-hidden")
            }
          >
            {recherche
              .filter((_, i) => displayAll || i === 0)
              .map((d, i) => (
                <SearchItem
                  isBigDesktop={isBigDesktop}
                  key={i}
                  item={d}
                  keyValue={i}
                  selectParam={this.selectParam}
                  desactiver={this.desactiver}
                  switchGeoSearch={this.switchGeoSearch}
                  geoSearch={this.state.geoSearch}
                
                />
              ))}
            <SearchToggle
              onClick={() => this.toggleSearch()}
              visible={this.state.searchToggleVisible}
            >
              {this.state.searchToggleVisible ? (
                <EVAIcon name="arrow-ios-upward-outline" fill={colors.blanc} />
              ) : (
                <EVAIcon name="arrow-ios-downward-outline" fill={colors.noir} />
              )}
            </SearchToggle>
            <ResponsiveFooter
              {...this.state}
              show={false}
              toggleDropdownTri={this.toggleDropdownTri}
              toggleDropdownFiltre={this.toggleDropdownFiltre}
              reorder={this.reorder}
              filter_content={this.filter_content}
              toggleDisplayAll={this.toggleDisplayAll}
              t={t}
            />
          </div>
          <FilterBar
            visibleTop={this.state.visible}
            visibleSearch={this.state.searchToggleVisible}
          >
            <FilterTitle>
              {t("AdvancedSearch.Filtrer par n", "Filtrer par")}
            </FilterTitle>
            {filtres_contenu.map((filtre, idx) => {
              return (
                <TagButton
                  active={filtre.name === activeFiltre}
                  desactiver={this.desactiverFiltre}
                  key={idx}
                  filter
                  onClick={() => this.filter_content(filtre)}
                >
                  {filtre.name &&
                    t("AdvancedSearch." + filtre.name, filtre.name)}
                </TagButton>
              );
            })}
            {languei18nCode === "fr" ? (
              <>
                <TagButton
                  active={"traduction" === activeFiltre}
                  desactiver={this.desactiverFiltre}
                  filter
                  id={"Tooltip-1"}
                  onClick={() => this.openLDropdown()}
                >
                  {filterLanguage === "" ? (
                    t("AdvancedSearch.Traduction")
                  ) : (
                    <>
                      <i
                        className={
                          "flag-icon ml-8 flag-icon-" +
                          filterLanguage.langueCode
                        }
                        title={filterLanguage.langueCode}
                        id={filterLanguage.langueCode}
                      />
                      <LanguageTextFilter>
                        {filterLanguage.langueFr || "Langue"}
                      </LanguageTextFilter>
                    </>
                  )}
                </TagButton>
                <Tooltip
                  placement={"bottom"}
                  isOpen={this.state.languageDropdown}
                  target={"Tooltip-1"}
                  className={"mt-15"}
                  style={{
                    backgroundColor: "white",
                    boxShadow: "0px 4px 40px rgba(0, 0, 0, 0.25)",
                    maxWidth: 2000,
                    flexDirection: "row",
                    display: "flex",
                    padding: "8px 0px 8px 8px",
                  }}

                  //popperClassName={"popper"}
                >
                  <div
                    style={{ display: "flex", flexDirection: "row" }}
                    ref={this.setWrapperRef}
                  >
                    {this.props.langues.map((elem) => {
                      if (elem.avancement > 0 && elem.langueCode !== "fr") {
                        return (
                          <div
                            className={"language-filter-button"}
                            onClick={() => this.selectLanguage(elem)}
                          >
                            <i
                              className={
                                "flag-icon ml-8 flag-icon-" + elem.langueCode
                              }
                              title={elem.langueCode}
                              id={elem.langueCode}
                            />
                            <LanguageText>
                              {elem.langueFr || "Langue"}
                            </LanguageText>
                          </div>
                        );
                      }
                    })}
                  </div>
                </Tooltip>{" "}
              </>
            ) : null}
            <FilterTitle>
              {t("AdvancedSearch.Trier par n", "Trier par")}
            </FilterTitle>
            {tris.map((tri, idx) => (
              <TagButton
                active={tri.name === activeTri}
                desactiver={this.desactiverTri}
                key={idx}
                filter
                onClick={() => this.reorder(tri)}
              >
                {t("AdvancedSearch." + tri.name, tri.name)}
              </TagButton>
            ))}
            <FilterTitle>
              {" "}
              {this.state.countShow +
                "/" +
                this.props.dispositifs.filter((elem) => !elem.demarcheId)
                  .length +
                " " +
                t("AdvancedSearch.résultats", "résultats")}
            </FilterTitle>
            <FButton
              className={isRTL ? "ml-10" : ""}
              type="white-yellow-hover"
              name="file-add-outline"
              onClick={this.writeNew}
              filter
            >
              {t("AdvancedSearch.Rédiger", "Rédiger")}
            </FButton>
          </FilterBar>
        </div>
        {!this.state.showSpinner ? (
          <div
            className={
              "search-wrapper " +
              (this.state.searchToggleVisible ? "mt-250" : "mt-250-hidden")
            }
            style={{
              backgroundColor:
                this.state.activeTri === "Par thème"
                  ? "#f1e8f5"
                  : this.state.recherche[0] && this.state.recherche[0].value
                  ? filtres.tags.find(
                      (elem) => elem.short === this.state.recherche[0].short
                    )["lightColor"]
                  : "#e4e5e6",
            }}
          >
            {this.state.activeTri === "Par thème" ? (
              <div style={{ width: "100%" }}>
                {this.state.themesObject.map((theme, index) => {
                  var themeKey = Object.keys(theme);
                  var selectedTheme = filtres.tags.find(
                    (elem) => elem.short === themeKey[0]
                  );
                  return (
                    <ThemeContainer
                      key={index}
                      color={selectedTheme.lightColor}
                    >
                      <ThemeHeader>
                        <ThemeButton
                          ml={isRTL ? 20 : 0}
                          color={selectedTheme.darkColor}
                        >
                          <Streamline
                            name={selectedTheme.icon}
                            stroke={"white"}
                            width={22}
                            height={22}
                          />
                          <ThemeText mr={isRTL ? 8 : 0}>
                            {t(
                              "Tags." + selectedTheme.short,
                              selectedTheme.short
                            )}
                          </ThemeText>
                        </ThemeButton>
                        <ThemeHeaderTitle color={selectedTheme.darkColor}>
                          {t(
                            "Tags." + selectedTheme.name,
                            selectedTheme.name
                          )[0].toUpperCase() +
                            t(
                              "Tags." + selectedTheme.name,
                              selectedTheme.name
                            ).slice(1)}
                        </ThemeHeaderTitle>
                      </ThemeHeader>
                      <ThemeListContainer
                        columns={
                          isDesktop || isBigDesktop
                            ? 5
                            : isSmallDesktop
                            ? 4
                            : isTablet
                            ? 3
                            : 2
                        }
                      >
                        {theme[themeKey]
                          .filter((_, indexCard) => indexCard < 4)
                          .map((cardFiltered, indexCardFiltered) => {
                            return (
                              <SearchResultCard
                                key={indexCardFiltered}
                                pin={this.pin}
                                pinnedList={this.state.pinned}
                                dispositif={cardFiltered}
                                showPinned={true}
                              />
                            );
                          })}
                        <SeeMoreCard
                          seeMore={() => this.seeMore(selectedTheme)}
                          theme={selectedTheme}
                          isRTL={isRTL}
                        />
                      </ThemeListContainer>
                    </ThemeContainer>
                  );
                })}
              </div>
            ) : this.state.activeTri !== "Par thème" &&
              this.state.recherche[0] &&
              this.state.recherche[0].value ? (
              <ThemeContainer>
                <ThemeHeader>
                  <ThemeHeaderTitle color={"#828282"}>
                    {langueCode !== "fr" || filterLanguage !== "" ? (
                      <>
                        {t("AdvancedSearch.Résultats disponibles en") + " "}
                        <i
                          className={
                            "flag-icon flag-icon-" +
                            (filterLanguage !== ""
                              ? filterLanguage.langueCode
                              : langueCode)
                          }
                          title={
                            filterLanguage !== ""
                              ? filterLanguage.langueCode
                              : langueCode
                          }
                          id={
                            filterLanguage !== ""
                              ? filterLanguage.langueCode
                              : langueCode
                          }
                        />
                        <span
                          className={
                            "language-name " + (isRTL ? "mr-10" : "ml-10")
                          }
                        >
                          {(filterLanguage !== ""
                            ? filterLanguage.langueFr
                            : current.langueFr) || "Langue"}
                        </span>
                        {" " + t("AdvancedSearch.avec le thème")}
                      </>
                    ) : (
                      t(
                        "AdvancedSearch.fiches avec le thème"
                      )[0].toUpperCase() +
                      t("AdvancedSearch.fiches avec le thème").slice(1)
                    )}
                  </ThemeHeaderTitle>
                  <ThemeButton
                    ml={8}
                    color={selectedTag ? selectedTag.darkColor : null}
                  >
                    <Streamline
                      name={selectedTag ? selectedTag.icon : null}
                      stroke={"white"}
                      width={22}
                      height={22}
                    />
                    <ThemeText mr={isRTL ? 8 : 0}>
                      {selectedTag
                        ? t("Tags." + selectedTag.short, selectedTag.short)
                        : null}
                    </ThemeText>
                  </ThemeButton>
                  {this.state.filterVille ? (
                    <ThemeHeaderTitle color={"#828282"}>
                      {" disponibles à "}
                    </ThemeHeaderTitle>
                  ) : null}
                  {this.state.filterVille ? (
                    <ThemeButton ml={8} color={"#0421b1"}>
                      <ThemeTextAlone mr={0}>
                        {this.state.filterVille}
                      </ThemeTextAlone>
                    </ThemeButton>
                  ) : null}
                </ThemeHeader>
                <ThemeListContainer
                  columns={
                    isDesktop || isBigDesktop
                      ? 5
                      : isSmallDesktop
                      ? 4
                      : isTablet
                      ? 3
                      : 2
                  }
                >
                  {this.state.principalThemeList.length > 0 ? (
                    this.state.principalThemeList.map((dispositif, index) => {
                      return (
                        <SearchResultCard
                          key={index}
                          pin={this.pin}
                          pinnedList={this.state.pinned}
                          dispositif={dispositif}
                          showPinned={true}
                        />
                      );
                    })
                  ) : (
                    <NoResultPlaceholder
                      restart={this.restart}
                      writeNew={this.writeNew}
                    />
                  )}
                </ThemeListContainer>
                <ButtonContainer>
                  {this.state.filterVille &&
                  !this.state.showGeolocFullFrancePrincipal ? (
                    <ShowFullFrancePrimary
                      onClick={() =>
                        this.setState({ showGeolocFullFrancePrincipal: true })
                      }
                    >
                      {t("AdvancedSearch.Afficher aussi les résultats disponibles dans")}
                      <b>{t("AdvancedSearch.toute la France")}</b>
                    </ShowFullFrancePrimary>
                  ) : this.state.filterVille &&
                    this.state.showGeolocFullFrancePrincipal ? (
                    <ShowFullFrancePrimary
                      active
                      onClick={() =>
                        this.setState({ showGeolocFullFrancePrincipal: false })
                      }
                    >
                     {t("AdvancedSearch.Masquer les résultats disponibles dans")}
                      <b>{t("AdvancedSearch.toute la France")}</b>
                    </ShowFullFrancePrimary>
                  ) : null}
                </ButtonContainer>
                {this.state.filterVille &&
                this.state.showGeolocFullFrancePrincipal ? (
                  <ThemeListContainer
                    columns={
                      isDesktop || isBigDesktop
                        ? 5
                        : isSmallDesktop
                        ? 4
                        : isTablet
                        ? 3
                        : 2
                    }
                  >
                    {this.state.principalThemeListFullFrance.length > 0 ? (
                      this.state.principalThemeListFullFrance.map(
                        (dispositif, index) => {
                          return (
                            <SearchResultCard
                              key={index}
                              pin={this.pin}
                              pinnedList={this.state.pinned}
                              dispositif={dispositif}
                              showPinned={true}
                            />
                          );
                        }
                      )
                    ) : (
                      <NoResultPlaceholder
                        restart={this.restart}
                        writeNew={this.writeNew}
                      />
                    )}
                  </ThemeListContainer>
                ) : null}
                <ThemeHeader>
                  <ThemeHeaderTitle color={"#828282"}>
                    {langueCode !== "fr" || filterLanguage !== "" ? (
                      <>
                        {t("AdvancedSearch.Autres fiches traduites en") + " "}
                        <i
                          className={
                            "flag-icon flag-icon-" +
                            (filterLanguage !== ""
                              ? filterLanguage.langueCode
                              : langueCode)
                          }
                          title={
                            filterLanguage !== ""
                              ? filterLanguage.langueCode
                              : langueCode
                          }
                          id={
                            filterLanguage !== ""
                              ? filterLanguage.langueCode
                              : langueCode
                          }
                        />
                        <span
                          className={
                            "language-name " + (isRTL ? "mr-10" : "ml-10")
                          }
                        >
                          {(filterLanguage !== ""
                            ? filterLanguage.langueFr
                            : current.langueFr) || "Langue"}
                        </span>
                        {" " + t("AdvancedSearch.avec le thème")}
                      </>
                    ) : (
                      t(
                        "AdvancedSearch.autres fiches avec le thème"
                      )[0].toUpperCase() +
                      t("AdvancedSearch.autres fiches avec le thème").slice(1)
                    )}
                  </ThemeHeaderTitle>
                  <ThemeButton
                    ml={8}
                    color={selectedTag ? selectedTag.darkColor : null}
                  >
                    <Streamline
                      name={selectedTag ? selectedTag.icon : null}
                      stroke={"white"}
                      width={22}
                      height={22}
                    />
                    <ThemeText mr={isRTL ? 8 : 0}>
                      {selectedTag
                        ? t("Tags." + selectedTag.short, selectedTag.short)
                        : null}
                    </ThemeText>
                  </ThemeButton>
                  {this.state.filterVille ? (
                    <ThemeHeaderTitle color={"#828282"}>
                      {" disponibles à "}
                    </ThemeHeaderTitle>
                  ) : null}
                  {this.state.filterVille ? (
                    <ThemeButton ml={8} color={"#0421b1"}>
                      <ThemeTextAlone mr={0}>
                        {this.state.filterVille}
                      </ThemeTextAlone>
                    </ThemeButton>
                  ) : null}
                </ThemeHeader>
                <ThemeListContainer
                  columns={
                    isDesktop || isBigDesktop
                      ? 5
                      : isSmallDesktop
                      ? 4
                      : isTablet
                      ? 3
                      : 2
                  }
                >
                  {this.state.secondaryThemeList.length > 0 ? (
                    this.state.secondaryThemeList.map((dispositif, index) => {
                      return (
                        <SearchResultCard
                          key={index}
                          pin={this.pin}
                          pinnedList={this.state.pinned}
                          dispositif={dispositif}
                          showPinned={true}
                        />
                      );
                    })
                  ) : (
                    <NoResultPlaceholder
                      restart={this.restart}
                      writeNew={this.writeNew}
                    />
                  )}
                </ThemeListContainer>
                <ButtonContainer>
                  {this.state.filterVille &&
                  !this.state.showGeolocFullFranceSecondary ? (
                    <ShowFullFranceSecondary
                      onClick={() =>
                        this.setState({ showGeolocFullFranceSecondary: true })
                      }
                    >
                      {t("AdvancedSearch.Afficher aussi les autres fiches disponibles dans")}
                      <b>{t("AdvancedSearch.toute la France")}</b>
                    </ShowFullFranceSecondary>
                  ) : this.state.filterVille &&
                    this.state.showGeolocFullFranceSecondary ? (
                    <ShowFullFranceSecondary
                      active
                      onClick={() =>
                        this.setState({ showGeolocFullFranceSecondary: false })
                      }
                    >
                      {t("AdvancedSearch.Masquer les autres fiches disponibles dans")}
                      <b>{t("AdvancedSearch.toute la France")}</b>
                    </ShowFullFranceSecondary>
                  ) : null}
                </ButtonContainer>
                {this.state.filterVille &&
                this.state.showGeolocFullFranceSecondary ? (
                  <ThemeListContainer
                    columns={
                      isDesktop || isBigDesktop
                        ? 5
                        : isSmallDesktop
                        ? 4
                        : isTablet
                        ? 3
                        : 2
                    }
                  >
                    {this.state.secondaryThemeListFullFrance.length > 0 ? (
                      this.state.secondaryThemeListFullFrance.map(
                        (dispositif, index) => {
                          return (
                            <SearchResultCard
                              key={index}
                              pin={this.pin}
                              pinnedList={this.state.pinned}
                              dispositif={dispositif}
                              showPinned={true}
                            />
                          );
                        }
                      )
                    ) : (
                      <NoResultPlaceholder
                        restart={this.restart}
                        writeNew={this.writeNew}
                      />
                    )}
                  </ThemeListContainer>
                ) : null}
              </ThemeContainer>
            ) : this.state.filterVille ? (
                <ThemeContainer>
                  <ThemeHeader>
                    <ThemeHeaderTitle color={"#828282"}>
                      {"Fiches disponibles à "}
                    </ThemeHeaderTitle>
                    <ThemeButton ml={8} color={"#0421b1"}>
                      <ThemeTextAlone mr={0}>
                        {this.state.filterVille}
                      </ThemeTextAlone>
                    </ThemeButton>
                  </ThemeHeader>
                  <ThemeListContainer
                    columns={
                      isDesktop || isBigDesktop
                        ? 5
                        : isSmallDesktop
                        ? 4
                        : isTablet
                        ? 3
                        : 2
                    }
                  >
                   {dispositifs.length > 0 ? dispositifs.map((dispositif, index) => {
                        return (
                          <SearchResultCard
                            key={index}
                            pin={this.pin}
                            pinnedList={this.state.pinned}
                            dispositif={dispositif}
                            showPinned={true}
                          />
                        );
                      }):
                      (
                        <NoResultPlaceholder
                          restart={this.restart}
                          writeNew={this.writeNew}
                        />
                      )  
                      }
                  </ThemeListContainer>
                  <ThemeHeader>
                    <ThemeHeaderTitle color={"#828282"}>
                      {"Fiches disponibles partout en France"}
                    </ThemeHeaderTitle>
                  </ThemeHeader>
                  <ThemeListContainer
                    columns={
                      isDesktop || isBigDesktop
                        ? 5
                        : isSmallDesktop
                        ? 4
                        : isTablet
                        ? 3
                        : 2
                    }
                  >
                   {this.state.dispositifsFullFrance.length > 0 ? this.state.dispositifsFullFrance.map((dispositif, index) => {
                        return (
                          <SearchResultCard
                            key={index}
                            pin={this.pin}
                            pinnedList={this.state.pinned}
                            dispositif={dispositif}
                            showPinned={true}
                          />
                        );
                      }) :
                      (
                        <NoResultPlaceholder
                          restart={this.restart}
                          writeNew={this.writeNew}
                        />
                      ) 
                      }
                  </ThemeListContainer>
                </ThemeContainer>
            ) : (
              <ThemeContainer>
                {langueCode !== "fr" || filterLanguage !== "" ? (
                  <>
                    <ThemeHeader>
                      <ThemeHeaderTitle color={"#828282"}>
                        <>
                          {t("AdvancedSearch.Résultats disponibles en") + " "}
                          <i
                            className={
                              "flag-icon flag-icon-" +
                              (filterLanguage !== ""
                                ? filterLanguage.langueCode
                                : langueCode)
                            }
                            title={
                              filterLanguage !== ""
                                ? filterLanguage.langueCode
                                : langueCode
                            }
                            id={
                              filterLanguage !== ""
                                ? filterLanguage.langueCode
                                : langueCode
                            }
                          />
                          <span
                            className={
                              "language-name " + (isRTL ? "mr-10" : "ml-10")
                            }
                          >
                            {(filterLanguage !== ""
                              ? filterLanguage.langueFr
                              : current.langueFr) || "Langue"}
                          </span>
                        </>
                      </ThemeHeaderTitle>
                    </ThemeHeader>
                    <ThemeListContainer
                      columns={
                        isDesktop || isBigDesktop
                          ? 5
                          : isSmallDesktop
                          ? 4
                          : isTablet
                          ? 3
                          : 2
                      }
                    >
                      {this.state.dispositifs.length > 0 ? (
                        this.state.dispositifs.map((dispositif, index) => {
                          return (
                            <SearchResultCard
                              key={index}
                              pin={this.pin}
                              pinnedList={this.state.pinned}
                              dispositif={dispositif}
                              showPinned={true}
                            />
                          );
                        })
                      ) : (
                        <NoResultPlaceholder
                          restart={this.restart}
                          writeNew={this.writeNew}
                        />
                      )}
                    </ThemeListContainer>
                    <ThemeHeader>
                      <ThemeHeaderTitle color={"#828282"}>
                        <>
                          {t("AdvancedSearch.Résultats non disponibles en") +
                            " "}
                          <i
                            className={
                              "flag-icon flag-icon-" +
                              (filterLanguage !== ""
                                ? filterLanguage.langueCode
                                : langueCode)
                            }
                            title={
                              filterLanguage !== ""
                                ? filterLanguage.langueCode
                                : langueCode
                            }
                            id={
                              filterLanguage !== ""
                                ? filterLanguage.langueCode
                                : langueCode
                            }
                          />
                          <span
                            className={
                              "language-name " + (isRTL ? "mr-10" : "ml-10")
                            }
                          >
                            {(filterLanguage !== ""
                              ? filterLanguage.langueFr
                              : current.langueFr) || "Langue"}
                          </span>
                        </>
                      </ThemeHeaderTitle>
                    </ThemeHeader>
                    <ThemeListContainer
                      columns={
                        isDesktop || isBigDesktop
                          ? 5
                          : isSmallDesktop
                          ? 4
                          : isTablet
                          ? 3
                          : 2
                      }
                    >
                      {this.state.nonTranslated.length > 0 ? (
                        this.state.nonTranslated.map((dispositif, index) => {
                          return (
                            <SearchResultCard
                              key={index}
                              pin={this.pin}
                              pinnedList={this.state.pinned}
                              dispositif={dispositif}
                              showPinned={true}
                            />
                          );
                        })
                      ) : (
                        <NoResultPlaceholder
                          restart={this.restart}
                          writeNew={this.writeNew}
                        />
                      )}
                    </ThemeListContainer>
                  </>
                ) : (
                  <>
                    <ThemeHeader />
                    <ThemeListContainer
                      columns={
                        isDesktop || isBigDesktop
                          ? 5
                          : isSmallDesktop
                          ? 4
                          : isTablet
                          ? 3
                          : 2
                      }
                    >
                      {dispositifs.map((dispositif, index) => {
                        return (
                          <SearchResultCard
                            key={index}
                            pin={this.pin}
                            pinnedList={this.state.pinned}
                            dispositif={dispositif}
                            showPinned={true}
                          />
                        );
                      })}
                      {!showSpinner &&
                        [...pinned, ...dispositifs].length === 0 && (
                          /*             <Col
                    xs="12"
                    sm="6"
                    md="3"
                    className="no-result"
                    onClick={() => this.selectTag()}
                  > */
                          <NoResultPlaceholder
                            restart={this.restart}
                            writeNew={this.writeNew}
                          />
                          //  </Col>
                        )}
                    </ThemeListContainer>
                  </>
                )}
              </ThemeContainer>
            )}
          </div>
        ) : (
          <div
            className={
              "search-wrapper " +
              (this.state.searchToggleVisible ? "mt-250" : "mt-250-hidden")
            }
            /*           style={{
            backgroundColor:
              this.state.activeTri === "Par thème"
                ? "#f1e8f5"
                : this.state.recherche[0] && this.state.recherche[0].value
                ?  (filtres.tags.find(
                  (elem) => elem.short === this.state.recherche[0].short
                ))["lightColor"]
                : "#e4e5e6",
          }} */
          >
            <ThemeContainer>
              <ThemeHeader />
              <ThemeListContainer
                columns={
                  isDesktop || isBigDesktop
                    ? 5
                    : isSmallDesktop
                    ? 4
                    : isTablet
                    ? 3
                    : 2
                }
              >
                {this.state.chargingArray.map((_, index) => {
                  return <LoadingCard key={index} />;
                })}
              </ThemeListContainer>
            </ThemeContainer>
          </div>
        )}
        <BookmarkedModal
          t={this.props.t}
          success={this.props.user ? true : false}
          show={this.state.showBookmarkModal}
          toggle={this.toggleBookmarkModal}
        />
      </div>
    );
  }
}

export const ResponsiveFooter = (props) => {
  const { activeFiltre, activeTri, displayAll, t, show } = props;
  return (
    show && (
      <div className="responsive-footer">
        <ButtonDropdown
          className={"options-dropdown" + (activeTri ? " active" : "")}
          isOpen={props.dropdownOpenTri}
          toggle={props.toggleDropdownTri}
        >
          <DropdownToggle color="transparent">
            <EVAIcon name="options-2-outline" />
          </DropdownToggle>
          <DropdownMenu>
            {tris.map((tri, idx) => (
              <DropdownItem
                key={idx}
                onClick={() => props.reorder(tri)}
                className={
                  "side-option" + (tri.name === activeTri ? " active" : "")
                }
              >
                {t("AdvancedSearch." + tri.name, tri.name)}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </ButtonDropdown>
        <ButtonDropdown
          className={"options-dropdown" + (activeFiltre ? " active" : "")}
          isOpen={props.dropdownOpenFiltre}
          toggle={props.toggleDropdownFiltre}
        >
          <DropdownToggle
            color="transparent"
            className={activeFiltre ? "active" : ""}
          >
            <EVAIcon name="funnel-outline" />
          </DropdownToggle>
          <DropdownMenu>
            {filtres_contenu.map((filtre, idx) => (
              <DropdownItem
                key={idx}
                onClick={() => props.filter_content(filtre)}
                className={
                  "side-option" +
                  (filtre.name === activeFiltre ? " active" : "")
                }
              >
                {filtre.name && t("AdvancedSearch." + filtre.name, filtre.name)}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </ButtonDropdown>
        <EVAIcon
          name={"arrow-circle-" + (displayAll ? "up" : "down")}
          size="xlarge"
          onClick={props.toggleDisplayAll}
          className="close-arrow"
          fill={colors.grisFonce}
        />
      </div>
    )
  );
};

const mapStateToProps = (state) => {
  return {
    dispositifs: state.activeDispositifs,
    languei18nCode: state.langue.languei18nCode,
    user: state.user.user,
    langues: state.langue.langues,
  };
};

const mapDispatchToProps = {
  fetchUser: fetchUserActionCreator,
};

const mapSizesToProps = ({ width }) => ({
  isMobile: width < 850,
  isTablet: width >= 850 && width < 1100,
  isSmallDesktop: width >= 1100 && width < 1400,
  isDesktop: width >= 1400 && width < 1565,
  isBigDesktop: width >= 1565,
});

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(withSizes(mapSizesToProps)(withTranslation()(windowSize(AdvancedSearch))))
);
