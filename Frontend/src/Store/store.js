import { configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
} from "redux-persist";
import createWebStorage from "redux-persist/es/storage/createWebStorage";

import userReducer from "./slices/userslice";
import travelReducer from "./slices/travelSlice";

const storage = createWebStorage("local");

const travelPersistConfig = {
  key: "travel",
  storage,
};

const persistedTravelReducer = persistReducer(
  travelPersistConfig,
  travelReducer
);

export const store = configureStore({
  reducer: {
    user: userReducer,
    travel: persistedTravelReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);

export default store;