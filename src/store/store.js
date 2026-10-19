import { legacy_createStore as createStore, applyMiddleware } from "redux";
import { thunk } from "redux-thunk";
import { createLogger } from "redux-logger";
import reducer from "./reducer";
import { redactForLogger } from "./redactForLogger";
import { cartPersistence, readCart } from "./cartSession";

const middlewares = [thunk, cartPersistence];

if (import.meta.env.DEV) {
	middlewares.push(
		createLogger({
			collapsed: true,
			duration: true,
			actionTransformer: redactForLogger,
			stateTransformer: redactForLogger,
			errorTransformer: redactForLogger,
		}),
	);
}

const store = createStore(reducer, applyMiddleware(...middlewares));
store.dispatch({ type: "CART_SESSION_RESTORE", payload: { cartOwner: "guest", cart: readCart("guest") } });
export default store;
