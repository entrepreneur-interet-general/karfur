import React from "react";
import { infoCardIcon } from "../../../../components/Icon/Icon";
import {
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import { DispositifContent } from "../../../../types/interface";

interface Props {
  subitem: DispositifContent;
  disableEdit: boolean;
  availablecardTitles: {
    title: string;
    titleIcon: string;
    options?: string[];
  }[];
  t: any;
  isDropdownOpen: boolean;
  toggleDropdown: (e: any) => void;
  typeContenu: "dispositif" | "demarche";
}

export const CardHeaderContent = (props: Props) => {
  const title = ["Titre de séjour", "Acte de naissance OFPRA"].includes(
    props.subitem.title
  )
    ? "Pas possible sans"
    : props.subitem.title;
  // in lecture mode, display title and icon or in edition when all types of infocard are already displayed
  if (
    props.disableEdit ||
    props.availablecardTitles.length === 0 ||
    (props.subitem.title === "Zone d'action" &&
      props.typeContenu === "demarche")
  ) {
    return (
      <>
        {infoCardIcon(props.subitem.titleIcon, "#FFFFFF")}
        <span className="header-content">
          {title && props.t("Dispositif." + title, title)}
        </span>
      </>
    );
  }

  // in edition mode
  return (
    <ButtonDropdown isOpen={props.isDropdownOpen} toggle={props.toggleDropdown}>
      {
        // title and icon
        <DropdownToggle caret={!props.disableEdit} className="header-value">
          <div className="icon-title">
            {infoCardIcon(props.subitem.titleIcon, "#FFFFFF")}
            <span className="header-content">{title}</span>
          </div>
        </DropdownToggle>
      }
      <DropdownMenu>
        {
          // drop down with the list of possible info cards
          props.availablecardTitles.map((cardTitle, key) => {
            return (
              <DropdownItem
                key={key}
                // @ts-ignore
                id={key}
              >
                <div className="icon-title">
                  {infoCardIcon(cardTitle.titleIcon)}
                  <span className="header-content">{cardTitle.title}</span>
                </div>
              </DropdownItem>
            );
          })
        }
      </DropdownMenu>
    </ButtonDropdown>
  );
};
