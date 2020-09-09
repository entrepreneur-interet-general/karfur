import React, { Component } from "react";

import { Card, CardBody, Row, Col, Tooltip, Button } from "reactstrap";
import h2p from "html2plaintext";

import EVAIcon from "../../../components/UI/EVAIcon/EVAIcon";

import "./QuickToolbar.scss";
// @ts-ignore : issue with ts and .scss files
import variables from "../Dispositif.scss"; //A changer
import { Props } from "./QuickToolbar.container";

interface StateType {
  fill: boolean[];
  tooltipOpen: boolean[];
  isDropdownOpen: boolean;
  dropdownColor: string[];
}

export interface PropsBeforeInjection {
  tracking: any;
  disableEdit: boolean;
  toggleModal: (arg1: boolean, arg2: string) => void;
  readAudio: (arg1: any, arg2: string, arg3: any, arg4: boolean) => void;
  item: any;
  subkey: number;
  handleContentClick: (arg1: any, arg2: boolean, arg3: number) => void;
  keyValue: any;
  show: boolean;
  removeItem: (arg1: number, arg2: number) => void;
  t: any;
  ttsActive: boolean;
}

export class QuickToolbar extends Component<Props, StateType> {
  state: StateType = {
    fill: new Array(4).fill(false),
    tooltipOpen: new Array(4).fill(false),
    isDropdownOpen: false,
    dropdownColor: new Array(4).fill("#FFFFFF"),
  };

  _hoverOn = (key: number) =>
    this.setState((prevState: StateType) => ({
      fill: prevState.fill.map((_, i) => key === i),
    }));
  _hoverOff = () =>
    this.setState((prevState: StateType) => ({
      fill: prevState.fill.map(() => false),
    }));
  toggleTooltip = (key: number) => {
    this.setState((prevState: StateType) => ({
      tooltipOpen: prevState.tooltipOpen.map((x, i) =>
        key === i ? !x : false
      ),
    }));
  };
  toggle = () => this.setState({ isDropdownOpen: !this.state.isDropdownOpen });
  toggleColor = (key: number, hover: string) =>
    this.setState((prevState: StateType) => ({
      dropdownColor: prevState.dropdownColor.map((x, i) =>
        i === key ? (hover ? "#3D3D3D" : "#FFFFFF") : "#FFFFFF"
      ),
    }));

  _onClick = (id: number) => {
    if (this.props.disableEdit) {
      if (id === 0) {
        this.props.toggleModal(true, "reaction");
      } else if (id === 1) {
        let node = this.props.item;
        if (
          this.props.subkey !== undefined &&
          this.props.subkey !== null &&
          this.props.subkey >= 0 &&
          node.children &&
          node.children.length > 0
        ) {
          node = this.props.item.children[this.props.subkey];
        }
        node &&
          node.title &&
          this.props.readAudio(
            h2p(node.title),
            "fr-fr",
            () => this.props.readAudio(h2p(node.content), "fr-fr", null, true),
            true
          );
      }
    } else {
      if (id === 0) {
        this.props.handleContentClick(
          this.props.keyValue,
          true,
          this.props.subkey
        );
      } else if (id === 2) {
        this.props.removeItem(this.props.keyValue, this.props.subkey);
      }
    }
  };

  render() {
    const { t, show, disableEdit } = this.props;

    if (show) {
      if (disableEdit) {
        return (
          <Card className="quick-toolbar">
            <CardBody>
              <Row className="first-row">
                <Col lg="6" md="6" sm="12" xs="12" className="col-btn">
                  <Button
                    className="btn-pill"
                    id="eva-icon-0"
                    onMouseEnter={() => this._hoverOn(0)}
                    onMouseLeave={this._hoverOff}
                    onClick={() => this._onClick(0)}
                  >
                    <EVAIcon
                      name={
                        "message-circle" +
                        (this.state.fill[0] ? "" : "-outline")
                      }
                      fill={variables.darkColor}
                      className="icon-toolbar"
                    />
                    <Tooltip
                      className="dark-back"
                      placement="top"
                      isOpen={this.state.tooltipOpen[0]}
                      target="eva-icon-0"
                      toggle={() => this.toggleTooltip(0)}
                    >
                      {t("Dispositif.réagir", "réagir")}
                    </Tooltip>
                  </Button>
                </Col>
                <Col lg="6" md="6" sm="12" xs="12" className="col-btn">
                  <Button
                    className="btn-pill"
                    id="eva-icon-1"
                    onMouseEnter={() => this._hoverOn(1)}
                    onMouseLeave={this._hoverOff}
                    onClick={() => this._onClick(1)}
                  >
                    <EVAIcon
                      name={
                        "volume-up" +
                        (this.state.fill[1] || this.props.ttsActive
                          ? ""
                          : "-outline")
                      }
                      fill={variables.darkColor}
                      className="icon-toolbar"
                    />
                    <Tooltip
                      className="dark-back"
                      placement="top"
                      isOpen={this.state.tooltipOpen[1]}
                      target="eva-icon-1"
                      toggle={() => this.toggleTooltip(1)}
                    >
                      {t("Dispositif.écouter", "écouter")}
                    </Tooltip>
                  </Button>
                </Col>
              </Row>
            </CardBody>
          </Card>
        );
      }
      return false;
    }
    return null;
  }
}
