import React from "react";
import { Col, Row, Table } from "reactstrap";
import Icon from "react-eva-icons";
import moment from "moment/min/moment-with-locales";
import { withTranslation } from "react-i18next";

import EVAIcon from "../../../UI/EVAIcon/EVAIcon";
import { countrySide } from "../../../../assets/figma/index";
import { fakeNotifs } from "../../../../containers/Backend/UserProfile/data";
import FButton from "../../../FigmaUI/FButton/FButton";

import "./ActionTable.scss";
import variables from "scss/colors.scss";

moment.locale("fr");

const actionTable = (props) => {
  const { t } = props;
  const hasNotifs = (props.dataArray || []).length > 0;
  const dataArray = hasNotifs ? props.dataArray : new Array(5).fill(fakeNotifs);
  const data = props.limit ? dataArray.slice(0, props.limit) : dataArray;

  const hideOnPhone = props.hideOnPhone || new Array(props.headers).fill(false);

  const jsUcfirst = (string) => {
    return (
      string &&
      string.length > 1 &&
      string.charAt(0).toUpperCase() + string.slice(1, string.length - 1)
    );
  };

  const table = (
    <Table responsive className="avancement-user-table">
      <thead>
        <tr>
          {props.headers.map((element, key) => (
            <th key={key} className={hideOnPhone[key] ? "hideOnPhone" : ""}>
              {element && typeof element === "string"
                ? t("Tables." + element, element)
                : element}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.slice(0, props.limit).map((element, key) => {
          const joursDepuis =
            (new Date().getTime() - new Date(element.depuis).getTime()) /
            (1000 * 3600 * 24);
          return (
            <tr
              key={key}
              onClick={() => props.showSuggestion(element, key)}
              className={
                "action-table " + (element.read ? "is-read" : "not-read")
              }
            >
              <td className="align-middle">
                {!element.read && <div className="dot-circle" />}
              </td>
              <td className="align-middle">{element.titre}</td>
              <td className="align-middle hideOnPhone">
                <Icon
                  name={element.owner ? "shield-outline" : "people-outline"}
                  fill={variables.noir}
                  size="large"
                />
                &nbsp;
                {element.owner
                  ? t("Tables.Propriétaire", "Propriétaire")
                  : t("Tables.Contributeur", "Contributeur")}
              </td>
              <td className="align-middle">
                <EVAIcon
                  className="mr-8"
                  name={
                    element.action === "questions"
                      ? "question-mark-circle-outline"
                      : "bulb-outline"
                  }
                  fill={variables.noir}
                />
                {jsUcfirst(t("Tables." + element.action, element.action))}
              </td>
              <td
                className={
                  "align-middle hideOnPhone depuis " +
                  (joursDepuis > 3 ? "alert" : "success")
                }
              >
                {element.depuis ? moment(element.depuis).fromNow() : ""}
              </td>
              <td
                className="align-middle pointer fit-content"
                onClick={(e) => {
                  e.stopPropagation();
                  props.archive(element);
                }}
              >
                <FButton
                  type="light-action"
                  name="trash-2-outline"
                  fill={variables.noir}
                />
              </td>
              <td
                className="align-middle pointer fit-content"
                onClick={() => props.showSuggestion(element)}
              >
                <FButton
                  type="light-action"
                  name="eye-outline"
                  fill={variables.noir}
                />
              </td>
            </tr>
          );
        })}
        {props.limit && dataArray.length > 5 && (
          <tr>
            <td
              colSpan="7"
              className="align-middle voir-plus"
              onClick={() => props.toggleModal("actions")}
            >
              <Icon name="expand-outline" fill={variables.noir} />
              &nbsp;
              {t("Tables.Voir plus", "Voir plus")}
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );

  if (props.limit) {
    return (
      <div className="tableau-wrapper" id="actions-requises">
        <Row>
          <Col>
            <h1>
              {t("Tables." + props.title, props.title)}
              {hasNotifs && (
                <sup className="nb-actions">{props.dataArray.length}</sup>
              )}
            </h1>
          </Col>
          <Col className="tableau-header no-margin" lg="1">
            {/*<FButton type="dark" name="options-2-outline" onClick={props.upcoming}>
              Paramétrer
              </FButton>*/}
          </Col>
        </Row>

        <div className="tableau">
          {table}

          {!hasNotifs && (
            <div className="ecran-protection no-notifs">
              <div className="content-wrapper">
                <img src={countrySide} alt="illustration protection" />
                <h1>
                  {t("Tables.Aucune notification", "Aucune notification")}
                </h1>
                <div className="sous-contenu">
                  {t(
                    "Tables.no worries",
                    "Ne vous inquiétez pas, ça ne va pas tarder"
                  )}
                  {"."}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  return table;
};

export default withTranslation()(actionTable);
