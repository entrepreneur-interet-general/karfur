import * as React from "react";
import styled from "styled-components/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TextNormal } from "../../components/StyledText";
import { HeaderWithBack } from "../../components/HeaderWithBack";
import { ProfilParamList } from "../../../types";
import { StackScreenProps } from "@react-navigation/stack";
import { useTranslationWithRTL } from "../../hooks/useTranslationWithRTL";

export const CityProfilScreen = ({
  navigation,
}: StackScreenProps<ProfilParamList, "CityProfilScreen">) => {
  const { t } = useTranslationWithRTL();
  return (
    <SafeAreaView>
      <HeaderWithBack
        navigation={navigation}
        text={t("Profil.Ville", "Ville")}
        iconName="pin-outline"
      />
      <TextNormal>City</TextNormal>
    </SafeAreaView>
  );
};