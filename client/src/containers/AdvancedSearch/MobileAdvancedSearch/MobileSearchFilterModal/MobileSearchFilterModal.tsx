import React from "react";
import { Modal } from "reactstrap";
import styled from "styled-components";
import "./MobileSearchFilterModal.scss";
import Streamline from "../../../../assets/streamline";
import Icon from "react-eva-icons";

const TextTitle = styled.div`
  width: fit-content;
  margin-right: 10px;
  padding-right: 10px;
  padding-top: 14px;
`;
const ButtonTitle = styled.div`
  height: 55px;
  background-color: black;
  display: flex;
  justify-content: space-between;
  width: fit-content;
  color: white;
  padding: 14px;
  border-radius: 12px;
`;
const TitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 0;
  font-size: 18px;
  font-weight: 700;
`;

const FilterButton = styled.div`
  align-items: center;
  padding: 16px;
  height: 53px;
  width: 100%;
  background-color: ${(props) => props.color};
  color: ${(props) => props.textColor};
  text-align: ${(props) => props.textAlign};
  font-weight: 700;
  border-color: #212121;
  border-radius: 12px;
  padding-top: 12px;
  margin: 5px 0;
  display: flex;
  justify-content: space-between;
`;

const FilterText = styled.div`
  margin: auto;
`;

interface Props {
  setSelectedItem: (item: any) => void;
  toggle: () => void;
  type: string;
  show: boolean;
  title: string;
  defaultTitle: string;
  sentence: string;
  defaultSentence: string;
  t: (a: string, b: string) => void;
  data: any;
}

export const MobileSearchFilterModal = (props: Props) => {
  const selectOption = (item: any) => {
    props.setSelectedItem(item);
    props.toggle();
  };
  return (
    <Modal
      isOpen={props.show}
      toggle={props.toggle}
      className="mobile-search-filter"
    >
      {/* Display Modal title */}
      <TitleContainer>
        <TextTitle> {props.t(props.sentence, props.defaultSentence)}</TextTitle>
        <ButtonTitle onClick={props.toggle}>
          {props.t(props.title, props.defaultTitle)}
          <Icon name="close" fill="#FFFFFF" size="large" />
        </ButtonTitle>
      </TitleContainer>
      {/* Display list of possible values */}
      {props.data.map((item: any, index: any) => {
        return (
          <div key={index}>
            {props.type === "thème" ? (
              <FilterButton
                color={item.darkColor}
                textColor="white"
                textAlign="left"
                onClick={() => selectOption(item)}
              >
                {props.t("Tags." + item.name, item.name)}
                {item.icon ? (
                  <Streamline
                    name={item.icon}
                    stroke={"white"}
                    width={22}
                    height={22}
                  />
                ) : null}
              </FilterButton>
            ) : props.type === "age" || props.type === "french" ? (
              <FilterButton
                color="white"
                textColor="black"
                textAlign="center"
                onClick={() => selectOption(item)}
              >
                <FilterText>
                  {props.t("Tags." + item.name, item.name)}
                </FilterText>
              </FilterButton>
            ) : null}
          </div>
        );
      })}
    </Modal>
  );
};
