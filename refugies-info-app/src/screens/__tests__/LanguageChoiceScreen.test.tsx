import { wrapWithProvidersAndRender } from "../../jest/wrapWithProvidersAndRender";
import { LanguageChoiceScreen } from "../LanguageChoiceScreen";
import { initialRootStateFactory } from "../../services/redux/reducers";
import { fetchLanguagesActionCreator } from "../../services/redux/Languages/languages.actions";
import { fireEvent, act } from "react-native-testing-library";
import { saveSelectedLanguageActionCreator } from "../../services/redux/User/user.actions";
import i18n from "../../services/i18n";
import { mockedLanguageData } from "../../jest/__fixtures__/languages";

jest.mock("../../services/redux/Languages/languages.actions", () => {
  const actions = jest.requireActual(
    "../../services/redux/Languages/languages.actions"
  );
  return {
    fetchLanguagesActionCreator: jest.fn(actions.fetchLanguagesActionCreator),
  };
});

jest.mock("../../services/i18n", () => ({
  __esModule: true, // this property makes it work
  default: { changeLanguage: jest.fn(), isRTL: jest.fn() },
}));

jest.mock("../../services/redux/User/user.actions", () => {
  const actions = jest.requireActual("../../services/redux/User/user.actions");
  return {
    saveSelectedLanguageActionCreator: jest.fn(
      actions.saveSelectedLanguageActionCreator
    ),
  };
});

describe("LanguageChoiceScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render correctly", () => {
    const component = wrapWithProvidersAndRender({
      Component: LanguageChoiceScreen,
      reduxState: {
        ...initialRootStateFactory(),
        languages: { availableLanguages: mockedLanguageData },
      },
    });
    expect(fetchLanguagesActionCreator).toHaveBeenCalledWith();
    expect(component).toMatchSnapshot();
    const Button = component.getByTestId("test-language-button-Anglais");
    act(() => {
      fireEvent.press(Button);
    });
    expect(i18n.changeLanguage).toHaveBeenCalledWith("en");
    expect(saveSelectedLanguageActionCreator).toHaveBeenCalledWith("en");
  });
});
