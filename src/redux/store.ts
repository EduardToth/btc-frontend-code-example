import { createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import rootReducer from "./root";

export const store = createStore(rootReducer, composeWithDevTools());
export const dispatch = store.dispatch;

export default store;
