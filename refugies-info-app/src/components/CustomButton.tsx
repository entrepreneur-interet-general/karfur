import * as React from "react";
import styled from "styled-components/native";
import { RTLTouchableOpacity } from "./BasicComponents";
import { theme } from "../theme";
import { StyledTextSmallBold, StyledTextSmall } from "./StyledText";
import { useTranslationWithRTL } from "../hooks/useTranslationWithRTL";
import { Icon } from "react-native-eva-icons";

const ButtonContainer = styled(RTLTouchableOpacity)`
  background-color: ${(props: { backgroundColor: string }) =>
    props.backgroundColor || theme.colors.white};
  justify-content: center;
  padding: ${theme.radius * 3}px;
  border-radius: ${theme.radius * 2}px;
  align-items: center;
  width: 100%;
  height: 56px;
  box-shadow: 0px 8px 16px rgba(33, 33, 33, 0.24);
  elevation: 1;
`;

const ColoredTextBold = styled(StyledTextSmallBold)`
  color: ${(props: { textColor: string }) => props.textColor};
  margin-left: ${(props: { isRTL: boolean }) =>
    props.isRTL ? theme.margin : 0}px;
  margin-right: ${(props: { isRTL: boolean }) =>
    props.isRTL ? 0 : theme.margin}px;
`;

const ColoredTextNormal = styled(StyledTextSmall)`
  color: ${(props: { textColor: string }) => props.textColor};
  margin-left: ${(props: { isRTL: boolean }) =>
    props.isRTL ? theme.margin : 0}px;
  margin-right: ${(props: { isRTL: boolean }) =>
    props.isRTL ? 0 : theme.margin}px;
`;

interface Props {
  textColor: string;
  i18nKey: string;
  onPress: () => void;
  iconName?: string;
  defaultText: string;
  isTextNotBold?: boolean;
  backgroundColor?: string;
}

const ICON_SIZE = 24;

export const CustomButton = (props: Props) => {
  const { t, isRTL } = useTranslationWithRTL();
  return (
    <ButtonContainer
      onPress={props.onPress}
      backgroundColor={props.backgroundColor}
    >
      {props.isTextNotBold ? (
        <ColoredTextNormal textColor={props.textColor} isRTL={isRTL}>
          {t(props.i18nKey, props.defaultText)}
        </ColoredTextNormal>
      ) : (
        <ColoredTextBold textColor={props.textColor} isRTL={isRTL}>
          {t(props.i18nKey, props.defaultText)}
        </ColoredTextBold>
      )}
      {props.iconName && (
        <Icon
          name={props.iconName}
          width={ICON_SIZE}
          height={ICON_SIZE}
          fill={props.textColor}
        />
      )}
    </ButtonContainer>
  );
};
