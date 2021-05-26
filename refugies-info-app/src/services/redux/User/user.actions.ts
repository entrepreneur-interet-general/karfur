import { action, ActionType } from "typesafe-actions";
import {
  SET_SELECTED_LANGUAGE,
  SAVE_SELECTED_LANGUAGE,
} from "./user.actionTypes";

export const setHasUserSeenOnboardingActionCreator = () =>
  action("SET_USER_HAS_SEEN_ONBOARDING");

export const saveHasUserSeenOnboardingActionCreator = () =>
  action("SAVE_USER_HAS_SEEN_ONBOARDING");

export const setSelectedLanguageActionCreator = (value: string) =>
  action(SET_SELECTED_LANGUAGE, value);

export const saveSelectedLanguageActionCreator = (value: string) =>
  action(SAVE_SELECTED_LANGUAGE, value);

const actions = {
  setHasUserSeenOnboardingActionCreator,
  setSelectedLanguageActionCreator,
  saveSelectedLanguageActionCreator,
  saveHasUserSeenOnboardingActionCreator,
};
export type UserActions = ActionType<typeof actions>;
