import { createReducer } from "typesafe-actions";
import { UserStructureActions } from "./userStructure.actions";
import { Structure } from "../../@types/interface";

export type UserStructureState = Structure | null;

const initialUserStructureState: UserStructureState = null;

export const structureReducer = createReducer<
  UserStructureState,
  UserStructureActions
>(initialUserStructureState, {
  SET_USER_STRUCTURE: (_, action) => action.payload,
});
