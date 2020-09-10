import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import { Dropdown, DropdownToggle, DropdownMenu } from "reactstrap";
import ReactDependentScript from "react-dependent-script";
import Autocomplete from "react-google-autocomplete";

import FSearchBtn from "../../../components/FigmaUI/FSearchBtn/FSearchBtn";
import EVAIcon from "../../../components/UI/EVAIcon/EVAIcon";

import "./SearchItem.scss";
// import variables from 'scss/colors.scss';

export class SearchItem extends Component {
  constructor(props) {
    super(props);
    this.selectParam = this.onPlaceSelected.bind(this); //Placé ici pour être reconnu par les tests unitaires
  }
  state = {
    dropdownOpen: false,
    isMounted: false,
    ville: "",
    test: "",
  };

  componentDidMount() {
    this.setState({ isMounted: true });
  }

  onPlaceSelected(place) {
    console.log("place", place);
    this.setState({ ville: place.formatted_address });
    this.props.selectParam(this.props.keyValue, place);
  }

  toggle = () =>
    this.setState((prevState) => {
      return { dropdownOpen: !prevState.dropdownOpen };
    });
  handleChange = (e) => this.setState({ [e.currentTarget.id]: e.target.value });
  initializeVille = () => this.setState({ ville: "" });

  selectOption = (subi) => {
    this.props.selectParam(this.props.keyValue, subi);
    this.toggle();
  };

  render() {
    const { t, item, keyValue } = this.props;
    const { dropdownOpen, isMounted, ville } = this.state;
    console.log("ville", this.state.test);
    return (
      <div className="search-col">
        <span className="mr-10">
          {t("SearchItem." + item.title, item.title)}
        </span>
        {item.queryName === "localisation" ? (
          isMounted && (
            <ReactDependentScript
              loadingComponent={<div>Chargement de Google Maps...</div>}
              scripts={[
                "https://maps.googleapis.com/maps/api/js?key=" +
                  process.env.REACT_APP_GOOGLE_API_KEY +
                  "&v=3.exp&libraries=places&language=fr&region=FR",
              ]}
            >
              <div className="position-relative">
                <Autocomplete
                  className={
                    "search-btn in-header search-autocomplete " +
                    (item.active ? "active" : "")
                  }
                  placeholder={item.placeholder}
                  id="ville"
                  value={ville}
                  onChange={this.handleChange}
                  onPlaceSelected={(place) =>
                    this.setState({
                      ville: place.formatted_address,
                      test: place,
                    })
                  }
                  types={["(regions)"]}
                  componentRestrictions={{ country: "fr" }}
                />
                {item.active && (
                  <EVAIcon
                    name="close-circle"
                    size="xlarge"
                    className="close-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      this.props.desactiver(keyValue);
                      this.initializeVille();
                    }}
                  />
                )}
              </div>
            </ReactDependentScript>
          )
        ) : (
          <Dropdown
            isOpen={dropdownOpen}
            toggle={this.toggle}
            className="display-inline-block"
          >
            <DropdownToggle
              caret
              tag="div"
              data-toggle="dropdown"
              aria-expanded={dropdownOpen}
              className={
                "search-btn in-header " +
                (item.short && item.active
                  ? "bg-" + item.short.split(" ").join("-")
                  : "") +
                (!item.short && item.active ? "active" : "")
              }
            >
              {item.value
                ? t("Tags." + item.value, item.value)
                : t("Tags." + item.placeholder, item.placeholder)}
              {item.active && (
                <EVAIcon
                  name="close-circle"
                  size="xlarge"
                  className="close-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    this.props.desactiver(keyValue);
                  }}
                />
              )}
            </DropdownToggle>
            <DropdownMenu>
              <div
                className={
                  "options-wrapper" +
                  (item.queryName === "tags.name" ? " query-tags" : "")
                }
              >
                {item.children.map((subi, idx) => {
                  return (
                    <FSearchBtn
                      key={idx}
                      onClick={() => this.selectOption(subi)}
                      className={
                        "search-options color" + (subi.short ? "" : " filter")
                      }
                      color={(subi.short || "").replace(/ /g, "-")}
                    >
                      {t("Tags." + subi.name, subi.name)}
                    </FSearchBtn>
                  );
                })}
              </div>
            </DropdownMenu>
          </Dropdown>
        )}
        {item.title2 && (
          <span className="ml-10">
            {t("SearchItem." + item.title2, item.title2)}
          </span>
        )}
      </div>
    );
  }
}

export default withTranslation()(SearchItem);
