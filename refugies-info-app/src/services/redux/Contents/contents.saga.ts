import { SagaIterator } from "redux-saga";
import { takeLatest, put, call, select } from "redux-saga/effects";
import {
  startLoading,
  finishLoading,
  LoadingStatusKey,
} from "../LoadingStatus/loadingStatus.actions";
import { logger } from "../../../logger";
import { setContentsActionCreator } from "./contents.actions";
import { FETCH_CONTENTS } from "./contents.actionTypes";
import { getContentsForApp } from "../../../utils/API";
import { selectedI18nCodeSelector } from "../User/user.selectors";

export function* fetchContents(): SagaIterator {
  try {
    logger.info("[fetchContents] saga");
    yield put(startLoading(LoadingStatusKey.FETCH_CONTENTS));
    const selectedLanguage = yield select(selectedI18nCodeSelector);
    if (selectedLanguage) {
      const data = yield call(getContentsForApp, selectedLanguage);

      if (data && data.data && data.data.data) {
        yield put(
          setContentsActionCreator({
            langue: selectedLanguage,
            contents: data.data.data,
          })
        );
      }
    }
    yield put(finishLoading(LoadingStatusKey.FETCH_CONTENTS));
  } catch (error) {
    logger.error("Error while fetching contents", { error: error.message });
  }
}

function* latestActionsSaga() {
  yield takeLatest(FETCH_CONTENTS, fetchContents);
}

export default latestActionsSaga;
