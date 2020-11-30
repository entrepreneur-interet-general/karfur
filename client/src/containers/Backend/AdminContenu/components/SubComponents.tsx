import React from "react";
import styled from "styled-components";
import { ObjectId } from "mongodb";
import { limitNbCaracters } from "../../../../lib";
import { max } from "moment";
import { correspondingStatus } from "../data";
import EVAIcon from "../../../../components/UI/EVAIcon/EVAIcon";
// @ts-ignore
import variables from "scss/colors.scss";
import { mapPropsStream } from "recompose";

const Container = styled.div`
  font-weight: normal;
  font-size: 12px;
  line-height: 15px;
  color: ${(props) => (props.isDispositif ? "#FFFFFF" : "#212121")};
  background-color: ${(props) => (props.isDispositif ? "#212121" : "#FFFFFF")};
  padding: 8px;
  border-radius: 6px;
  width: fit-content;
`;

export const TypeContenu = (props: { type: string }) => {
  const correctedType = props.type === "dispositif" ? "Dispositif" : "Démarche";
  return (
    <Container isDispositif={props.type === "dispositif"}>
      {correctedType}
    </Container>
  );
};

const maxDescriptionLength = 30;
const maxTitreMarqueLength = 25;

const TitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  font-style: normal;
  font-size: 16px;
  line-height: 20px;
  width: 270px;
`;

export const Title = (props: {
  titreInformatif: string;
  titreMarque: string;
}) => {
  const { titreInformatif, titreMarque } = props;
  const reducedTitreInfo = titreInformatif
    ? limitNbCaracters(titreInformatif, maxDescriptionLength)
    : "";
  const reducedTitreMarque = titreMarque
    ? limitNbCaracters(titreMarque, maxTitreMarqueLength)
    : "";

  return (
    <TitleContainer>
      <b>{reducedTitreInfo}</b>
      <span>{`avec ${reducedTitreMarque}`}</span>
    </TitleContainer>
  );
};

const StructureContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const getStructureNameAndStatus = (
  sponsor: SimplifiedStructure | null
): { structureName: string; statusColor: string } => {
  const red = "#F44336";
  const orange = "#FF9800";
  const green = "#4CAF50";

  if (!sponsor || !sponsor.nom)
    return { structureName: "Sans structure", statusColor: red };

  // @ts-ignore
  if (sponsor._id === "5e5fdb7b361338004e16e75f")
    return { structureName: "Structure temporaire", statusColor: red };

  const structureName = limitNbCaracters(sponsor.nom, maxDescriptionLength);
  const statusColor =
    sponsor.status === "Actif"
      ? green
      : sponsor.status === "En attente"
      ? orange
      : red;
  return { structureName, statusColor };
};

const ColoredRound = styled.div`
  width: 10px;
  height: 10px;
  background-color: ${(props) => props.color};
  border-radius: 50%;
  margin-right: 10px;
`;
interface SimplifiedStructure {
  _id: ObjectId;
  status: string;
  nom: string;
}
export const Structure = (props: { sponsor: SimplifiedStructure | null }) => {
  const { sponsor } = props;
  const { structureName, statusColor } = getStructureNameAndStatus(sponsor);
  return (
    <StructureContainer>
      <ColoredRound color={statusColor} />
      {structureName}
    </StructureContainer>
  );
};

export const StyledStatusContainer = styled.div`
  font-weight: bold;
  border-radius: 6px;
  padding: 8px;
  background-color: ${(props) => props.color};
  width: fit-content;
  font-weight: normal;
  font-size: 12px;
  line-height: 15px;
  color: #ffffff;
`;
const getColorAndStatus = (text: string) => {
  const correspondingStatusElement = correspondingStatus.filter(
    (element) => element.storedStatus === text
  );
  if (correspondingStatusElement.length > 0)
    return {
      status: correspondingStatusElement[0].displayedStatus,
      color: correspondingStatusElement[0].color,
    };

  return { status: "NO STATUS", color: "#0421B1" };
};
export const StyledStatus = (props: { text: string }) => {
  const { status, color } = getColorAndStatus(props.text);
  return <StyledStatusContainer color={color}>{status}</StyledStatusContainer>;
};

const ButtonContainer = styled.div`
  width: 40px;
  height: 40px;
  background-color: #828282;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right:4px;
  margin-left:4px


  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};

  &:hover {
    background-color: ${(props) =>
      props.disabled ? "#828282" : props.hoverColor};
  }
`;
export const ValidateButton = (props: {
  onClick: () => void;
  disabled: boolean;
}) => (
  <ButtonContainer
    onClick={props.onClick}
    disabled={props.disabled}
    hoverColor={variables.validationHover}
  >
    <div style={{ marginBottom: "4px" }}>
      <EVAIcon name="checkmark-outline" fill={"#FFFFFF"} size="20" />
    </div>
  </ButtonContainer>
);

export const SeeButton = (props: { burl: string }) => (
  <ButtonContainer hoverColor={variables.darkColor}>
    <a href={props.burl} target="_blank" rel="noopener noreferrer">
      <div style={{ marginBottom: "4px" }}>
        <EVAIcon name="eye-outline" fill={"#FFFFFF"} size="20" />
      </div>
    </a>
  </ButtonContainer>
);

export const DeleteButton = (props: { onClick: () => void }) => (
  <ButtonContainer onClick={props.onClick} hoverColor={variables.error}>
    <div style={{ marginBottom: "4px" }}>
      <EVAIcon name="trash-outline" fill={"#FFFFFF"} size="20" />
    </div>
  </ButtonContainer>
);

const FilterButtonContainer = styled.div`
  background: #ffffff;
  border-radius: 12px;
  font-weight: normal;
  font-size: 16px;
  line-height: 20px;
  padding: 15px;
  width: fit-content;
  margin-right: 8px;
  cursor: pointer;
  height: fit-content;
`;
export const FilterButton = (props: { onClick: () => void; text: string }) => (
  <FilterButtonContainer onClick={props.onClick}>
    {props.text}
  </FilterButtonContainer>
);
