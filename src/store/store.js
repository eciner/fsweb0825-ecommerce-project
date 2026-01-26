import { createStore, applyMiddleware, combineReducers } from 'redux';
import { thunk } from 'redux-thunk';

// Example reducer - you can add more reducers here
const exampleReducer = (state = { data: [] }, action) => {
  switch (action.type) {
    default:
      return state;
  }
};

const rootReducer = combineReducers({
  example: exampleReducer,
  // Add more reducers here as you build your app
});

const store = createStore(rootReducer, applyMiddleware(thunk));

export default store;
