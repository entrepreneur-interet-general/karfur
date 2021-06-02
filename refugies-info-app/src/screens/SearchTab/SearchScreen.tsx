import * as React from "react";
import { TextNormal } from "../../components/StyledText";
import { t } from "../../services/i18n";
import { WrapperWithHeaderAndLanguageModal } from "../WrapperWithHeaderAndLanguageModal";
import { useSelector } from "react-redux";
import {
  currentI18nCodeSelector,
  selectedI18nCodeSelector,
} from "../../services/redux/User/user.selectors";

export const SearchScreen = () => {
  const currentLanguageI18nCode = useSelector(currentI18nCodeSelector);
  const selectedLanguageI18nCode = useSelector(selectedI18nCodeSelector);

  return (
    <WrapperWithHeaderAndLanguageModal
      currentLanguageI18nCode={currentLanguageI18nCode}
      selectedLanguageI18nCode={selectedLanguageI18nCode}
    >
      <TextNormal>Search screen</TextNormal>

      <TextNormal>{t("lists", "options")}</TextNormal>
      <TextNormal>{t("homepage.test", "options")}</TextNormal>
    </WrapperWithHeaderAndLanguageModal>
  );
};