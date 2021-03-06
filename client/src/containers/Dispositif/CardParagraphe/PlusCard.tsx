import { cardTitlesDispositif, cardTitlesDemarche } from "../data";
import React from "react";
import { Card, CardHeader, CardBody, Col } from "reactstrap";

interface PlusCardProps {
  addItem: (arg1: number, arg2: string, arg3?: string | null) => void;
  keyValue: number;
  cards: string[];
  typeContenu: "dispositif" | "demarche";
}

export const PlusCard = (props: PlusCardProps) => {
  const cardTitles =
    props.typeContenu === "dispositif"
      ? cardTitlesDispositif
      : cardTitlesDemarche;
  const availablecardTitlesDispositif = cardTitles.filter(
    (x) => !props.cards.includes(x.title)
  );
  const nextTitle =
    availablecardTitlesDispositif.length > 0
      ? availablecardTitlesDispositif[0].title
      : "";
  return (
    <Col xl="4" lg="6" md="6" sm="12" xs="12" className="card-col">
      <Card
        className="add-card"
        onClick={() => props.addItem(props.keyValue, "card", nextTitle)}
      >
        <CardHeader className="backgroundColor-darkColor">
          Ajouter un item
        </CardHeader>
        <CardBody>
          <span className="add-sign">+</span>
        </CardBody>
      </Card>
    </Col>
  );
};
