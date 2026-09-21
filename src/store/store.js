import { legacy_createStore as createStore, applyMiddleware } from "redux";
import { thunk } from "redux-thunk";
import { createLogger } from "redux-logger";
import reducer from "./reducer";

const middlewares = [thunk];

if (import.meta.env.DEV) {
	middlewares.push(
		createLogger({
			collapsed: true,
			duration: true,
		}),
	);
}

const store = createStore(reducer, applyMiddleware(...middlewares));
export default store;