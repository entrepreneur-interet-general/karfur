import React, { Component } from "react";
import {
  Row,
  Col,
  Collapse,
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  Input,
  DropdownItem,
  Form,
  Label,
  FormGroup,
  Tooltip,
} from "reactstrap";
import ContentEditable from "react-contenteditable";
import _ from "lodash";
import { withTranslation } from "react-i18next";

import FButton from "../../../components/FigmaUI/FButton/FButton";
import EVAIcon from "../../../components/UI/EVAIcon/EVAIcon";
import { QuickToolbar } from "../QuickToolbar";
import EditableParagraph from "../../../components/Frontend/Dispositif/EditableParagraph/EditableParagraph";
import FInput from "../../../components/FigmaUI/FInput/FInput";

import "./EtapeParagraphe.scss";
import variables from "scss/colors.scss";
import { EtapeModal } from "../../../components/Modals";

class EtapeParagraphe extends Component {
  state = {
    options: this.props.demarcheSteps.options.map((x) => ({
      ...x,
      selected: false,
    })),
    isDropdownOpen: new Array(2).fill(false),
    isPapiersDropdownOpen: [false],
    validatedRow: new Array(4).fill(false),
    checked: false,
    value1: "",
    value2: "",
    value3: "",
    value4: "",
    isOptionSelected: false,
    selectedOption: {},
    configurationOpen: false,
    tooltipOpen: new Array(4).fill(false),
    showModal: false,
  };

  // eslint-disable-next-line react/no-deprecated
  componentWillReceiveProps(nextProps) {
    const { isOptionSelected } = this.state;
    if (
      !isOptionSelected &&
      ((_.get(nextProps, "subitem.option.value1") &&
        _.get(nextProps, "subitem.option.value1") !== this.state.value1) ||
        (_.get(nextProps, "subitem.option.value2") &&
          _.get(nextProps, "subitem.option.value2") !== this.state.value2) ||
        (_.get(nextProps, "subitem.option.checked") !== undefined &&
          _.get(nextProps, "subitem.option.checked") !== this.state.checked))
    ) {
      const {
        checked,
        value1,
        value2,
        value3,
        value4,
        texte,
      } = nextProps.subitem.option;
      const subItemPapiers = (nextProps.subitem || {}).papiers || [];
      const isPapiersDropdownOpen =
        subItemPapiers.length > 0
          ? new Array(subItemPapiers.length).fill(false)
          : [false];
      this.setState((pS) => ({
        checked,
        value1,
        value2,
        value3,
        value4,
        texte,
        isPapiersDropdownOpen,
        isOptionSelected: true,
        selectedOption: nextProps.subitem.option,
        options: pS.options.map((x) => ({ ...x, selected: x.texte === texte })),
      }));
    }
    if (_.get(nextProps, "subitem.papiers", []).length > 0) {
      this.setState({
        isPapiersDropdownOpen: new Array(
          _.get(nextProps, "subitem.papiers", []).length + 1
        ).fill(false),
      });
    }
  }

  editCard = () => this.toggleModal(true, "pieces");

  toggleDropdown = (idx) =>
    this.setState((pS) => ({
      isDropdownOpen: pS.isDropdownOpen.map((x, i) => (i === idx ? !x : x)),
    }));
  togglePapiersDropdown = (idx) =>
    this.setState((pS) => ({
      isPapiersDropdownOpen: pS.isPapiersDropdownOpen.map((x, i) =>
        i === idx ? !x : x
      ),
    }));

  handleCheck = () =>
    this.setState((pS) => ({
      checked: !pS.checked,
      ...(!pS.checked && { value1: "" }),
    }));
  toggleConfigurationOpen = () =>
    this.setState((pS) => ({ configurationOpen: !pS.configurationOpen }));
  handleChange = (e, target) => this.setState({ [target]: e.target.value });
  selectOption = (idx = null, option = {}) =>
    this.setState((pS) => ({
      isOptionSelected: idx !== null,
      selectedOption: option,
      options: pS.options.map((x, i) => ({ ...x, selected: i === idx })),
      value1: "",
      value2: "",
      value3: "",
      value4: "",
      checked: false,
    }));
  toggleTooltip = (idx) =>
    this.setState((pS) => ({
      tooltipOpen: pS.tooltipOpen.map((x, i) => (i === idx ? !x : x)),
    }));
  toggleModal = () => this.setState((pS) => ({ showModal: !pS.showModal }));

  validateOption = (e) => {
    e.preventDefault();
    this.setState((pS) => ({
      validatedRow: pS.validatedRow.map((x, i) => (i === 0 ? true : x)),
      isOptionSelected: false,
    }));
  };

  addDoc = (papier, idx = null, add = true) => {
    const newPapiers =
      idx === null
        ? [...(this.props.subitem.papiers || []), papier]
        : add
        ? this.props.subitem.papiers.map((x, i) => (i === idx ? papier : x))
        : this.props.subitem.papiers.filter((_, i) => i !== idx);

    this.setPropsValue(newPapiers, "papiers");
    this.setState((pS) => ({
      isPapiersDropdownOpen: [...pS.isPapiersDropdownOpen, false],
    }));
  };

  setOption = () => {
    const {
      selectedOption,
      checked,
      value1,
      value2,
      value3,
      value4,
    } = this.state;
    const newOption = {
      ...selectedOption,
      checked,
      value1,
      value2,
      value3,
      value4,
      ctaText: selectedOption.ctaField
        ? selectedOption[selectedOption.ctaField]
        : selectedOption.ctaText,
    };
    this.setPropsValue(newOption, "option");
  };

  setPropsValue = (value, target) => {
    this.props.handleMenuChange(
      {
        currentTarget: {
          id: this.props.keyValue.toString(),
          dataset: {
            subkey: this.props.subkey.toString(),
            target: target,
          },
        },
      },
      value
    );
    this.setState((pS) => ({
      validatedRow: pS.validatedRow.map((x, i) =>
        (target === "duree" && i === 1) ||
        (target === "delai" && i === 2) ||
        (target === "papiers" && i === 3)
          ? i !== 3 || value.length > 0
          : x
      ),
    }));
  };

  render() {
    const {
      keyValue,
      subitem,
      subkey,
      uiArray,
      updateUIArray,
      disableEdit,
      sideView,
      demarcheSteps,
      inVariante,
      t,
    } = this.props;
    const {
      isDropdownOpen,
      checked,
      value1,
      value2,
      value3,
      value4,
      options,
      isOptionSelected,
      selectedOption,
      validatedRow,
      isPapiersDropdownOpen,
      configurationOpen,
      tooltipOpen,
      showModal,
    } = this.state;
    const safeUiArray = (key, subkey, node) =>
      uiArray[key] &&
      uiArray[key].children &&
      uiArray[key].children.length > subkey &&
      uiArray[key].children[subkey] &&
      uiArray[key].children[subkey][node];

    return (
      <div
        key={subkey}
        className={
          "etape contenu" +
          (!inVariante && safeUiArray(keyValue, subkey, "isHover")
            ? " isHovered"
            : "")
        }
        onMouseEnter={(e) =>
          updateUIArray(keyValue, subkey, "isHover", true, e)
        }
      >
        <Row className="relative-position">
          <Col lg="12" md="12" sm="12" xs="12" className="accordeon-col">
            <div className="title-bloc">
              <div
                id="accordion-header"
                className={
                  "position-relative text-left " +
                  (safeUiArray(keyValue, subkey, "accordion")
                    ? "active"
                    : "inactive")
                }
                onMouseUp={() =>
                  disableEdit &&
                  updateUIArray(
                    keyValue,
                    subkey,
                    "accordion",
                    !safeUiArray(keyValue, subkey, "accordion")
                  )
                }
                aria-expanded={safeUiArray(keyValue, subkey, "accordion")}
                aria-controls={"collapse" + keyValue + "-" + subkey}
              >
                <h5>
                  <span className="accordion-text">
                    {subkey + 1 + " - "}
                    <ContentEditable
                      id={keyValue}
                      data-subkey={subkey}
                      data-target="title"
                      className="etape-title"
                      html={subitem.title || ""} // innerHTML of the editable div
                      disabled={disableEdit} // use true to disable editing
                      onChange={this.props.handleMenuChange} // handle innerHTML change
                      onMouseUp={(e) => !disableEdit && e.stopPropagation()}
                    />
                  </span>
                  {disableEdit && (
                    <EVAIcon
                      name={
                        "chevron-" +
                        (safeUiArray(keyValue, subkey, "accordion")
                          ? "up"
                          : "down") +
                        "-outline"
                      }
                      size="large"
                      fill={variables.darkColor}
                    />
                  )}
                </h5>
                {!disableEdit && subkey > 0 && (
                  <EVAIcon
                    onClick={() => this.props.removeItem(keyValue, subkey)}
                    className="delete-icon cursor-pointer"
                    name="close-circle"
                    fill={variables.error}
                    size="xlarge"
                  />
                )}
              </div>
              <div
                className={
                  "etapes-data ml-10" + (disableEdit ? "" : " editing")
                }
                onClick={this.toggleConfigurationOpen}
              >
                {(!disableEdit || subitem.option) && (
                  <div className="etape-data" id="etape-option">
                    <EVAIcon
                      name={((subitem.option || {}).logo || "at") + "-outline"}
                      fill={variables.grisFonce}
                      className="mr-8"
                    />
                    <span>
                      {t(
                        "Dispositif." +
                          ((subitem.option || {}).texte || "En ligne"),
                        (subitem.option || {}).texte || "En ligne"
                      )}
                    </span>
                    <Tooltip
                      placement="top"
                      offset="0px, 8px"
                      isOpen={tooltipOpen[0]}
                      target="etape-option"
                      toggle={() => this.toggleTooltip(0)}
                    >
                      {t("Dispositif.Type de démarche", "Type de démarche")}
                    </Tooltip>
                  </div>
                )}
                {(!disableEdit || subitem.duree) && (
                  <div className="etape-data" id="etape-duree">
                    <EVAIcon
                      name="clock-outline"
                      fill={variables.grisFonce}
                      className="mr-8"
                    />
                    <span>
                      {subitem.duree || 0}{" "}
                      {t(subitem.timeStepDuree, subitem.timeStepDuree)}
                    </span>
                    <Tooltip
                      placement="top"
                      offset="0px, 8px"
                      isOpen={tooltipOpen[1]}
                      target="etape-duree"
                      toggle={() => this.toggleTooltip(1)}
                    >
                      {t(
                        "Dispositif.Combien de temps",
                        "Combien de temps ça va vous prendre ?"
                      )}
                    </Tooltip>
                  </div>
                )}
                {(!disableEdit || subitem.delai) && (
                  <div className="etape-data" id="etape-delai">
                    <EVAIcon
                      name="undo"
                      fill={variables.grisFonce}
                      className="mr-8"
                    />
                    <span>
                      {subitem.delai &&
                      subitem.delai !== "00" &&
                      subitem.timeStepDelai ? (
                        <span>
                          {subitem.delai}{" "}
                          {t(subitem.timeStepDelai, subitem.timeStepDelai)}
                        </span>
                      ) : (
                        t("Dispositif.Immédiate", "Immédiate")
                      )}
                    </span>
                    <Tooltip
                      placement="top"
                      offset="0px, 8px"
                      isOpen={tooltipOpen[2]}
                      target="etape-delai"
                      toggle={() => this.toggleTooltip(2)}
                    >
                      {t(
                        "Dispositif.Délais de réponse annoncés",
                        "Délais de réponse annoncés"
                      )}
                    </Tooltip>
                  </div>
                )}
                {(!disableEdit ||
                  (subitem.papiers && subitem.papiers.length > 0)) && (
                  <div className="etape-data" id="etape-papiers">
                    <EVAIcon
                      name="file-text-outline"
                      fill={variables.grisFonce}
                      className="mr-8"
                    />
                    <span>{(subitem.papiers || []).length || 0}</span>
                    <Tooltip
                      placement="top"
                      offset="0px, 8px"
                      isOpen={tooltipOpen[3]}
                      target="etape-papiers"
                      toggle={() => this.toggleTooltip(3)}
                    >
                      {t(
                        "Dispositif.Documents nécessaires",
                        "Documents nécessaires"
                      )}
                    </Tooltip>
                  </div>
                )}
              </div>
            </div>

            <Collapse
              className="bloc-configuration"
              isOpen={!disableEdit && configurationOpen}
              data-parent=".etapes-data"
            >
              <h5>Configurez votre étape</h5>

              <div
                className={
                  "row-config direction-colonne mb-10" +
                  (validatedRow[0] ? " validated" : "")
                }
              >
                <div className="options-wrapper">
                  {options.map((option, key) => (
                    <div
                      className={
                        "col-config mr-10" + (option.selected ? " active" : "")
                      }
                      key={key}
                      onClick={() => this.selectOption(key, option)}
                    >
                      <EVAIcon
                        name={option.logo + "-outline"}
                        fill={variables.noir}
                        className="mr-10"
                      />
                      <span>{option.texte}</span>
                    </div>
                  ))}
                </div>
                {isOptionSelected && (
                  <Form
                    onSubmit={this.validateOption}
                    className="mt-10 full-width"
                  >
                    <FormGroup>
                      <Label
                        for="link"
                        lg={
                          selectedOption.label1
                            ? selectedOption.texte === "Autre"
                              ? "9"
                              : "3"
                            : "0"
                        }
                      >
                        {selectedOption.label1}
                      </Label>
                      <Col
                        lg={
                          selectedOption.label1
                            ? selectedOption.texte === "Autre"
                              ? "3"
                              : "9"
                            : "12"
                        }
                      >
                        <FInput
                          prepend={!!selectedOption.icon1}
                          prependName={selectedOption.icon1 + "-outline"}
                          value={value1}
                          disabled={checked}
                          onChange={(e) => this.handleChange(e, "value1")}
                          id="link"
                          type="text"
                          placeholder={selectedOption.placeholder1}
                        />
                      </Col>
                    </FormGroup>
                    {selectedOption.placeholder2 && (
                      <FormGroup>
                        <Label
                          for="displayText"
                          lg={selectedOption.label2 ? "3" : "0"}
                        >
                          {selectedOption.label2}
                        </Label>
                        <Col
                          lg={
                            selectedOption.label2
                              ? "9"
                              : selectedOption.placeholder3
                              ? "3"
                              : "12"
                          }
                        >
                          <FInput
                            prepend={!!selectedOption.icon2}
                            prependName={selectedOption.icon2 + "-outline"}
                            value={value2}
                            onChange={(e) => this.handleChange(e, "value2")}
                            id="displayText"
                            type={selectedOption.icon2 ? "text" : "textarea"}
                            placeholder={selectedOption.placeholder2}
                          />
                        </Col>
                        {selectedOption.placeholder3 && (
                          <>
                            <Col lg="6">
                              <FInput
                                prepend
                                prependName={selectedOption.icon3 + "-outline"}
                                value={value3}
                                onChange={(e) => this.handleChange(e, "value3")}
                                id="displayText"
                                type="text"
                                placeholder={selectedOption.placeholder3}
                              />
                            </Col>
                            <Col lg="3">
                              <FInput
                                prepend
                                prependName={selectedOption.icon4 + "-outline"}
                                value={value4}
                                onChange={(e) => this.handleChange(e, "value4")}
                                id="displayText"
                                type="text"
                                placeholder={selectedOption.placeholder4}
                              />
                            </Col>
                          </>
                        )}
                      </FormGroup>
                    )}
                    <div className="footer-form">
                      {selectedOption.checkbox ? (
                        <FormGroup
                          check
                          className={"no-info" + (checked ? " checked" : "")}
                        >
                          <Label check>
                            <Input
                              type="checkbox"
                              checked={checked}
                              onChange={this.handleCheck}
                            />{" "}
                            <span>{selectedOption.checkbox}</span>
                          </Label>
                        </FormGroup>
                      ) : (
                        <div />
                      )}
                      <div className="footer-btns">
                        <FButton
                          type="light-action"
                          name="close-outline"
                          className="mr-10"
                          onClick={() => this.selectOption()}
                        >
                          Annuler
                        </FButton>
                        <FButton
                          type="validate"
                          name="checkmark-outline"
                          onClick={this.setOption}
                          disabled={
                            !checked &&
                            (!value1 ||
                              (selectedOption.placeholder2 && !value2))
                          }
                        >
                          Valider
                        </FButton>
                      </div>
                    </div>
                  </Form>
                )}
              </div>

              <div
                className={
                  "row-config mb-10" + (validatedRow[1] ? " validated" : "")
                }
              >
                <EVAIcon
                  name="clock-outline"
                  fill={variables.noir}
                  className="mr-10"
                />
                <b>Cette étape prend :</b>

                <Input
                  type="number"
                  className="etape-input mr-10"
                  placeholder="00"
                  id={keyValue}
                  data-subkey={subkey}
                  data-target="duree"
                  value={subitem.duree}
                  onChange={(e) => this.setPropsValue(e.target.value, "duree")}
                />

                <ButtonDropdown
                  isOpen={isDropdownOpen[0]}
                  toggle={() => this.toggleDropdown(0)}
                  className="etape-dropdown mr-10"
                >
                  <DropdownToggle caret>{subitem.timeStepDuree}</DropdownToggle>
                  <DropdownMenu>
                    {demarcheSteps.timeSteps.map((timeStep, key) => (
                      <DropdownItem
                        key={key}
                        id={key}
                        onClick={() =>
                          this.setPropsValue(timeStep.texte, "timeStepDuree")
                        }
                      >
                        {timeStep.texte}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </ButtonDropdown>
                <span className="color-grisFonce">
                  Précisez le temps nécessaire pour faire cette étape.
                </span>
              </div>

              <div
                className={
                  "row-config mb-10" + (validatedRow[2] ? " validated" : "")
                }
              >
                <EVAIcon name="undo" fill={variables.noir} className="mr-10" />
                <b>Délai de réponse :</b>

                <Input
                  type="number"
                  className="etape-input mr-10"
                  placeholder="00"
                  id={keyValue}
                  data-subkey={subkey}
                  data-target="delai"
                  value={subitem.delai}
                  onChange={(e) => this.setPropsValue(e.target.value, "delai")}
                />

                <ButtonDropdown
                  isOpen={isDropdownOpen[1]}
                  toggle={() => this.toggleDropdown(1)}
                  className="etape-dropdown mr-10"
                >
                  <DropdownToggle caret>{subitem.timeStepDelai}</DropdownToggle>
                  <DropdownMenu>
                    {demarcheSteps.timeSteps.map((timeStep, key) => (
                      <DropdownItem
                        key={key}
                        id={key}
                        onClick={() =>
                          this.setPropsValue(timeStep.texte, "timeStepDelai")
                        }
                      >
                        {timeStep.texte}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </ButtonDropdown>

                <span className="color-grisFonce">
                  Précisez le délai de réponse légal ou constaté.
                </span>
              </div>

              <div
                className={
                  "row-config negative-padding" +
                  (validatedRow[3] ? " validated" : "")
                }
              >
                <EVAIcon
                  name="file-text"
                  fill={variables.noir}
                  className="mr-10 mb-10"
                />
                <b className="mr-10 mb-10">
                  Documents justificatifs{" "}
                  {subitem.papiers &&
                    subitem.papiers.length > 0 &&
                    "(" + subitem.papiers.length + ") "}
                  :
                </b>

                {(subitem.papiers || []).map((doc, idx) => (
                  <ButtonDropdown
                    isOpen={isPapiersDropdownOpen[idx]}
                    toggle={() => this.togglePapiersDropdown(idx)}
                    className="etape-dropdown mr-10"
                    key={idx}
                  >
                    <DropdownToggle caret className="docs-dropdown">
                      <span className="idx-docs">{idx + 1}</span>
                      {doc.texte}
                      {!disableEdit && (
                        <EVAIcon
                          onClick={(e) => {
                            e.stopPropagation();
                            this.addDoc(doc, idx, false);
                          }}
                          className="delete-icon cursor-pointer"
                          name="close-circle"
                          fill={variables.error}
                          size="xlarge"
                        />
                      )}
                    </DropdownToggle>
                    <DropdownMenu>
                      {demarcheSteps.papiers.map((papier, key) => (
                        <DropdownItem
                          key={key}
                          id={key}
                          onClick={() => this.addDoc(papier, idx)}
                        >
                          {key + 1 + " - " + papier.texte}
                        </DropdownItem>
                      ))}
                    </DropdownMenu>
                  </ButtonDropdown>
                ))}
                <ButtonDropdown
                  isOpen={
                    isPapiersDropdownOpen[isPapiersDropdownOpen.length - 1]
                  }
                  toggle={() =>
                    this.togglePapiersDropdown(isPapiersDropdownOpen.length - 1)
                  }
                  className="etape-dropdown mr-10"
                >
                  <DropdownToggle caret className="docs-dropdown">
                    <EVAIcon name="plus-circle" className="plus-btn-docs" />
                    Ajouter un document
                  </DropdownToggle>
                  <DropdownMenu>
                    {demarcheSteps.papiers.map((papier, key) => (
                      <DropdownItem
                        key={key}
                        id={key}
                        onClick={() => this.addDoc(papier)}
                      >
                        {key + 1 + " - " + papier.texte}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </ButtonDropdown>
              </div>

              <div className="footer-btns mt-10">
                <FButton
                  tag={"a"}
                  href="https://help.refugies.info/fr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  type="help"
                  name="question-mark-circle-outline"
                  fill={variables.error}
                >
                  {t("J'ai besoin d'aide")}
                </FButton>
                <FButton
                  type="validate"
                  name="checkmark-outline"
                  onClick={this.toggleConfigurationOpen}
                  fill={variables.noir}
                  disabled={!validatedRow.includes(true)}
                >
                  Valider
                </FButton>
              </div>
            </Collapse>

            <Collapse
              className="contenu-accordeon etape-accordeon"
              isOpen={safeUiArray(keyValue, subkey, "accordion")}
              data-parent="#accordion"
              id={"collapse" + keyValue + "-" + subkey}
              aria-labelledby={"heading" + keyValue + "-" + subkey}
            >
              {disableEdit && subitem.option && (
                <div className="realisation-wrapper">
                  {/*<h5>{t("Dispositif.realisation etape", "Je réalise cette étape :")}</h5>*/}
                  <div className="real-btns">
                    <FButton
                      type="dark"
                      name="link-outline"
                      className="mr-10"
                      fill={variables.noir}
                      onClick={this.toggleModal}
                    >
                      {subitem.option.ctaField
                        ? subitem.option[subitem.option.ctaField]
                        : subitem.option.ctaText &&
                          t(
                            "Dispositif." + subitem.option.ctaText,
                            subitem.option.ctaText
                          )}
                    </FButton>
                    <FButton
                      type="help"
                      name="question-mark-circle-outline"
                      fill={variables.error}
                      onClick={this.props.upcoming}
                    >
                      {t("J'ai besoin d'aide")}
                    </FButton>
                  </div>
                </div>
              )}
              <EditableParagraph
                keyValue={keyValue}
                subkey={subkey}
                target="content"
                handleMenuChange={this.props.handleMenuChange}
                onEditorStateChange={this.props.onEditorStateChange}
                handleContentClick={this.props.handleContentClick}
                disableEdit={disableEdit}
                tutoriel={this.props.item.tutoriel}
                addItem={this.props.addItem}
                typeContenu={this.props.typeContenu}
                {...subitem}
              />
            </Collapse>
            {!disableEdit && (
              <FButton
                type="dark"
                name="plus-circle-outline"
                className="mt-10"
                onClick={() => this.props.addItem(keyValue, "etape", subkey)}
              >
                Ajouter une étape
              </FButton>
            )}
          </Col>
          {!sideView && !inVariante && disableEdit && (
            <Col lg="2" md="2" sm="2" xs="2" className="toolbar-col">
              <QuickToolbar
                show={safeUiArray(keyValue, subkey, "isHover")}
                keyValue={keyValue}
                subkey={subkey}
                {...this.props}
              />
            </Col>
          )}
        </Row>

        <EtapeModal
          show={showModal}
          toggle={this.toggleModal}
          {...this.props}
        />
      </div>
    );
  }
}

export default withTranslation()(EtapeParagraphe);
