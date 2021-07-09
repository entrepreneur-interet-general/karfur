import * as React from "react";
import styled from "styled-components/native";
import { Text, useWindowDimensions, View } from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import { ExplorerParamList } from "../../types";
import { useTranslationWithRTL } from "../hooks/useTranslationWithRTL";
import { WrapperWithHeaderAndLanguageModal } from "./WrapperWithHeaderAndLanguageModal";
import { TouchableOpacity, ScrollView } from "react-native-gesture-handler";
import { useDispatch, useSelector } from "react-redux";
import { fetchSelectedContentActionCreator } from "../services/redux/SelectedContent/selectedContent.actions";
import { selectedContentSelector } from "../services/redux/SelectedContent/selectedContent.selectors";
import { theme } from "../theme";
import {
  TextBigBold,
  StyledTextBigBold,
  StyledTextSmall,
  TextSmallNormal,
} from "../components/StyledText";
import {
  selectedI18nCodeSelector,
  currentI18nCodeSelector,
} from "../services/redux/User/user.selectors";
import { ContentFromHtml } from "../components/Content/ContentFromHtml";
import { Accordion } from "../components/Content/Accordion";
import { AvailableLanguageI18nCode } from "../types/interface";
import { HeaderImage } from "../components/Content/HeaderImage";
import { HeaderWithBackForWrapper } from "../components/HeaderWithLogo";
import { LanguageChoiceModal } from "./Modals/LanguageChoiceModal";
import { RTLView } from "../components/BasicComponents";

const getHeaderImageHeight = (nbLines: number) => {
  if (nbLines < 3) {
    return 280;
  }
  return 280 + 40 * (nbLines - 2);
};
const ContentContainer = styled.View`
  padding: 24px;
`;

const TitlesContainer = styled(View)`
  position: absolute;
  top: 130px;
  width: ${(props: { width: number }) => props.width};
  left: 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const TitreInfoText = styled(TextBigBold)`
  opacity: 0.9;
  background-color: ${theme.colors.white};
  align-self: flex-start;
  line-height: 40px;
`;

const TitreMarqueText = styled(TextSmallNormal)`
  background-color: ${theme.colors.white};
  opacity: 0.9;
  line-height: 32px;
  align-self: flex-start;
`;

const HeaderText = styled(TextBigBold)`
  margin-top: ${theme.margin * 2}px;
  margin-bottom: ${theme.margin * 2}px;
  color: ${(props: { textColor: string }) => props.textColor};
  flex-shrink: 1;
`;

const TextWrapper = styled(TextSmallNormal)`
  margin-bottom: ${theme.margin * 2}px;
  align-self: flex-start;
  line-height: ${(props) => props.lineHeight};
  display: flex;
  flex: 1;
`;

const FixedContainerForHeader = styled.View`
  top: 0;
  left: 0;
  position: absolute;
  z-index: 2;
  width: 100%;
`;

const headersDispositif = [
  "C'est quoi ?",
  "C'est pour qui ?",
  "Pourquoi c'est intéressant ?",
  "Comment je m'engage ?",
];

const headersDemarche = [
  "C'est quoi ?",
  "C'est pour qui ?",
  "Comment faire ?",
  "Et après ?",
];

const computeIfContentIsTranslatedInCurrentLanguage = (
  avancement: 1 | Record<AvailableLanguageI18nCode, number>,
  currentLanguage: AvailableLanguageI18nCode
) => {
  if (currentLanguage === "fr") return false;
  if (avancement === 1) return false;
  return avancement[currentLanguage] === 1;
};

export const ContentScreen = ({
  navigation,
  route,
}: StackScreenProps<ExplorerParamList, "ContentScreen">) => {
  const [isLanguageModalVisible, setLanguageModalVisible] = React.useState(
    false
  );
  const [nbLinesTitreInfo, setNbLinesTitreInfo] = React.useState(2);
  const [nbLinesTitreMarque, setNbLinesTitreMarque] = React.useState(1);

  const toggleLanguageModal = () =>
    setLanguageModalVisible(!isLanguageModalVisible);

  const [accordionExpanded, setAccordionExpanded] = React.useState("");

  const { t, isRTL } = useTranslationWithRTL();

  const dispatch = useDispatch();

  const selectedLanguage = useSelector(selectedI18nCodeSelector);
  const currentLanguage = useSelector(currentI18nCodeSelector);
  const { contentId, tagDarkColor, tagVeryLightColor, tagName } = route.params;

  const windowWidth = useWindowDimensions().width;

  React.useEffect(() => {
    if (contentId && selectedLanguage) {
      dispatch(
        fetchSelectedContentActionCreator({
          contentId: contentId,
          locale: selectedLanguage,
        })
      );
    }
  }, [selectedLanguage]);

  const selectedContent = useSelector(selectedContentSelector(currentLanguage));

  const onLayoutTitre = (e: any, titre: string) => {
    const { height } = e.nativeEvent.layout;
    if (titre === "titreInfo") {
      setNbLinesTitreInfo(Math.floor(height / 40));
      return;
    }
    setNbLinesTitreMarque(Math.floor(height / 32));
    return;
  };

  if (!selectedContent || !currentLanguage) {
    return (
      <WrapperWithHeaderAndLanguageModal
        showSwitch={true}
        navigation={navigation}
      >
        <TouchableOpacity onPress={navigation.goBack}>
          <Text>Back</Text>
        </TouchableOpacity>

        <ContentContainer>
          <Text>pas de contenu</Text>
        </ContentContainer>
      </WrapperWithHeaderAndLanguageModal>
    );
  }
  const isDispositif = selectedContent.typeContenu === "dispositif";

  const headers = isDispositif ? headersDispositif : headersDemarche;
  const isContentTranslatedInCurrentLanguage = computeIfContentIsTranslatedInCurrentLanguage(
    selectedContent.avancement,
    currentLanguage
  );

  const toggleAccordion = (index: string) => {
    if (index === accordionExpanded) return setAccordionExpanded("");
    setAccordionExpanded(index);
    return;
  };

  const accordionMaxWidthWithStep = windowWidth - 2 * 24 - 4 * 16 - 24 - 32;
  const accordionMaxWidthWithoutStep = windowWidth - 2 * 24 - 3 * 16 - 24;

  const nbLinesTitle = nbLinesTitreInfo + nbLinesTitreMarque;
  const headerImageHeight = getHeaderImageHeight(nbLinesTitle);

  return (
    <View>
      <FixedContainerForHeader>
        <HeaderWithBackForWrapper
          onLongPressSwitchLanguage={toggleLanguageModal}
          navigation={navigation}
        />
      </FixedContainerForHeader>
      <ScrollView contentContainerStyle={{}}>
        <HeaderImage tagName={tagName} height={headerImageHeight} />
        <TitlesContainer width={windowWidth - 2 * 24} isRTL={isRTL}>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
            }}
          >
            <TextWrapper
              onLayout={(e: any) => onLayoutTitre(e, "titreInfo")}
              lineHeight={40}
            >
              <TitreInfoText isRTL={isRTL}>
                {selectedContent.titreInformatif}
              </TitreInfoText>
            </TextWrapper>
          </View>

          {selectedContent.titreMarque && (
            <View style={{ display: "flex", flexDirection: "row" }}>
              <TextWrapper
                onLayout={(e: any) => onLayoutTitre(e, "titreMarque")}
                lineHeight={32}
              >
                <TitreMarqueText>
                  {"avec " + selectedContent.titreMarque}
                </TitreMarqueText>
              </TextWrapper>
            </View>
          )}
        </TitlesContainer>
        <ContentContainer>
          {headers.map((header, index) => {
            if (index === 0 && selectedContent.contenu[0].content) {
              return (
                <>
                  <HeaderText key={header} textColor={tagDarkColor}>
                    {t("Content." + header, header)}
                  </HeaderText>
                  <ContentFromHtml
                    htmlContent={selectedContent.contenu[index].content}
                    windowWidth={windowWidth}
                  />
                </>
              );
            }
            if (index === 1) {
              return (
                <>
                  <HeaderText key={header} textColor={tagDarkColor}>
                    {t("Content." + header, header)}
                  </HeaderText>
                </>
              );
            }

            return (
              <>
                <HeaderText key={header} textColor={tagDarkColor}>
                  {t("Content." + header, header)}
                </HeaderText>
                {selectedContent &&
                  selectedContent.contenu[index] &&
                  selectedContent.contenu[index].children &&
                  // @ts-ignore
                  selectedContent.contenu[index].children.map(
                    (child, indexChild) => {
                      if (
                        child.type === "accordion" ||
                        child.type === "etape"
                      ) {
                        const accordionIndex =
                          index.toString() + "-" + indexChild.toString();
                        const isAccordionExpanded =
                          accordionExpanded === accordionIndex;
                        return (
                          <Accordion
                            isExpanded={isAccordionExpanded}
                            title={child.title}
                            content={child.content}
                            toggleAccordion={() =>
                              toggleAccordion(accordionIndex)
                            }
                            key={indexChild}
                            stepNumber={
                              child.type === "etape" ? indexChild + 1 : null
                            }
                            width={
                              child.type === "etape"
                                ? accordionMaxWidthWithStep
                                : accordionMaxWidthWithoutStep
                            }
                            currentLanguage={currentLanguage}
                            windowWidth={windowWidth}
                            darkColor={tagDarkColor}
                            lightColor={tagVeryLightColor}
                            isContentTranslated={
                              isContentTranslatedInCurrentLanguage
                            }
                          />
                        );
                      }
                    }
                  )}
              </>
            );
          })}
        </ContentContainer>
      </ScrollView>
      <LanguageChoiceModal
        isModalVisible={isLanguageModalVisible}
        toggleModal={toggleLanguageModal}
      />
    </View>
  );
};
