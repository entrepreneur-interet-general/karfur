import { Dispositif } from "../../@types/interface";
import { createReducer } from "typesafe-actions";
import { AllDispositifsActions } from "./allDispositifs.actions";

export type AllDispositifsState = Dispositif[];

export const initialAllDispositifsState: AllDispositifsState = [];

export const allDispositifsReducer = createReducer<
  AllDispositifsState,
  AllDispositifsActions
>(initialAllDispositifsState, {
  SET_ALL_DISPOSITIFS: (state, action) => action.payload,
});