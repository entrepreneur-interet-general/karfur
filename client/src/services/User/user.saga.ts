import { SagaIterator } from "redux-saga";
import { takeLatest, put, call } from "redux-saga/effects";
import { FETCH_USER } from "./user.actionTypes";
import API from "../../utils/API";
import { setUserActionCreator, fetchUserActionCreator } from "./user.actions";
import { push } from "connected-react-router";
import { logger } from "../../logger";
import { fetchUserStructureActionCreator } from "../Structures/structures.actions";
import {
  startLoading,
  LoadingStatusKey,
  finishLoading,
} from "../LoadingStatus/loadingStatus.actions";

export function* fetchUser(
  action: ReturnType<typeof fetchUserActionCreator>
): SagaIterator {
  try {
    yield put(startLoading(LoadingStatusKey.FETCH_USER));
    const isAuth = yield call(API.isAuth);
    if (isAuth) {
      const data = yield call(API.get_user_info);
      yield put(setUserActionCreator(data.data.data));
      yield put(
        fetchUserStructureActionCreator({
          structureId: data.data.data.structures
            ? data.data.data.structures[0]
            : null,
        })
      );
    } else {
      yield put(setUserActionCreator(null));
    }
    yield put(finishLoading(LoadingStatusKey.FETCH_USER));

    if (action.payload && action.payload.shouldRedirect) {
      yield put(
        push({
          pathname: "/backend/user-dashboard",
          state: { user: action.payload.user },
        })
      );
    }
  } catch (error) {
    logger.error("Error while fetching user", { error });
    yield put(setUserActionCreator(null));
  }
}

function* latestActionsSaga() {
  yield takeLatest(FETCH_USER, fetchUser);
}

export default latestActionsSaga;
